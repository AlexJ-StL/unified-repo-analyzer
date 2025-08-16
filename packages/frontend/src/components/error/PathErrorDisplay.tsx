import type React from 'react';
import type { PathErrorResponse } from '../../services/api';

interface PathErrorDisplayProps {
  error: PathErrorResponse;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const PathErrorDisplay: React.FC<PathErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{error.error}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error.message}</p>

            {error.details && <p className="mt-1 text-xs text-red-600">{error.details}</p>}

            {error.path && (
              <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono">
                <span className="text-red-600">Path:</span> {error.path}
                {error.normalizedPath && error.normalizedPath !== error.path && (
                  <>
                    <br />
                    <span className="text-red-600">Normalized:</span> {error.normalizedPath}
                  </>
                )}
              </div>
            )}
          </div>

          {error.suggestions && error.suggestions.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-red-800">Suggestions:</h4>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside space-y-1">
                {error.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {error.learnMoreUrl && (
            <div className="mt-3">
              <a
                href={error.learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-red-600 hover:text-red-500 underline"
              >
                Learn more about this error →
              </a>
            </div>
          )}

          {error.technicalDetails && (
            <details className="mt-3">
              <summary className="text-sm font-medium text-red-800 cursor-pointer">
                Technical Details
              </summary>
              <div className="mt-2 text-xs text-red-600">
                {error.technicalDetails.errors && error.technicalDetails.errors.length > 0 && (
                  <div>
                    <strong>Errors:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {error.technicalDetails.errors.map((err, index) => (
                        <li key={index}>
                          <code>{err.code}</code>: {err.message}
                          {err.details && <div className="ml-4 text-gray-600">{err.details}</div>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {error.technicalDetails.warnings && error.technicalDetails.warnings.length > 0 && (
                  <div className="mt-2">
                    <strong>Warnings:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {error.technicalDetails.warnings.map((warning, index) => (
                        <li key={index}>
                          <code>{warning.code}</code>: {warning.message}
                          {warning.details && (
                            <div className="ml-4 text-gray-600">{warning.details}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        <div className="ml-auto pl-3">
          <div className="flex space-x-2">
            {onRetry && (
              <button
                type="button"
                className="bg-red-50 rounded-md p-1.5 text-red-400 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                onClick={onRetry}
                title="Retry"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}

            {onDismiss && (
              <button
                type="button"
                className="bg-red-50 rounded-md p-1.5 text-red-400 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                onClick={onDismiss}
                title="Dismiss"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathErrorDisplay;
