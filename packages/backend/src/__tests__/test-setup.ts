import { vi } from "vitest";

// Mock the health check to avoid file system operations in tests
vi.mock("../services/health.service", () => ({
  healthService: {
    healthCheckHandler: async (_req: any, res: any) => {
      res.status(200).json({
        status: "healthy",
        timestamp: new Date(),
        uptime: 0,
        version: "1.0.0-test",
        environment: "test",
        checks: [
          {
            name: "filesystem",
            status: "healthy",
            message: "Test filesystem",
            responseTime: 10,
            lastChecked: new Date(),
          },
          {
            name: "memory",
            status: "healthy",
            message: "Memory usage: 25%",
            responseTime: 5,
            lastChecked: new Date(),
          },
          {
            name: "disk",
            status: "healthy",
            message: "Disk check passed",
            responseTime: 15,
            lastChecked: new Date(),
          },
          {
            name: "llm-providers",
            status: "degraded",
            message: "No LLM providers configured in test",
            responseTime: 20,
            lastChecked: new Date(),
          },
        ],
      });
    },
    readinessHandler: async (_req: any, res: any) => {
      res.status(200).json({ status: "ready" });
    },
    livenessHandler: async (_req: any, res: any) => {
      res.status(200).json({
        status: "alive",
        timestamp: new Date(),
        uptime: 0,
      });
    },
  },
}));

// Set test environment
export const setupTestEnvironment = () => {
  process.env.NODE_ENV = "test";

  // Ensure data directories exist
  const fs = require("fs");
  const path = require("path");

  const dirs = ["data", "data/cache", "data/index", "logs", "backups"];
  dirs.forEach((dir) => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

// Clean up test environment
export const cleanupTestEnvironment = () => {
  process.env.NODE_ENV = "development";
};
