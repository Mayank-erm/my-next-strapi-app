// src/components/DocumentViewer.tsx
import React, { useRef, useEffect, useState } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline'; // Removed ArrowDownTrayIcon as it's not used directly here

interface DocumentViewerProps {
  documentPath: string;
  proposalName: string;
  isDirectIframeSupported: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentPath, proposalName, isDirectIframeSupported }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isDirectIframeSupported && iframeRef.current) {
      setIsLoading(true);
      const handleLoad = () => {
        setIsLoading(false);
      };
      iframeRef.current.addEventListener('load', handleLoad);

      const timeoutId = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          console.warn("Document iframe took too long to load or failed.");
        }
      }, 15000);

      return () => {
        if (iframeRef.current) {
          iframeRef.current.removeEventListener('load', handleLoad);
        }
        clearTimeout(timeoutId);
      };
    } else {
        setIsLoading(false);
    }
  }, [documentPath, isDirectIframeSupported]);

  return (
    // The key is that this outermost div for DocumentViewer is w-full h-full
    <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden relative w-full h-full">
      {isLoading && isDirectIframeSupported && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10">
            <div className="flex flex-col items-center">
                <svg className="animate-spin h-8 w-8 text-gray-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600">Loading document...</p>
            </div>
        </div>
      )}
      {isDirectIframeSupported && documentPath ? (
        // This inner div is also crucial to ensure the iframe takes the full space of its flex parent
        <div className="w-full h-full">
          <iframe
            ref={iframeRef}
            src={documentPath}
            title={proposalName}
            className="w-full h-full border-0" // iframe itself is w-full h-full
            allowFullScreen
          >
            <p>Your browser does not support iframes, or the document could not be loaded.</p>
            <p>Please use the download button below to view the document.</p>
          </iframe>
        </div>
      ) : documentPath ? (
        <div className="flex flex-col items-center p-6 text-gray-500 text-center border border-dashed border-gray-300 rounded-lg w-full h-full justify-center">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">File preview not available</p>
          <p className="text-sm text-gray-600 mb-4">This file type is not supported for direct browser preview.</p>
          <p className="text-sm text-gray-600">Please use the download button in the footer to view the document.</p>
        </div>
      ) : (
        <p className="text-gray-500 text-center">No document URL available for preview.<br/>Please download the document to view its full content.</p>
      )}
    </div>
  );
};

export default DocumentViewer;