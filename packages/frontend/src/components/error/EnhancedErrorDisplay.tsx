/**
 * Enhanced error display component with comprehensive error handling
 */

import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import type React from 'react';
import { useState } from 'react';
import { errorMessageService, type UserFriendlyError } from '../../services/errorMessages';
import type { PathError, PathWarning } from '../../services/pathValidation';

interface EnhancedErrorDisplayProps {
  errors?: PathError[];
  warnings?: PathWarning[];
  userFriendlyError?: UserFriendlyError;
  originalPath?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showTechnicalDetails?: boolean;
  showSuggestions?: boolean;
  compact?: boolean;
}

const EnhancedErrorDisplay: React.FC<EnhancedErrorDisplayProps> = ({
  errors = [],
  warnings = [],
  userFriendlyError,
  originalPath,
  onRetry,
  onDismiss,
  className = '',
  showTechnicalDetails = true,
  showSuggestions = true,
  compact = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Create user-friendly error if not provided
  const displayError =
    userFriendlyError ||
    (errors.length > 0
      ? errorMessageService.createPathErrorMessage(errors, warnings, originalPath)
      : null);

  // Create warning message if we have warnings but no errors
  const displayWarning =
    !displayError && warnings.length > 0
      ? errorMessageService.createWarningMessage(warnings)
      : null;

  const displayMessage = displayError || displayWarning;

  if (!displayMessage || dismissed) {
    return null;
  }

  const colors = errorMessageService.getSeverityColor(displayMessage.severity);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const getIcon = () => {
    switch (displayMessage.severity) {
      case 'error':
        return <XCircleIcon className={`h-5 w-5 ${colors.icon}`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`h-5 w-5 ${colors.icon}`} />;
      case 'info':
        return <InformationCircleIcon className={`h-5 w-5 ${colors.icon}`} />;
      default:
        return <XCircleIcon className={`h-5 w-5 ${colors.icon}`} />;
    }
  };

  if (compact) {
    return (
      <div className={`${colors.bg} ${colors.border} border rounded-md p-3 ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${colors.text}`}>{displayMessage.title}</p>
            <p className={`text-sm ${colors.text} mt-1`}>{displayMessage.message}</p>
          </div>
          {onDismiss && (
            <div className="ml-auto pl-3">
              <button
                type="button"
                onClick={handleDismiss}
                className={`${colors.bg} rounded-md p-1.5 ${colors.icon} hover:${colors.text} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${colors.bg.split('-')[1]}-50`}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">{getIcon()}</div>

        <div className="ml-3 flex-1">
          {/* Title and message */}
          <h3 className={`text-sm font-medium ${colors.text}`}>{displayMessage.title}</h3>
          <div className={`mt-2 text-sm ${colors.text}`}>
            <p>{displayMessage.message}</p>

            {displayMessage.details && (
              <p className="mt-1 text-xs opacity-75">{displayMessage.details}</p>
            )}
          </div>

          {/* Original path display */}
          {originalPath && (
            <div className={`mt-3 p-2 ${colors.bg} rounded text-xs font-mono`}>
              <span className={colors.text}>Path:</span> {originalPath}
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && displayMessage.suggestions.length > 0 && (
            <div className="mt-3">
              <h4 className={`text-sm font-medium ${colors.text}`}>Suggestions:</h4>
              <ul className={`mt-1 text-sm ${colors.text} list-disc list-inside space-y-1`}>
                {displayMessage.suggestions.map((suggestion, _index) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Platform-specific tips */}
          {displayMessage.category === 'path' && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className={`text-sm ${colors.text} hover:underline focus:outline-none`}
              >
                {showDetails ? 'Hide' : 'Show'} platform-specific tips
              </button>

              {showDetails && (
                <div className="mt-2">
                  <h5 className={`text-xs font-medium ${colors.text} mb-1`}>Path Format Tips:</h5>
                  <ul
                    className={`text-xs ${colors.text} list-disc list-inside space-y-1 opacity-75`}
                  >
                    {errorMessageService
                      .getPlatformSpecificSuggestions()
                      .tips.map((tip, _index) => (
                        <li key={tip}>{tip}</li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Learn more link */}
          {displayMessage.learnMoreUrl && (
            <div className="mt-3">
              <a
                href={displayMessage.learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm ${colors.text} hover:underline`}
              >
                Learn more about this error →
              </a>
            </div>
          )}

          {/* Technical details */}
          {showTechnicalDetails && (errors.length > 0 || warnings.length > 0) && (
            <details className="mt-3">
              <summary className={`text-sm font-medium ${colors.text} cursor-pointer`}>
                Technical Details
              </summary>
              <div className={`mt-2 text-xs ${colors.text} opacity-75`}>
                {errors.length > 0 && (
                  <div>
                    <strong>Errors ({errors.length}):</strong>
                    <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                      {errors.map((error, index) => (
                        <li key={`error-${error.code}-${index}`}>
                          <code className="bg-black bg-opacity-10 px-1 rounded">{error.code}</code>:{' '}
                          {error.message}
                          {error.details && (
                            <div className="ml-4 mt-1 text-gray-600">{error.details}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {warnings.length > 0 && (
                  <div className={errors.length > 0 ? 'mt-3' : ''}>
                    <strong>Warnings ({warnings.length}):</strong>
                    <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                      {warnings.map((warning, index) => (
                        <li key={`warning-${warning.code}-${index}`}>
                          <code className="bg-black bg-opacity-10 px-1 rounded">
                            {warning.code}
                          </code>
                          : {warning.message}
                          {warning.details && (
                            <div className="ml-4 mt-1 text-gray-600">{warning.details}</div>
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

        {/* Action buttons */}
        <div className="ml-auto pl-3">
          <div className="flex space-x-2">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className={`${colors.bg} rounded-md p-1.5 ${colors.icon} hover:${colors.text} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                title="Retry"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <title>Retry icon</title>
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
                onClick={handleDismiss}
                className={`${colors.bg} rounded-md p-1.5 ${colors.icon} hover:${colors.text} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                title="Dismiss"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedErrorDisplay;
