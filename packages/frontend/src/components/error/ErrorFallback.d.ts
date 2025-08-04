import React from 'react';
interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
  showDetails?: boolean;
  className?: string;
}
declare const ErrorFallback: React.FC<ErrorFallbackProps>;
export default ErrorFallback;
