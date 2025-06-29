// src/components/Toast.tsx
import React, { useEffect, useRef } from 'react';
import { XMarkIcon, CheckCircleIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'error';
  autoCloseDelay?: number;
}

const Toast: React.FC<ToastProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  autoCloseDelay = 3000,
}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, onClose, autoCloseDelay]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'info':
        return <ClipboardDocumentListIcon className="h-6 w-6 text-blue-500" />;
      case 'error':
        return <XMarkIcon className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] p-4 bg-white rounded-lg shadow-xl border border-gray-200 flex items-start space-x-3 animate-slideInFromRight">
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1">
        <h3 className="text-md font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-md hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-200"
        aria-label="Close notification"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;