/**
 * Mock variables for logging integration tests
 * These are separated into their own file to avoid hoisting issues with vi.mock
 */

import { vi } from 'vitest';

// Mock logger functions
export const mockLoggerInfo = vi.fn();
export const mockLoggerWarn = vi.fn();
export const mockLoggerError = vi.fn();
export const mockLoggerDebug = vi.fn();
