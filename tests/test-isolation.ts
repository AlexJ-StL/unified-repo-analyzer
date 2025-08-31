/**
 * Test isolation utilities
 * Provides utilities for ensuring proper test isolation and cleanup
 */

import { vi } from "vitest";

/**
 * Test isolation manager
 */
export class TestIsolationManager {
  private static instance: TestIsolationManager;
  private isolationTasks: Map<string, Array<() => Promise<void>>> = new Map();
  private globalCleanupTasks: Array<() => Promise<void>> = [];

  static getInstance(): TestIsolationManager {
    if (!TestIsolationManager.instance) {
      TestIsolationManager.instance = new TestIsolationManager();
    }
    return TestIsolationManager.instance;
  }

  /**
   * Add a cleanup task for a specific test
   */
  addTestCleanup(testId: string, task: () => Promise<void>): void {
    if (!this.isolationTasks.has(testId)) {
      this.isolationTasks.set(testId, []);
    }
    this.isolationTasks.get(testId)?.push(task);
  }

  /**
   * Add a global cleanup task
   */
  addGlobalCleanup(task: () => Promise<void>): void {
    this.globalCleanupTasks.push(task);
  }

  /**
   * Run cleanup for a specific test
   */
  async runTestCleanup(testId: string): Promise<void> {
    const tasks = this.isolationTasks.get(testId) || [];
    this.isolationTasks.delete(testId);

    await Promise.all(tasks.map((task) => task().catch((_error) => {})));
  }

  /**
   * Run all global cleanup tasks
   */
  async runGlobalCleanup(): Promise<void> {
    const tasks = [...this.globalCleanupTasks];
    this.globalCleanupTasks.length = 0;

    await Promise.all(tasks.map((task) => task().catch((_error) => {})));
  }

  /**
   * Reset all isolation state
   */
  reset(): void {
    this.isolationTasks.clear();
    this.globalCleanupTasks.length = 0;
  }
}

/**
 * Environment isolation utilities
 */
export namespace EnvironmentIsolation {
  let originalEnv: Record<string, string | undefined> = {};
  const modifiedKeys: Set<string> = new Set();

  /**
   * Set environment variable with cleanup tracking
   */
  export function setEnv(key: string, value: string): void {
    if (!modifiedKeys.has(key)) {
      originalEnv[key] = process.env[key];
      modifiedKeys.add(key);
    }
    process.env[key] = value;
  }

  /**
   * Restore all modified environment variables
   */
  export function restoreEnv(): void {
    for (const key of modifiedKeys) {
      const originalValue = originalEnv[key];
      if (originalValue === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalValue;
      }
    }
    modifiedKeys.clear();
    originalEnv = {};
  }
}

/**
 * Module isolation utilities
 */
export namespace ModuleIsolation {
  const mockedModules: Set<string> = new Set();

  /**
   * Mock a module with cleanup tracking
   */
  export function mockModule(
    modulePath: string,
    factory?: () => unknown
  ): void {
    mockedModules.add(modulePath);
    vi.mock(modulePath, factory as any);
  }

  /**
   * Restore all mocked modules
   */
  export function restoreModules(): void {
    for (const modulePath of mockedModules) {
      vi.unmock(modulePath);
    }
    mockedModules.clear();
    vi.resetModules();
  }
}

/**
 * DOM isolation utilities for frontend tests
 */
export namespace DOMIsolation {
  /**
   * Setup clean DOM state
   */
  export function setupCleanDOM(): void {
    if (typeof document !== "undefined") {
      // Clear document body
      document.body.innerHTML = "";

      // Reset document title
      document.title = "Test";

      // Clear any event listeners
      const newBody = document.createElement("body");
      document.body.parentNode?.replaceChild(newBody, document.body);
    }
  }

  /**
   * Cleanup DOM modifications
   */
  export function cleanupDOM(): void {
    if (typeof document !== "undefined") {
      document.body.innerHTML = "";

      // Remove any added stylesheets
      const stylesheets = document.querySelectorAll(
        'style, link[rel="stylesheet"]'
      );
      stylesheets.forEach((sheet) => {
        if (sheet.parentNode) {
          sheet.parentNode.removeChild(sheet);
        }
      });
    }
  }
}

/**
 * Timer isolation utilities
 */
export namespace TimerIsolation {
  const activeTimers: Set<NodeJS.Timeout> = new Set();
  const activeIntervals: Set<NodeJS.Timeout> = new Set();

  /**
   * Set timeout with cleanup tracking
   */
  export function setTimeout(
    callback: () => void,
    delay: number
  ): NodeJS.Timeout {
    const timer = globalThis.setTimeout(() => {
      activeTimers.delete(timer);
      callback();
    }, delay);
    activeTimers.add(timer);
    return timer;
  }

  /**
   * Set interval with cleanup tracking
   */
  export function setInterval(
    callback: () => void,
    delay: number
  ): NodeJS.Timeout {
    const interval = globalThis.setInterval(callback, delay);
    activeIntervals.add(interval);
    return interval;
  }

  /**
   * Clear all active timers and intervals
   */
  export function clearAll(): void {
    for (const timer of activeTimers) {
      clearTimeout(timer);
    }
    for (const interval of activeIntervals) {
      clearInterval(interval);
    }
    activeTimers.clear();
    activeIntervals.clear();
  }
}

/**
 * Complete test isolation setup
 */
export function setupTestIsolation(testId: string): void {
  const manager = TestIsolationManager.getInstance();

  // Setup cleanup tasks
  manager.addTestCleanup(testId, async () => {
    EnvironmentIsolation.restoreEnv();
    ModuleIsolation.restoreModules();
    DOMIsolation.cleanupDOM();
    TimerIsolation.clearAll();
  });

  // Setup clean state
  DOMIsolation.setupCleanDOM();
}

/**
 * Complete test isolation cleanup
 */
export async function cleanupTestIsolation(testId: string): Promise<void> {
  const manager = TestIsolationManager.getInstance();
  await manager.runTestCleanup(testId);
}
