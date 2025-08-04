import { Request, Response } from 'express';
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
declare class HealthService {
    private checks;
    private startTime;
    constructor();
    private registerDefaultChecks;
    registerCheck(name: string, checkFn: () => Promise<{
        status: 'healthy' | 'unhealthy' | 'degraded';
        message?: string;
    }>): void;
    private performCheck;
    private startPeriodicChecks;
    private runAllChecks;
    getHealthStatus(): HealthStatus;
    healthCheckHandler: (req: Request, res: Response) => Promise<void>;
    readinessHandler: (req: Request, res: Response) => Promise<void>;
    livenessHandler: (req: Request, res: Response) => Promise<void>;
}
export declare const healthService: HealthService;
export default healthService;
