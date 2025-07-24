import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ToastData, ToastType } from '../components/error/Toast';
import ToastContainer from '../components/error/ToastContainer';

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  showSuccess: (title: string, message?: string, action?: ToastData['action']) => void;
  showError: (title: string, message?: string, action?: ToastData['action']) => void;
  showWarning: (title: string, message?: string, action?: ToastData['action']) => void;
  showInfo: (title: string, message?: string, action?: ToastData['action']) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const generateId = () => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = generateId();
    const newToast: ToastData = {
      id,
      duration: 5000, // Default 5 seconds
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const showSuccess = useCallback(
    (title: string, message?: string, action?: ToastData['action']) => {
      showToast({ type: 'success', title, message, action });
    },
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string, action?: ToastData['action']) => {
      showToast({ type: 'error', title, message, action, duration: 0 }); // Errors don't auto-dismiss
    },
    [showToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string, action?: ToastData['action']) => {
      showToast({ type: 'warning', title, message, action });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string, action?: ToastData['action']) => {
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
