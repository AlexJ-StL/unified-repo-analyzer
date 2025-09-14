/**
 * Centralized Test Utilities Index
 * Provides clean, non-circular imports for all test utilities
 */

import {
  createIsolatedContext,
  emergencyIsolationReset,
  getIsolationStats,
  withIsolation
} from "./test-isolation";

// Cleanup management
export {
  cleanupManager,
  clearCleanupTasks,
  emergencyCleanup,
  getCleanupStats,
  registerCleanupTask,
  runCleanup
} from "./cleanup-manager";
// Core test infrastructure
// Mock utilities (cleaned up to avoid circular imports)
// Note: mock-utils-clean will be created if needed, for now using MockManager
export {
  cleanupMocks,
  createMock,
  MockManager,
  mockFunction,
  mockManager,
  mockModule,
  resetAllMocks,
  setupMocks
} from "./MockManager";
export { ResourceController, resourceController } from "./ResourceController";
// Runtime helpers
export {
  assertMemoryUsage,
  assertTiming,
  assertWithTolerance,
  getTestConfig,
  createRuntimeMock,
  createRuntimeTest,
  skipIf
} from "./runtime-test-helpers";
// Setup utilities (re-export from setup files)
export {
  createMockFunction,
  createTypedMock,
  mockEnv as setupMockEnv,
  mocked,
  restoreEnv as setupRestoreEnv
} from "./setup-minimal";
// Test cleanup helpers
export {
  createTestCleanupContext,
  EnvCleanup,
  NetworkCleanup,
  TempFileCleanup,
  TimerCleanup,
  waitForPendingOperations,
  withCleanup
} from "./test-cleanup-helpers";
// Test isolation
export {
  cleanupTestIsolation,
  createIsolatedContext,
  DOMIsolation,
  EnvironmentIsolation,
  emergencyIsolationReset,
  getIsolationStats,
  IsolationManager,
  isolationManager,
  ModuleIsolation,
  setupTestIsolation,
  TestIsolationManager,
  TimerIsolation,
  withIsolation
} from "./test-isolation";

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
    TimerIsolation
  } = require("./test-isolation");
  const {
    registerCleanupTask,
    runCleanup,
    emergencyCleanup
  } = require("./cleanup-manager");
  const { createTestCleanupContext } = require("./test-cleanup-helpers");
  const {
    runtimeTest,
    runtimeMock,
    skipIf,
    getTestConfig,
    assertWithTolerance,
    assertTiming,
    assertMemoryUsage
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
      timers: TimerIsolation
    },

    // Cleanup
    cleanup: {
      register: registerCleanupTask,
      run: runCleanup,
      emergency: emergencyCleanup,
      createContext: createTestCleanupContext
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
        memory: assertMemoryUsage
      }
    }
  };
}
