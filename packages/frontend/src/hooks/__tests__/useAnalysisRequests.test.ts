import { act, renderHook, waitFor } from '@testing-library/react';
import type { AxiosResponse } from 'axios';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { type AnalysisRequest, type AnalysisRequestStats, apiService } from '../../services/api';
import { useAnalysisRequests } from '../useAnalysisRequests';

// Mock the entire apiService module
vi.mock('../../services/api');

describe('useAnalysisRequests', () => {
  const mockRequests: AnalysisRequest[] = [
    {
      id: '1',
      path: '/test/path1',
      options: {},
      status: 'completed',
      progress: 100,
      startTime: '2023-01-01T00:00:00Z',
    },
    {
      id: '2',
      path: '/test/path2',
      options: {},
      status: 'processing',
      progress: 50,
      startTime: '2023-01-01T00:00:00Z',
    },
  ];

  const mockStats: AnalysisRequestStats = {
    total: 2,
    queued: 0,
    processing: 1,
    completed: 1,
    failed: 0,
    cancelled: 0,
    averageProcessingTime: 0,
  };

  beforeEach(() => {
    const mockResponse: AxiosResponse<AnalysisRequest[]> = {
      data: mockRequests,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} },
    };
    vi.mocked(apiService.getAnalysisRequests).mockResolvedValue(mockResponse);

    const mockStatsResponse: AxiosResponse<AnalysisRequestStats> = {
      data: mockStats,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} },
    };
    vi.mocked(apiService.getAnalysisRequestStats).mockResolvedValue(mockStatsResponse);

    const mockSingleResponse: AxiosResponse<AnalysisRequest> = {
      data: mockRequests[0],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} },
    };
    vi.mocked(apiService.getAnalysisRequest).mockResolvedValue(mockSingleResponse);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should fetch requests and stats on mount', async () => {
    const { result } = renderHook(() => useAnalysisRequests());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.requests).toEqual(mockRequests);
      expect(result.current.stats).toEqual(mockStats);
    });

    expect(apiService.getAnalysisRequests).toHaveBeenCalledTimes(1);
    expect(apiService.getAnalysisRequestStats).toHaveBeenCalledTimes(1);
  });

  test('should handle fetch errors', async () => {
    const fetchError = new Error('Failed to fetch');
    vi.mocked(apiService.getAnalysisRequests).mockRejectedValue(fetchError);

    const { result } = renderHook(() => useAnalysisRequests());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to fetch analysis requests');
      expect(result.current.requests).toEqual([]);
    });
  });

  test('should refresh requests', async () => {
    const { result } = renderHook(() => useAnalysisRequests());

    // Wait for initial fetch
    await waitFor(() => expect(result.current.requests).toEqual(mockRequests));

    const newMockRequests: AnalysisRequest[] = [
      ...mockRequests,
      {
        id: '3',
        path: '/test/path3',
        options: {},
        status: 'queued',
        progress: 0,
        startTime: '2023-01-01T00:00:00Z',
      },
    ];
    const newMockResponse: AxiosResponse<AnalysisRequest[]> = {
      data: newMockRequests,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: {} },
    };
    vi.mocked(apiService.getAnalysisRequests).mockResolvedValue(newMockResponse);

    // Refresh requests
    await act(async () => {
      await result.current.refreshRequests();
    });

    expect(result.current.requests).toEqual(newMockRequests);
    expect(apiService.getAnalysisRequests).toHaveBeenCalledTimes(2);
  });

  test('should fetch a specific request', async () => {
    const { result } = renderHook(() => useAnalysisRequests());

    let request: AnalysisRequest | null;
    await act(async () => {
      request = await result.current.getRequest('1');
    });

    expect(request).not.toBeNull();
    expect(request).toEqual(mockRequests[0]);
    expect(apiService.getAnalysisRequest).toHaveBeenCalledWith('1');
  });
});
