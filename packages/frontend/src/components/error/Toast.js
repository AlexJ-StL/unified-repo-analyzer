import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon, } from '@heroicons/react/24/outline';
const Toast = ({ toast, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    useEffect(() => {
        // Trigger entrance animation
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, toast.duration);
            return () => clearTimeout(timer);
        }
    }, [toast.duration]);
    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            onClose(toast.id);
        }, 300); // Match the transition duration
    };
    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircleIcon className="w-5 h-5 text-green-400"/>;
            case 'error':
                return <XCircleIcon className="w-5 h-5 text-red-400"/>;
            case 'warning':
                return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400"/>;
            case 'info':
                return <InformationCircleIcon className="w-5 h-5 text-blue-400"/>;
        }
    };
    const getBackgroundColor = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'info':
                return 'bg-blue-50 border-blue-200';
        }
    };
    const getTitleColor = () => {
        switch (toast.type) {
            case 'success':
                return 'text-green-800';
            case 'error':
                return 'text-red-800';
            case 'warning':
                return 'text-yellow-800';
            case 'info':
                return 'text-blue-800';
        }
    };
    const getMessageColor = () => {
        switch (toast.type) {
            case 'success':
                return 'text-green-700';
            case 'error':
                return 'text-red-700';
            case 'warning':
                return 'text-yellow-700';
            case 'info':
                return 'text-blue-700';
        }
    };
    return (<div className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        max-w-sm w-full ${getBackgroundColor()} border rounded-lg shadow-lg pointer-events-auto
      `}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${getTitleColor()}`}>{toast.title}</p>
            {toast.message && (<p className={`mt-1 text-sm ${getMessageColor()}`}>{toast.message}</p>)}
            {toast.action && (<div className="mt-3">
                <button onClick={toast.action.onClick} className={`
                    text-sm font-medium underline hover:no-underline focus:outline-none
                    ${toast.type === 'success' ? 'text-green-600 hover:text-green-500' : ''}
                    ${toast.type === 'error' ? 'text-red-600 hover:text-red-500' : ''}
                    ${toast.type === 'warning' ? 'text-yellow-600 hover:text-yellow-500' : ''}
                    ${toast.type === 'info' ? 'text-blue-600 hover:text-blue-500' : ''}
                  `}>
                  {toast.action.label}
                </button>
              </div>)}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button onClick={handleClose} className={`
                inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2
                ${toast.type === 'success' ? 'text-green-400 hover:text-green-500 focus:ring-green-500' : ''}
                ${toast.type === 'error' ? 'text-red-400 hover:text-red-500 focus:ring-red-500' : ''}
                ${toast.type === 'warning' ? 'text-yellow-400 hover:text-yellow-500 focus:ring-yellow-500' : ''}
                ${toast.type === 'info' ? 'text-blue-400 hover:text-blue-500 focus:ring-blue-500' : ''}
              `}>
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5"/>
            </button>
          </div>
        </div>
      </div>
    </div>);
};
export default Toast;
//# sourceMappingURL=Toast.js.map