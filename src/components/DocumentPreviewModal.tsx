// src/components/DocumentPreviewModal.tsx (Updated after component extraction)
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { XMarkIcon, ShareIcon, ArrowDownTrayIcon, StarIcon } from '@heroicons/react/24/outline';
import { EyeIcon } from '@heroicons/react/20/solid';
import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon as SolidDocumentTextIcon } from '@heroicons/react/20/solid';

// Import the extracted components
import Toast from './Toast';
import DocumentViewer from './DocumentViewer';
import DescriptionPanel from './DescriptionPanel';
import DescriptionView from './DescriptionView';


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
    documentUrl?: string; // Optional document URL from data source
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
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('info');

  // Mock data for average rating, views, and downloads (replace with actual data later)
  const mockAverageRating = 4.5;
  const mockTotalRatings = 12;
  const viewsCount = 30;
  const downloadsCount = 25;

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
      // Fallback to local test documents if no documentUrl provided by Strapi
      if (proposal.proposalName?.includes("Excel")) {
        path = '/documents/test_excel.xlsx';
      } else if (proposal.proposalName?.includes("Word")) {
        path = '/documents/test_word.docx';
      } else if (proposal.proposalName?.includes("PPT")) {
        path = '/documents/test_ppt.pptx';
      } else if (proposal.proposalName?.includes("HTML")) {
        path = '/documents/test_html.html'; // Assuming you have a test_html.html
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

  const handleRatingSubmit = useCallback((rating: number, comment: string) => {
    console.log(`User rated ${rating} stars with comment: "${comment}"`);
    setToastTitle('Rating Submitted!');
    setToastMessage('Thank you for your feedback. Your rating has been recorded.');
    setToastType('success');
    setIsToastOpen(true);
  }, []);

  const handleShare = useCallback(() => {
    const shareLink = documentPath;

    try {
      // Modern way to copy text to clipboard
      navigator.clipboard.writeText(shareLink).then(() => {
        setToastTitle('Link Copied!');
        setToastMessage('The document link has been copied to your clipboard.');
        setToastType('success');
        setIsToastOpen(true);
      }).catch(err => {
        console.error('Failed to copy text (navigator.clipboard): ', err);
        // Fallback for older browsers or if permission is denied
        const tempInput = document.createElement('textarea');
        tempInput.value = shareLink;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        setToastTitle('Link Copied (Fallback)!');
        setToastMessage('The document link has been copied to your clipboard.');
        setToastType('success');
        setIsToastOpen(true);
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setToastTitle('Copy Failed');
      setToastMessage('Could not automatically copy the link.');
      setToastType('error');
      setIsToastOpen(true);
    }
  }, [documentPath]);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = documentPath;
    link.setAttribute('download', proposal.proposalName + '.' + fileExtension);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastTitle('Download Started!');
    setToastMessage('Your document download should begin shortly.');
    setToastType('info');
    setIsToastOpen(true);
  }, [documentPath, proposal.proposalName, fileExtension]);


  const authorName = proposal.proposedBy || 'N/A';
  const publishedDate = new Date(proposal.publishedAt || '').toLocaleDateString() || 'N/A';
  const updatedDate = new Date(proposal.updatedAt || '').toLocaleDateString() || 'N/A';


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
              <span className="hidden md:block text-gray-300">|</span>
              <span>Owner: {authorName}</span>
              <span className="hidden md:block text-gray-300">|</span>
              <span>Modified: {updatedDate}</span>
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