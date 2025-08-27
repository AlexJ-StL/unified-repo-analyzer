import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { env } from "../config/environment";

// Types and interfaces for structured logging
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface LogEntry {
  timestamp: string;
  level: string;
  component: string;
  requestId: string;
  message: string;
  metadata?: Record<string, any>;
  error?: ErrorDetails;
}

export interface ErrorDetails {
  name: string;
  message: string;
  stack?: string;
  code?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  outputs: LogOutput[];
  format: "JSON" | "TEXT";
  includeStackTrace: boolean;
  redactSensitiveData: boolean;
}

export interface LogOutput {
  type: "console" | "file" | "external";
  config: ConsoleConfig | FileConfig | ExternalConfig;
}

export interface ConsoleConfig {
  colorize: boolean;
}

export interface FileConfig {
  path: string;
  maxSize: string;
  maxFiles: number;
  rotateDaily: boolean;
}

export interface ExternalConfig {
  endpoint: string;
  apiKey?: string;
  format: "JSON" | "TEXT";
}

// Request context storage for correlation IDs
const requestContext = new Map<string, string>();

// Logger class with structured logging capabilities
export class Logger {
  private winston: winston.Logger;
  private config: LoggerConfig;
  private defaultComponent: string;

  constructor(
    config?: Partial<LoggerConfig>,
    component = "unified-repo-analyzer"
  ) {
    this.defaultComponent = component;
    this.config = {
      level: "INFO",
      outputs: [{ type: "console", config: { colorize: true } }],
      format: "JSON",
      includeStackTrace: true,
      redactSensitiveData: true,
      ...config,
    };

    this.winston = this.createWinstonLogger();
  }

  private createWinstonLogger(): winston.Logger {
    // Ensure log directory exists
    if (!fs.existsSync(env.LOG_DIR)) {
      fs.mkdirSync(env.LOG_DIR, { recursive: true });
    }

    const transports: winston.transport[] = [];

    // Create transports based on configuration
    for (const output of this.config.outputs) {
      switch (output.type) {
        case "console":
          transports.push(
            this.createConsoleTransport(output.config as ConsoleConfig)
          );
          break;
        case "file":
          transports.push(
            this.createFileTransport(output.config as FileConfig)
          );
          break;
        case "external":
          transports.push(
            this.createExternalTransport(output.config as ExternalConfig)
          );
          break;
      }
    }

    return winston.createLogger({
      level: this.config.level.toLowerCase(),
      format: this.createLogFormat(),
      transports,
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(env.LOG_DIR, "exceptions.log"),
          format: this.createLogFormat(),
        }),
      ],
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(env.LOG_DIR, "rejections.log"),
          format: this.createLogFormat(),
        }),
      ],
      exitOnError: false,
    });
  }

  private createLogFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss.SSS",
      }),
      winston.format.errors({ stack: this.config.includeStackTrace }),
      winston.format.printf((info) => {
        const logEntry: LogEntry = {
          timestamp: info.timestamp,
          level: info.level.toUpperCase(),
          component: info.component || this.defaultComponent,
          requestId: info.requestId || this.generateRequestId(),
          message: info.message,
          metadata: this.sanitizeMetadata(info.metadata || {}),
        };

        if (info.error || info.stack) {
          logEntry.error = {
            name: info.error?.name || "Error",
            message: info.error?.message || info.message,
            stack: this.config.includeStackTrace
              ? info.stack || info.error?.stack
              : undefined,
            code: info.error?.code,
          };
        }

        return this.config.format === "JSON"
          ? JSON.stringify(logEntry)
          : this.formatTextLog(logEntry);
      })
    );
  }

  private createConsoleTransport(config: ConsoleConfig): winston.transport {
    return new winston.transports.Console({
      format: config.colorize
        ? winston.format.combine(
            winston.format.colorize(),
            this.createLogFormat()
          )
        : this.createLogFormat(),
      level: this.config.level.toLowerCase(),
    });
  }

  private createFileTransport(config: FileConfig): winston.transport {
    const maxSizeBytes = this.parseSize(config.maxSize);

    if (config.rotateDaily) {
      // Use DailyRotateFile for daily rotation
      return new DailyRotateFile({
        filename: config.path.replace(".log", "-%DATE%.log"),
        datePattern: "YYYY-MM-DD",
        format: this.createLogFormat(),
        maxSize: config.maxSize,
        maxFiles: `${config.maxFiles}d`, // Keep files for N days
        auditFile: config.path.replace(".log", "-audit.json"),
        createSymlink: true,
        symlinkName: config.path,
        level: this.config.level.toLowerCase(),
      });
    }
    return new winston.transports.File({
      filename: config.path,
      format: this.createLogFormat(),
      maxsize: maxSizeBytes,
      maxFiles: config.maxFiles,
      tailable: true,
      level: this.config.level.toLowerCase(),
    });
  }

  private createExternalTransport(config: ExternalConfig): winston.transport {
    // Create a custom transport for external logging services
    return new winston.transports.Http({
      host: this.extractHostFromEndpoint(config.endpoint),
      port: this.extractPortFromEndpoint(config.endpoint),
      path: this.extractPathFromEndpoint(config.endpoint),
      ssl: config.endpoint.startsWith("https"),
      format:
        config.format === "JSON"
          ? winston.format.json()
          : winston.format.simple(),
      headers: config.apiKey
        ? { Authorization: `Bearer ${config.apiKey}` }
        : undefined,
    });
  }

  private extractHostFromEndpoint(endpoint: string): string {
    try {
      const url = new URL(endpoint);
      return url.hostname;
    } catch {
      return "localhost";
    }
  }

  private extractPortFromEndpoint(endpoint: string): number {
    try {
      const url = new URL(endpoint);
      return url.port
        ? Number.parseInt(url.port, 10)
        : url.protocol === "https:"
          ? 443
          : 80;
    } catch {
      return 80;
    }
  }

  private extractPathFromEndpoint(endpoint: string): string {
    try {
      const url = new URL(endpoint);
      return url.pathname || "/";
    } catch {
      return "/";
    }
  }

  private parseSize(sizeStr: string): number {
    const match = sizeStr.match(/^(\d+)(MB|KB|GB)?$/i);
    if (!match) return 10485760; // Default 10MB

    const size = Number.parseInt(match[1], 10);
    const unit = (match[2] || "MB").toUpperCase();

    switch (unit) {
      case "KB":
        return size * 1024;
      case "MB":
        return size * 1024 * 1024;
      case "GB":
        return size * 1024 * 1024 * 1024;
      default:
        return size;
    }
  }

  private formatTextLog(entry: LogEntry): string {
    let log = `${entry.timestamp} [${entry.level}] [${entry.component}] [${entry.requestId}]: ${entry.message}`;

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      log += ` ${JSON.stringify(entry.metadata)}`;
    }

    if (entry.error?.stack) {
      log += `\n${entry.error.stack}`;
    }

    return log;
  }

  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    if (!this.config.redactSensitiveData) {
      return metadata;
    }

    const sensitiveKeys = [
      "password",
      "token",
      "apikey",
      "secret",
      "authorization",
    ];
    const sanitized = { ...metadata };

    for (const key of Object.keys(sanitized)) {
      if (
        sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))
      ) {
        sanitized[key] = "[REDACTED]";
      }
    }

    return sanitized;
  }

  private generateRequestId(): string {
    return randomUUID();
  }

  // Public logging methods
  debug(
    message: string,
    metadata?: Record<string, any>,
    component?: string,
    requestId?: string
  ): void {
    this.winston.debug(message, { metadata, component, requestId });
  }

  info(
    message: string,
    metadata?: Record<string, any>,
    component?: string,
    requestId?: string
  ): void {
    this.winston.info(message, { metadata, component, requestId });
  }

  warn(
    message: string,
    metadata?: Record<string, any>,
    component?: string,
    requestId?: string
  ): void {
    this.winston.warn(message, { metadata, component, requestId });
  }

  error(
    message: string,
    error?: Error,
    metadata?: Record<string, any>,
    component?: string,
    requestId?: string
  ): void {
    this.winston.error(message, { error, metadata, component, requestId });
  }

  // Request context management
  setRequestId(requestId: string): void {
    requestContext.set("current", requestId);
  }

  getRequestId(): string {
    return requestContext.get("current") || this.generateRequestId();
  }

  // Configuration management
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.winston = this.createWinstonLogger();
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// Create default logger instance
const defaultLoggerConfig: Partial<LoggerConfig> = {
  level: (env.LOG_LEVEL?.toUpperCase() as LogLevel) || "INFO",
  outputs: [],
  format: "JSON",
  includeStackTrace: true,
  redactSensitiveData: true,
};

// Configure outputs based on environment
if (env.NODE_ENV === "development") {
  defaultLoggerConfig.outputs = [
    { type: "console", config: { colorize: true } },
  ];
} else {
  defaultLoggerConfig.outputs = [
    { type: "console", config: { colorize: false } },
    {
      type: "file",
      config: {
        path: path.join(env.LOG_DIR, "combined.log"),
        maxSize: "10MB",
        maxFiles: 10,
        rotateDaily: false,
      },
    },
    {
      type: "file",
      config: {
        path: path.join(env.LOG_DIR, "error.log"),
        maxSize: "10MB",
        maxFiles: 5,
        rotateDaily: false,
      },
    },
  ];
}

// Create default logger instance
export const logger = new Logger(defaultLoggerConfig);

// Backward compatibility - expose winston logger for legacy code
const legacyLogger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Enhanced HTTP request/response logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const requestId = randomUUID();
  logger.setRequestId(requestId);
  req.requestId = requestId;

  const start = Date.now();
  const startTime = new Date().toISOString();

  // Log incoming request
  const requestData = {
    requestId,
    method: req.method,
    url: req.url,
    path: req.path,
    query: sanitizeQueryParams(req.query),
    headers: sanitizeHeaders(req.headers),
    body: sanitizeRequestBody(req.body),
    userAgent: req.get("User-Agent"),
    ip: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
    timestamp: startTime,
    contentLength: req.get("Content-Length"),
    contentType: req.get("Content-Type"),
  };

  logger.info(
    "HTTP Request Started",
    requestData,
    "http-middleware",
    requestId
  );

  // Capture response data
  const originalSend = res.send;
  const originalJson = res.json;
  let responseBody: any = null;
  let responseSize = 0;

  // Override res.send to capture response body
  res.send = function (body: any) {
    responseBody = body;
    responseSize = Buffer.isBuffer(body)
      ? body.length
      : Buffer.byteLength(body || "", "utf8");
    return originalSend.call(this, body);
  };

  // Override res.json to capture JSON response
  res.json = function (obj: any) {
    responseBody = obj;
    const jsonString = JSON.stringify(obj);
    responseSize = Buffer.byteLength(jsonString, "utf8");
    return originalJson.call(this, obj);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    const endTime = new Date().toISOString();

    const responseData = {
      requestId,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      statusText: getStatusText(res.statusCode),
      duration: `${duration}ms`,
      responseHeaders: sanitizeHeaders(res.getHeaders()),
      responseBody: sanitizeResponseBody(responseBody, res.statusCode),
      responseSize: `${responseSize} bytes`,
      timestamp: endTime,
      userAgent: req.get("User-Agent"),
      ip: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error(
        "HTTP Request Completed",
        undefined,
        responseData,
        "http-middleware",
        requestId
      );
    } else if (res.statusCode >= 400) {
      logger.warn(
        "HTTP Request Completed",
        responseData,
        "http-middleware",
        requestId
      );
    } else {
      logger.info(
        "HTTP Request Completed",
        responseData,
        "http-middleware",
        requestId
      );
    }
  });

  res.on("error", (error: Error) => {
    const duration = Date.now() - start;
    const errorData = {
      requestId,
      method: req.method,
      url: req.url,
      duration: `${duration}ms`,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };

    logger.error(
      "HTTP Request Error",
      error,
      errorData,
      "http-middleware",
      requestId
    );
  });

  next();
};

// Helper functions for data sanitization
function sanitizeHeaders(headers: any): Record<string, any> {
  if (!headers) return {};

  const sanitized = { ...headers };
  const sensitiveHeaders = [
    "authorization",
    "cookie",
    "x-api-key",
    "x-auth-token",
    "x-access-token",
  ];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    }
  }

  return sanitized;
}

function sanitizeQueryParams(query: any): Record<string, any> {
  if (!query) return {};

  const sanitized = { ...query };
  const sensitiveParams = ["password", "token", "apikey", "secret", "auth"];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveParams.some((param) => key.toLowerCase().includes(param))) {
      sanitized[key] = "[REDACTED]";
    }
  }

  return sanitized;
}

function sanitizeRequestBody(body: any): any {
  if (!body) return null;

  // Don't log large bodies
  const bodyString = typeof body === "string" ? body : JSON.stringify(body);
  if (bodyString.length > 1000) {
    return `[BODY TOO LARGE: ${bodyString.length} characters]`;
  }

  if (typeof body === "object") {
    const sanitized = { ...body };
    const sensitiveFields = [
      "password",
      "token",
      "apikey",
      "secret",
      "auth",
      "credential",
    ];

    for (const key of Object.keys(sanitized)) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = "[REDACTED]";
      }
    }

    return sanitized;
  }

  return body;
}

function sanitizeResponseBody(body: any, statusCode: number): any {
  if (!body) return null;

  // Don't log response bodies for successful requests to avoid noise
  if (statusCode >= 200 && statusCode < 300) {
    const bodyString = typeof body === "string" ? body : JSON.stringify(body);
    if (bodyString.length > 500) {
      return `[RESPONSE BODY: ${bodyString.length} characters]`;
    }
  }

  // For error responses, include more details but sanitize sensitive data
  if (statusCode >= 400 && typeof body === "object") {
    const sanitized = { ...body };
    const sensitiveFields = ["password", "token", "apikey", "secret", "auth"];

    for (const key of Object.keys(sanitized)) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = "[REDACTED]";
      }
    }

    return sanitized;
  }

  return body;
}

function getStatusText(statusCode: number): string {
  const statusTexts: Record<number, string> = {
    200: "OK",
    201: "Created",
    204: "No Content",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    409: "Conflict",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
  };

  return statusTexts[statusCode] || "Unknown";
}

// Error logging helper
export const logError = (
  error: Error,
  context?: Record<string, any>,
  component?: string
) => {
  logger.error(error.message, error, context, component);
};

// Performance logging helper
export const logPerformance = (
  operation: string,
  duration: number,
  metadata?: Record<string, any>,
  component?: string
) => {
  logger.info(
    `Performance: ${operation}`,
    {
      duration: `${duration}ms`,
      ...metadata,
    },
    component || "performance"
  );
};

// Security event logging
export const logSecurityEvent = (
  event: string,
  details: Record<string, any>,
  component?: string
) => {
  logger.warn(`Security Event: ${event}`, details, component || "security");
};

// Analysis logging helper
export const logAnalysis = (
  repoPath: string,
  status: "started" | "completed" | "failed",
  metadata?: Record<string, any>,
  component?: string
) => {
  const message = `Analysis ${status}: ${repoPath}`;
  const comp = component || "analysis";

  if (status === "failed") {
    logger.error(message, undefined, metadata, comp);
  } else {
    logger.info(message, metadata, comp);
  }
};

// Export both new and legacy logger for backward compatibility
export default logger;
export { legacyLogger };
