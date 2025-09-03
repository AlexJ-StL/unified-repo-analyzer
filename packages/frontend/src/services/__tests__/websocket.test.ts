import { beforeEach, afterEach, describe, expect, test } from "vitest";
import {
  mockFunction,
  mockModule,
  setupMocks,
  cleanupMocks,
} from "../../../../../tests/MockManager";
import websocketService from "../websocket";

// Create mocked socket using MockManager
const mockSocket = {
  on: mockFunction(),
  off: mockFunction(),
  emit: mockFunction(),
  disconnect: mockFunction(),
  connected: true,
};

// Mock socket.io-client
mockModule("socket.io-client", () => ({
  io: mockFunction(() => mockSocket),
}));

// Create mocked store functions
const mockSetProgress = mockFunction();
const mockSetResults = mockFunction();

// Mock the analysis store
mockModule("../../store/useAnalysisStore", () => ({
  useAnalysisStore: {
    getState: () => ({
      setProgress: mockSetProgress,
      setResults: mockSetResults,
    }),
  },
}));

describe("WebSocketService", () => {
  beforeEach(() => {
    setupMocks();

    // Clear all mocks
    mockSocket.on.mockReset?.();
    mockSocket.off.mockReset?.();
    mockSocket.emit.mockReset?.();
    mockSocket.disconnect.mockReset?.();
    mockSetProgress.mockReset?.();
    mockSetResults.mockReset?.();

    // Reset the websocket service
    (websocketService as any).socket = null;
    (websocketService as any).connected = false;
  });

  afterEach(() => {
    cleanupMocks();
  });

  test("should connect to WebSocket server", () => {
    websocketService.connect();

    expect((websocketService as any).socket).not.toBeNull();
    expect((websocketService as any).connected).toBe(false); // Not connected yet, waiting for connect event
  });

  test("should disconnect from WebSocket server", () => {
    websocketService.connect();
    websocketService.disconnect();

    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect((websocketService as any).socket).toBeNull();
    expect((websocketService as any).connected).toBe(false);
  });

  test("should subscribe to analysis progress", () => {
    websocketService.connect();
    websocketService.subscribeToAnalysis("test-analysis-id");

    expect(mockSocket.emit).toHaveBeenCalledWith(
      "register-analysis",
      "test-analysis-id"
    );
  });

  test("should handle connect event", () => {
    websocketService.connect();

    // Simulate connect event
    const connectHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "connect"
    )[1];
    connectHandler();

    expect((websocketService as any).connected).toBe(true);
    expect((websocketService as any).reconnectAttempts).toBe(0);
    expect(mockSetProgress).toHaveBeenCalledWith({
      log: "WebSocket connected",
    });
  });

  test("should handle disconnect event", () => {
    websocketService.connect();

    // Simulate disconnect event
    const disconnectHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "disconnect"
    )[1];
    disconnectHandler("test-reason");

    expect((websocketService as any).connected).toBe(false);
    expect(mockSetProgress).toHaveBeenCalledWith({
      log: "WebSocket disconnected: test-reason",
    });
  });

  test("should handle analysis progress event", () => {
    websocketService.connect();

    // Simulate analysis progress event
    const progressHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "analysis-progress"
    )[1];
    progressHandler({
      status: "processing",
      currentFile: "src/index.js",
      progress: 50,
      total: 100,
      processed: 50,
      filesProcessed: 50,
      totalFiles: 100,
      timeElapsed: 10,
      timeRemaining: 20,
      tokensUsed: 1000,
    });

    expect(mockSetProgress).toHaveBeenCalledWith({
      status: "processing",
      currentStep: "src/index.js",
      progress: 50,
      totalSteps: 100,
      filesProcessed: 50,
      totalFiles: 100,
      timeElapsed: 10,
      timeRemaining: 20,
      tokensUsed: 1000,
      log: "Processing: src/index.js",
    });
  });

  test("should handle analysis complete event", () => {
    websocketService.connect();

    // Simulate analysis complete event
    const completeHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "analysis-complete"
    )[1];
    const testData = { id: "test-id", name: "test-repo" };
    completeHandler(testData);

    expect(mockSetProgress).toHaveBeenCalledWith({
      status: "completed",
      progress: 100,
      totalSteps: 100,
      log: "Analysis completed successfully",
    });
    expect(mockSetResults).toHaveBeenCalledWith(testData);
  });

  test("should handle batch analysis progress event", () => {
    websocketService.connect();

    // Simulate batch analysis progress event
    const progressHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "batch-analysis-progress"
    )[1];
    progressHandler({
      status: "processing",
      currentRepositories: ["repo1", "repo2"],
      progress: 75,
      total: 4,
      completed: 3,
      failed: 0,
      timeElapsed: 30,
      timeRemaining: 10,
    });

    expect(mockSetProgress).toHaveBeenCalledWith({
      status: "processing",
      currentStep: "Processing: repo1, repo2",
      progress: 75,
      totalSteps: 4,
      filesProcessed: 3,
      totalFiles: 4,
      timeElapsed: 30,
      timeRemaining: 10,
      log: "Batch progress: 3/4 completed, 0 failed",
    });
  });

  test("should handle batch analysis complete event", () => {
    websocketService.connect();

    // Simulate batch analysis complete event
    const completeHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "batch-analysis-complete"
    )[1];
    const testData = {
      repositories: [
        { id: "repo1", name: "test-repo-1" },
        { id: "repo2", name: "test-repo-2" },
      ],
    };
    completeHandler(testData);

    expect(mockSetProgress).toHaveBeenCalledWith({
      status: "completed",
      progress: 100,
      totalSteps: 100,
      log: "Batch analysis completed successfully",
    });
    expect(mockSetResults).toHaveBeenCalledWith({
      id: "repo1",
      name: "test-repo-1",
    });
  });
});
