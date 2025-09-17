/**
 * Tests for analysis requests API routes
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock dependencies before importing the service
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid'),
}));

vi.mock('../../../services/logger.service.js', () => ({
  default: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../../services/metrics.service.js', () => ({
  metricsService: {
    recordAnalysisMetric: vi.fn(),
  },
}));

// Import after mocking dependencies
import { analysisRequestTracker } from '../../../services/analysis-request-tracker.service';

// Mock express Router
const mockRouter = {
  get: vi.fn(),
};

vi.mock('express', async () => {
  const actual = await vi.importActual('express');
  return {
    ...actual,
    Router: () => mockRouter,
  };
});

describe('analysis requests routes', () => {
  beforeEach(() => {
    // Clear all requests before each test
    const requests = analysisRequestTracker.getRequests();
    for (const _request of requests) {
      // We can't directly delete requests, so we'll just reset the tracker
      // In a real test, we might want to mock the tracker instead
    }

    // Clear mock calls
    mockRouter.get.mockClear();
  });

  test('should define GET routes', async () => {
    // Import the routes file which should register the routes
    await import('../analysis-requests');

    expect(mockRouter.get).toHaveBeenCalledWith('/', expect.any(Function));
    expect(mockRouter.get).toHaveBeenCalledWith('/:id', expect.any(Function));
    expect(mockRouter.get).toHaveBeenCalledWith('/stats', expect.any(Function));
  });
});