import { useCallback, useState } from 'react';
import { useToast } from './useToast';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number) => void;
  onMaxAttemptsReached?: () => void;
}

interface RetryState {
  isRetrying: boolean;
  attempt: number;
  lastError: Error | null;
}

export const useRetry = (options: RetryOptions = {}) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoffMultiplier = 2,
    onRetry,
    onMaxAttemptsReached,
  } = options;

  const { showError, showInfo } = useToast();
  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    lastError: null,
  });

  const sleep = useCallback(async (ms: number) => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }, []);

  const executeWithRetry = useCallback(
    async <T>(operation: () => Promise<T>, customOptions?: Partial<RetryOptions>): Promise<T> => {
      const finalOptions = { ...options, ...customOptions };
      const finalMaxAttempts = finalOptions.maxAttempts || maxAttempts;
      const finalDelay = finalOptions.delay || delay;
      const finalBackoffMultiplier = finalOptions.backoffMultiplier || backoffMultiplier;

      let currentAttempt = 0;
      let currentDelay = finalDelay;

      while (currentAttempt < finalMaxAttempts) {
        try {
          setRetryState({
            isRetrying: currentAttempt > 0,
            attempt: currentAttempt + 1,
            lastError: null,
          });

          const result = await operation();

          // Reset state on success
          setRetryState({
            isRetrying: false,
            attempt: 0,
            lastError: null,
          });

          return result;
        } catch (error) {
          currentAttempt++;
          const isLastAttempt = currentAttempt >= finalMaxAttempts;
          const errorObj = error instanceof Error ? error : new Error(String(error));

          setRetryState({
            isRetrying: !isLastAttempt,
            attempt: currentAttempt,
            lastError: errorObj,
          });

          if (isLastAttempt) {
            // Max attempts reached
            if (onMaxAttemptsReached) {
              onMaxAttemptsReached();
            }
            showError(
              'Operation Failed',
              `Failed after ${finalMaxAttempts} attempts: ${errorObj.message}`
            );
            throw errorObj;
          }
          // Retry attempt
          if (onRetry) {
            onRetry(currentAttempt);
          }

          showInfo(
            'Retrying Operation',
            `Attempt ${currentAttempt} failed. Retrying in ${currentDelay / 1000} seconds...`
          );

          await sleep(currentDelay);
          currentDelay *= finalBackoffMultiplier;
        }
      }

      // This should never be reached, but TypeScript requires it
      throw new Error('Unexpected end of retry loop');
    },
    [
      maxAttempts,
      delay,
      backoffMultiplier,
      onRetry,
      onMaxAttemptsReached,
      showError,
      showInfo,
      options,
      sleep,
    ]
  );

  const reset = useCallback(() => {
    setRetryState({
      isRetrying: false,
      attempt: 0,
      lastError: null,
    });
  }, []);

  return {
    executeWithRetry,
    retryState,
    reset,
  };
};
