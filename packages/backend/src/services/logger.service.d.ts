import winston from 'winston';
declare const logger: winston.Logger;
export declare const requestLogger: (
  req: import('express').Request,
  res: import('express').Response,
  next: import('express').NextFunction
) => void;
export declare const logError: (error: Error, context?: Record<string, unknown>) => void;
export declare const logPerformance: (
  operation: string,
  duration: number,
  metadata?: Record<string, unknown>
) => void;
export declare const logSecurityEvent: (event: string, details: Record<string, unknown>) => void;
export declare const logAnalysis: (
  repoPath: string,
  status: 'started' | 'completed' | 'failed',
  metadata?: Record<string, unknown>
) => void;
export default logger;
