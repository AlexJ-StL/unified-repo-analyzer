import { ExclamationTriangleIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import type React from 'react';
import { type ReactNode, useEffect, useState } from 'react';

interface GracefulDegradationProps {
  children: ReactNode;
  fallback?: ReactNode;
  feature: string;
  isEnabled: boolean;
  error?: Error | null;
  onRetry?: () => void;
  showWarning?: boolean;
  warningMessage?: string;
}

const GracefulDegradation: React.FC<GracefulDegradationProps> = ({
  children,
  fallback,
  feature,
  isEnabled,
  error,
  onRetry,
  showWarning = true,
  warningMessage,
}) => {
  const [hasShownWarning, setHasShownWarning] = useState(false);

  useEffect(() => {
    if (!isEnabled && showWarning && !hasShownWarning) {
      setHasShownWarning(true);
    }
  }, [isEnabled, showWarning, hasShownWarning]);

  // If feature is enabled and no error, render children
  if (isEnabled && !error) {
    return <>{children}</>;
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default fallback UI
  const defaultMessage =
    warningMessage ||
    (error
      ? `The ${feature} feature encountered an error and is temporarily unavailable.`
      : `The ${feature} feature is currently unavailable.`);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          {error ? (
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
          ) : (
            <EyeSlashIcon className="h-5 w-5 text-yellow-400" />
          )}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">Feature Unavailable</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>{defaultMessage}</p>
            {error && process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">
                  Error Details (Development)
                </summary>
                <pre className="mt-1 text-xs whitespace-pre-wrap">{error.message}</pre>
              </details>
            )}
          </div>
          {onRetry && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onRetry}
                className="text-sm font-medium text-yellow-800 underline hover:no-underline"
              >
                Try to enable this feature
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GracefulDegradation;
