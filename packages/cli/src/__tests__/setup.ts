/**
 * CLI Test Setup
 * Configures the test environment for CLI package tests
 */

import { afterEach, beforeEach } from 'vitest';
import { mockManager } from '../../../../tests/MockManager';

// Setup mocks before each test
beforeEach(() => {
  mockManager.setupMocks();
});

// Cleanup after each test
afterEach(() => {
  mockManager.cleanupMocks();
});
