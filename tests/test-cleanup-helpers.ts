/**
 * Test-specific cleanup helpers
 * Utilities for tests that need custom cleanup beyond the standard cleanup
 */

import { promises as fs } from "node:fs";
import * as path from "node:path";
import { registerCleanupTask } from "./cleanup-manager";

/**
 * Cleanup helper for tests that create temporary files
 */
export class TempFileCleanup {
  private tempFiles: string[] = [];
  private tempDirs: string[] = [];

  /**
   * Register a temporary file for cleanup
   */
  addTempFile(filePath: string): void {
    this.tempFiles.push(filePath);
  }

  /**
   * Register a temporary directory for cleanup
   */
  addTempDir(dirPath: string): void {
    this.tempDirs.push(dirPath);
  }

  /**
   * Create a temporary file and register it for cleanup
   */
  async createTempFile(fileName: string, content = ""): Promise<string> {
    const tempPath = path.join(process.cwd(), "test-temp", fileName);
    await fs.mkdir(path.dirname(tempPath), { recursive: true });
    await fs.writeFile(tempPath, content);
    this.addTempFile(tempPath);
    return tempPath;
  }

  /**
   * Create a temporary directory and register it for cleanup
   */
  async createTempDir(dirName: string): Promise<string> {
    const tempPath = path.join(process.cwd(), "test-temp", dirName);
    await fs.mkdir(tempPath, { recursive: true });
    this.addTempDir(tempPath);
    return tempPath;
  }

  /**
   * Clean up all registered temporary files and directories
   */
  async cleanup(): Promise<void> {
    // Clean up files first
    for (const file of this.tempFiles) {
      try {
        await fs.unlink(file);
      } catch {
        // Ignore if file doesn't exist
      }
    }

    // Clean up directories
    for (const dir of this.tempDirs) {
      try {
        await fs.rm(dir, { recursive: true, force: true });
      } catch {
        // Ignore if directory doesn't exist
      }
    }

    // Clear the arrays
    this.tempFiles = [];
    this.tempDirs = [];
  }

  /**
   * Register this cleanup instance with the global cleanup manager
   */
  registerWithCleanupManager(testName: string): void {
    registerCleanupTask(`temp-files-${testName}`, () => this.cleanup(), 3);
  }
}

/**
 * Cleanup helper for tests that modify environment variables
 */
export class EnvCleanup {
  private originalEnv: Record<string, string | undefined> = {};

  /**
   * Set an environment variable and remember the original value
   */
  setEnv(key: string, value: string): void {
    if (!(key in this.originalEnv)) {
      this.originalEnv[key] = process.env[key];
    }
    process.env[key] = value;
  }

  /**
   * Delete an environment variable and remember the original value
   */
  deleteEnv(key: string): void {
    if (!(key in this.originalEnv)) {
      this.originalEnv[key] = process.env[key];
    }
    delete process.env[key];
  }

  /**
   * Restore all modified environment variables
   */
  restore(): void {
    for (const [key, originalValue] of Object.entries(this.originalEnv)) {
      if (originalValue === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalValue;
      }
    }
    this.originalEnv = {};
  }

  /**
   * Register this cleanup instance with the global cleanup manager
   */
  registerWithCleanupManager(testName: string): void {
    registerCleanupTask(`env-${testName}`, () => this.restore(), 2);
  }
}

/**
 * Cleanup helper for tests that create network connections or servers
 */
export class NetworkCleanup {
  private servers: Array<{ close: () => Promise<void> | void }> = [];
  private connections: Array<{ close: () => Promise<void> | void }> = [];

  /**
   * Register a server for cleanup
   */
  addServer(server: { close: () => Promise<void> | void }): void {
    this.servers.push(server);
  }

  /**
   * Register a connection for cleanup
   */
  addConnection(connection: { close: () => Promise<void> | void }): void {
    this.connections.push(connection);
  }

  /**
   * Close all registered servers and connections
   */
  async cleanup(): Promise<void> {
    // Close connections first
    for (const connection of this.connections) {
      try {
        await connection.close();
      } catch (_error) {}
    }

    // Close servers
    for (const server of this.servers) {
      try {
        await server.close();
      } catch (_error) {}
    }

    // Clear the arrays
    this.connections = [];
    this.servers = [];
  }

  /**
   * Register this cleanup instance with the global cleanup manager
   */
  registerWithCleanupManager(testName: string): void {
    registerCleanupTask(`network-${testName}`, () => this.cleanup(), 1);
  }
}

/**
 * Cleanup helper for tests that use timers and intervals
 */
export class TimerCleanup {
  private timers: NodeJS.Timeout[] = [];
  private intervals: NodeJS.Timeout[] = [];

  /**
   * Create a timeout and register it for cleanup
   */
  setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setTimeout(callback, delay);
    this.timers.push(timer);
    return timer;
  }

  /**
   * Create an interval and register it for cleanup
   */
  setInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(callback, delay);
    this.intervals.push(interval);
    return interval;
  }

  /**
   * Clear all registered timers and intervals
   */
  cleanup(): void {
    this.timers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.intervals.forEach((interval) => {
      clearInterval(interval);
    });
    this.timers = [];
    this.intervals = [];
  }

  /**
   * Register this cleanup instance with the global cleanup manager
   */
  registerWithCleanupManager(testName: string): void {
    registerCleanupTask(`timers-${testName}`, () => this.cleanup(), 1);
  }
}

/**
 * Create a comprehensive cleanup context for a test
 */
export function createTestCleanupContext(testName: string) {
  const tempFiles = new TempFileCleanup();
  const env = new EnvCleanup();
  const network = new NetworkCleanup();
  const timers = new TimerCleanup();

  // Register all cleanup helpers
  tempFiles.registerWithCleanupManager(testName);
  env.registerWithCleanupManager(testName);
  network.registerWithCleanupManager(testName);
  timers.registerWithCleanupManager(testName);

  return {
    tempFiles,
    env,
    network,
    timers,

    /**
     * Manual cleanup - call this in test teardown if needed
     */
    async cleanup() {
      await Promise.all([tempFiles.cleanup(), network.cleanup()]);
      env.restore();
      timers.cleanup();
    }
  };
}

/**
 * Decorator for test functions that automatically sets up cleanup
 */
export function withCleanup<T extends (...args: unknown[]) => unknown>(
  testName: string,
  testFn: T
): T {
  return ((...args: unknown[]) => {
    const cleanup = createTestCleanupContext(testName);

    try {
      const result = testFn(...args);

      // If the test function returns a promise, add cleanup to the chain
      if (
        result &&
        typeof result === "object" &&
        result !== null &&
        "then" in result &&
        typeof (result as Promise<unknown>).then === "function" &&
        "finally" in result &&
        typeof (result as Promise<unknown>).finally === "function"
      ) {
        return (result as Promise<unknown>).finally(() => cleanup.cleanup());
      }

      return result;
    } catch (error) {
      // Ensure cleanup runs even if test throws
      cleanup.cleanup().catch((error) => {
        // Log cleanup error without using console
        if (process?.stderr) {
          process.stderr.write(`Cleanup error: ${error}\n`);
        }
      });
      throw error;
    }
  }) as T;
}

/**
 * Utility to wait for all pending operations to complete
 */
export async function waitForPendingOperations(
  timeoutMs = 1000
): Promise<void> {
  return new Promise((resolve) => {
    // Wait for next tick to allow pending operations to complete
    setImmediate(() => {
      setTimeout(resolve, 0);
    });

    // Timeout to prevent hanging
    setTimeout(resolve, timeoutMs);
  });
}
