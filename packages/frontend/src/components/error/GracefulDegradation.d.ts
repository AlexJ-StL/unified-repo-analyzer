import React, { ReactNode } from 'react';
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
declare const GracefulDegradation: React.FC<GracefulDegradationProps>;
export default GracefulDegradation;
