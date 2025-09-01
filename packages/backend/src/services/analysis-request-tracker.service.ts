/**
 * Service for tracking analysis requests
 */

import { v4 as uuidv4 } from "uuid";
import { metricsService } from "./metrics.service";
import logger from "./logger.service";

export interface AnalysisRequest {
  id: string;
  path: string;
  options: any;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  progress: number;
  currentFile?: string;
  startTime: Date;
  endTime?: Date;
  processingTime?: number;
  error?: {
    message: string;
    code: string;
    recoverable: boolean;
    context?: Record<string, any>;
  };
  clientId?: string;
  result?: any;
}

class AnalysisRequestTracker {
  private requests: Map<string, AnalysisRequest> = new Map();
  private maxRequests = 1000; // Keep only last 1000 requests to prevent memory leaks

  /**
   * Create a new analysis request
   */
  createRequest(
    path: string,
    options: any,
    clientId?: string
  ): AnalysisRequest {
    const requestId = uuidv4();
    const request: AnalysisRequest = {
      id: requestId,
      path,
      options,
      status: "queued",
      progress: 0,
      startTime: new Date(),
      clientId,
    };

    this.requests.set(requestId, request);

    // Clean up old requests if we exceed the limit
    if (this.requests.size > this.maxRequests) {
      const keys = Array.from(this.requests.keys());
      const oldestKey = keys[0];
      this.requests.delete(oldestKey);
    }

    logger.info(
      "Analysis request created",
      {
        path,
        clientId,
      },
      undefined,
      requestId
    );

    return request;
  }

  /**
   * Get a request by ID
   */
  getRequest(requestId: string): AnalysisRequest | undefined {
    return this.requests.get(requestId);
  }

  /**
   * Update request status
   */
  updateRequestStatus(
    requestId: string,
    status: AnalysisRequest["status"]
  ): void {
    const request = this.requests.get(requestId);
    if (request) {
      request.status = status;
      logger.debug(
        `Analysis request status updated`,
        {
          status,
        },
        undefined,
        requestId
      );
    }
  }

  /**
   * Update request progress
   */
  updateRequestProgress(
    requestId: string,
    progress: number,
    currentFile?: string
  ): void {
    const request = this.requests.get(requestId);
    if (request) {
      request.progress = progress;
      if (currentFile) {
        request.currentFile = currentFile;
      }
      logger.debug(
        `Analysis request progress updated`,
        {
          progress,
          currentFile,
        },
        undefined,
        requestId
      );
    }
  }

  /**
   * Mark request as completed
   */
  completeRequest(requestId: string, result?: any): void {
    const request = this.requests.get(requestId);
    if (request) {
      request.status = "completed";
      request.endTime = new Date();
      request.processingTime =
        request.endTime.getTime() - request.startTime.getTime();
      if (result) {
        request.result = result;
      }

      logger.info(
        "Analysis request completed",
        {
          processingTime: request.processingTime,
          fileCount: result?.fileCount,
        },
        undefined,
        requestId
      );

      // Record metrics
      metricsService.recordAnalysisMetric(true, request.processingTime, 1);
    }
  }

  /**
   * Mark request as failed
   */
  failRequest(requestId: string, error: any): void {
    const request = this.requests.get(requestId);
    if (request) {
      request.status = "failed";
      request.endTime = new Date();
      request.processingTime =
        request.endTime.getTime() - request.startTime.getTime();
      request.error = {
        message: error.message || "Unknown error",
        code: error.code || "UNKNOWN_ERROR",
        recoverable: error.recoverable !== undefined ? error.recoverable : true,
        context: error.context,
      };

      logger.error(
        "Analysis request failed",
        error,
        {
          errorMessage: request.error.message,
          errorCode: request.error.code,
          processingTime: request.processingTime,
        },
        undefined,
        requestId
      );

      // Record metrics
      metricsService.recordAnalysisMetric(false, request.processingTime, 1);
    }
  }

  /**
   * Cancel a request
   */
  cancelRequest(requestId: string): void {
    const request = this.requests.get(requestId);
    if (request) {
      request.status = "cancelled";
      request.endTime = new Date();
      request.processingTime =
        request.endTime.getTime() - request.startTime.getTime();

      logger.info(
        "Analysis request cancelled",
        {
          processingTime: request.processingTime,
        },
        undefined,
        requestId
      );
    }
  }

  /**
   * Get all requests (with optional filtering)
   */
  getRequests(filter?: {
    status?: AnalysisRequest["status"];
    clientId?: string;
    limit?: number;
  }): AnalysisRequest[] {
    let requests = Array.from(this.requests.values());

    if (filter?.status) {
      requests = requests.filter((req) => req.status === filter.status);
    }

    if (filter?.clientId) {
      requests = requests.filter((req) => req.clientId === filter.clientId);
    }

    if (filter?.limit) {
      requests = requests.slice(-filter.limit);
    }

    // Return sorted by startTime (newest first)
    return requests.sort(
      (a, b) => b.startTime.getTime() - a.startTime.getTime()
    );
  }

  /**
   * Get request statistics
   */
  getStats(): {
    total: number;
    queued: number;
    processing: number;
    completed: number;
    failed: number;
    cancelled: number;
    averageProcessingTime: number;
  } {
    const requests = Array.from(this.requests.values());
    const stats = {
      total: requests.length,
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      averageProcessingTime: 0,
    };

    let totalProcessingTime = 0;
    let completedRequests = 0;

    for (const request of requests) {
      switch (request.status) {
        case "queued":
          stats.queued++;
          break;
        case "processing":
          stats.processing++;
          break;
        case "completed":
          stats.completed++;
          if (request.processingTime) {
            totalProcessingTime += request.processingTime;
            completedRequests++;
          }
          break;
        case "failed":
          stats.failed++;
          break;
        case "cancelled":
          stats.cancelled++;
          break;
      }
    }

    if (completedRequests > 0) {
      stats.averageProcessingTime = totalProcessingTime / completedRequests;
    }

    return stats;
  }

  /**
   * Clean up old requests
   */
  cleanupOldRequests(maxAgeHours = 24): number {
    const now = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    let cleanedCount = 0;

    for (const [requestId, request] of this.requests.entries()) {
      if (request.endTime && now - request.endTime.getTime() > maxAgeMs) {
        this.requests.delete(requestId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug(`Cleaned up ${cleanedCount} old analysis requests`);
    }

    return cleanedCount;
  }
}

export const analysisRequestTracker = new AnalysisRequestTracker();
export default analysisRequestTracker;
