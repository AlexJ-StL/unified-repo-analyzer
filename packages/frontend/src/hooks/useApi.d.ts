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
  execute: (...args: unknown[]) => Promise<T | null>;
  executeWithRetry: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
  retry: () => Promise<T | null>;
}
type ApiFunction = (...args: unknown[]) => Promise<unknown>;
export declare function useApi<T = unknown>(
  apiFunc: ApiFunction,
  options?: UseApiOptions
): UseApiReturn<T>;
export declare const useAnalyzeRepository: (options?: UseApiOptions) => UseApiReturn<any>;
export declare const useAnalyzeBatch: (options?: UseApiOptions) => UseApiReturn<any>;
export declare const useGetRepositories: (options?: UseApiOptions) => UseApiReturn<any>;
export declare const useSearchRepositories: (options?: UseApiOptions) => UseApiReturn<any>;
export declare const useGetAnalysis: (options?: UseApiOptions) => UseApiReturn<any>;
export declare const useExportAnalysis: (options?: UseApiOptions) => UseApiReturn<any>;
export declare const useCancelAnalysis: (options?: UseApiOptions) => UseApiReturn<any>;
