import fs from 'fs';
import path from 'path';
import { env } from '../config/environment';
import logger from './logger.service';
class HealthService {
    checks = new Map();
    startTime = new Date();
    constructor() {
        this.registerDefaultChecks();
        this.startPeriodicChecks();
    }
    registerDefaultChecks() {
        // File system check
        this.registerCheck('filesystem', async () => {
            const testFile = path.join(env.DATA_DIR, '.health-check');
            try {
                await fs.promises.writeFile(testFile, 'health-check');
                await fs.promises.unlink(testFile);
                return { status: 'healthy' };
            }
            catch (error) {
                return {
                    status: 'unhealthy',
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
                    status: 'unhealthy',
                    message: `High memory usage: ${heapUsagePercent.toFixed(1)}%`,
                };
            }
            else if (heapUsagePercent > 75) {
                return {
                    status: 'degraded',
                    message: `Elevated memory usage: ${heapUsagePercent.toFixed(1)}%`,
                };
            }
            return {
                status: 'healthy',
                message: `Memory usage: ${heapUsagePercent.toFixed(1)}%`,
            };
        });
        // Disk space check
        this.registerCheck('disk', async () => {
            try {
                await fs.promises.stat(env.DATA_DIR);
                // This is a simplified check - in production, you'd want to check actual disk space
                return { status: 'healthy' };
            }
            catch (error) {
                return {
                    status: 'unhealthy',
                    message: `Disk check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                };
            }
        });
        // LLM providers check
        this.registerCheck('llm-providers', async () => {
            const providers = [];
            if (env.CLAUDE_API_KEY)
                providers.push('Claude');
            if (env.GEMINI_API_KEY)
                providers.push('Gemini');
            if (env.OPENROUTER_API_KEY)
                providers.push('OpenRouter');
            if (providers.length === 0) {
                return {
                    status: 'degraded',
                    message: 'No LLM providers configured',
                };
            }
            return {
                status: 'healthy',
                message: `Providers available: ${providers.join(', ')}`,
            };
        });
    }
    registerCheck(name, checkFn) {
        // Store the check function for periodic execution
        this.performCheck(name, checkFn);
    }
    async performCheck(name, checkFn) {
        const startTime = Date.now();
        try {
            const result = await Promise.race([
                checkFn(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Health check timeout')), env.HEALTH_CHECK_TIMEOUT)),
            ]);
            const responseTime = Date.now() - startTime;
            this.checks.set(name, {
                name,
                status: result.status,
                message: result.message,
                responseTime,
                lastChecked: new Date(),
            });
        }
        catch (error) {
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
    startPeriodicChecks() {
        setInterval(() => {
            this.runAllChecks().catch((error) => {
                logger.error('Error running periodic health checks', { error: error.message });
            });
        }, env.HEALTH_CHECK_INTERVAL);
        // Run initial checks
        this.runAllChecks().catch((error) => {
            logger.error('Error running initial health checks', { error: error.message });
        });
    }
    async runAllChecks() {
        // Re-register and run all default checks
        this.registerDefaultChecks();
    }
    getHealthStatus() {
        const checks = Array.from(this.checks.values());
        const uptime = Date.now() - this.startTime.getTime();
        // Determine overall status
        let overallStatus = 'healthy';
        if (checks.some((check) => check.status === 'unhealthy')) {
            overallStatus = 'unhealthy';
        }
        else if (checks.some((check) => check.status === 'degraded')) {
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
    healthCheckHandler = async (req, res) => {
        const healthStatus = this.getHealthStatus();
        // Set appropriate HTTP status code
        const statusCode = healthStatus.status === 'healthy' ? 200 : healthStatus.status === 'degraded' ? 200 : 503;
        res.status(statusCode).json(healthStatus);
    };
    // Readiness check (for Kubernetes)
    readinessHandler = async (req, res) => {
        const healthStatus = this.getHealthStatus();
        // Ready if not unhealthy
        if (healthStatus.status !== 'unhealthy') {
            res.status(200).json({ status: 'ready' });
        }
        else {
            res.status(503).json({ status: 'not ready', checks: healthStatus.checks });
        }
    };
    // Liveness check (for Kubernetes)
    livenessHandler = async (req, res) => {
        // Simple liveness check - if we can respond, we're alive
        res.status(200).json({
            status: 'alive',
            timestamp: new Date(),
            uptime: Date.now() - this.startTime.getTime(),
        });
    };
}
export const healthService = new HealthService();
export default healthService;
//# sourceMappingURL=health.service.js.map