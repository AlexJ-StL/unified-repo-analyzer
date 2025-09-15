/**
 * Test setup file for backend API tests
 */

import fs from "node:fs/promises";
import path from "node:path";
import type { Express } from "express";

let testApp: Express | null = null;

export async function setupTestServer(): Promise<void> {
  // Ensure test data directory exists
  const testDataDir = path.resolve(process.cwd(), "data");
  try {
    await fs.mkdir(testDataDir, { recursive: true });
  } catch (error) {
    console.warn("Could not create test data directory:", error);
  }

  // Import the app dynamically to avoid circular dependencies
  const { app } = await import("./index.js");
  testApp = app;
}

export function getTestApp(): Express {
  if (!testApp) {
    throw new Error(
      "Test server not initialized. Call setupTestServer() first."
    );
  }
  return testApp;
}

// Export vitest globals
export { afterAll, beforeAll, describe, expect, it } from "vitest";
