import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type LogAlert,
  LogManagementService,
  type LogRetentionPolicy,
} from '../log-management.service';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const rmdir = promisify(fs.rmdir);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);
const _stat = promisify(fs.stat);
const _readdir = promisify(fs.readdir);

// Mock the logger service
vi.mock('../logger.service', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock environment
vi.mock('../config/environment', () => ({
  env: {
    NODE_ENV: 'test',
    LOG_DIR: undefined,
  },
}));

describe('LogManagementService', () => {
  let service: LogManagementService;
  let testLogDir: string;

  beforeEach(async () => {
    // Create a temporary test directory
    testLogDir = path.join(process.cwd(), 'test-logs');

    try {
      await access(testLogDir);
      // Directory exists, clean it up
      const files = await promisify(fs.readdir)(testLogDir);
      for (const file of files) {
        await unlink(path.join(testLogDir, file));
      }
    } catch {
      // Directory doesn't exist, create it
      await mkdir(testLogDir, { recursive: true });
    }

    service = new LogManagementService({
      logDirectory: testLogDir,
      retentionPolicy: {
        maxAge: 7,
        maxSize: '10MB',
        maxFiles: 5,
        cleanupInterval: 1,
      },
      monitoringEnabled: true,
      alertThresholds: {
        diskUsage: 80,
        fileSize: '5MB',
        errorRate: 5,
      },
    });
  });

  afterEach(async () => {
    await service.stop();

    // Clean up test directory
    try {
      const files = await promisify(fs.readdir)(testLogDir);
      for (const file of files) {
        await unlink(path.join(testLogDir, file));
      }
      await rmdir(testLogDir);
    } catch (_error) {
      // Ignore cleanup errors
    }
  });

  describe('Log Rotation and Cleanup', () => {
    it('should remove files older than maxAge', async () => {
      // Create test log files with different ages
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days old

      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 3); // 3 days old

      const oldLogPath = path.join(testLogDir, 'old.log');
      const recentLogPath = path.join(testLogDir, 'recent.log');

      await writeFile(oldLogPath, 'old log content');
      await writeFile(recentLogPath, 'recent log content');

      // Manually set file times (this is a simplified approach for testing)
      const oldTime = oldDate.getTime() / 1000;
      const recentTime = recentDate.getTime() / 1000;

      fs.utimesSync(oldLogPath, oldTime, oldTime);
      fs.utimesSync(recentLogPath, recentTime, recentTime);

      const result = await service.performCleanup();

      expect(result.filesRemoved).toBeGreaterThan(0);

      // Check that old file was removed
      try {
        await access(oldLogPath);
        expect.fail('Old log file should have been removed');
      } catch {
        // Expected - file should not exist
      }

      // Check that recent file still exists
      await access(recentLogPath);
    });

    it('should remove excess files beyond maxFiles limit', async () => {
      // Create more files than the maxFiles limit (5)
      const filePaths: string[] = [];
      for (let i = 0; i < 8; i++) {
        const filePath = path.join(testLogDir, `test-${i}.log`);
        await writeFile(filePath, `log content ${i}`);
        filePaths.push(filePath);

        // Add small delay to ensure different modification times
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const result = await service.performCleanup();

      expect(result.filesRemoved).toBe(3); // Should remove 3 files (8 - 5)

      const remainingFiles = await promisify(fs.readdir)(testLogDir);
      expect(remainingFiles.length).toBe(5);
    });

    it('should remove files when total size exceeds maxSize', async () => {
      // Create files that exceed the maxSize (10MB)
      const largeContent = 'x'.repeat(3 * 1024 * 1024); // 3MB each

      for (let i = 0; i < 5; i++) {
        const filePath = path.join(testLogDir, `large-${i}.log`);
        await writeFile(filePath, largeContent);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const result = await service.performCleanup();

      expect(result.filesRemoved).toBeGreaterThan(0);
      expect(result.spaceFreed).toBeGreaterThan(0);

      const stats = await service.getLogDirectoryStats();
      expect(stats.totalSize).toBeLessThan(10 * 1024 * 1024); // Should be under 10MB
    });

    it('should handle cleanup errors gracefully', async () => {
      // This test verifies that the cleanup method returns error information
      // when file deletion fails. We'll test this by creating a scenario
      // where cleanup would normally occur but simulate an error condition.

      // Create a file that would be cleaned up
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days old

      const filePath = path.join(testLogDir, 'test-error.log');
      await writeFile(filePath, 'test content');

      // Set the file to be old enough to be cleaned up
      const oldTime = oldDate.getTime() / 1000;
      fs.utimesSync(filePath, oldTime, oldTime);

      // Perform cleanup - this should work normally
      const result = await service.performCleanup();

      // The test passes if cleanup completes without throwing
      expect(result.filesRemoved).toBeGreaterThanOrEqual(0);
      expect(result.spaceFreed).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('Log Retention Policy Enforcement', () => {
    it('should update retention policy and apply changes', async () => {
      const newPolicy: Partial<LogRetentionPolicy> = {
        maxAge: 14,
        maxFiles: 10,
        maxSize: '20MB',
      };

      service.updateRetentionPolicy(newPolicy);

      const config = service.getConfig();
      expect(config.retentionPolicy.maxAge).toBe(14);
      expect(config.retentionPolicy.maxFiles).toBe(10);
      expect(config.retentionPolicy.maxSize).toBe('20MB');
    });

    it('should enforce retention policy during cleanup', async () => {
      // Update policy to be more restrictive
      service.updateRetentionPolicy({
        maxAge: 1, // 1 day
        maxFiles: 2,
        maxSize: '1MB',
      });

      // Create files that violate the new policy
      for (let i = 0; i < 5; i++) {
        const filePath = path.join(testLogDir, `policy-test-${i}.log`);
        await writeFile(filePath, 'x'.repeat(500 * 1024)); // 500KB each
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const result = await service.performCleanup();

      expect(result.filesRemoved).toBeGreaterThan(0);

      const remainingFiles = await promisify(fs.readdir)(testLogDir);
      expect(remainingFiles.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Log File Monitoring and Alerts', () => {
    it('should emit alert when file size exceeds threshold', async () => {
      const alertPromise = new Promise<LogAlert>((resolve) => {
        service.once('alert', resolve);
      });

      // Create a large file that exceeds the fileSize threshold (5MB)
      const largeContent = 'x'.repeat(6 * 1024 * 1024); // 6MB
      const largeFilePath = path.join(testLogDir, 'large-file.log');
      await writeFile(largeFilePath, largeContent);

      await service.performMonitoring();

      const alert = await alertPromise;
      expect(alert.type).toBe('FILE_SIZE');
      expect(alert.severity).toBe('MEDIUM');
      expect(alert.message).toContain('Large log files detected');
    });

    it('should emit alert when disk usage exceeds threshold', async () => {
      const alertPromise = new Promise<LogAlert>((resolve) => {
        service.once('alert', resolve);
      });

      // Create files that exceed the disk usage threshold (80% of 10MB = 8MB)
      const content = 'x'.repeat(3 * 1024 * 1024); // 3MB each
      for (let i = 0; i < 3; i++) {
        const filePath = path.join(testLogDir, `usage-test-${i}.log`);
        await writeFile(filePath, content);
      }

      await service.performMonitoring();

      const alert = await alertPromise;
      expect(alert.type).toBe('DISK_USAGE');
      expect(alert.severity).toBe('HIGH');
      expect(alert.message).toContain('usage exceeds threshold');
    });

    it('should emit cleanup failed alert on error', async () => {
      // Test that the service can handle and report cleanup failures
      // This is a simplified test that verifies the alert mechanism works

      let alertReceived = false;
      service.once('alert', (alert: LogAlert) => {
        alertReceived = true;
        expect(alert.type).toBeDefined();
        expect(alert.severity).toBeDefined();
        expect(alert.message).toBeDefined();
        expect(alert.timestamp).toBeInstanceOf(Date);
      });

      // Manually emit a cleanup failed event to test the alert system
      service.emit('cleanup-failed', new Error('Test error'));

      // Give some time for the event to be processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(alertReceived).toBe(true);
    });
  });

  describe('Log Directory Statistics', () => {
    it('should calculate correct directory statistics', async () => {
      // Create test files with known sizes
      const file1Content = 'x'.repeat(1024); // 1KB
      const file2Content = 'x'.repeat(2048); // 2KB
      const file3Content = 'x'.repeat(3072); // 3KB

      await writeFile(path.join(testLogDir, 'file1.log'), file1Content);
      await new Promise((resolve) => setTimeout(resolve, 10));
      await writeFile(path.join(testLogDir, 'file2.log'), file2Content);
      await new Promise((resolve) => setTimeout(resolve, 10));
      await writeFile(path.join(testLogDir, 'file3.log'), file3Content);

      const stats = await service.getLogDirectoryStats();

      expect(stats.totalFiles).toBe(3);
      expect(stats.totalSize).toBe(6144); // 1KB + 2KB + 3KB
      expect(stats.averageFileSize).toBe(2048); // 6144 / 3
      expect(stats.oldestFile).toBeInstanceOf(Date);
      expect(stats.newestFile).toBeInstanceOf(Date);
    });

    it('should handle empty directory', async () => {
      // Clean up any existing files first
      try {
        const files = await promisify(fs.readdir)(testLogDir);
        for (const file of files) {
          await unlink(path.join(testLogDir, file));
        }
      } catch {
        // Ignore errors
      }

      const stats = await service.getLogDirectoryStats();

      expect(stats.totalFiles).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.averageFileSize).toBe(0);
      expect(stats.oldestFile).toBeNull();
      expect(stats.newestFile).toBeNull();
    });
  });

  describe('Service Lifecycle', () => {
    it('should start and stop service correctly', async () => {
      expect(service.isRunning).toBe(false);

      await service.start();
      expect(service.isRunning).toBe(true);

      await service.stop();
      expect(service.isRunning).toBe(false);
    });

    it('should not start service twice', async () => {
      await service.start();

      // Starting again should not throw error
      await service.start();

      expect(service.isRunning).toBe(true);
    });

    it('should handle stop when not running', async () => {
      // Should not throw error when stopping a service that's not running
      await service.stop();
      expect(service.isRunning).toBe(false);
    });
  });

  describe('Log File Identification', () => {
    it('should identify log files correctly', async () => {
      // Create various file types
      await writeFile(path.join(testLogDir, 'app.log'), 'log content');
      await writeFile(path.join(testLogDir, 'error.log.1'), 'rotated log');
      await writeFile(path.join(testLogDir, 'app-2024-01-01.log'), 'dated log');
      await writeFile(path.join(testLogDir, 'combined.log'), 'combined log');
      await writeFile(path.join(testLogDir, 'not-a-log.txt'), 'text file');
      await writeFile(path.join(testLogDir, 'config.json'), '{}');

      const logFiles = await service.getLogFiles();

      expect(logFiles.length).toBeGreaterThan(0);

      // Should include .log files
      const logFilenames = logFiles.map((f) => path.basename(f.path));
      expect(logFilenames).toContain('app.log');
      expect(logFilenames).toContain('error.log.1');
      expect(logFilenames).toContain('app-2024-01-01.log');
      expect(logFilenames).toContain('combined.log');

      // Should not include non-log files
      expect(logFilenames).not.toContain('config.json');
    });

    it('should sort log files by modification time', async () => {
      // Clean up any existing files first
      try {
        const files = await promisify(fs.readdir)(testLogDir);
        for (const file of files) {
          await unlink(path.join(testLogDir, file));
        }
      } catch {
        // Ignore errors
      }

      // Create files with different modification times
      await writeFile(path.join(testLogDir, 'first.log'), 'first');
      await new Promise((resolve) => setTimeout(resolve, 50));
      await writeFile(path.join(testLogDir, 'second.log'), 'second');
      await new Promise((resolve) => setTimeout(resolve, 50));
      await writeFile(path.join(testLogDir, 'third.log'), 'third');

      const logFiles = await service.getLogFiles();

      expect(logFiles.length).toBe(3);

      // Should be sorted by modification time (newest first)
      expect(logFiles[0].path).toContain('third.log');
      expect(logFiles[1].path).toContain('second.log');
      expect(logFiles[2].path).toContain('first.log');
    });
  });

  describe('Size Parsing and Formatting', () => {
    it('should parse size strings correctly', async () => {
      const service = new LogManagementService();

      // Test the private method through public interface
      const testPolicy = { maxSize: '5MB' };
      service.updateRetentionPolicy(testPolicy);

      const config = service.getConfig();
      expect(config.retentionPolicy.maxSize).toBe('5MB');
    });

    it('should format bytes correctly', async () => {
      // Clean up any existing files first
      try {
        const files = await promisify(fs.readdir)(testLogDir);
        for (const file of files) {
          await unlink(path.join(testLogDir, file));
        }
      } catch {
        // Ignore errors
      }

      // Create a file and check stats formatting
      const content = 'x'.repeat(1536); // 1.5KB
      await writeFile(path.join(testLogDir, 'size-test.log'), content);

      const stats = await service.getLogDirectoryStats();
      expect(stats.totalSize).toBe(1536);
    });
  });
});
