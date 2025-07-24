import { useState, useCallback } from 'react';
import { apiService, handleApiError } from '../services/api';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

type ApiFunction = (...args: any[]) => Promise<any>;

export function useApi<T = any>(apiFunc: ApiFunction): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      try {
        setState({ data: null, isLoading: true, error: null });
        const response = await apiFunc(...args);
        const data = response.data;
        setState({ data, isLoading: false, error: null });
        return data;
      } catch (error) {
        const errorMessage = handleApiError(error);
        setState({ data: null, isLoading: false, error: errorMessage });
        return null;
      }
    },
    [apiFunc]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Pre-configured hooks for common API operations
export const useAnalyzeRepository = () => useApi(apiService.analyzeRepository);
export const useAnalyzeBatch = () => useApi(apiService.analyzeBatch);
export const useGetRepositories = () => useApi(apiService.getRepositories);
export const useSearchRepositories = () => useApi(apiService.searchRepositories);
export const useGetAnalysis = () => useApi(apiService.getAnalysis);
export const useExportAnalysis = () => useApi(apiService.exportAnalysis);
