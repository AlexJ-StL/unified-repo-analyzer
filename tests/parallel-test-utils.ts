/**
 * Parallel test execution utilities
 * Provides utilities for managing parallel test execution and resource allocation
 */

/**
 * Test execution pool configuration
 */
export interface TestPoolConfig {
  maxConcurrency: number;
  timeoutMs: number;
  retries: number;
}

/**
 * Default test pool configuration based on environment
 */
export const getDefaultPoolConfig = (): TestPoolConfig => {
  const isCI = process.env.CI === 'true';
  const isBun = typeof globalThis.Bun !== 'undefined';

  return {
    maxConcurrency: isCI ? (isBun ? 8 : 6) : isBun ? 4 : 3,
    timeoutMs: isCI ? 120000 : 60000,
    retries: isCI ? 2 : 1,
  };
};

/**
 * Resource manager for test execution
 */
export class TestResourceManager {
  private static instance: TestResourceManager;
  private activeTests = new Set<string>();
  private maxConcurrency: number;

  private constructor(config: TestPoolConfig) {
    this.maxConcurrency = config.maxConcurrency;
  }

  static getInstance(config?: TestPoolConfig): TestResourceManager {
    if (!TestResourceManager.instance) {
      TestResourceManager.instance = new TestResourceManager(config || getDefaultPoolConfig());
    }
    return TestResourceManager.instance;
  }

  async acquireResource(testId: string): Promise<void> {
    while (this.activeTests.size >= this.maxConcurrency) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    this.activeTests.add(testId);
  }

  releaseResource(testId: string): void {
    this.activeTests.delete(testId);
  }

  getActiveCount(): number {
    return this.activeTests.size;
  }
}

/**
 * Parallel test execution wrapper
 */
export async function runInParallel<T>(
  tasks: Array<() => Promise<T>>,
  config?: Partial<TestPoolConfig>
): Promise<T[]> {
  const fullConfig = { ...getDefaultPoolConfig(), ...config };
  const manager = TestResourceManager.getInstance(fullConfig);

  const results = await Promise.all(
    tasks.map(async (task, index) => {
      const testId = `task-${index}`;
      await manager.acquireResource(testId);

      try {
        return await task();
      } finally {
        manager.releaseResource(testId);
      }
    })
  );

  return results;
}

/**
 * Test isolation utilities
 */
export const TestIsolation = {
  cleanupTasks: [] as Array<() => Promise<void>>,

  addCleanupTask(task: () => Promise<void>): void {
    this.cleanupTasks.push(task);
  },

  async runCleanup(): Promise<void> {
    const tasks = [...this.cleanupTasks];
    this.cleanupTasks.length = 0;

    await Promise.all(tasks.map((task) => task().catch((_error) => {})));
  },

  reset(): void {
    this.cleanupTasks.length = 0;
  },
};

/**
 * Memory management utilities for tests
 */
export const TestMemoryManager = {
  memoryThreshold: 500 * 1024 * 1024, // 500MB

  checkMemoryUsage(): boolean {
    if (process?.memoryUsage) {
      const usage = process.memoryUsage();
      return usage.heapUsed < this.memoryThreshold;
    }
    return true;
  },

  async forceGarbageCollection(): Promise<void> {
    if (global?.gc) {
      global.gc();
    }

    // Give time for cleanup
    await new Promise((resolve) => setTimeout(resolve, 10));
  },
};

/**
 * Test timeout management
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Test timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    }),
  ]);
}

/**
 * Batch test execution with resource management
 */
export async function executeBatch<T>(
  items: T[],
  processor: (item: T) => Promise<void>,
  batchSize = 5
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(processor));

    // Memory check between batches
    if (!TestMemoryManager.checkMemoryUsage()) {
      await TestMemoryManager.forceGarbageCollection();
    }
  }
}
