interface UseErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  onError?: (error: unknown) => void;
}
export declare const useErrorHandler: (options?: UseErrorHandlerOptions) => {
  handleError: (error: unknown, context?: string) => any;
  handleAsyncError: <T>(
    operation: () => Promise<T>,
    context?: string,
    onSuccess?: (result: T) => void
  ) => Promise<T | null>;
  createErrorHandler: (context?: string) => (error: unknown) => any;
};
