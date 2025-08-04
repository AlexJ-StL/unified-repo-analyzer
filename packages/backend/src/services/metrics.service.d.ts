import { Request, Response, NextFunction } from 'express';
declare class MetricsService {
  private metrics;
  private requestMetrics;
  private analysisMetrics;
  private startTime;
  private activeConnections;
  constructor();
  private startMetricsCollection;
  private collectSystemMetrics;
  recordMetric(name: string, value: number, labels?: Record<string, string>): void;
  recordRequestMetric(method: string, statusCode: number, responseTime: number): void;
  recordAnalysisMetric(success: boolean, duration: number, repositoryCount?: number): void;
  incrementActiveConnections(): void;
  decrementActiveConnections(): void;
  getMetrics(): Record<string, any>;
  private logMetricsSummary;
  requestMiddleware(): (req: Request, res: Response, next: NextFunction) => void;
  metricsHandler: (req: Request, res: Response) => void;
  prometheusHandler: (req: Request, res: Response) => void;
}
export declare const metricsService: MetricsService;
export default metricsService;
