import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useAnalysisRequests } from "../useAnalysisRequests";

// Mock the apiService
const mockGetAnalysisRequests = vi.fn();
const mockGetAnalysisRequestStats = vi.fn();
const mockGetAnalysisRequest = vi.fn();

vi.mock("../../services/api", () => ({
  apiService: {
    getAnalysisRequests: mockGetAnalysisRequests,
    getAnalysisRequestStats: mockGetAnalysisRequestStats,
    getAnalysisRequest: mockGetAnalysisRequest,
  },
}));

describe("useAnalysisRequests", () => {
  const mockRequests = [
    {
      id: "1",
      path: "/test/path1",
      options: {},
      status: "completed",
      progress: 100,
      startTime: "2023-01-01T00:00:00Z",
      endTime: "2023-01-01T00:01:00Z",
      processingTime: 60000,
    },
    {
      id: "2",
      path: "/test/path2",
      options: {},
      status: "processing",
      progress: 50,
      startTime: "2023-01-01T00:00:00Z",
      currentFile: "file2.js",
    },
  ];

  const mockStats = {
    total: 2,
    queued: 0,
    processing: 1,
    completed: 1,
    failed: 0,
    cancelled: 0,
    averageProcessingTime: 60000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should fetch requests and stats on mount", async () => {
    mockGetAnalysisRequests.mockResolvedValue({
      data: mockRequests,
    });
    mockGetAnalysisRequestStats.mockResolvedValue({
      data: mockStats,
    });

    const { result } = renderHook(() => useAnalysisRequests());

    expect(result.current.loading).toBe(true);

    // Wait for the async operations to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.requests).toEqual(mockRequests);
    expect(result.current.stats).toEqual(mockStats);
    expect(mockGetAnalysisRequests).toHaveBeenCalledWith(undefined);
    expect(mockGetAnalysisRequestStats).toHaveBeenCalledWith();
  });

  test("should handle fetch errors", async () => {
    mockGetAnalysisRequests.mockRejectedValue(new Error("Failed to fetch"));
    mockGetAnalysisRequestStats.mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHook(() => useAnalysisRequests());

    // Wait for the async operations to complete
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe("Failed to fetch");
    expect(result.current.requests).toEqual([]);
    expect(result.current.stats).toBeNull();
  });

  test("should refresh requests", async () => {
    mockGetAnalysisRequests
      .mockResolvedValueOnce({
        data: [],
      })
      .mockResolvedValueOnce({
        data: mockRequests,
      });
    mockGetAnalysisRequestStats.mockResolvedValue({
      data: mockStats,
    });

    const { result } = renderHook(() => useAnalysisRequests());

    // Wait for initial fetch
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.requests).toEqual([]);

    // Refresh requests
    await act(async () => {
      await result.current.refreshRequests();
    });

    expect(result.current.requests).toEqual(mockRequests);
    expect(mockGetAnalysisRequests).toHaveBeenCalledTimes(2);
  });

  test("should fetch a specific request", async () => {
    const mockRequest = mockRequests[0];
    mockGetAnalysisRequest.mockResolvedValue({
      data: mockRequest,
    });

    const { result } = renderHook(() => useAnalysisRequests());

    let request: any;
    await act(async () => {
      request = await result.current.getRequest("1");
    });

    expect(request).toEqual(mockRequest);
    expect(mockGetAnalysisRequest).toHaveBeenCalledWith("1");
  });
});
