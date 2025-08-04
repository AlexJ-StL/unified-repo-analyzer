import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { env } from '../config/environment';
// Ensure log directory exists
if (!fs.existsSync(env.LOG_DIR)) {
    fs.mkdirSync(env.LOG_DIR, { recursive: true });
}
// Custom log format
const logFormat = winston.format.combine(winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
}), winston.format.errors({ stack: true }), winston.format.json(), winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
        log += `\n${stack}`;
    }
    return log;
}));
// Console format for development
const consoleFormat = winston.format.combine(winston.format.colorize(), winston.format.simple(), winston.format.printf(({ level, message, stack }) => {
    let log = `${level}: ${message}`;
    if (stack) {
        log += `\n${stack}`;
    }
    return log;
}));
// Create transports
const transports = [];
// Console transport (always enabled in development)
if (env.NODE_ENV === 'development') {
    transports.push(new winston.transports.Console({
        format: consoleFormat,
        level: env.LOG_LEVEL,
    }));
}
// File transports for production
if (env.NODE_ENV === 'production') {
    // Error log file
    transports.push(new winston.transports.File({
        filename: path.join(env.LOG_DIR, 'error.log'),
        level: 'error',
        format: logFormat,
        maxsize: 10485760, // 10MB
        maxFiles: 5,
        tailable: true,
    }));
    // Combined log file
    transports.push(new winston.transports.File({
        filename: path.join(env.LOG_DIR, 'combined.log'),
        format: logFormat,
        maxsize: 10485760, // 10MB
        maxFiles: 10,
        tailable: true,
    }));
    // Console transport for production (minimal)
    transports.push(new winston.transports.Console({
        format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
        level: 'warn',
    }));
}
// Create logger instance
const logger = winston.createLogger({
    level: env.LOG_LEVEL,
    format: logFormat,
    transports,
    // Handle uncaught exceptions and rejections
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(env.LOG_DIR, 'exceptions.log'),
            format: logFormat,
        }),
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(env.LOG_DIR, 'rejections.log'),
            format: logFormat,
        }),
    ],
    exitOnError: false,
});
// Request logging middleware
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
        };
        if (res.statusCode >= 400) {
            logger.warn('HTTP Request', logData);
        }
        else {
            logger.info('HTTP Request', logData);
        }
    });
    next();
};
// Error logging helper
export const logError = (error, context) => {
    logger.error(error.message, {
        stack: error.stack,
        ...context,
    });
};
// Performance logging helper
export const logPerformance = (operation, duration, metadata) => {
    logger.info(`Performance: ${operation}`, {
        duration: `${duration}ms`,
        ...metadata,
    });
};
// Security event logging
export const logSecurityEvent = (event, details) => {
    logger.warn(`Security Event: ${event}`, details);
};
// Analysis logging helper
export const logAnalysis = (repoPath, status, metadata) => {
    const level = status === 'failed' ? 'error' : 'info';
    logger.log(level, `Analysis ${status}: ${repoPath}`, metadata);
};
export default logger;
//# sourceMappingURL=logger.service.js.map