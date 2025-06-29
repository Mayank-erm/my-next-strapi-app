// src/components/DocumentPreviewModal.tsx (Consolidated and Error-Fixed)
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'; // Added useCallback
import { XMarkIcon, ShareIcon, ArrowDownTrayIcon, StarIcon, CheckCircleIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { EyeIcon } from '@heroicons/react/20/solid';
import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon as SolidDocumentTextIcon } from '@heroicons/react/20/solid';


// Helper to extract plain text from Strapi Rich Text
const getPlainTextFromRichText = (richTextBlocks: any[] | null | undefined): string => {
  if (!richTextBlocks || !Array.isArray(richTextBlocks) || richTextBlocks.length === 0) {
    return "";
  }
  return richTextBlocks.map(block => {
    if (block && block.type === 'paragraph' && Array.isArray(block.children)) {
      return block.children.map((child: any) => (child && typeof child.text === 'string') ? child.text : '').join('');
    }
    return '';
  }).join('\n');
};

// -----------------------------------------------------------
// NEW COMPONENT: AlertDialog.tsx (Consolidated) -> Renamed to Toast (for specific use case)
// -----------------------------------------------------------
interface ToastProps { // Renamed from AlertDialogProps
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'error';
  autoCloseDelay?: number; // New prop for auto-closing
}

const Toast: React.FC<ToastProps> = ({ // Renamed from AlertDialog
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  autoCloseDelay = 3000, // Default to 3 seconds
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


// -----------------------------------------------------------
// NEW COMPONENT: DocumentViewer.tsx (Consolidated)
// -----------------------------------------------------------
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
        <div className="w-full h-full">
          <iframe
            ref={iframeRef}
            src={documentPath}
            title={proposalName}
            className="w-full h-full border-0"
            allowFullScreen
          >
            <p>Your browser does not support iframes, or the document could not be loaded.</p>
            <p>Please use the download button below to view the document.</p>
          </iframe>
        </div>
      ) : documentPath ? (
        <div className="flex flex-col items-center p-6 text-gray-500 text-center border border-dashed border-gray-300 rounded-lg w-full h-full justify-center">
          <SolidDocumentTextIcon className="h-16 w-16 text-gray-400 mb-4" />
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

// -----------------------------------------------------------
// NEW COMPONENT: DescriptionPanel.tsx (Consolidated)
// -----------------------------------------------------------
interface DescriptionPanelProps {
  description: string;
  onRatingSubmit: (rating: number, comment: string) => void;
}

const DescriptionPanel: React.FC<DescriptionPanelProps> = ({ description, onRatingSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onRatingSubmit(rating, comment);
    setRating(0);
    setComment('');
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6">
      <h3 className="text-xl font-bold text-text-dark-gray mb-4">Description</h3>
      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-8">
        {description || 'No detailed description available.'}
      </p>

      {/* Ratings Section */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-bold text-text-dark-gray mb-3">Rate this document</h3>
        <div className="flex items-center space-x-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`h-7 w-7 cursor-pointer transition-colors duration-150
                          ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-300'}`}
              onClick={() => setRating(star)}
            />
          ))}
          {rating > 0 && <span className="ml-2 text-text-medium-gray">{rating} / 5 Stars</span>}
        </div>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-strapi-green-light resize-y mb-3"
          rows={3}
          placeholder="Add a comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className="px-6 py-2 bg-strapi-green-light text-white font-semibold rounded-lg disabled:opacity-50
                     hover:bg-strapi-green-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2"
        >
          Submit Rating
        </button>
      </div>
    </div>
  );
};

// -----------------------------------------------------------
// NEW COMPONENT: DescriptionView.tsx (Consolidated)
// -----------------------------------------------------------
interface DescriptionViewProps {
  proposal: {
    proposalName: string;
    clientName: string;
    opportunityNumber: string;
    pstatus: string;
    value: string | number;
    proposedBy: string | null;
    publishedAt: string;
    description?: any[] | null;
  };
  onRatingSubmit: (rating: number, comment: string) => void;
  getPlainTextFromRichText: (richTextBlocks: any[] | null | undefined) => string;
}

const DescriptionView: React.FC<DescriptionViewProps> = ({ proposal, onRatingSubmit, getPlainTextFromRichText }) => {
  const plainDescription = getPlainTextFromRichText(proposal.description);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Critical Information Section - Always visible in Description View */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 mx-6 mt-6 border border-gray-200"> {/* Modernized styles */}
        <p className="text-xl font-bold text-gray-900 mb-4">{proposal.proposalName || 'N/A'}</p> {/* Stronger heading */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-base text-gray-700"> {/* Improved grid & text */}
          <div className="flex items-center"><span className="font-semibold text-gray-800 mr-2">Client:</span> {proposal.clientName || 'N/A'}</div>
          <div className="flex items-center"><span className="font-semibold text-gray-800 mr-2">Opportunity #:</span> {proposal.opportunityNumber || 'N/A'}</div>
          <div className="flex items-center"><span className="font-semibold text-gray-800 mr-2">Status:</span> <span className="font-semibold capitalize text-strapi-green-dark">{proposal.pstatus || 'N/A'}</span></div> {/* Highlight status */}
          <div className="flex items-center"><span className="font-semibold text-gray-800 mr-2">Value:</span> ${Number(proposal.value || 0).toLocaleString()}</div>
          <div className="flex items-center"><span className="font-semibold text-gray-800 mr-2">Proposed By:</span> {proposal.proposedBy || 'N/A'}</div>
          <div className="flex items-center"><span className="font-semibold text-gray-800 mr-2">Published:</span> {new Date(proposal.publishedAt || '').toLocaleDateString() || 'N/A'}</div>
        </div>
      </div>

      {/* Description and Ratings Panel */}
      <DescriptionPanel
        description={plainDescription}
        onRatingSubmit={onRatingSubmit}
      />
    </div>
  );
};


// -----------------------------------------------------------
// MAIN COMPONENT: DocumentPreviewModal.tsx
// -----------------------------------------------------------
interface DocumentPreviewModalProps {
  proposal: {
    id: number;
    opportunityNumber: string;
    proposalName: string;
    clientName: string;
    pstatus: string;
    value: string | number;
    description?: any[] | null;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
    proposedBy: string | null;
    chooseEmployee: number | null;
    documentUrl?: string;
  };
  onClose: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ proposal, onClose }) => {
  // Ensure proposal is not undefined or null early
  if (!proposal) {
    console.error("DocumentPreviewModal received undefined or null proposal prop.");
    return (
      <div className="fixed inset-0 bg-custom-overlay backdrop-blur-sm flex justify-center items-center pt-10 pb-10 z-50 overflow-y-auto">
        <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 my-auto flex flex-col items-center justify-center text-center">
          <XMarkIcon className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Document</h3>
          <p className="text-gray-600 mb-6">No document data was provided. Please try again later or contact support.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const modalRef = useRef<HTMLDivElement>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(true);

  // State for the Toast notification
  const [isToastOpen, setIsToastOpen] = useState(false); // Renamed from isAlertDialogOpen
  const [toastTitle, setToastTitle] = useState('');     // Renamed from alertDialogTitle
  const [toastMessage, setToastMessage] = useState('');   // Renamed from alertDialogMessage
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('info'); // Renamed from alertDialogType


  // Mock data for average rating, views, and downloads
  const mockAverageRating = 4.5;
  const mockTotalRatings = 12;

  // Determine the document URL for preview.
  const documentPath = useMemo(() => {
    // Add an explicit check for proposal being defined within useMemo
    if (!proposal) {
      console.warn("DocumentPreviewModal: proposal is null/undefined during useMemo evaluation.");
      return ''; // Return an empty path or handle as per your app's logic
    }

    const base = typeof window !== 'undefined' ? window.location.origin : '';
    let path = proposal.documentUrl; // Access proposal.documentUrl here now that proposal is guaranteed not null/undefined

    if (!path) {
      if (proposal.proposalName?.includes("Excel")) {
        path = '/documents/test_excel.xlsx';
      } else if (proposal.proposalName?.includes("Word")) {
        path = '/documents/test_word.docx';
      } else if (proposal.proposalName?.includes("PPT")) {
        path = '/documents/test_ppt.pptx';
      } else if (proposal.proposalName?.includes("HTML")) {
        path = '/documents/test_html.html';
      } else {
        path = '/documents/test_pdf.pdf';
      }
    }
    const finalPath = path.startsWith('http') ? path : `${base}${path}`;
    console.log("Calculated documentPath for iframe preview:", finalPath);
    return finalPath;
  }, [proposal]); // Dependency remains just `proposal`

  // Determine supported preview types for direct iframe
  const fileExtension = documentPath.split('.').pop()?.toLowerCase();
  const isDirectIframeSupported = ['pdf', 'htm', 'html'].includes(fileExtension || '');


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  const handleRatingSubmit = useCallback((rating: number, comment: string) => { // Memoized
    console.log(`User rated ${rating} stars with comment: "${comment}"`);
    setToastTitle('Rating Submitted!');
    setToastMessage('Thank you for your feedback. Your rating has been recorded.');
    setToastType('success');
    setIsToastOpen(true);
  }, []);

  const handleShare = useCallback(() => { // Memoized
    const shareLink = documentPath;

    try {
      const tempInput = document.createElement('textarea');
      tempInput.value = shareLink;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);

      setToastTitle('Link Copied!');
      setToastMessage('The document link has been copied to your clipboard.');
      setToastType('success');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setToastTitle('Copy Failed');
      setToastMessage('Could not automatically copy the link.');
      setToastType('error');
    }
    setIsToastOpen(true);
  }, [documentPath]);

  const handleDownload = useCallback(() => { // Memoized
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = documentPath;
    link.setAttribute('download', proposal.proposalName + '.' + fileExtension); // Suggest a filename
    document.body.appendChild(link);
    link.click(); // Programmatically click the link to trigger download
    document.body.removeChild(link); // Clean up the element

    setToastTitle('Download Started!');
    setToastMessage('Your document download should begin shortly.');
    setToastType('info');
    setIsToastOpen(true);
  }, [documentPath, proposal.proposalName, fileExtension]); // Dependencies


  const authorName = proposal.proposedBy || 'N/A';
  const viewsCount = 30;
  const downloadsCount = 25;

  return (
    <>
      <div
        className="fixed inset-0 bg-custom-overlay backdrop-blur-sm flex justify-center items-center pt-10 pb-10 z-50 overflow-y-auto"
        onClick={handleOverlayClick}
      >
        <div
          ref={modalRef}
          className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 my-auto overflow-hidden flex flex-col h-[90vh] md:max-h-[95vh]"
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-bold text-text-dark-gray flex-1 truncate pr-4">
              {proposal.proposalName || 'N/A'} ({proposal.opportunityNumber || 'N/A'})
            </h2>

            {/* Consolidated Toggle Buttons - Placed prominently in the header */}
            <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex space-x-1 mr-4">
                <button
                    onClick={() => setShowDocumentViewer(false)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-2
                                ${!showDocumentViewer ? 'bg-strapi-green-light text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}
                                focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-1`}
                >
                    <Bars3BottomLeftIcon className="h-5 w-5" />
                    <span>Description</span>
                </button>
                <button
                    onClick={() => setShowDocumentViewer(true)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-2
                                ${showDocumentViewer ? 'bg-strapi-green-light text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}
                                focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-1`}
                  >
                      <SolidDocumentTextIcon className="h-5 w-5" />
                      <span>Preview</span>
                  </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-label="Close preview"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Main Content Area - This flex-1 div will now host either DescriptionView or DocumentViewer */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {showDocumentViewer ? (
              <DocumentViewer
                documentPath={documentPath}
                proposalName={proposal.proposalName || 'N/A'}
                isDirectIframeSupported={isDirectIframeSupported}
              />
            ) : (
              <DescriptionView
                proposal={proposal}
                onRatingSubmit={handleRatingSubmit}
                getPlainTextFromRichText={getPlainTextFromRichText}
              />
            )}
          </div>

          {/* Modal Footer - Beautified */}
          <div className="flex flex-col md:flex-row justify-between items-center p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 text-text-medium-gray text-sm">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-2 mb-3 md:mb-0">
              <span className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-1 text-gray-500" /> {viewsCount} Viewed
              </span>
              <span className="flex items-center">
                <SolidDocumentTextIcon className="h-4 w-4 mr-1 text-gray-500" /> {downloadsCount} Downloads
              </span>
              <span className="flex items-center">
                  <StarIcon className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                  {mockAverageRating} / 5 ({mockTotalRatings} ratings)
              </span>
              {/* Added a subtle separator for better visual grouping */}
              <span className="hidden md:block text-gray-300">|</span> 
              <span>Owner: {authorName}</span>
              <span className="hidden md:block text-gray-300">|</span>
              <span>Modified: {new Date(proposal.updatedAt || '').toLocaleDateString() || 'N/A'}</span>
            </div>
            <div className="flex space-x-3 mt-3 md:mt-0">
              <button
                onClick={handleShare}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm"
              >
                <ShareIcon className="h-5 w-5 mr-2" /> Share
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 bg-strapi-green-light text-white rounded-lg hover:bg-strapi-green-dark transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2 shadow-md"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" /> Download
              </button>
            </div>
          </div>
        </div>
      </div>

      <Toast
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
        title={toastTitle}
        message={toastMessage}
        type={toastType}
      />
    </>
  );
};

export default DocumentPreviewModal;
