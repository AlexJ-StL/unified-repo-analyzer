import { useState, useCallback } from 'react';
import { apiService, handleApiError, createApiService } from '../services/api';
import { useErrorHandler } from './useErrorHandler';
import { useRetry } from './useRetry';
import { useToast } from './useToast';
import { parseError, shouldShowRetryButton } from '../utils/errorHandling';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isRetrying: boolean;
  retryCount: number;
}

interface UseApiOptions {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  executeWithRetry: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  retry: () => Promise<T | null>;
}

type ApiFunction = (...args: any[]) => Promise<any>;

export function useApi<T = any>(
  apiFunc: ApiFunction,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    showErrorToast = false, // Disabled by default to avoid duplicate toasts
    showSuccessToast = false,
    successMessage,
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isRetrying: false,
    retryCount: 0,
  });

  const [lastArgs, setLastArgs] = useState<any[]>([]);
  const { handleError } = useErrorHandler({ showToast: showErrorToast });
  const { executeWithRetry: retryExecute } = useRetry({
    maxAttempts: maxRetries,
    delay: retryDelay,
  });
  const { showSuccess } = useToast();

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        setLastArgs(args);

        const response = await apiFunc(...args);
        const data = response.data;

        setState({
          data,
          isLoading: false,
          error: null,
          isRetrying: false,
          retryCount: 0,
        });

        if (showSuccessToast && successMessage) {
          showSuccess('Success', successMessage);
        }

        return data;
      } catch (error) {
        const errorMessage = handleApiError(error);
        const errorInfo = parseError(error);

        setState((prev) => ({
          ...prev,
          data: null,
          isLoading: false,
          error: errorMessage,
          isRetrying: false,
        }));

        if (showErrorToast) {
          handleError(error, 'API call');
        }

        return null;
      }
    },
    [apiFunc, showErrorToast, showSuccessToast, successMessage, handleError, showSuccess]
  );

  const executeWithRetry = useCallback(
    async (...args: any[]): Promise<T | null> => {
      if (!enableRetry) {
        return execute(...args);
      }

      try {
        setState((prev) => ({ ...prev, isRetrying: true, error: null }));
        setLastArgs(args);

        const result = await retryExecute(async () => {
          const response = await apiFunc(...args);
          return response.data;
        });

        setState({
          data: result,
          isLoading: false,
          error: null,
          isRetrying: false,
          retryCount: 0,
        });

        if (showSuccessToast && successMessage) {
          showSuccess('Success', successMessage);
        }

        return result;
      } catch (error) {
        const errorMessage = handleApiError(error);

        setState((prev) => ({
          ...prev,
          data: null,
          isLoading: false,
          error: errorMessage,
          isRetrying: false,
          retryCount: prev.retryCount + 1,
        }));

        if (showErrorToast) {
          handleError(error, 'API call with retry');
        }

        return null;
      }
    },
    [
      apiFunc,
      enableRetry,
      execute,
      retryExecute,
      showErrorToast,
      showSuccessToast,
      successMessage,
      handleError,
      showSuccess,
    ]
  );

  const retry = useCallback(async (): Promise<T | null> => {
    if (lastArgs.length === 0) {
      console.warn('No previous arguments to retry with');
      return null;
    }
    return executeWithRetry(...lastArgs);
  }, [lastArgs, executeWithRetry]);

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isRetrying: false,
      retryCount: 0,
    });
    setLastArgs([]);
  }, []);

  return {
    ...state,
    execute,
    executeWithRetry,
    reset,
    retry,
  };
}

// Pre-configured hooks for common API operations with enhanced error handling
export const useAnalyzeRepository = (options?: UseApiOptions) =>
  useApi(apiService.analyzeRepository, {
    showSuccessToast: true,
    successMessage: 'Repository analysis completed successfully',
    ...options,
  });

export const useAnalyzeBatch = (options?: UseApiOptions) =>
  useApi(apiService.analyzeBatch, {
    showSuccessToast: true,
    successMessage: 'Batch analysis completed successfully',
    maxRetries: 1, // Batch operations are expensive, limit retries
    ...options,
  });

export const useGetRepositories = (options?: UseApiOptions) =>
  useApi(apiService.getRepositories, {
    enableRetry: true,
    maxRetries: 2,
    ...options,
  });

export const useSearchRepositories = (options?: UseApiOptions) =>
  useApi(apiService.searchRepositories, {
    enableRetry: true,
    maxRetries: 2,
    ...options,
  });

export const useGetAnalysis = (options?: UseApiOptions) =>
  useApi(apiService.getAnalysis, {
    enableRetry: true,
    maxRetries: 2,
    ...options,
  });

export const useExportAnalysis = (options?: UseApiOptions) =>
  useApi(apiService.exportAnalysis, {
    showSuccessToast: true,
    successMessage: 'Export completed successfully',
    ...options,
  });

export const useCancelAnalysis = (options?: UseApiOptions) =>
  useApi(apiService.cancelAnalysis, {
    showSuccessToast: true,
    successMessage: 'Analysis cancelled successfully',
    enableRetry: false, // Don't retry cancellation
    ...options,
  });
