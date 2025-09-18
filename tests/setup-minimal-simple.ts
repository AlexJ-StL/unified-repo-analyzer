/// <reference types="vitest" />
/// <reference types="node" />

import { vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';

// Set test environment variables BEFORE importing any services
process.env.NODE_ENV = 'test';

// Set up temporary directories for tests
const tempDir = path.join(tmpdir(), 'unified-repo-analyzer-test');
process.env.DATA_DIR = path.join(tempDir, 'data');
process.env.CACHE_DIR = path.join(tempDir, 'cache');
process.env.INDEX_DIR = path.join(tempDir, 'index');
process.env.LOG_DIR = path.join(tempDir, 'logs');
process.env.BACKUP_DIR = path.join(tempDir, 'backups');

// Create temporary directories
const dirs = [process.env.DATA_DIR, process.env.CACHE_DIR, process.env.INDEX_DIR, process.env.LOG_DIR, process.env.BACKUP_DIR];
dirs.forEach((dir) => {
  if (dir && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Mock the health service to avoid file system operations
vi.mock('../packages/backend/src/services/health.service', () => ({
  healthService: {
    healthCheckHandler: vi.fn().mockImplementation(async (_req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: 0,
        version: '1.0.0-test',
        environment: 'test',
        checks: [
          {
            name: 'filesystem',
            status: 'healthy',
            message: 'Test filesystem',
            responseTime: 10,
            lastChecked: new Date(),
          },
          {
            name: 'memory',
            status: 'healthy',
            message: 'Memory usage: 25%',
            responseTime: 5,
            lastChecked: new Date(),
          },
          {
            name: 'disk',
            status: 'healthy',
            message: 'Disk check passed',
            responseTime: 15,
            lastChecked: new Date(),
          },
          {
            name: 'llm-providers',
            status: 'degraded',
            message: 'No LLM providers configured in test',
            responseTime: 20,
            lastChecked: new Date(),
          },
        ],
      });
    }),
    readinessHandler: vi.fn().mockImplementation(async (_req, res) => {
      res.status(200).json({ status: 'ready' });
    }),
    livenessHandler: vi.fn().mockImplementation(async (_req, res) => {
      res.status(200).json({
        status: 'alive',
        timestamp: new Date(),
        uptime: 0,
      });
    }),
  },
}));

// Export vi for tests that need it
export { vi } from 'vitest';

// Export our mock manager utilities
export {
  cleanupMocks,
  createMock,
  mockFunction,
  mockModule,
  resetAllMocks,
  setupMocks,
} from './MockManager';

// Safe mocked function that works with both Bun and Vitest
export const mocked = <T>(item: T): T => {
  if (typeof vi?.mocked === 'function') {
    return vi.mocked(item) as unknown as T;
  }
  // Fallback for when vi.mocked is not available
  return item as T;
};
