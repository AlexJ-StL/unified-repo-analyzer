import { AxiosError } from 'axios';

export interface ErrorInfo {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
  recoverable: boolean;
  userMessage: string;
  suggestions: string[];
}

export const parseError = (error: unknown): ErrorInfo => {
  // Handle Axios errors
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return parseAxiosError(axiosError);
  }

  // Handle standard errors
  if (error instanceof Error) {
    return parseStandardError(error);
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      recoverable: true,
      userMessage: error,
      suggestions: ['Please try again'],
    };
  }

  // Handle unknown errors
  return {
    message: 'An unknown error occurred',
    recoverable: true,
    userMessage: 'Something unexpected happened',
    suggestions: ['Please refresh the page and try again'],
  };
};

const parseAxiosError = (error: AxiosError): ErrorInfo => {
  const { response, request, message } = error;

  if (response) {
    // Server responded with error status
    const statusCode = response.status;
    const data = response.data as any;

    switch (statusCode) {
      case 400:
        return {
          message: data?.message || 'Bad request',
          code: 'BAD_REQUEST',
          statusCode,
          details: data,
          recoverable: true,
          userMessage: 'Invalid request. Please check your input and try again.',
          suggestions: [
            'Verify that all required fields are filled correctly',
            'Check that file paths are valid and accessible',
          ],
        };

      case 401:
        return {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
          statusCode,
          recoverable: false,
          userMessage: 'Authentication required',
          suggestions: ['Please log in and try again'],
        };

      case 403:
        return {
          message: 'Forbidden',
          code: 'FORBIDDEN',
          statusCode,
          recoverable: false,
          userMessage: 'Access denied',
          suggestions: ['You do not have permission to perform this action'],
        };

      case 404:
        return {
          message: 'Not found',
          code: 'NOT_FOUND',
          statusCode,
          recoverable: true,
          userMessage: 'The requested resource was not found',
          suggestions: [
            'Check that the file or directory path is correct',
            'Ensure the repository exists and is accessible',
          ],
        };

      case 408:
        return {
          message: 'Request timeout',
          code: 'TIMEOUT',
          statusCode,
          recoverable: true,
          userMessage: 'The request took too long to complete',
          suggestions: [
            'Try analyzing a smaller repository',
            'Check your internet connection',
            'Try again later',
          ],
        };

      case 413:
        return {
          message: 'Payload too large',
          code: 'PAYLOAD_TOO_LARGE',
          statusCode,
          recoverable: true,
          userMessage: 'The repository is too large to analyze',
          suggestions: [
            'Try analyzing a smaller subset of files',
            'Use quick analysis mode',
            'Exclude large binary files',
          ],
        };

      case 429:
        return {
          message: 'Too many requests',
          code: 'RATE_LIMITED',
          statusCode,
          recoverable: true,
          userMessage: 'Rate limit exceeded',
          suggestions: [
            'Please wait a moment before trying again',
            'Consider using batch processing for multiple repositories',
          ],
        };

      case 500:
        return {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          statusCode,
          recoverable: true,
          userMessage: 'Server error occurred',
          suggestions: [
            'Please try again in a few moments',
            'If the problem persists, contact support',
          ],
        };

      case 502:
      case 503:
      case 504:
        return {
          message: 'Service unavailable',
          code: 'SERVICE_UNAVAILABLE',
          statusCode,
          recoverable: true,
          userMessage: 'Service is temporarily unavailable',
          suggestions: [
            'Please try again in a few minutes',
            'Check if there are any service maintenance notifications',
          ],
        };

      default:
        return {
          message: data?.message || `HTTP ${statusCode}`,
          code: 'HTTP_ERROR',
          statusCode,
          details: data,
          recoverable: true,
          userMessage: `Server returned an error (${statusCode})`,
          suggestions: ['Please try again or contact support if the problem persists'],
        };
    }
  } else if (request) {
    // Network error
    return {
      message: 'Network error',
      code: 'NETWORK_ERROR',
      recoverable: true,
      userMessage: 'Unable to connect to the server',
      suggestions: [
        'Check your internet connection',
        'Verify that the server is running',
        'Try again in a few moments',
      ],
    };
  } else {
    // Request setup error
    return {
      message: message || 'Request failed',
      code: 'REQUEST_ERROR',
      recoverable: true,
      userMessage: 'Failed to send request',
      suggestions: ['Please try again'],
    };
  }
};

const parseStandardError = (error: Error): ErrorInfo => {
  const message = error.message;

  // File system errors
  if (message.includes('ENOENT') || message.includes('no such file')) {
    return {
      message,
      code: 'FILE_NOT_FOUND',
      recoverable: true,
      userMessage: 'File or directory not found',
      suggestions: [
        'Check that the path is correct',
        'Ensure the file or directory exists',
        'Verify you have permission to access the location',
      ],
    };
  }

  if (message.includes('EACCES') || message.includes('permission denied')) {
    return {
      message,
      code: 'PERMISSION_DENIED',
      recoverable: false,
      userMessage: 'Permission denied',
      suggestions: [
        'Check file and directory permissions',
        'Run with appropriate privileges if necessary',
      ],
    };
  }

  if (message.includes('EMFILE') || message.includes('too many open files')) {
    return {
      message,
      code: 'TOO_MANY_FILES',
      recoverable: true,
      userMessage: 'Too many files open',
      suggestions: [
        'Try analyzing a smaller repository',
        'Close other applications that might be using many files',
        'Try again after a moment',
      ],
    };
  }

  // Memory errors
  if (message.includes('out of memory') || message.includes('heap')) {
    return {
      message,
      code: 'OUT_OF_MEMORY',
      recoverable: true,
      userMessage: 'Not enough memory to complete the operation',
      suggestions: [
        'Try analyzing a smaller repository',
        'Use quick analysis mode',
        'Close other applications to free up memory',
      ],
    };
  }

  // Timeout errors
  if (message.includes('timeout') || message.includes('timed out')) {
    return {
      message,
      code: 'TIMEOUT',
      recoverable: true,
      userMessage: 'Operation timed out',
      suggestions: [
        'Try again with a smaller repository',
        'Check your internet connection',
        'Use quick analysis mode for faster processing',
      ],
    };
  }

  // Generic error
  return {
    message,
    recoverable: true,
    userMessage: message || 'An unexpected error occurred',
    suggestions: ['Please try again or contact support if the problem persists'],
  };
};

export const getRecoverySuggestions = (errorInfo: ErrorInfo): string[] => {
  const baseSuggestions = [...errorInfo.suggestions];

  if (errorInfo.recoverable) {
    baseSuggestions.push('Try the operation again');
  }

  // Add general suggestions based on error type
  if (errorInfo.code?.includes('NETWORK') || errorInfo.statusCode === 408) {
    baseSuggestions.push('Check your internet connection');
  }

  if (errorInfo.code?.includes('TIMEOUT') || errorInfo.statusCode === 408) {
    baseSuggestions.push('Consider using a faster analysis mode');
  }

  if (errorInfo.statusCode && errorInfo.statusCode >= 500) {
    baseSuggestions.push('The issue may be temporary - try again later');
  }

  return [...new Set(baseSuggestions)]; // Remove duplicates
};

export const shouldShowRetryButton = (errorInfo: ErrorInfo): boolean => {
  return errorInfo.recoverable && errorInfo.statusCode !== 401 && errorInfo.statusCode !== 403;
};

export const getErrorTitle = (errorInfo: ErrorInfo): string => {
  switch (errorInfo.code) {
    case 'NETWORK_ERROR':
      return 'Connection Error';
    case 'TIMEOUT':
      return 'Request Timeout';
    case 'FILE_NOT_FOUND':
      return 'File Not Found';
    case 'PERMISSION_DENIED':
      return 'Permission Denied';
    case 'OUT_OF_MEMORY':
      return 'Memory Error';
    case 'RATE_LIMITED':
      return 'Rate Limit Exceeded';
    case 'SERVICE_UNAVAILABLE':
      return 'Service Unavailable';
    default:
      return 'Error';
  }
};
