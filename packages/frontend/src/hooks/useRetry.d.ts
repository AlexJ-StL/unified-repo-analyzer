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
export declare const useRetry: (options?: RetryOptions) => {
    executeWithRetry: <T>(operation: () => Promise<T>, customOptions?: Partial<RetryOptions>) => Promise<T>;
    retryState: RetryState;
    reset: () => void;
};
export {};
