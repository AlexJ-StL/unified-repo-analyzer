/**
 * Test setup file for backend API tests
 */

import type { Express } from 'express';

let testApp: Express | null = null;

export async function setupTestServer(): Promise<void> {
  // Import the app dynamically to avoid circular dependencies
  const { app } = await import('./index.js');
  testApp = app;
}

export function getTestApp(): Express {
  if (!testApp) {
    throw new Error('Test server not initialized. Call setupTestServer() first.');
  }
  return testApp;
}

// Export vitest globals
export { afterAll, beforeAll, describe, expect, it } from 'vitest';
