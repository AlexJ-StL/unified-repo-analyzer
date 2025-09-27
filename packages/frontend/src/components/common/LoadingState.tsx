/**
 * Loading state component with progress indicators
 */

import type React from 'react';

interface LoadingStateProps {
  message?: string;
  progress?: number;
  stage?: string;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  progress,
  stage,
  showProgress = false,
  size = 'md',
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          spinner: 'h-4 w-4',
          text: 'text-xs',
          container: 'p-2',
        };
      case 'lg':
        return {
          spinner: 'h-8 w-8',
          text: 'text-base',
          container: 'p-6',
        };
      default:
        return {
          spinner: 'h-5 w-5',
          text: 'text-sm',
          container: 'p-4',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`flex items-center justify-center ${sizeClasses.container} ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        {/* Spinner */}
        <div className="relative">
          <svg
            className={`animate-spin ${sizeClasses.spinner} text-blue-600`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <title>Loading spinner</title>
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>

          {/* Progress ring overlay */}
          {showProgress && typeof progress === 'number' && (
            <svg
              className={`absolute inset-0 ${sizeClasses.spinner} transform -rotate-90`}
              viewBox="0 0 24 24"
            >
              <title>Progress indicator</title>
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-blue-200"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 10}`}
                strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress / 100)}`}
                className="text-blue-600 transition-all duration-300"
              />
            </svg>
          )}
        </div>

        {/* Message and stage */}
        <div className="text-center">
          <p className={`${sizeClasses.text} text-gray-600 font-medium`}>{message}</p>

          {stage && <p className={`${sizeClasses.text} text-gray-500 mt-1`}>{stage}</p>}

          {showProgress && typeof progress === 'number' && (
            <p className={`${sizeClasses.text} text-gray-500 mt-1`}>{Math.round(progress)}%</p>
          )}
        </div>

        {/* Progress bar (alternative to ring) */}
        {showProgress && typeof progress === 'number' && size !== 'sm' && (
          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
