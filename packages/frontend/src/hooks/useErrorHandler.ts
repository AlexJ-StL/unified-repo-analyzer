import { useCallback } from 'react';
import { useToast } from './useToast';
import { parseError, getRecoverySuggestions, getErrorTitle } from '../utils/errorHandling';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  onError?: (error: any) => void;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const { showToast = true, logError = true, onError } = options;
  const { showError } = useToast();

  const handleError = useCallback(
    (error: unknown, context?: string) => {
      const errorInfo = parseError(error);

      // Log error if enabled
      if (logError) {
        console.error(`Error${context ? ` in ${context}` : ''}:`, error);
      }

      // Call custom error handler if provided
      if (onError) {
        onError(error);
      }

      // Show toast notification if enabled
      if (showToast) {
        const title = getErrorTitle(errorInfo);
        const suggestions = getRecoverySuggestions(errorInfo);
        const message = `${errorInfo.userMessage}${suggestions.length > 0 ? `\n\nSuggestions:\n• ${suggestions.join('\n• ')}` : ''}`;

        showError(title, message);
      }

      return errorInfo;
    },
    [showToast, logError, onError, showError]
  );

  const handleAsyncError = useCallback(
    async <T>(
      operation: () => Promise<T>,
      context?: string,
      onSuccess?: (result: T) => void
    ): Promise<T | null> => {
      try {
        const result = await operation();
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } catch (error) {
        handleError(error, context);
        return null;
      }
    },
    [handleError]
  );

  const createErrorHandler = useCallback(
    (context?: string) => {
      return (error: unknown) => handleError(error, context);
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncError,
    createErrorHandler,
  };
};
