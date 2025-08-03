import { describe, it, expect } from 'vitest';
import { parseError, getRecoverySuggestions, shouldShowRetryButton, getErrorTitle, } from '../errorHandling';
describe('errorHandling utils', () => {
    describe('parseError', () => {
        it('parses Axios errors correctly', () => {
            const axiosError = {
                isAxiosError: true,
                response: {
                    status: 404,
                    data: { message: 'Not found' },
                },
                message: 'Request failed',
            };
            const result = parseError(axiosError);
            expect(result.statusCode).toBe(404);
            expect(result.code).toBe('NOT_FOUND');
            expect(result.recoverable).toBe(true);
            expect(result.userMessage).toBe('The requested resource was not found');
            expect(result.suggestions).toContain('Check that the file or directory path is correct');
        });
        it('parses network errors correctly', () => {
            const networkError = {
                isAxiosError: true,
                request: {},
                message: 'Network Error',
            };
            const result = parseError(networkError);
            expect(result.code).toBe('NETWORK_ERROR');
            expect(result.recoverable).toBe(true);
            expect(result.userMessage).toBe('Unable to connect to the server');
            expect(result.suggestions).toContain('Check your internet connection');
        });
        it('parses standard errors correctly', () => {
            const error = new Error('ENOENT: no such file or directory');
            const result = parseError(error);
            expect(result.code).toBe('FILE_NOT_FOUND');
            expect(result.recoverable).toBe(true);
            expect(result.userMessage).toBe('File or directory not found');
            expect(result.suggestions).toContain('Check that the path is correct');
        });
        it('handles permission errors', () => {
            const error = new Error('EACCES: permission denied');
            const result = parseError(error);
            expect(result.code).toBe('PERMISSION_DENIED');
            expect(result.recoverable).toBe(false);
            expect(result.userMessage).toBe('Permission denied');
            expect(result.suggestions).toContain('Check file and directory permissions');
        });
        it('handles memory errors', () => {
            const error = new Error('JavaScript heap out of memory');
            const result = parseError(error);
            expect(result.code).toBe('OUT_OF_MEMORY');
            expect(result.recoverable).toBe(true);
            expect(result.userMessage).toBe('Not enough memory to complete the operation');
            expect(result.suggestions).toContain('Try analyzing a smaller repository');
        });
        it('handles timeout errors', () => {
            const error = new Error('Operation timed out');
            const result = parseError(error);
            expect(result.code).toBe('TIMEOUT');
            expect(result.recoverable).toBe(true);
            expect(result.userMessage).toBe('Operation timed out');
            expect(result.suggestions).toContain('Try again with a smaller repository');
        });
        it('handles string errors', () => {
            const result = parseError('Something went wrong');
            expect(result.message).toBe('Something went wrong');
            expect(result.recoverable).toBe(true);
            expect(result.userMessage).toBe('Something went wrong');
            expect(result.suggestions).toContain('Please try again');
        });
        it('handles unknown errors', () => {
            const result = parseError({ unknown: 'error' });
            expect(result.message).toBe('An unknown error occurred');
            expect(result.recoverable).toBe(true);
            expect(result.userMessage).toBe('Something unexpected happened');
            expect(result.suggestions).toContain('Please refresh the page and try again');
        });
    });
    describe('HTTP status code handling', () => {
        const createAxiosError = (status, message) => ({
            isAxiosError: true,
            response: {
                status,
                data: { message },
            },
            message: 'Request failed',
        });
        it('handles 400 Bad Request', () => {
            const result = parseError(createAxiosError(400));
            expect(result.code).toBe('BAD_REQUEST');
            expect(result.recoverable).toBe(true);
        });
        it('handles 401 Unauthorized', () => {
            const result = parseError(createAxiosError(401));
            expect(result.code).toBe('UNAUTHORIZED');
            expect(result.recoverable).toBe(false);
        });
        it('handles 403 Forbidden', () => {
            const result = parseError(createAxiosError(403));
            expect(result.code).toBe('FORBIDDEN');
            expect(result.recoverable).toBe(false);
        });
        it('handles 408 Request Timeout', () => {
            const result = parseError(createAxiosError(408));
            expect(result.code).toBe('TIMEOUT');
            expect(result.recoverable).toBe(true);
        });
        it('handles 413 Payload Too Large', () => {
            const result = parseError(createAxiosError(413));
            expect(result.code).toBe('PAYLOAD_TOO_LARGE');
            expect(result.recoverable).toBe(true);
        });
        it('handles 429 Too Many Requests', () => {
            const result = parseError(createAxiosError(429));
            expect(result.code).toBe('RATE_LIMITED');
            expect(result.recoverable).toBe(true);
        });
        it('handles 500 Internal Server Error', () => {
            const result = parseError(createAxiosError(500));
            expect(result.code).toBe('INTERNAL_ERROR');
            expect(result.recoverable).toBe(true);
        });
        it('handles 503 Service Unavailable', () => {
            const result = parseError(createAxiosError(503));
            expect(result.code).toBe('SERVICE_UNAVAILABLE');
            expect(result.recoverable).toBe(true);
        });
    });
    describe('getRecoverySuggestions', () => {
        it('includes base suggestions', () => {
            const errorInfo = {
                message: 'Test error',
                recoverable: true,
                userMessage: 'Test message',
                suggestions: ['Original suggestion'],
            };
            const suggestions = getRecoverySuggestions(errorInfo);
            expect(suggestions).toContain('Original suggestion');
            expect(suggestions).toContain('Try the operation again');
        });
        it('adds network-specific suggestions', () => {
            const errorInfo = {
                message: 'Network error',
                code: 'NETWORK_ERROR',
                recoverable: true,
                userMessage: 'Network failed',
                suggestions: [],
            };
            const suggestions = getRecoverySuggestions(errorInfo);
            expect(suggestions).toContain('Check your internet connection');
        });
        it('adds timeout-specific suggestions', () => {
            const errorInfo = {
                message: 'Timeout error',
                code: 'TIMEOUT',
                recoverable: true,
                userMessage: 'Operation timed out',
                suggestions: [],
            };
            const suggestions = getRecoverySuggestions(errorInfo);
            expect(suggestions).toContain('Consider using a faster analysis mode');
        });
        it('adds server error suggestions', () => {
            const errorInfo = {
                message: 'Server error',
                statusCode: 500,
                recoverable: true,
                userMessage: 'Server failed',
                suggestions: [],
            };
            const suggestions = getRecoverySuggestions(errorInfo);
            expect(suggestions).toContain('The issue may be temporary - try again later');
        });
        it('removes duplicate suggestions', () => {
            const errorInfo = {
                message: 'Test error',
                recoverable: true,
                userMessage: 'Test message',
                suggestions: ['Try the operation again', 'Check your connection'],
            };
            const suggestions = getRecoverySuggestions(errorInfo);
            // Should not have duplicate "Try the operation again"
            const tryAgainCount = suggestions.filter((s) => s === 'Try the operation again').length;
            expect(tryAgainCount).toBe(1);
        });
    });
    describe('shouldShowRetryButton', () => {
        it('shows retry for recoverable errors', () => {
            const errorInfo = {
                message: 'Test error',
                recoverable: true,
                userMessage: 'Test message',
                suggestions: [],
            };
            expect(shouldShowRetryButton(errorInfo)).toBe(true);
        });
        it('hides retry for non-recoverable errors', () => {
            const errorInfo = {
                message: 'Test error',
                recoverable: false,
                userMessage: 'Test message',
                suggestions: [],
            };
            expect(shouldShowRetryButton(errorInfo)).toBe(false);
        });
        it('hides retry for 401 errors', () => {
            const errorInfo = {
                message: 'Unauthorized',
                statusCode: 401,
                recoverable: true,
                userMessage: 'Unauthorized',
                suggestions: [],
            };
            expect(shouldShowRetryButton(errorInfo)).toBe(false);
        });
        it('hides retry for 403 errors', () => {
            const errorInfo = {
                message: 'Forbidden',
                statusCode: 403,
                recoverable: true,
                userMessage: 'Forbidden',
                suggestions: [],
            };
            expect(shouldShowRetryButton(errorInfo)).toBe(false);
        });
    });
    describe('getErrorTitle', () => {
        it('returns specific titles for known error codes', () => {
            expect(getErrorTitle({ code: 'NETWORK_ERROR' })).toBe('Connection Error');
            expect(getErrorTitle({ code: 'TIMEOUT' })).toBe('Request Timeout');
            expect(getErrorTitle({ code: 'FILE_NOT_FOUND' })).toBe('File Not Found');
            expect(getErrorTitle({ code: 'PERMISSION_DENIED' })).toBe('Permission Denied');
            expect(getErrorTitle({ code: 'OUT_OF_MEMORY' })).toBe('Memory Error');
            expect(getErrorTitle({ code: 'RATE_LIMITED' })).toBe('Rate Limit Exceeded');
            expect(getErrorTitle({ code: 'SERVICE_UNAVAILABLE' })).toBe('Service Unavailable');
        });
        it('returns generic title for unknown error codes', () => {
            expect(getErrorTitle({ code: 'UNKNOWN_ERROR' })).toBe('Error');
            expect(getErrorTitle({})).toBe('Error');
        });
    });
});
//# sourceMappingURL=errorHandling.test.js.map