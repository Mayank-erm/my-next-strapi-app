import React from 'react';
import { XMarkIcon, CheckCircleIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'error'; // Optional type for different styling/icons
  showCopyButton?: boolean;
  copyText?: string;
  onCopy?: (text: string) => void;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  showCopyButton = false,
  copyText = '',
  onCopy,
}) => {
  if (!isOpen) return null;

  const handleCopy = () => {
    if (onCopy && copyText) {
      onCopy(copyText);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />;
      case 'info':
        return <ClipboardDocumentListIcon className="h-8 w-8 text-blue-500" />; // Custom icon for info, or general clipboard
      case 'error':
        return <XMarkIcon className="h-8 w-8 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-custom-overlay backdrop-blur-sm flex justify-center items-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-label="Close alert"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-4">{getIcon()}</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>

          {showCopyButton && copyText && (
            <button
              onClick={handleCopy}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 mb-4"
            >
              <ClipboardDocumentListIcon className="h-5 w-5 mr-2" /> Copy Link
            </button>
          )}

          <button
            onClick={onClose}
            className="px-6 py-2 bg-strapi-green-light text-white font-semibold rounded-lg hover:bg-strapi-green-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
