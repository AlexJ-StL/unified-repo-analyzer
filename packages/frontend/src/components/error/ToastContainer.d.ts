import React from 'react';
import { ToastData } from './Toast';
interface ToastContainerProps {
  toasts: ToastData[];
  onRemoveToast: (id: string) => void;
}
declare const ToastContainer: React.FC<ToastContainerProps>;
export default ToastContainer;
