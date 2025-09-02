import { useCallback, useEffect, useState } from 'react';
import type { AnalysisRequest, AnalysisRequestStats } from '../services/api';
import { apiService } from '../services/api';

export interface UseAnalysisRequestsReturn {
  requests: AnalysisRequest[];
  stats: AnalysisRequestStats | null;
  loading: boolean;
  error: string | null;
  refreshRequests: () => Promise<void>;
  refreshStats: () => Promise<void>;
  getRequest: (id: string) => Promise<AnalysisRequest | null>;
}

export const useAnalysisRequests = (initialParams?: {
  status?: string;
  clientId?: string;
  limit?: number;
}): UseAnalysisRequestsReturn => {
  const [requests, setRequests] = useState<AnalysisRequest[]>([]);
  const [stats, setStats] = useState<AnalysisRequestStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(
    async (params?: { status?: string; clientId?: string; limit?: number }) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.getAnalysisRequests(params);
        setRequests(response.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch analysis requests';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAnalysisRequestStats();
      setStats(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch analysis request stats';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequest = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAnalysisRequest(id);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analysis request';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(initialParams);
    fetchStats();
  }, [fetchRequests, fetchStats, initialParams]);

  return {
    requests,
    stats,
    loading,
    error,
    refreshRequests: () => fetchRequests(initialParams),
    refreshStats: fetchStats,
    getRequest: fetchRequest,
  };
};
