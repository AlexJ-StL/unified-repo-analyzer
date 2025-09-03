/**
 * Centralized Test Utilities Index
 * Provides clean, non-circular imports for all test utilities
 */

import { createIsolatedContext } from "./test-isolation";

import { withIsolation } from "./test-isolation";

import { getIsolationStats } from "./test-isolation";

import { emergencyIsolationReset } from "./test-isolation";

// Core test infrastructure
export { mockManager, MockManager } from "./MockManager";
export { resourceController, ResourceController } from "./ResourceController";

// Mock utilities (cleaned up to avoid circular imports)
// Note: mock-utils-clean will be created if needed, for now using MockManager
export {
  createMock,
  mockFunction,
  mockModule,
  setupMocks,
  cleanupMocks,
  resetAllMocks,
} from "./MockManager";

// Test isolation
export {
  IsolationManager,
  TestIsolationManager,
  EnvironmentIsolation,
  ModuleIsolation,
  DOMIsolation,
  TimerIsolation,
  setupTestIsolation,
  cleanupTestIsolation,
  emergencyIsolationReset,
  getIsolationStats,
  withIsolation,
  createIsolatedContext,
  isolationManager,
} from "./test-isolation";

// Cleanup management
export {
  cleanupManager,
  registerCleanupTask,
  runCleanup,
  getCleanupStats,
  clearCleanupTasks,
  emergencyCleanup,
} from "./cleanup-manager";

// Test cleanup helpers
export {
  TempFileCleanup,
  EnvCleanup,
  NetworkCleanup,
  TimerCleanup,
  createTestCleanupContext,
  withCleanup,
  waitForPendingOperations,
} from "./test-cleanup-helpers";

// Runtime helpers
export {
  RuntimeTestHelpers,
  RuntimeAssertions,
  runtimeTest,
  runtimeMock,
  skipIf,
  getTestConfig,
  assertWithTolerance,
  assertTiming,
  assertMemoryUsage,
} from "./runtime-test-helpers";

// Setup utilities (re-export from setup files)
export {
  mocked,
  createMockFunction,
  createTypedMock,
  mockEnv as setupMockEnv,
  restoreEnv as setupRestoreEnv,
} from "./setup-minimal";

/**
 * Convenience function to get all test utilities in one object
 */
export function getTestUtils() {
  // Import the utilities dynamically to avoid circular dependencies
  const { mockManager } = require("./MockManager");
  const { resourceController } = require("./ResourceController");
  const {
    setupTestIsolation,
    cleanupTestIsolation,
    EnvironmentIsolation,
    ModuleIsolation,
    DOMIsolation,
    TimerIsolation,
  } = require("./test-isolation");
  const {
    registerCleanupTask,
    runCleanup,
    emergencyCleanup,
  } = require("./cleanup-manager");
  const { createTestCleanupContext } = require("./test-cleanup-helpers");
  const {
    runtimeTest,
    runtimeMock,
    skipIf,
    getTestConfig,
    assertWithTolerance,
    assertTiming,
    assertMemoryUsage,
  } = require("./runtime-test-helpers");

  return {
    // Core
    mockManager,
    resourceController,

    // Isolation
    isolation: {
      setup: setupTestIsolation,
      cleanup: cleanupTestIsolation,
      emergency: emergencyIsolationReset,
      stats: getIsolationStats,
      withIsolation,
      createContext: createIsolatedContext,
      environment: EnvironmentIsolation,
      modules: ModuleIsolation,
      dom: DOMIsolation,
      timers: TimerIsolation,
    },

    // Cleanup
    cleanup: {
      register: registerCleanupTask,
      run: runCleanup,
      emergency: emergencyCleanup,
      createContext: createTestCleanupContext,
    },

    // Runtime
    runtime: {
      test: runtimeTest,
      mock: runtimeMock,
      skipIf,
      config: getTestConfig(),
      assertions: {
        withTolerance: assertWithTolerance,
        timing: assertTiming,
        memory: assertMemoryUsage,
      },
    },
  };
}
