import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { apiService } from '../../services/api';
import { useAnalysisRequests } from '../useAnalysisRequests';

// Mock the entire apiService module
vi.mock('../../services/api');

describe('useAnalysisRequests', () => {
  const mockRequests = [
    { id: '1', path: '/test/path1', status: 'completed', progress: 100 },
    { id: '2', path: '/test/path2', status: 'processing', progress: 50 },
  ];

  const mockStats = {
    total: 2,
    processing: 1,
    completed: 1,
  };

  beforeEach(() => {
    vi.mocked(apiService.getAnalysisRequests).mockResolvedValue({ data: mockRequests } as any);
    vi.mocked(apiService.getAnalysisRequestStats).mockResolvedValue({ data: mockStats } as any);
    vi.mocked(apiService.getAnalysisRequest).mockResolvedValue({ data: mockRequests[0] } as any);
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

    const newMockRequests = [
      ...mockRequests,
      { id: '3', path: '/test/path3', status: 'queued', progress: 0 },
    ];
    vi.mocked(apiService.getAnalysisRequests).mockResolvedValue({ data: newMockRequests } as any);

    // Refresh requests
    await act(async () => {
      await result.current.refreshRequests();
    });

    expect(result.current.requests).toEqual(newMockRequests);
    expect(apiService.getAnalysisRequests).toHaveBeenCalledTimes(2);
  });

  test('should fetch a specific request', async () => {
    const { result } = renderHook(() => useAnalysisRequests());

    let request: any;
    await act(async () => {
      request = await result.current.getRequest('1');
    });

    expect(request).toEqual(mockRequests[0]);
    expect(apiService.getAnalysisRequest).toHaveBeenCalledWith('1');
  });
});
