import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import websocketService from '../websocket';

// --- Mocks ---
const eventHandlers: { [key: string]: (...args: any[]) => void } = {};
const mockSocket = {
  on: vi.fn((event, handler) => {
    eventHandlers[event] = handler;
  }),
  off: vi.fn((event) => {
    delete eventHandlers[event];
  }),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connected: true,
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

const mockSetProgress = vi.fn();
const mockSetResults = vi.fn();

vi.mock('../../store/useAnalysisStore', () => ({
  useAnalysisStore: {
    getState: () => ({
      setProgress: mockSetProgress,
      setResults: mockSetResults,
    }),
  },
}));

// Helper to trigger events
const triggerSocketEvent = (event: string, ...args: any[]) => {
  if (eventHandlers[event]) {
    act(() => {
      eventHandlers[event](...args);
    });
  }
};

describe('WebSocketService', () => {
  beforeEach(() => {
    // Clear all mocks and handlers before each test
    vi.clearAllMocks();
    for (const key in eventHandlers) {
      delete eventHandlers[key];
    }

    // Reset the websocket service internal state
    websocketService.disconnect();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should connect to WebSocket server', () => {
    websocketService.connect();
    expect(vi.mocked(mockSocket.on)).toHaveBeenCalledWith('connect', expect.any(Function));
    expect((websocketService as any).socket).not.toBeNull();
  });

  test('should disconnect from WebSocket server', () => {
    websocketService.connect();
    websocketService.disconnect();
    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect((websocketService as any).socket).toBeNull();
  });

  test('should subscribe to analysis progress', () => {
    websocketService.connect();
    websocketService.subscribeToAnalysis('test-analysis-id');
    expect(mockSocket.emit).toHaveBeenCalledWith('register-analysis', 'test-analysis-id');
  });

  test('should handle connect event', () => {
    websocketService.connect();
    triggerSocketEvent('connect');
    expect((websocketService as any).connected).toBe(true);
    expect(mockSetProgress).toHaveBeenCalledWith({ log: 'WebSocket connected' });
  });

  test('should handle disconnect event', () => {
    websocketService.connect();
    triggerSocketEvent('disconnect', 'test-reason');
    expect((websocketService as any).connected).toBe(false);
    expect(mockSetProgress).toHaveBeenCalledWith({ log: 'WebSocket disconnected: test-reason' });
  });

  test('should handle analysis progress event', () => {
    websocketService.connect();
    const progressData = { progress: 50, currentFile: 'src/index.js' };
    triggerSocketEvent('analysis-progress', progressData);
    expect(mockSetProgress).toHaveBeenCalledWith(expect.objectContaining({ progress: 50 }));
  });

  test('should handle analysis complete event', () => {
    websocketService.connect();
    const completeData = { id: '123', name: 'test-repo' };
    triggerSocketEvent('analysis-complete', completeData);
    expect(mockSetResults).toHaveBeenCalledWith(completeData);
    expect(mockSetProgress).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
  });

  test('should handle batch analysis progress event', () => {
    websocketService.connect();
    const batchData = { progress: 75, completed: 3, total: 4 };
    triggerSocketEvent('batch-analysis-progress', batchData);
    expect(mockSetProgress).toHaveBeenCalledWith(expect.objectContaining({ progress: 75 }));
  });

  test('should handle batch analysis complete event', () => {
    websocketService.connect();
    const batchCompleteData = { repositories: [{ id: '1', name: 'repo1' }] };
    triggerSocketEvent('batch-analysis-complete', batchCompleteData);
    expect(mockSetResults).toHaveBeenCalledWith({ id: '1', name: 'repo1' });
    expect(mockSetProgress).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
  });
});
