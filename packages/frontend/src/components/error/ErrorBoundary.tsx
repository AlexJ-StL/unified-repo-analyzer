import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import type React from 'react';
import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>

            <div className="mt-4 text-center">
              <h1 className="text-lg font-medium text-gray-900">Something went wrong</h1>
              <p className="mt-2 text-sm text-gray-600">
                We encountered an unexpected error. Please try refreshing the page or contact
                support if the problem persists.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 p-3 bg-gray-100 rounded-md">
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 text-gray-600">
                    <p className="font-medium">Error:</p>
                    <p className="mb-2">{this.state.error.message}</p>
                    <p className="font-medium">Stack:</p>
                    <pre className="whitespace-pre-wrap break-all">{this.state.error.stack}</pre>
                    {this.state.errorInfo && (
                      <>
                        <p className="font-medium mt-2">Component Stack:</p>
                        <pre className="whitespace-pre-wrap break-all">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Try Again
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
