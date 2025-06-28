// src/components/DocumentPreviewModal.tsx (REDESIGNED & DEBUGGED: Single toggle, improved layout)
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { XMarkIcon, ShareIcon, ArrowDownTrayIcon, StarIcon } from '@heroicons/react/24/outline';
import { EyeIcon, DocumentTextIcon } from '@heroicons/react/20/solid';
import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline';

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
    documentUrl?: string; // Assume this field exists in your Strapi for the actual document file
  };
  onClose: () => void;
}

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

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ proposal, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null); // Ref for the iframe
  const criticalInfoRef = useRef<HTMLDivElement>(null); // Ref for critical info section
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [documentContentTop, setDocumentContentTop] = useState('0px'); // Dynamic top for content area


  // Determine the document URL for preview.
  const documentPath = useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    let path = proposal.documentUrl;

    if (!path) {
      // Fallback to local test files for demonstration
      if (proposal.proposalName.includes("Excel")) {
        path = '/documents/test_excel.xlsx';
      } else if (proposal.proposalName.includes("Word")) {
        path = '/documents/test_word.docx';
      } else if (proposal.proposalName.includes("PPT")) {
        path = '/documents/test_ppt.pptx';
      } else if (proposal.proposalName.includes("HTML")) { // For testing HTML preview
        path = '/documents/test_html.html';
      } else {
        path = '/documents/test_pdf.pdf';
      }
    }
    const finalPath = path.startsWith('http') ? path : `${base}${path}`;
    console.log("Calculated documentPath for iframe preview:", finalPath); // DEBUG LOG
    return finalPath;
  }, [proposal.documentUrl, proposal.proposalName]);

  // Determine supported preview types for direct iframe
  const fileExtension = documentPath.split('.').pop()?.toLowerCase();
  const isDirectIframeSupported = ['pdf', 'htm', 'html'].includes(fileExtension || '');


  // Calculate dynamic top offset for the full-screen iframe
  useEffect(() => {
    if (criticalInfoRef.current) {
      // The top of the content area is the height of the critical info box + its bottom margin
      // Let's assume mb-6 is 1.5rem = 24px
      const topOffset = criticalInfoRef.current.offsetHeight + 24; // 24px for mb-6
      setDocumentContentTop(`${topOffset}px`);
    }
  }, [showDocumentViewer, proposal]); // Recalculate if view changes or proposal changes


  // Handle keyboard events for closing the modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle clicks outside the modal content
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  const plainDescription = getPlainTextFromRichText(proposal.description);

  // Placeholder for author, views, downloads
  const authorName = proposal.proposedBy || 'N/A';
  const viewsCount = 30;
  const downloadsCount = 25;

  // Handle rating submission
  const handleRatingSubmit = () => {
    alert(`Rating: ${rating} stars, Comment: ${comment}`);
    setRating(0);
    setComment('');
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex justify-center items-start pt-10 pb-10 z-50 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 my-auto overflow-hidden flex flex-col h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-text-dark-gray flex-1 truncate pr-4">
            {proposal.proposalName} ({proposal.opportunityNumber})
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label="Close preview"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body: Main Content Area (now full width) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area - Conditionally renders sections based on toggle */}
          <div className="flex-1 p-6 flex flex-col overflow-hidden relative">

            {/* Critical Information Section - Always visible */}
            <div ref={criticalInfoRef} className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100 flex-shrink-0 relative">
              <p className="text-lg font-semibold text-blue-800 mb-2">{proposal.proposalName}</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                <span><span className="font-medium">Client:</span> {proposal.clientName}</span>
                <span><span className="font-medium">Opportunity #:</span> {proposal.opportunityNumber}</span>
                <span><span className="font-medium">Status:</span> <span className="font-semibold capitalize">{proposal.pstatus}</span></span>
                <span><span className="font-medium">Value:</span> ${Number(proposal.value).toLocaleString()}</span>
                <span><span className="font-medium">Proposed By:</span> {proposal.proposedBy || 'N/A'}</span>
                <span><span className="font-medium">Published:</span> {new Date(proposal.publishedAt).toLocaleDateString()}</span>
              </div>
              
              {/* Consolidated Toggle Buttons - positioned within critical info box */}
              <div className="absolute top-4 right-4 bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex space-x-1">
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
                        <DocumentTextIcon className="h-5 w-5" />
                        <span>Document</span>
                    </button>
              </div>
            </div>

            {/* Content Display Area - This is where the magic happens */}
            {!showDocumentViewer ? (
              // Description and Ratings section - takes remaining space and scrolls
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-4">
                <h3 className="text-xl font-bold text-text-dark-gray mb-4">Description</h3>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-8">
                  {plainDescription || 'No detailed description available.'}
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
                    onClick={handleRatingSubmit}
                    disabled={rating === 0}
                    className="px-6 py-2 bg-strapi-green-light text-white font-semibold rounded-lg disabled:opacity-50
                               hover:bg-strapi-green-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2"
                  >
                    Submit Rating
                  </button>
                </div>
              </div>
            ) : (
              // Document Viewer takes full height when active, or shows message if not supported
              <div className="absolute inset-x-0 bottom-0 bg-gray-100 flex items-center justify-center text-gray-500 text-center border border-dashed border-gray-300 rounded-lg p-4 overflow-hidden"
                   style={{ top: documentContentTop }} // Use dynamic top offset
              >
                {console.log("Attempting to render iframe. Document URI:", documentPath)} {/* DEBUG LOG */}
                {isDirectIframeSupported && documentPath ? (
                    <div className="w-full h-full"> {/* Inner div to ensure iframe fills */}
                      <iframe
                        ref={iframeRef} // Assign ref to iframe
                        src={documentPath}
                        title={proposal.proposalName}
                        className="w-full h-full border-0 rounded-lg"
                        allowFullScreen // Allow fullscreen for PDFs if browser supports it
                      >
                        <p>Your browser does not support iframes, or the document could not be loaded.</p>
                        <p>Please <a href={documentPath} target="_blank" rel="noopener noreferrer" className="text-strapi-green-light hover:underline">download the document</a> to view it.</p>
                      </iframe>
                    </div>
                  ) : documentPath ? (
                    // Message for unsupported file types
                    <div className="flex flex-col items-center p-6">
                        <DocumentTextIcon className="h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-700 mb-2">File preview not available</p>
                        <p className="text-sm text-gray-600 mb-4">This file type is not supported for direct browser preview.</p>
                        <a href={documentPath} target="_blank" rel="noopener noreferrer"
                           className="flex items-center px-4 py-2 bg-strapi-green-light text-white rounded-lg hover:bg-strapi-green-dark transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2">
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" /> Download Document
                        </a>
                    </div>
                  ) : (
                    <p>No document URL available for preview.<br/>Please download the document to view its full content.</p>
                  )}
              </div>
            )}
            </div>
          </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center space-x-4 text-sm text-text-medium-gray">
            <span className="flex items-center">
              <EyeIcon className="h-4 w-4 mr-1 text-gray-500" /> {viewsCount} Viewed
            </span>
            <span className="flex items-center">
              <DocumentTextIcon className="h-4 w-4 mr-1 text-gray-500" /> {downloadsCount} Downloads
            </span>
            <span>Owner: {authorName}</span>
            <span>Modified Date: {new Date(proposal.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => alert('Sharing document...')}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <ShareIcon className="h-5 w-5 mr-2" /> Share
            </button>
            <button
              onClick={() => alert('Downloading document...')}
              className="flex items-center px-4 py-2 bg-strapi-green-light text-white rounded-lg hover:bg-strapi-green-dark transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
