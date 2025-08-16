/**
 * Enhanced path input component with real-time validation
 */

import { FolderIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { type PathValidationResult, pathValidationService } from '../../services/pathValidation';
import EnhancedErrorDisplay from '../error/EnhancedErrorDisplay';
import LoadingState from './LoadingState';

interface PathInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean, result?: PathValidationResult) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showFormatHints?: boolean;
  validateOnChange?: boolean;
  validateExistence?: boolean;
  validatePermissions?: boolean;
  timeoutMs?: number;
}

const PathInput: React.FC<PathInputProps> = ({
  label,
  value,
  onChange,
  onValidationChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  showFormatHints = true,
  validateOnChange = true,
  validateExistence = true,
  validatePermissions = true,
  timeoutMs = 5000,
}) => {
  const [validationResult, setValidationResult] = useState<PathValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [validationProgress, setValidationProgress] = useState<{
    stage: string;
    percentage: number;
    message: string;
  } | null>(null);

  // Debounced validation
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  const validatePath = useCallback(
    async (pathToValidate: string) => {
      if (!pathToValidate.trim()) {
        setValidationResult(null);
        onValidationChange?.(true); // Empty is valid if not required
        return;
      }

      setIsValidating(true);
      setValidationProgress({
        stage: 'initializing',
        percentage: 0,
        message: 'Starting path validation...',
      });

      try {
        const result = await pathValidationService.validatePath(
          pathToValidate,
          {
            timeoutMs,
            validateExistence,
            validatePermissions,
          },
          (progress) => {
            setValidationProgress(progress);
          }
        );

        setValidationResult(result);
        onValidationChange?.(result.isValid, result);
      } catch (error) {
        const errorResult: PathValidationResult = {
          isValid: false,
          errors: [
            {
              code: 'VALIDATION_ERROR',
              message: 'Failed to validate path',
              details: error instanceof Error ? error.message : String(error),
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
        onValidationChange?.(false, errorResult);
      } finally {
        setIsValidating(false);
        setValidationProgress(null);
      }
    },
    [timeoutMs, validateExistence, validatePermissions, onValidationChange]
  );

  // Handle input change with debounced validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (validateOnChange) {
      // Clear existing timeout
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }

      // Set new timeout for validation
      const timeout = setTimeout(() => {
        validatePath(newValue);
      }, 500); // 500ms debounce

      setValidationTimeout(timeout);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

  // Manual validation trigger
  const handleValidateClick = () => {
    validatePath(value);
  };

  // Get format hints
  const formatHints = pathValidationService.getPathFormatHints();

  // Determine input styling based on validation state
  const getInputStyling = () => {
    if (isValidating) {
      return 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500';
    }
    if (validationResult) {
      if (validationResult.isValid) {
        return 'border-green-300 focus:border-green-500 focus:ring-green-500';
      }
      return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    }
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label htmlFor={`path-input-${label}`} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {showFormatHints && (
          <button
            type="button"
            onClick={() => setShowHints(!showHints)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <InformationCircleIcon className="h-4 w-4 mr-1" />
            Format Help
          </button>
        )}
      </div>

      {/* Input field */}
      <div className="relative">
        <input
          id={`path-input-${label}`}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder || `Enter ${formatHints.platform} path...`}
          disabled={disabled}
          className={`
            block w-full px-3 py-2 text-sm rounded-md shadow-sm
            placeholder-gray-400 focus:outline-none focus:ring-1
            ${getInputStyling()}
            ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}
          `}
        />

        {/* Browse button */}
        <button
          type="button"
          onClick={() => {
            // In a real implementation, this would open a file dialog
            // For now, just show a placeholder message
            alert('File browser not implemented in demo');
          }}
          disabled={disabled}
          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
        >
          <FolderIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Validation progress */}
      {isValidating && validationProgress && (
        <LoadingState
          message={validationProgress.message}
          progress={validationProgress.percentage}
          stage={validationProgress.stage}
          showProgress={true}
          size="sm"
          className="py-2"
        />
      )}

      {/* Validation results */}
      {validationResult && !isValidating && (
        <div className="space-y-2">
          {/* Success message */}
          {validationResult.isValid && (
            <div className="flex items-center text-sm text-green-600">
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Path is valid
              {validationResult.normalizedPath && validationResult.normalizedPath !== value && (
                <span className="ml-2 text-xs text-gray-500">
                  (normalized: {validationResult.normalizedPath})
                </span>
              )}
            </div>
          )}

          {/* Enhanced error and warning display */}
          {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
            <EnhancedErrorDisplay
              errors={validationResult.errors}
              warnings={validationResult.warnings}
              originalPath={value}
              onRetry={() => validatePath(value)}
              showTechnicalDetails={true}
              showSuggestions={true}
              compact={false}
            />
          )}

          {/* Path metadata */}
          {validationResult.isValid && validationResult.metadata.exists && (
            <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
              <div className="grid grid-cols-2 gap-2">
                <div>Type: {validationResult.metadata.isDirectory ? 'Directory' : 'File'}</div>
                <div>Readable: {validationResult.metadata.permissions.read ? 'Yes' : 'No'}</div>
                <div>Writable: {validationResult.metadata.permissions.write ? 'Yes' : 'No'}</div>
                {validationResult.metadata.size !== undefined && (
                  <div>Size: {(validationResult.metadata.size / 1024).toFixed(1)} KB</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual validation button */}
      {!validateOnChange && (
        <button
          type="button"
          onClick={handleValidateClick}
          disabled={disabled || isValidating || !value.trim()}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Validate Path
        </button>
      )}

      {/* Format hints */}
      {showHints && showFormatHints && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            {formatHints.platform} Path Format
          </h4>

          <div className="space-y-2 text-sm text-blue-700">
            <div>
              <strong>Examples:</strong>
              <ul className="mt-1 text-xs font-mono bg-blue-100 rounded p-2 space-y-1">
                {formatHints.examples.map((example, index) => (
                  <li key={index}>{example}</li>
                ))}
              </ul>
            </div>

            <div>
              <strong>Tips:</strong>
              <ul className="mt-1 text-xs list-disc list-inside space-y-1">
                {formatHints.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PathInput;
