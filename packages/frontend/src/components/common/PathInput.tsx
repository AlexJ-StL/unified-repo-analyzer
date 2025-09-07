import { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { type PathValidationResult, pathValidationService } from '../../services/pathValidation';

export interface PathInputProps {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onValidationChange?: (isValid: boolean, result: PathValidationResult) => void;
  validateOnChange?: boolean;
  showFormatHints?: boolean;
  timeoutMs?: number;
  required?: boolean;
}

export function PathInput({
  label,
  value,
  onChange,
  onValidationChange,
  validateOnChange = false,
  showFormatHints = false,
  timeoutMs = 1000,
  required = false,
}: PathInputProps) {
  const [validationState, setValidationState] = useState<
    'idle' | 'validating' | 'valid' | 'invalid'
  >('idle');
  const [validationResult, setValidationResult] = useState<PathValidationResult | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Debounced validation function
  const validatePath = useCallback(
    async (pathToValidate: string) => {
      if (!pathToValidate.trim()) {
        setValidationState('idle');
        setValidationResult(null);
        onValidationChange?.(false, {
          isValid: false,
          errors: [],
          warnings: [],
          metadata: {
            exists: false,
            isDirectory: false,
            permissions: { read: false, write: false, execute: false },
          },
        });
        return;
      }

      setValidationState('validating');

      try {
        const result = await pathValidationService.validatePath(
          pathToValidate,
          { timeoutMs },
          (progress) => {
            // Handle progress updates
            console.log('Validation progress:', progress);
          }
        );

        setValidationResult(result);
        setValidationState(result.isValid ? 'valid' : 'invalid');
        onValidationChange?.(result.isValid, result);
      } catch (error) {
        const errorResult: PathValidationResult = {
          isValid: false,
          errors: [
            {
              code: 'VALIDATION_ERROR',
              message: error instanceof Error ? error.message : 'Validation failed',
              suggestions: ['Try a different path', 'Check the path format'],
            },
          ],
          warnings: [],
          metadata: {
            exists: false,
            isDirectory: false,
            permissions: { read: false, write: false, execute: false },
          },
        };

        setValidationResult(errorResult);
        setValidationState('invalid');
        onValidationChange?.(false, errorResult);
      }
    },
    [timeoutMs, onValidationChange]
  );

  // Handle input changes with debouncing
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event);

    if (validateOnChange) {
      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set new timer for debounced validation
      const timer = setTimeout(() => {
        validatePath(event.target.value);
      }, 300); // 300ms debounce

      setDebounceTimer(timer);
    }
  };

  // Manual validation trigger
  const handleManualValidation = () => {
    validatePath(value);
  };

  // Toggle format hints
  const toggleFormatHints = () => {
    setShowHints(!showHints);
  };

  // Get format hints
  const formatHints = pathValidationService.getPathFormatHints();

  // Get CSS classes based on validation state
  const getInputClasses = () => {
    const baseClasses =
      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';

    switch (validationState) {
      case 'validating':
        return `${baseClasses} border-yellow-300 bg-yellow-50`;
      case 'valid':
        return `${baseClasses} border-green-300 bg-green-50`;
      case 'invalid':
        return `${baseClasses} border-red-300 bg-red-50`;
      default:
        return `${baseClasses} border-gray-300`;
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <div className="space-y-2">
      <label htmlFor={`path-${label}`} className="block text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span aria-label="required" className="text-red-500 ml-1">
            *
          </span>
        )}
      </label>

      <div className="relative">
        <input
          id={`path-${label}`}
          type="text"
          value={value}
          onChange={handleInputChange}
          aria-required={required}
          className={getInputClasses()}
          placeholder="Enter file or directory path..."
        />

        <div className="absolute right-2 top-2 flex space-x-1">
          {showFormatHints && (
            <button
              type="button"
              onClick={toggleFormatHints}
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              Format Help
            </button>
          )}

          {!validateOnChange && (
            <button
              type="button"
              onClick={handleManualValidation}
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              disabled={validationState === 'validating'}
            >
              Validate Path
            </button>
          )}

          <button
            type="button"
            aria-label="browse"
            className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            Browse
          </button>
        </div>
      </div>

      {/* Validation Status */}
      {validationState === 'validating' && (
        <div className="text-sm text-yellow-600">Starting path validation...</div>
      )}

      {validationState === 'valid' && validationResult && (
        <div className="text-sm text-green-600">
          Path is valid
          {validationResult.normalizedPath && validationResult.normalizedPath !== value && (
            <div className="text-xs text-gray-500">
              normalized: {validationResult.normalizedPath}
            </div>
          )}
        </div>
      )}

      {validationState === 'invalid' && validationResult && (
        <div className="text-sm text-red-600">
          <div className="font-medium">Path validation failed</div>
          {validationResult.errors.map((error, index) => (
            <div key={`error-${error.code}-${index}`} className="mt-1">
              <div className="font-medium">{error.code}</div>
              <div>{error.message}</div>
              {error.suggestions?.map((suggestion, suggestionIndex) => (
                <div key={`suggestion-${suggestionIndex}`} className="text-xs text-gray-600 ml-2">
                  • {suggestion}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Format Hints */}
      {showFormatHints && showHints && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
          <div className="font-medium text-blue-800 mb-2">{formatHints.platform} Path Format</div>

          <div className="mb-2">
            <div className="font-medium text-blue-700">Examples:</div>
            {formatHints.examples.map((example, index) => (
              <div key={`example-${index}`} className="font-mono text-xs text-blue-600 ml-2">
                {example}
              </div>
            ))}
          </div>

          <div>
            <div className="font-medium text-blue-700">Tips:</div>
            {formatHints.tips.map((tip, index) => (
              <div key={`tip-${index}`} className="text-blue-600 ml-2">
                • {tip}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PathInput;
