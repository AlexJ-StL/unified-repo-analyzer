/**
 * Test isolation utilities
 * Provides utilities for ensuring proper test isolation and cleanup
 * Enhanced with comprehensive module cache clearing and global state management
 */

import { vi } from 'vitest';

/**
 * Enhanced Test Isolation Manager
 * Provides comprehensive test isolation with module cache clearing,
 * global variable reset, and environment management
 */
export class IsolationManager {
  private static instance: IsolationManager;
  private isolationTasks: Map<string, Array<() => Promise<void>>> = new Map();
  private globalCleanupTasks: Array<() => Promise<void>> = [];
  private moduleCache: Map<string, unknown> = new Map();
  private globalVariables: Map<string, unknown> = new Map();
  private originalConsole: Console;
  private isIsolationActive = false;

  static getInstance(): IsolationManager {
    if (!IsolationManager.instance) {
      IsolationManager.instance = new IsolationManager();
    }
    return IsolationManager.instance;
  }

  constructor() {
    this.originalConsole = { ...console };
  }

  /**
   * Initialize isolation for a test
   */
  async initializeIsolation(testId: string): Promise<void> {
    this.isIsolationActive = true;

    // Store original global state
    this.storeGlobalState();

    // Clear module cache
    this.clearModuleCache();

    // Setup clean environment
    await this.setupCleanEnvironment();

    // Register cleanup for this test
    this.addTestCleanup(testId, async () => {
      await this.restoreGlobalState();
      this.clearModuleCache();
    });
  }

  /**
   * Store current global state for restoration
   */
  private storeGlobalState(): void {
    // Store global variables that might be modified by tests
    const globalVarsToTrack = [
      'process',
      'Buffer',
      'global',
      'globalThis',
      '__dirname',
      '__filename',
      'require',
      'module',
      'exports',
    ];

    globalVarsToTrack.forEach((varName) => {
      if (varName in globalThis) {
        this.globalVariables.set(varName, (globalThis as Record<string, unknown>)[varName]);
      }
    });

    // Store process.env separately for detailed tracking
    this.globalVariables.set('process.env', { ...process.env });
  }

  /**
   * Restore original global state
   */
  private async restoreGlobalState(): Promise<void> {
    // Restore global variables
    this.globalVariables.forEach((value, key) => {
      if (key === 'process.env') {
        // Restore environment variables
        const originalEnv = value as Record<string, string>;
        Object.keys(process.env).forEach((key) => {
          if (!(key in originalEnv)) {
            delete process.env[key];
          }
        });
        Object.assign(process.env, originalEnv);
      } else {
        (globalThis as Record<string, unknown>)[key] = value;
      }
    });

    // Restore console
    Object.assign(console, this.originalConsole);
  }

  /**
   * Clear module cache to ensure fresh imports
   */
  private clearModuleCache(): void {
    try {
      // Clear Vitest module cache if available
      if (typeof vi !== 'undefined' && typeof vi.resetModules === 'function') {
        vi.resetModules();
      }

      // Clear Node.js require cache
      if (require?.cache) {
        Object.keys(require.cache).forEach((key) => {
          // Only clear test-related modules, preserve core Node modules
          if (!key.includes('node_modules') || key.includes('vitest') || key.includes('test')) {
            delete require.cache[key];
          }
        });
      }

      // Clear dynamic import cache (if supported)
      if (
        typeof globalThis !== 'undefined' &&
        (globalThis as Record<string, unknown>).__vitest_mocker__
      ) {
        const mocker = (globalThis as Record<string, unknown>).__vitest_mocker__;
        if (typeof mocker.resetCache === 'function') {
          mocker.resetCache();
        }
      }
    } catch (_error) {}
  }

  /**
   * Setup clean environment for test execution
   */
  private async setupCleanEnvironment(): Promise<void> {
    // Reset process.env.NODE_ENV
    process.env.NODE_ENV = 'test';

    // Clear any test-specific environment variables
    const testEnvVars = Object.keys(process.env).filter(
      (key) => key.startsWith('TEST_') || key.startsWith('VITEST_')
    );
    testEnvVars.forEach((key) => {
      if (!this.globalVariables.has(`process.env.${key}`)) {
        delete process.env[key];
      }
    });

    // Reset console to prevent test output pollution
    if (process.env.NODE_ENV === 'test') {
      console.log = vi?.fn?.() || (() => {});
      console.warn = vi?.fn?.() || (() => {});
      console.error = vi?.fn?.() || (() => {});
    }
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

    await Promise.all(
      tasks.map(async (task) => {
        try {
          await task();
        } catch (_error) {}
      })
    );
  }

  /**
   * Run all global cleanup tasks
   */
  async runGlobalCleanup(): Promise<void> {
    const tasks = [...this.globalCleanupTasks];
    this.globalCleanupTasks.length = 0;

    await Promise.all(
      tasks.map(async (task) => {
        try {
          await task();
        } catch (_error) {}
      })
    );

    this.isIsolationActive = false;
  }

  /**
   * Emergency cleanup - force reset everything
   */
  async emergencyCleanup(): Promise<void> {
    try {
      // Force clear all isolation tasks
      this.isolationTasks.clear();

      // Restore global state
      await this.restoreGlobalState();

      // Clear module cache
      this.clearModuleCache();

      // Run global cleanup
      await this.runGlobalCleanup();

      // Reset internal state
      this.reset();
    } catch (_error) {}
  }

  /**
   * Reset all isolation state
   */
  reset(): void {
    this.isolationTasks.clear();
    this.globalCleanupTasks.length = 0;
    this.moduleCache.clear();
    this.globalVariables.clear();
    this.isIsolationActive = false;
  }

  /**
   * Check if isolation is currently active
   */
  isActive(): boolean {
    return this.isIsolationActive;
  }

  /**
   * Get isolation statistics
   */
  getStats(): {
    activeTests: number;
    globalTasks: number;
    cachedModules: number;
    trackedGlobals: number;
  } {
    return {
      activeTests: this.isolationTasks.size,
      globalTasks: this.globalCleanupTasks.length,
      cachedModules: this.moduleCache.size,
      trackedGlobals: this.globalVariables.size,
    };
  }
}

// Backward compatibility
export class TestIsolationManager extends IsolationManager {}

/**
 * Enhanced Environment isolation utilities
 */
export namespace EnvironmentIsolation {
  let originalEnv: Record<string, string | undefined> = {};
  const modifiedKeys: Set<string> = new Set();
  let envSnapshot: Record<string, string | undefined> = {};

  /**
   * Create a snapshot of current environment
   */
  export function createSnapshot(): void {
    envSnapshot = { ...process.env };
  }

  /**
   * Restore environment from snapshot
   */
  export function restoreFromSnapshot(): void {
    // Remove keys that weren't in the snapshot
    Object.keys(process.env).forEach((key) => {
      if (!(key in envSnapshot)) {
        delete process.env[key];
      }
    });

    // Restore original values
    Object.entries(envSnapshot).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  }

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
   * Set multiple environment variables
   */
  export function setEnvVars(vars: Record<string, string>): void {
    Object.entries(vars).forEach(([key, value]) => {
      setEnv(key, value);
    });
  }

  /**
   * Temporarily override environment variables for a function
   */
  export async function withEnv<T>(
    vars: Record<string, string>,
    fn: () => Promise<T> | T
  ): Promise<T> {
    const backup = { ...process.env };
    try {
      setEnvVars(vars);
      return await fn();
    } finally {
      Object.keys(process.env).forEach((key) => {
        if (!(key in backup)) {
          delete process.env[key];
        }
      });
      Object.assign(process.env, backup);
    }
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

  /**
   * Clear all test-related environment variables
   */
  export function clearTestEnv(): void {
    const testKeys = Object.keys(process.env).filter(
      (key) =>
        key.startsWith('TEST_') ||
        key.startsWith('VITEST_') ||
        key.startsWith('NODE_TEST_') ||
        key.includes('_TEST')
    );

    testKeys.forEach((key) => {
      delete process.env[key];
    });
  }
}

/**
 * Enhanced Module isolation utilities
 */
export namespace ModuleIsolation {
  const mockedModules: Set<string> = new Set();
  const moduleSnapshots: Map<string, unknown> = new Map();
  const requireCacheSnapshot: Map<string, unknown> = new Map();

  /**
   * Create a snapshot of the current module cache
   */
  export function createCacheSnapshot(): void {
    requireCacheSnapshot.clear();

    if (require?.cache) {
      Object.entries(require.cache).forEach(([key, value]) => {
        requireCacheSnapshot.set(key, value);
      });
    }
  }

  /**
   * Restore module cache from snapshot
   */
  export function restoreCacheFromSnapshot(): void {
    if (require?.cache) {
      // Clear current cache
      Object.keys(require.cache).forEach((key) => {
        delete require.cache[key];
      });

      // Restore from snapshot
      requireCacheSnapshot.forEach((value, key) => {
        require.cache[key] = value as NodeJS.Module;
      });
    }
  }

  /**
   * Clear module cache selectively
   */
  export function clearCache(patterns?: string[]): void {
    if (require?.cache) {
      const keysToDelete = Object.keys(require.cache).filter((key) => {
        if (!patterns || patterns.length === 0) {
          // Clear test-related modules by default
          return (
            key.includes('test') ||
            key.includes('spec') ||
            key.includes('mock') ||
            !key.includes('node_modules')
          );
        }

        return patterns.some((pattern) => key.includes(pattern));
      });

      keysToDelete.forEach((key) => {
        delete require.cache[key];
      });
    }

    // Clear Vitest module cache
    if (typeof vi !== 'undefined' && typeof vi.resetModules === 'function') {
      vi.resetModules();
    }
  }

  /**
   * Mock a module with cleanup tracking
   */
  export function mockModule(modulePath: string, _factory?: () => unknown): void {
    mockedModules.add(modulePath);

    // Store original module if it exists
    try {
      if (typeof require !== 'undefined') {
        const resolved = require.resolve(modulePath);
        if (require.cache[resolved] && !moduleSnapshots.has(modulePath)) {
          moduleSnapshots.set(modulePath, require.cache[resolved]);
        }
      }
    } catch {
      // Module doesn't exist yet, that's fine
    }

    // Use MockManager for actual mocking to avoid module loading issues
  }

  /**
   * Restore a specific mocked module
   */
  export function restoreModule(modulePath: string): void {
    mockedModules.delete(modulePath);

    const snapshot = moduleSnapshots.get(modulePath);
    if (snapshot && typeof require !== 'undefined') {
      try {
        const resolved = require.resolve(modulePath);
        require.cache[resolved] = snapshot as NodeJS.Module;
      } catch {
        // Module resolution failed, clear from cache instead
        try {
          const resolved = require.resolve(modulePath);
          delete require.cache[resolved];
        } catch {
          // Ignore resolution errors
        }
      }
    }

    moduleSnapshots.delete(modulePath);
  }

  /**
   * Restore all mocked modules
   */
  export function restoreModules(): void {
    // Restore individual modules
    Array.from(mockedModules).forEach((modulePath) => {
      restoreModule(modulePath);
    });

    mockedModules.clear();
    moduleSnapshots.clear();

    // Clear Vitest module cache
    if (typeof vi !== 'undefined' && typeof vi.resetModules === 'function') {
      vi.resetModules();
    }
  }

  /**
   * Force clear all module caches
   */
  export function forceClearAll(): void {
    // Clear require cache
    if (require?.cache) {
      Object.keys(require.cache).forEach((key) => {
        delete require.cache[key];
      });
    }

    // Clear Vitest cache
    if (typeof vi !== 'undefined' && typeof vi.resetModules === 'function') {
      vi.resetModules();
    }

    // Clear internal tracking
    mockedModules.clear();
    moduleSnapshots.clear();
    requireCacheSnapshot.clear();
  }

  /**
   * Get module cache statistics
   */
  export function getCacheStats(): {
    requireCacheSize: number;
    mockedModulesCount: number;
    snapshotsCount: number;
  } {
    return {
      requireCacheSize: require?.cache ? Object.keys(require.cache).length : 0,
      mockedModulesCount: mockedModules.size,
      snapshotsCount: moduleSnapshots.size,
    };
  }
}

/**
 * Enhanced DOM isolation utilities for frontend tests
 */
export namespace DOMIsolation {
  let originalDocument: Document | null = null;
  let _originalWindow: Window | null = null;
  const addedElements: Set<Element> = new Set();
  const modifiedAttributes: Map<Element, Map<string, string | null>> = new Map();

  /**
   * Create DOM snapshot for restoration
   */
  export function createSnapshot(): void {
    if (typeof document !== 'undefined') {
      originalDocument = document.cloneNode(true) as Document;
    }
    if (typeof window !== 'undefined') {
      _originalWindow = { ...window } as Window;
    }
  }

  /**
   * Setup clean DOM state
   */
  export function setupCleanDOM(): void {
    if (typeof document !== 'undefined') {
      // Clear document body
      document.body.innerHTML = '';

      // Reset document title
      document.title = 'Test';

      // Clear any event listeners by replacing body
      const newBody = document.createElement('body');
      if (document.body.parentNode) {
        document.body.parentNode.replaceChild(newBody, document.body);
      }

      // Reset document head to minimal state
      const head = document.head;
      const elementsToRemove = head.querySelectorAll('style, link[rel="stylesheet"], script[src]');
      elementsToRemove.forEach((element) => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });

      // Reset viewport meta tag
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.setAttribute('name', 'viewport');
        head.appendChild(viewport);
      }
      viewport.setAttribute('content', 'width=device-width, initial-scale=1');
    }

    // Setup global DOM objects if in jsdom environment
    if (typeof global !== 'undefined' && typeof window !== 'undefined') {
      setupGlobalDOMObjects();
    }
  }

  /**
   * Setup global DOM objects for testing
   */
  function setupGlobalDOMObjects(): void {
    // Mock common DOM APIs that might be missing in jsdom
    if (typeof window !== 'undefined') {
      // ResizeObserver
      if (!window.ResizeObserver) {
        window.ResizeObserver = class ResizeObserver {
          observe() {}
          unobserve() {}
          disconnect() {}
        } as any;
      }

      // IntersectionObserver
      if (!window.IntersectionObserver) {
        window.IntersectionObserver = class IntersectionObserver {
          observe() {}
          unobserve() {}
          disconnect() {}
        } as any;
      }

      // matchMedia
      if (!window.matchMedia) {
        window.matchMedia = (query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        });
      }

      // requestAnimationFrame
      if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (callback: FrameRequestCallback) => {
          return setTimeout(() => callback(Date.now()), 16) as unknown as number;
        };
      }

      // cancelAnimationFrame
      if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = (id: number) => {
          clearTimeout(id);
        };
      }

      // getComputedStyle
      if (!window.getComputedStyle) {
        window.getComputedStyle = () =>
          ({
            getPropertyValue: () => '',
          }) as unknown as CSSStyleDeclaration;
      }
    }
  }

  /**
   * Track element addition for cleanup
   */
  export function trackElement(element: Element): void {
    addedElements.add(element);
  }

  /**
   * Track attribute modification for restoration
   */
  export function trackAttribute(
    element: Element,
    attribute: string,
    originalValue: string | null
  ): void {
    if (!modifiedAttributes.has(element)) {
      modifiedAttributes.set(element, new Map());
    }
    const elementAttrs = modifiedAttributes.get(element) ?? new Map();
    if (!elementAttrs.has(attribute)) {
      elementAttrs.set(attribute, originalValue);
    }
  }

  /**
   * Cleanup DOM modifications
   */
  export function cleanupDOM(): void {
    if (typeof document !== 'undefined') {
      // Remove tracked elements
      addedElements.forEach((element) => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      addedElements.clear();

      // Restore modified attributes
      modifiedAttributes.forEach((attrs, element) => {
        attrs.forEach((originalValue, attribute) => {
          if (originalValue === null) {
            element.removeAttribute(attribute);
          } else {
            element.setAttribute(attribute, originalValue);
          }
        });
      });
      modifiedAttributes.clear();

      // Clear document body
      document.body.innerHTML = '';

      // Remove any added stylesheets and scripts
      const elementsToRemove = document.querySelectorAll(
        'style, link[rel="stylesheet"], script[src]'
      );
      elementsToRemove.forEach((element) => {
        if (element.parentNode && !element.hasAttribute('data-keep')) {
          element.parentNode.removeChild(element);
        }
      });

      // Reset document title
      document.title = 'Test';

      // Clear any custom properties on document
      Object.keys(document).forEach((key) => {
        if (key.startsWith('test') || key.startsWith('mock')) {
          delete (document as Record<string, unknown>)[key];
        }
      });
    }

    // Clean up window object if available
    if (typeof window !== 'undefined') {
      // Remove test-related properties
      Object.keys(window).forEach((key) => {
        if (key.startsWith('test') || key.startsWith('mock')) {
          delete (window as Record<string, unknown>)[key];
        }
      });
    }
  }

  /**
   * Restore DOM from snapshot
   */
  export function restoreFromSnapshot(): void {
    if (originalDocument && typeof document !== 'undefined') {
      // This is a simplified restoration - in practice, full DOM restoration is complex
      document.body.innerHTML = originalDocument.body.innerHTML;
      document.title = originalDocument.title;
    }
  }

  /**
   * Force cleanup everything DOM-related
   */
  export function forceCleanup(): void {
    addedElements.clear();
    modifiedAttributes.clear();
    cleanupDOM();

    if (typeof document !== 'undefined') {
      // Nuclear option - replace entire body
      const newBody = document.createElement('body');
      if (document.body?.parentNode) {
        document.body.parentNode.replaceChild(newBody, document.body);
      }
    }
  }
}

/**
 * Enhanced Timer isolation utilities
 */
export namespace TimerIsolation {
  const activeTimers: Set<NodeJS.Timeout> = new Set();
  const activeIntervals: Set<NodeJS.Timeout> = new Set();
  const activeImmediates: Set<NodeJS.Immediate> = new Set();
  let isTimerTrackingActive = false;

  /**
   * Initialize timer isolation
   */
  export function initialize(): void {
    isTimerTrackingActive = true;
  }

  /**
   * Enable timer tracking (simplified approach)
   */
  export function enableMocking(): void {
    isTimerTrackingActive = true;
  }

  /**
   * Disable timer tracking
   */
  export function disableMocking(): void {
    isTimerTrackingActive = false;
    clearAll();
  }

  /**
   * Set timeout with cleanup tracking
   */
  export function setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = globalThis.setTimeout(() => {
      activeTimers.delete(timer);
      callback();
    }, delay);

    if (isTimerTrackingActive) {
      activeTimers.add(timer);
    }

    return timer;
  }

  /**
   * Set interval with cleanup tracking
   */
  export function setInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = globalThis.setInterval(callback, delay);

    if (isTimerTrackingActive) {
      activeIntervals.add(interval);
    }

    return interval;
  }

  /**
   * Set immediate with cleanup tracking
   */
  export function setImmediate(callback: () => void): NodeJS.Immediate {
    const immediate = globalThis.setImmediate(() => {
      activeImmediates.delete(immediate);
      callback();
    });

    if (isTimerTrackingActive) {
      activeImmediates.add(immediate);
    }

    return immediate;
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
    for (const immediate of activeImmediates) {
      clearImmediate(immediate);
    }

    activeTimers.clear();
    activeIntervals.clear();
    activeImmediates.clear();
  }

  /**
   * Get timer statistics
   */
  export function getStats(): {
    activeTimers: number;
    activeIntervals: number;
    activeImmediates: number;
    isMockingActive: boolean;
  } {
    return {
      activeTimers: activeTimers.size,
      activeIntervals: activeIntervals.size,
      activeImmediates: activeImmediates.size,
      isMockingActive: isTimerTrackingActive,
    };
  }

  /**
   * Wait for all pending timers to complete (for testing)
   */
  export async function waitForPendingTimers(timeout = 5000): Promise<void> {
    const startTime = Date.now();

    while (
      (activeTimers.size > 0 || activeIntervals.size > 0 || activeImmediates.size > 0) &&
      Date.now() - startTime < timeout
    ) {
      await new Promise((resolve) => globalThis.setTimeout(resolve, 10));
    }
  }

  /**
   * Force clear specific timer types
   */
  export function clearTimers(): void {
    for (const timer of activeTimers) {
      clearTimeout(timer);
    }
    activeTimers.clear();
  }

  /**
   * Force clear specific interval types
   */
  export function clearIntervals(): void {
    for (const interval of activeIntervals) {
      clearInterval(interval);
    }
    activeIntervals.clear();
  }

  /**
   * Force clear specific immediate types
   */
  export function clearImmediates(): void {
    for (const immediate of activeImmediates) {
      clearImmediate(immediate);
    }
    activeImmediates.clear();
  }
}

/**
 * Complete test isolation setup
 */
export async function setupTestIsolation(testId: string): Promise<void> {
  const manager = IsolationManager.getInstance();

  // Initialize comprehensive isolation
  await manager.initializeIsolation(testId);

  // Create snapshots for restoration
  EnvironmentIsolation.createSnapshot();
  ModuleIsolation.createCacheSnapshot();
  DOMIsolation.createSnapshot();
  TimerIsolation.initialize();

  // Setup cleanup tasks
  manager.addTestCleanup(testId, async () => {
    EnvironmentIsolation.restoreEnv();
    ModuleIsolation.restoreModules();
    DOMIsolation.cleanupDOM();
    TimerIsolation.clearAll();
    TimerIsolation.disableMocking();
  });

  // Setup clean state
  DOMIsolation.setupCleanDOM();
  EnvironmentIsolation.clearTestEnv();

  // Enable timer tracking if requested
  if (process.env.TRACK_TIMERS === 'true') {
    TimerIsolation.enableMocking();
  }
}

/**
 * Complete test isolation cleanup
 */
export async function cleanupTestIsolation(testId: string): Promise<void> {
  const manager = IsolationManager.getInstance();

  try {
    // Run test-specific cleanup
    await manager.runTestCleanup(testId);

    // Force cleanup of all isolation systems
    EnvironmentIsolation.restoreFromSnapshot();
    ModuleIsolation.restoreCacheFromSnapshot();
    DOMIsolation.restoreFromSnapshot();
    TimerIsolation.clearAll();

    // Wait for any pending operations
    await TimerIsolation.waitForPendingTimers(1000);
  } catch (_error) {
    // Emergency cleanup
    await manager.emergencyCleanup();
    EnvironmentIsolation.restoreEnv();
    ModuleIsolation.forceClearAll();
    DOMIsolation.forceCleanup();
    TimerIsolation.clearAll();
  }
}

/**
 * Emergency isolation reset - use when tests are in a bad state
 */
export async function emergencyIsolationReset(): Promise<void> {
  const manager = IsolationManager.getInstance();

  try {
    await manager.emergencyCleanup();
    EnvironmentIsolation.restoreEnv();
    ModuleIsolation.forceClearAll();
    DOMIsolation.forceCleanup();
    TimerIsolation.clearAll();
    TimerIsolation.disableMocking();

    // Reset the manager itself
    manager.reset();
  } catch (_error) {}
}

/**
 * Get comprehensive isolation statistics
 */
export function getIsolationStats(): {
  manager: ReturnType<IsolationManager['getStats']>;
  modules: ReturnType<typeof ModuleIsolation.getCacheStats>;
  timers: ReturnType<typeof TimerIsolation.getStats>;
} {
  const manager = IsolationManager.getInstance();

  return {
    manager: manager.getStats(),
    modules: ModuleIsolation.getCacheStats(),
    timers: TimerIsolation.getStats(),
  };
}

/**
 * Utility function to run a test with complete isolation
 */
export async function withIsolation<T>(testId: string, testFn: () => Promise<T> | T): Promise<T> {
  await setupTestIsolation(testId);

  try {
    return await testFn();
  } finally {
    await cleanupTestIsolation(testId);
  }
}

/**
 * Create an isolated test context with automatic cleanup
 */
export function createIsolatedContext(testId: string) {
  let isSetup = false;

  return {
    async setup(): Promise<void> {
      if (!isSetup) {
        await setupTestIsolation(testId);
        isSetup = true;
      }
    },

    async cleanup(): Promise<void> {
      if (isSetup) {
        await cleanupTestIsolation(testId);
        isSetup = false;
      }
    },

    async run<T>(fn: () => Promise<T> | T): Promise<T> {
      await this.setup();
      try {
        return await fn();
      } finally {
        await this.cleanup();
      }
    },

    getStats() {
      return getIsolationStats();
    },
  };
}

// Export the main isolation manager instance
export const isolationManager = IsolationManager.getInstance();
