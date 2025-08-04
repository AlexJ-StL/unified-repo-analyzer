import React, { Component, ErrorInfo, ReactNode } from 'react';
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}
declare class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props);
  static getDerivedStateFromError(error: Error): State;
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
  handleRetry: () => void;
  render():
    | string
    | number
    | boolean
    | React.JSX.Element
    | Iterable<React.ReactNode>
    | null
    | undefined;
}
export default ErrorBoundary;
