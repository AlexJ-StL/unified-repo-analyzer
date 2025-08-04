import React, { ReactNode } from 'react';
import { ToastData } from '../components/error/Toast';
interface ToastContextType {
    showToast: (toast: Omit<ToastData, 'id'>) => void;
    showSuccess: (title: string, message?: string, action?: ToastData['action']) => void;
    showError: (title: string, message?: string, action?: ToastData['action']) => void;
    showWarning: (title: string, message?: string, action?: ToastData['action']) => void;
    showInfo: (title: string, message?: string, action?: ToastData['action']) => void;
    removeToast: (id: string) => void;
    clearAllToasts: () => void;
}
interface ToastProviderProps {
    children: ReactNode;
}
export declare const ToastProvider: React.FC<ToastProviderProps>;
export declare const useToast: () => ToastContextType;
export {};
