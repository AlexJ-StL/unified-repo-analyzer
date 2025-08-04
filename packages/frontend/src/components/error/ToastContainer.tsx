import type React from 'react';
import { useEffect, useRef } from 'react';
import type { Toast as ToastType } from '../../hooks/useToast';
import Toast from './Toast';

interface ToastContainerProps {
  toasts: ToastType[];
  onRemoveToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onRemoveToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
