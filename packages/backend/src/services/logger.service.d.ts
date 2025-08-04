import winston from 'winston';
declare const logger: winston.Logger;
export declare const requestLogger: (req: any, res: any, next: any) => void;
export declare const logError: (error: Error, context?: Record<string, any>) => void;
export declare const logPerformance: (operation: string, duration: number, metadata?: Record<string, any>) => void;
export declare const logSecurityEvent: (event: string, details: Record<string, any>) => void;
export declare const logAnalysis: (repoPath: string, status: "started" | "completed" | "failed", metadata?: Record<string, any>) => void;
export default logger;
