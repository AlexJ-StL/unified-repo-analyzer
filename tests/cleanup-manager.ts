/**
 * Comprehensive test cleanup manager
 * Handles cleanup of all test artifacts, mocks, and state
 */

import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { performance } from 'node:perf_hooks';
import { vi } from 'vitest';

interface CleanupTask {
  name: string;
  cleanup: () => Promise<void> | void;
  priority: number; // Lower numbers run first
}

interface CleanupStats {
  tasksRun: number;
  totalTime: number;
  errors: Array<{ task: string; error: Error }>;
}

class TestCleanupManager {
  private cleanupTasks: CleanupTask[] = [];
  private isCleaningUp = false;
  private stats: CleanupStats = {
    tasksRun: 0,
    totalTime: 0,
    errors: [],
  };

  /**
   * Register a cleanup task
   */
  registerCleanupTask(task: CleanupTask): void {
    this.cleanupTasks.push(task);
    // Sort by priority (lower numbers first)
    this.cleanupTasks.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Run all cleanup tasks
   */
  async runCleanup(): Promise<CleanupStats> {
    if (this.isCleaningUp) {
      return this.stats;
    }

    this.isCleaningUp = true;
    const startTime = performance.now();

    // Reset stats
    this.stats = {
      tasksRun: 0,
      totalTime: 0,
      errors: [],
    };

    for (const task of this.cleanupTasks) {
      try {
        await task.cleanup();
        this.stats.tasksRun++;
      } catch (error) {
        this.stats.errors.push({
          task: task.name,
          error: error as Error,
        });
      }
    }

    this.stats.totalTime = performance.now() - startTime;
    this.isCleaningUp = false;

    return this.stats;
  }

  /**
   * Clear all registered cleanup tasks
   */
  clearTasks(): void {
    this.cleanupTasks = [];
  }

  /**
   * Get cleanup statistics
   */
  getStats(): CleanupStats {
    return { ...this.stats };
  }
}

// Global cleanup manager instance
export const cleanupManager = new TestCleanupManager();

// Register default cleanup tasks
cleanupManager.registerCleanupTask({
  name: 'mock-cleanup',
  priority: 1,
  cleanup: () => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.restoreAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  },
});

cleanupManager.registerCleanupTask({
  name: 'module-cache-cleanup',
  priority: 2,
  cleanup: () => {
    vi.resetModules();
  },
});

cleanupManager.registerCleanupTask({
  name: 'filesystem-cleanup',
  priority: 3,
  cleanup: async () => {
    await cleanupTestDirectories();
  },
});

cleanupManager.registerCleanupTask({
  name: 'dom-cleanup',
  priority: 4,
  cleanup: async () => {
    await cleanupDOM();
  },
});

cleanupManager.registerCleanupTask({
  name: 'process-cleanup',
  priority: 5,
  cleanup: () => {
    cleanupProcessState();
  },
});

cleanupManager.registerCleanupTask({
  name: 'memory-cleanup',
  priority: 6,
  cleanup: () => {
    cleanupMemory();
  },
});

/**
 * Cleanup test directories and files
 */
async function cleanupTestDirectories(): Promise<void> {
  const testDirs = [
    'test-logging-integration',
    'test-repo-analysis',
    'test-cache',
    'test-output',
    'test-temp',
    'test-data',
    'test-logs',
    'test-artifacts',
    '.test-tmp',
  ];

  const testFiles = ['test.log', 'test-audit.json', 'test-results.xml', 'coverage-temp.json'];

  // Cleanup directories
  for (const dir of testDirs) {
    const fullPath = path.join(process.cwd(), dir);
    try {
      await fs.rm(fullPath, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
  }

  // Cleanup files
  for (const file of testFiles) {
    const fullPath = path.join(process.cwd(), file);
    try {
      await fs.unlink(fullPath);
    } catch {
      // Ignore if doesn't exist
    }
  }

  // Cleanup any files matching test patterns
  try {
    const files = await fs.readdir(process.cwd());
    const testPatterns = [/^test-.*\.(log|tmp|cache)$/, /^\.test-/, /\.test\.temp$/];

    for (const file of files) {
      if (testPatterns.some((pattern) => pattern.test(file))) {
        try {
          const fullPath = path.join(process.cwd(), file);
          const stat = await fs.stat(fullPath);
          if (stat.isFile()) {
            await fs.unlink(fullPath);
          } else if (stat.isDirectory()) {
            await fs.rm(fullPath, { recursive: true, force: true });
          }
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  } catch {
    // Ignore if can't read directory
  }
}

/**
 * Cleanup DOM state
 */
async function cleanupDOM(): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  try {
    // Clear document body
    if (document.body) {
      document.body.innerHTML = '';
    }

    // Clear document head of test-added elements
    const testElements = document.head.querySelectorAll('[data-test]');
    testElements.forEach((el) => el.remove());

    // Clear any event listeners added during tests
    const events = ['click', 'change', 'input', 'submit', 'load', 'resize'];
    events.forEach((event) => {
      document.removeEventListener(event, () => {});
      window.removeEventListener(event, () => {});
    });

    // Reset document title
    document.title = 'Test';

    // Clear localStorage and sessionStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }

    // Clear any test cookies
    if (document.cookie) {
      document.cookie.split(';').forEach((cookie) => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    }

    // Use testing-library cleanup if available
    try {
      const { cleanup } = await import('@testing-library/react');
      cleanup();
    } catch {
      // Not available, skip
    }
  } catch (_error) {}
}

/**
 * Cleanup process state
 */
function cleanupProcessState(): void {
  // Reset NODE_ENV if it was changed
  if (process.env.NODE_ENV !== 'test') {
    process.env.NODE_ENV = 'test';
  }

  // Clear any test-specific environment variables
  const testEnvVars = Object.keys(process.env).filter(
    (key) => key.startsWith('TEST_') || key.startsWith('VITEST_') || key.includes('_TEST_')
  );

  testEnvVars.forEach((key) => {
    if (!key.startsWith('VITEST_')) {
      // Don't remove vitest's own vars
      delete process.env[key];
    }
  });

  // Clear any test-added process listeners
  const testEvents = ['uncaughtException', 'unhandledRejection', 'warning'];
  testEvents.forEach((event) => {
    process.removeAllListeners(event);
  });

  // Reset process.cwd if it was changed (though this is rare)
  try {
    process.chdir(process.cwd());
  } catch {
    // Ignore if can't change directory
  }
}

/**
 * Cleanup memory and references
 */
function cleanupMemory(): void {
  // Force garbage collection if available (Node.js with --expose-gc)
  if (global.gc) {
    global.gc();
  }

  // Clear any global test variables
  const globalKeys = Object.keys(global).filter(
    (key) => key.startsWith('test') || key.startsWith('mock') || key.includes('Test')
  );

  globalKeys.forEach((key) => {
    try {
      delete (global as any)[key];
    } catch {
      // Ignore if can't delete
    }
  });
}

/**
 * Register a custom cleanup task
 */
export function registerCleanupTask(
  name: string,
  cleanup: () => Promise<void> | void,
  priority = 10
): void {
  cleanupManager.registerCleanupTask({ name, cleanup, priority });
}

/**
 * Run all cleanup tasks
 */
export async function runCleanup(): Promise<CleanupStats> {
  return cleanupManager.runCleanup();
}

/**
 * Get cleanup statistics
 */
export function getCleanupStats(): CleanupStats {
  return cleanupManager.getStats();
}

/**
 * Clear all cleanup tasks (useful for testing the cleanup system itself)
 */
export function clearCleanupTasks(): void {
  cleanupManager.clearTasks();
}

/**
 * Cleanup specific to database connections and external resources
 */
export async function cleanupExternalResources(): Promise<void> {
  // This would be called by tests that use external resources
  // Implementation depends on what external resources are used
  // Example patterns:
  // - Close database connections
  // - Clear Redis cache
  // - Stop HTTP servers
  // - Close file handles
  // - Cancel pending network requests
}

/**
 * Emergency cleanup - runs all cleanup tasks synchronously
 * Use only when async cleanup is not possible
 */
export function emergencyCleanup(): void {
  try {
    // Run only synchronous cleanup tasks
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.restoreAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();

    cleanupProcessState();
    cleanupMemory();
  } catch (_error) {}
}
