// src/components/Toast.tsx - COMPLETE VERSION with Portal for proper z-index
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-200';
      case 'info':
        return 'border-blue-200';
      case 'error':
        return 'border-red-200';
      default:
        return 'border-gray-200';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'info':
        return 'bg-blue-50';
      case 'error':
        return 'bg-red-50';
      default:
        return 'bg-white';
    }
  };

  if (!isOpen || !mounted) return null;

  const toastContent = (
    <div 
      className={`toast-notification fixed bottom-6 right-6 p-4 rounded-lg shadow-xl border flex items-start space-x-3 animate-slideInFromRight ${getBackgroundColor()} ${getBorderColor()}`}
      style={{ 
        zIndex: 1000001,
        minWidth: '300px',
        maxWidth: '400px',
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem'
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1">
        <h3 className="text-md font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-md hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-200 transition-colors"
        aria-label="Close notification"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );

  // CRITICAL: Use React Portal to render toast at body level - above modal
  return createPortal(toastContent, document.body);
};

export default Toast;