import React from 'react';
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export interface ToastData {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}
interface ToastProps {
    toast: ToastData;
    onClose: (id: string) => void;
}
declare const Toast: React.FC<ToastProps>;
export default Toast;
