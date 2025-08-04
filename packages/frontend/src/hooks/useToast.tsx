import type React from 'react';
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import ToastContainer from '../components/error/ToastContainer';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showSuccess: (title: string, message?: string, action?: Toast['action']) => void;
  showError: (title: string, message?: string, action?: Toast['action']) => void;
  showWarning: (title: string, message?: string, action?: Toast['action']) => void;
  showInfo: (title: string, message?: string, action?: Toast['action']) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

const generateId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      duration: 5000, // Default 5 seconds
      ...toast,
    };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const showSuccess = useCallback(
    (title: string, message?: string, action?: Toast['action']) => {
      showToast({ type: 'success', title, message, action });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string, action?: Toast['action']) => {
      showToast({ type: 'error', title, message, action, duration: 0 }); // Errors don't auto-dismiss
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string, action?: Toast['action']) => {
      showToast({ type: 'warning', title, message, action });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string, action?: Toast['action']) => {
      showToast({ type: 'info', title, message, action });
    },
    [showToast]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
