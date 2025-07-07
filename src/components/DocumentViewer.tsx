// src/components/DocumentViewer.tsx - SIMPLIFIED VERSION (No external dependencies needed)
import React, { useRef, useEffect, useState } from 'react';
import { DocumentTextIcon as SolidDocumentTextIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/20/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DocumentViewerProps {
  documentPath: string;
  proposalName: string;
  isDirectIframeSupported: boolean;
}

// Enhanced file type detection
const getFileType = (path: string): string => {
  const extension = path.split('.').pop()?.toLowerCase() || '';
  const typeMap: Record<string, string> = {
    'pdf': 'pdf',
    'doc': 'word',
    'docx': 'word',
    'ppt': 'powerpoint',
    'pptx': 'powerpoint',
    'xls': 'excel',
    'xlsx': 'excel',
    'csv': 'excel',
    'txt': 'text',
    'html': 'web',
    'htm': 'web'
  };
  return typeMap[extension] || 'unknown';
};

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  documentPath, 
  proposalName, 
  isDirectIframeSupported 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('unknown');

  useEffect(() => {
    const detectedType = getFileType(documentPath);
    setFileType(detectedType);
    
    // For PDF files, let iframe handle loading
    if (detectedType === 'pdf' && isDirectIframeSupported) {
      return; // iframe will trigger load events
    }
    
    // For other files, stop loading immediately and show preview card
    setIsLoading(false);
  }, [documentPath, isDirectIframeSupported]);

  // Handle iframe load events for PDF files only
  useEffect(() => {
    if (fileType === 'pdf' && isDirectIframeSupported && iframeRef.current) {
      const iframe = iframeRef.current;
      
      const handleLoad = () => {
        setIsLoading(false);
        setError(null);
      };
      
      const handleError = () => {
        setError('Failed to load PDF document');
        setIsLoading(false);
      };

      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);

      // Fallback timeout for PDFs that don't trigger load event
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          console.warn('PDF load timeout - assuming loaded');
        }
      }, 8000);

      return () => {
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
        clearTimeout(timeoutId);
      };
    }
  }, [fileType, isDirectIframeSupported, isLoading]);

  // Loading state (only for PDFs)
  if (isLoading && fileType === 'pdf') {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="animate-spin h-10 w-10 border-4 border-strapi-green-light border-t-transparent rounded-full"></div>
            <SolidDocumentTextIcon className="h-6 w-6 text-strapi-green-light absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-gray-700 font-medium">Loading PDF document...</p>
          <p className="text-gray-500 text-sm mt-1">This may take a moment</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Preview Error</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                // Retry by reloading iframe
                if (iframeRef.current) {
                  iframeRef.current.src = iframeRef.current.src;
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Retry Preview
            </button>
            <a
              href={documentPath}
              download
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Download
            </a>
          </div>
        </div>
      </div>
    );
  }

  // PDF Preview (iframe)
  if (fileType === 'pdf' && isDirectIframeSupported) {
    return (
      <div className="flex-1 bg-white rounded-lg overflow-hidden border border-gray-200">
        <iframe
          ref={iframeRef}
          src={documentPath}
          title={proposalName}
          className="w-full h-full border-0"
          allowFullScreen
        />
      </div>
    );
  }

  // Enhanced preview cards for other file types
  const getFileTypeInfo = () => {
    switch (fileType) {
      case 'word':
        return {
          title: 'Microsoft Word Document',
          description: 'Word documents (.doc/.docx) provide rich text formatting and are best viewed by downloading.',
          icon: '📄',
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          features: ['Rich text formatting', 'Tables and images', 'Comments and track changes']
        };
      case 'powerpoint':
        return {
          title: 'PowerPoint Presentation',
          description: 'PowerPoint files (.ppt/.pptx) contain slides with animations and multimedia content.',
          icon: '📊',
          color: 'from-orange-500 to-red-500',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          features: ['Slide presentations', 'Animations and transitions', 'Charts and multimedia']
        };
      case 'excel':
        return {
          title: 'Excel Spreadsheet',
          description: 'Excel files (.xls/.xlsx/.csv) contain data tables, formulas, and charts.',
          icon: '📈',
          color: 'from-green-500 to-emerald-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          features: ['Data tables and formulas', 'Charts and graphs', 'Multiple worksheets']
        };
      case 'text':
        return {
          title: 'Text Document',
          description: 'Plain text files (.txt) contain unformatted text content.',
          icon: '📝',
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          features: ['Plain text content', 'Lightweight format', 'Universal compatibility']
        };
      case 'web':
        return {
          title: 'Web Document',
          description: 'HTML files (.html/.htm) can be previewed directly in the browser.',
          icon: '🌐',
          color: 'from-purple-500 to-indigo-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          features: ['Web content', 'Hyperlinks', 'Styled formatting']
        };
      default:
        return {
          title: 'Document File',
          description: 'This file type requires downloading to view the complete content.',
          icon: '📎',
          color: 'from-gray-400 to-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          features: ['Unknown format', 'Download required', 'External application needed']
        };
    }
  };

  const fileInfo = getFileTypeInfo();

  // Special handling for HTML files - can be previewed directly
  if (fileType === 'web') {
    return (
      <div className="flex-1 bg-white rounded-lg overflow-hidden border border-gray-200">
        <iframe
          src={documentPath}
          title={proposalName}
          className="w-full h-full border-0"
          sandbox="allow-same-origin"
        />
      </div>
    );
  }

  // Enhanced preview card for non-previewable files
  return (
    <div className={`flex-1 flex items-center justify-center ${fileInfo.bgColor} rounded-lg border ${fileInfo.borderColor}`}>
      <div className="text-center p-8 max-w-lg mx-4">
        {/* File type icon and header */}
        <div className="relative mb-6">
          <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${fileInfo.color} flex items-center justify-center text-3xl shadow-lg`}>
            <span className="text-white text-2xl">{fileInfo.icon}</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
            <EyeIcon className="h-4 w-4 text-gray-600" />
          </div>
        </div>

        {/* Document information */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">{fileInfo.title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{fileInfo.description}</p>

        {/* File details card */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6 shadow-sm">
          <div className="text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <span className="font-medium text-gray-700">Document:</span>
              <span className="text-gray-900 truncate ml-2 max-w-48" title={proposalName}>
                {proposalName}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <span className="font-medium text-gray-700">Type:</span>
              <span className="text-gray-900 ml-2">{fileInfo.title}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-700">File:</span>
              <span className="text-gray-900 ml-2">.{fileType}</span>
            </div>
          </div>
        </div>

        {/* Features list */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">File Features:</h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {fileInfo.features.map((feature, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 border border-gray-200"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={documentPath}
            download
            className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${fileInfo.color} text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium`}
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Download Document
          </a>
          <button
            onClick={() => window.open(documentPath, '_blank')}
            className="inline-flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200 font-medium"
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            Open in New Tab
          </button>
        </div>

        {/* Help text */}
        <p className="text-xs text-gray-500 mt-4">
          💡 For the best viewing experience, download the document to use with its native application.
        </p>
      </div>
    </div>
  );
};

export default DocumentViewer;