export interface ErrorInfo {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  recoverable: boolean;
  userMessage: string;
  suggestions: string[];
}
export declare const parseError: (error: unknown) => ErrorInfo;
export declare const getRecoverySuggestions: (errorInfo: ErrorInfo) => string[];
export declare const shouldShowRetryButton: (errorInfo: ErrorInfo) => boolean;
export declare const getErrorTitle: (errorInfo: ErrorInfo) => string;
