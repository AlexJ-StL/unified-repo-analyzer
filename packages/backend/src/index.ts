import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { Server } from "socket.io";
// Import error middleware
import { errorHandler, notFound } from "./api/middleware/error.middleware";
// Import API routes
import apiRoutes from "./api/routes";
// Import WebSocket handlers
import { initializeWebSocketHandlers } from "./api/websocket";
// Import configuration and environment
import { env, validateProductionConfig } from "./config/environment";
// Import core modules
import * as core from "./core";
import { backupService } from "./services/backup.service";
import { configurationService } from "./services/config.service";
import { healthService } from "./services/health.service";
import logger, { requestLogger } from "./services/logger.service";
// Import services
import { metricsService } from "./services/metrics.service";

// Validate production configuration
try {
  validateProductionConfig();
} catch (error) {
  logger.error(
    "Configuration validation failed",
    error instanceof Error ? error : new Error(String(error))
  );
  process.exit(1);
}

// Initialize express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Logging middleware
app.use(requestLogger);

// Performance monitoring middleware
app.use(metricsService.requestMiddleware());

// Basic route
app.get("/", (_req, res) => {
  res.json({
    message: "Unified Repository Analyzer API",
    version: process.env.npm_package_version || "1.0.0",
    environment: env.NODE_ENV,
  });
});

// Health check endpoints
app.get("/health", healthService.healthCheckHandler);
app.get("/health/ready", healthService.readinessHandler);
app.get("/health/live", healthService.livenessHandler);

// Metrics endpoints
if (env.ENABLE_METRICS) {
  app.get("/metrics", metricsService.metricsHandler);
  app.get("/metrics/prometheus", metricsService.prometheusHandler);
}

// API routes
app.use("/api", apiRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize WebSocket handlers
initializeWebSocketHandlers(io);

// Initialize configuration service
configurationService.initialize().catch(console.error);

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);

  // Cleanup services
  backupService.destroy();

  httpServer.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server
httpServer.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`, {
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
    pid: process.pid,
  });
});

export { app, httpServer, io, core };
