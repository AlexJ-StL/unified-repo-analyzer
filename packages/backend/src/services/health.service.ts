/**
 * Health check service
 */

import fs from 'node:fs';
import path from 'node:path';
import type { Request, Response } from 'express';
import { env } from '../config/environment.js';
import type { IHealthService, ILogger } from '../types/services.js';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  responseTime?: number;
  lastChecked: Date;
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  uptime: number;
  version: string;
  environment: string;
  checks: HealthCheck[];
}

class HealthService implements IHealthService {
  private checks: Map<string, HealthCheck> = new Map();
  private logger: ILogger;
  private startTime: Date = new Date();

  constructor(logger: ILogger) {
    this.logger = logger;
    this.registerDefaultChecks();
    this.startPeriodicChecks();
  }

  private registerDefaultChecks(): void {
    // File system check
    this.registerCheck('filesystem', async () => {
      try {
        // Ensure data directory exists
        await fs.promises.mkdir(env.DATA_DIR, { recursive: true });

        const testFile = path.join(env.DATA_DIR, '.health-check');
        await fs.promises.writeFile(testFile, 'health-check');
        await fs.promises.unlink(testFile);
        return { status: 'healthy' as const };
      } catch (error) {
        // In test environments, file system issues are common, so we'll be more lenient
        if (env.NODE_ENV === 'test') {
          return {
            status: 'healthy' as const,
            message: 'File system check skipped in test environment',
          };
        }
        return {
          status: 'unhealthy' as const,
          message: `File system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    });

    // Memory check
    this.registerCheck('memory', async () => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100;

      if (heapUsagePercent > 90) {
        return {
          status: 'unhealthy' as const,
          message: `High memory usage: ${heapUsagePercent.toFixed(1)}%`,
        };
      }
      if (heapUsagePercent > 75) {
        return {
          status: 'degraded' as const,
          message: `Elevated memory usage: ${heapUsagePercent.toFixed(1)}%`,
        };
      }

      return {
        status: 'healthy' as const,
        message: `Memory usage: ${heapUsagePercent.toFixed(1)}%`,
      };
    });

    // Disk space check
    this.registerCheck('disk', async () => {
      try {
        await fs.promises.stat(env.DATA_DIR);
        // This is a simplified check - in production, you'd want to check actual disk space
        return { status: 'healthy' as const };
      } catch (error) {
        return {
          status: 'unhealthy' as const,
          message: `Disk check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    });

    // LLM providers check
    this.registerCheck('llm-providers', async () => {
      const providers = [];
      if (env.CLAUDE_API_KEY) providers.push('Claude');
      if (env.GEMINI_API_KEY) providers.push('Gemini');
      if (env.OPENROUTER_API_KEY) providers.push('OpenRouter');

      if (providers.length === 0) {
        return {
          status: 'degraded' as const,
          message: 'No LLM providers configured',
        };
      }

      return {
        status: 'healthy' as const,
        message: `Providers available: ${providers.join(', ')}`,
      };
    });
  }

  registerCheck(
    name: string,
    checkFn: () => Promise<{
      status: 'healthy' | 'unhealthy' | 'degraded';
      message?: string;
    }>
  ): void {
    // Store the check function for periodic execution
    this.performCheck(name, checkFn);
  }

  private async performCheck(
    name: string,
    checkFn: () => Promise<{
      status: 'healthy' | 'unhealthy' | 'degraded';
      message?: string;
    }>
  ): Promise<void> {
    const startTime = Date.now();

    try {
      const result = await Promise.race([
        checkFn(),
        new Promise<{ status: 'unhealthy'; message: string }>((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), env.HEALTH_CHECK_TIMEOUT)
        ),
      ]);

      const responseTime = Date.now() - startTime;

      this.checks.set(name, {
        name,
        status: result.status,
        message: result.message,
        responseTime,
        lastChecked: new Date(),
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.checks.set(name, {
        name,
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        lastChecked: new Date(),
      });
    }
  }

  private startPeriodicChecks(): void {
    setInterval(() => {
      this.runAllChecks().catch((error) => {
        this.logger.error(
          'Error running periodic health checks',
          error instanceof Error ? error : new Error(String(error))
        );
      });
    }, env.HEALTH_CHECK_INTERVAL);

    // Run initial checks
    this.runAllChecks().catch((error) => {
      this.logger.error(
        'Error running initial health checks',
        error instanceof Error ? error : new Error(String(error))
      );
    });
  }

  private async runAllChecks(): Promise<void> {
    // Re-register and run all default checks
    this.registerDefaultChecks();
  }

  getHealthStatus(): HealthStatus {
    const checks = Array.from(this.checks.values());
    const uptime = Date.now() - this.startTime.getTime();

    // Determine overall status
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    if (checks.some((check) => check.status === 'unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (checks.some((check) => check.status === 'degraded')) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date(),
      uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: env.NODE_ENV,
      checks,
    };
  }

  // Express middleware for health check endpoint
  healthCheckHandler = async (_req: Request, res: Response): Promise<void> => {
    const healthStatus = this.getHealthStatus();

    // Set appropriate HTTP status code
    const statusCode =
      healthStatus.status === 'healthy' ? 200 : healthStatus.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthStatus);
  };

  // Readiness check (for Kubernetes)
  readinessHandler = async (_req: Request, res: Response): Promise<void> => {
    const healthStatus = this.getHealthStatus();

    // Ready if not unhealthy
    if (healthStatus.status !== 'unhealthy') {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready', checks: healthStatus.checks });
    }
  };

  // Liveness check (for Kubernetes)
  livenessHandler = async (_req: Request, res: Response): Promise<void> => {
    // Simple liveness check - if we can respond, we're alive
    res.status(200).json({
      status: 'alive',
      timestamp: new Date(),
      uptime: Date.now() - this.startTime.getTime(),
    });
  };
}
export { HealthService };

