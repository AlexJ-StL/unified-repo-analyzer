/// <reference types="vitest" />
/// <reference types="node" />

import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { cleanupMocks } from "./MockManager";

// Export vi for tests that need it
export { vi } from "vitest";

// Export our mock manager utilities
export {
  cleanupMocks,
  createMock,
  mockFunction,
  mockModule,
  resetAllMocks,
  setupMocks
} from "./MockManager";

// Safe mocked function that works with both Bun and Vitest
export const mocked = <T>(item: T): T => {
  if (typeof vi?.mocked === "function") {
    return vi.mocked(item) as unknown as T;
  }
  // Fallback for when vi.mocked is not available
  return item as T;
};
