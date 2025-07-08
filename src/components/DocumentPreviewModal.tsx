// src/components/DocumentPreviewModal.tsx - ENHANCED WITH ATTACHMENTS SUPPORT
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { XMarkIcon, ShareIcon, ArrowDownTrayIcon, StarIcon, DocumentTextIcon, FolderIcon } from '@heroicons/react/24/outline';
import { EyeIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon as SolidDocumentTextIcon } from '@heroicons/react/20/solid';

import Toast from './Toast';
import DocumentViewer from './DocumentViewer';
import DescriptionPanel from './DescriptionPanel';
import DescriptionView from './DescriptionView';
import { StrapiProposal } from '@/types/strapi';

// Enhanced Attachment interface
interface DocumentAttachment {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: any;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
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

// Helper to get file type icon
const getFileTypeIcon = (mimeType: string, extension: string) => {
  const fileType = mimeType.toLowerCase();
  const ext = extension.toLowerCase();
  
  if (fileType.includes('pdf') || ext === '.pdf') return { icon: '📄', color: 'text-red-600', bg: 'bg-red-50' };
  if (fileType.includes('word') || ext.includes('doc')) return { icon: '📝', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (fileType.includes('excel') || fileType.includes('spreadsheet') || ext.includes('xls')) return { icon: '📊', color: 'text-green-600', bg: 'bg-green-50' };
  if (fileType.includes('powerpoint') || fileType.includes('presentation') || ext.includes('ppt')) return { icon: '📈', color: 'text-orange-600', bg: 'bg-orange-50' };
  if (fileType.includes('image')) return { icon: '🖼️', color: 'text-purple-600', bg: 'bg-purple-50' };
  if (fileType.includes('video')) return { icon: '🎥', color: 'text-indigo-600', bg: 'bg-indigo-50' };
  if (fileType.includes('audio')) return { icon: '🎵', color: 'text-pink-600', bg: 'bg-pink-50' };
  return { icon: '📎', color: 'text-gray-600', bg: 'bg-gray-50' };
};

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to get document URL - Updated for uploads folder
const getDocumentUrl = (attachment: DocumentAttachment): string => {
  // For local development, construct URL based on upload folder
  if (attachment.url.startsWith('/uploads/')) {
    return attachment.url; // Direct URL from Strapi
  }
  
  // Fallback: construct URL for local uploads
  return `/uploads/${attachment.hash}${attachment.ext}`;
};

interface DocumentPreviewModalProps {
  proposal: StrapiProposal;
  onClose: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ proposal, onClose }) => {
  console.log("DocumentPreviewModal: Proposal received:", proposal);
  console.log("DocumentPreviewModal: Attachments:", proposal.Attachments);

  const modalRef = useRef<HTMLDivElement>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(true);
  const [currentAttachmentIndex, setCurrentAttachmentIndex] = useState(0);

  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('info');

  // Effect to control body scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!proposal) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center pt-10 pb-10 z-50 overflow-y-auto">
        <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 my-auto flex flex-col items-center justify-center text-center">
          <XMarkIcon className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Document</h3>
          <p className="text-gray-600 mb-6">No document data was provided. Please try again later or contact support.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Parse attachments from the proposal
  const attachments: DocumentAttachment[] = useMemo(() => {
    if (!proposal.Attachments || !Array.isArray(proposal.Attachments)) {
      return [];
    }
    
    return proposal.Attachments.map((attachment: any) => {
      // Handle both direct attachment objects and nested data structures
      const data = attachment.attributes || attachment;
      return {
        id: attachment.id || data.id || Math.random(),
        name: data.name || 'Unknown Document',
        alternativeText: data.alternativeText,
        caption: data.caption,
        width: data.width,
        height: data.height,
        formats: data.formats,
        hash: data.hash || 'unknown',
        ext: data.ext || '.pdf',
        mime: data.mime || 'application/pdf',
        size: data.size || 0,
        url: data.url || `/uploads/${data.hash || 'unknown'}${data.ext || '.pdf'}`,
        previewUrl: data.previewUrl,
        provider: data.provider || 'local',
        provider_metadata: data.provider_metadata,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      } as DocumentAttachment;
    });
  }, [proposal.Attachments]);

  const mockAverageRating = 4.5;
  const mockTotalRatings = 12;
  const viewsCount = 30;
  const downloadsCount = 25;

  const currentAttachment = attachments[currentAttachmentIndex];
  const hasMultipleAttachments = attachments.length > 1;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && hasMultipleAttachments) {
        setCurrentAttachmentIndex(prev => (prev - 1 + attachments.length) % attachments.length);
      } else if (event.key === 'ArrowRight' && hasMultipleAttachments) {
        setCurrentAttachmentIndex(prev => (prev + 1) % attachments.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, hasMultipleAttachments, attachments.length]);

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
    const shareLink = currentAttachment ? getDocumentUrl(currentAttachment) : window.location.href;

    try {
      navigator.clipboard.writeText(shareLink).then(() => {
        setToastTitle('Link Copied!');
        setToastMessage('The document link has been copied to your clipboard.');
        setToastType('success');
        setIsToastOpen(true);
      }).catch(() => {
        setToastTitle('Copy Failed');
        setToastMessage('Could not automatically copy the link.');
        setToastType('error');
        setIsToastOpen(true);
      });
    } catch (err) {
      setToastTitle('Copy Failed');
      setToastMessage('Could not automatically copy the link.');
      setToastType('error');
      setIsToastOpen(true);
    }
  }, [currentAttachment]);

  const handleDownload = useCallback(() => {
    if (!currentAttachment) return;
    
    const link = document.createElement('a');
    link.href = getDocumentUrl(currentAttachment);
    link.setAttribute('download', currentAttachment.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastTitle('Download Started!');
    setToastMessage('Your document download should begin shortly.');
    setToastType('info');
    setIsToastOpen(true);
  }, [currentAttachment]);

  const handleDownloadAll = useCallback(() => {
    attachments.forEach((attachment, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = getDocumentUrl(attachment);
        link.setAttribute('download', attachment.name);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500); // Stagger downloads
    });

    setToastTitle('Downloads Started!');
    setToastMessage(`Downloading ${attachments.length} documents...`);
    setToastType('info');
    setIsToastOpen(true);
  }, [attachments]);

  const navigateAttachment = useCallback((direction: 'prev' | 'next') => {
    if (!hasMultipleAttachments) return;
    
    if (direction === 'prev') {
      setCurrentAttachmentIndex(prev => (prev - 1 + attachments.length) % attachments.length);
    } else {
      setCurrentAttachmentIndex(prev => (prev + 1) % attachments.length);
    }
  }, [hasMultipleAttachments, attachments.length]);

  const authorName = proposal.Author || 'N/A';
  const publishedDate = new Date(proposal.publishedAt || '').toLocaleDateString() || 'N/A';
  const updatedDate = new Date(proposal.updatedAt || '').toLocaleDateString() || 'N/A';

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center pt-10 pb-10 z-50 overflow-y-auto"
        onClick={handleOverlayClick}
      >
        <div
          ref={modalRef}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl mx-4 my-auto overflow-hidden flex flex-col h-[90vh] md:max-h-[95vh]"
        >
          {/* Enhanced Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-erm-primary/5 to-transparent">
            {/* Document Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {proposal.unique_id || 'N/A'}
                </h2>
                {hasMultipleAttachments && (
                  <div className="flex items-center space-x-2 bg-erm-primary/10 px-3 py-1 rounded-full">
                    <FolderIcon className="h-4 w-4 text-erm-primary" />
                    <span className="text-sm font-medium text-erm-dark">
                      {attachments.length} files
                    </span>
                  </div>
                )}
              </div>
              
              {/* Current document info */}
              {currentAttachment && (
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg ${getFileTypeIcon(currentAttachment.mime, currentAttachment.ext).icon}`}>
                      {getFileTypeIcon(currentAttachment.mime, currentAttachment.ext).icon}
                    </span>
                    <span className="font-medium">{currentAttachment.name}</span>
                  </div>
                  <span>•</span>
                  <span>{formatFileSize(currentAttachment.size)}</span>
                  {hasMultipleAttachments && (
                    <>
                      <span>•</span>
                      <span>{currentAttachmentIndex + 1} of {attachments.length}</span>
                    </>
                  )}
                </div>
              )}
              
              {/* No attachments message */}
              {attachments.length === 0 && (
                <p className="text-sm text-gray-500">No attachments available for this document</p>
              )}
            </div>

            {/* Navigation for multiple documents */}
            {hasMultipleAttachments && (
              <div className="flex items-center space-x-2 mx-6">
                <button
                  onClick={() => navigateAttachment('prev')}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                  title="Previous document"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <span className="text-sm text-gray-500 min-w-[4rem] text-center">
                  {currentAttachmentIndex + 1} / {attachments.length}
                </span>
                <button
                  onClick={() => navigateAttachment('next')}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                  title="Next document"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* View Toggle */}
            <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex space-x-1 mr-4">
              <button
                onClick={() => setShowDocumentViewer(false)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-2
                            ${!showDocumentViewer ? 'bg-erm-primary text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}
                            focus:outline-none focus:ring-2 focus:ring-erm-primary focus:ring-offset-1`}
              >
                <Bars3BottomLeftIcon className="h-5 w-5" />
                <span>Details</span>
              </button>
              <button
                onClick={() => setShowDocumentViewer(true)}
                disabled={attachments.length === 0}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-2
                            ${showDocumentViewer ? 'bg-erm-primary text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}
                            disabled:opacity-50 disabled:cursor-not-allowed
                            focus:outline-none focus:ring-2 focus:ring-erm-primary focus:ring-offset-1`}
              >
                <SolidDocumentTextIcon className="h-5 w-5" />
                <span>Preview</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close preview"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {showDocumentViewer && currentAttachment ? (
              /* Document Viewer */
              <div className="flex-1 flex flex-col">
                {/* Document List for Multiple Files */}
                {hasMultipleAttachments && (
                  <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Documents in this package:</h4>
                      <button
                        onClick={handleDownloadAll}
                        className="text-xs text-erm-primary hover:text-erm-dark font-medium"
                      >
                        Download All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((attachment, index) => {
                        const fileInfo = getFileTypeIcon(attachment.mime, attachment.ext);
                        return (
                          <button
                            key={attachment.id}
                            onClick={() => setCurrentAttachmentIndex(index)}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                              index === currentAttachmentIndex
                                ? 'bg-erm-primary text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span>{fileInfo.icon}</span>
                            <span className="truncate max-w-[120px]" title={attachment.name}>
                              {attachment.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Document Viewer Component */}
                <div className="flex-1">
                  <DocumentViewer
                    documentPath={getDocumentUrl(currentAttachment)}
                    proposalName={currentAttachment.name}
                    attachment={currentAttachment}
                  />
                </div>
              </div>
            ) : showDocumentViewer && attachments.length === 0 ? (
              /* No Attachments View */
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto p-8">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <DocumentTextIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Documents Available</h3>
                  <p className="text-gray-500 mb-6">
                    This proposal doesn't have any attached documents for preview.
                  </p>
                  <button
                    onClick={() => setShowDocumentViewer(false)}
                    className="px-4 py-2 bg-erm-primary text-white rounded-lg hover:bg-erm-dark transition-colors"
                  >
                    View Details Instead
                  </button>
                </div>
              </div>
            ) : (
              /* Description View */
              <DescriptionView
                proposal={proposal}
                onRatingSubmit={handleRatingSubmit}
                getPlainTextFromRichText={getPlainTextFromRichText}
              />
            )}
          </div>

          {/* Enhanced Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0 text-gray-600 text-sm">
            {/* Stats and Info */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-6 gap-y-2 mb-4 md:mb-0">
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

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleShare}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm"
              >
                <ShareIcon className="h-5 w-5 mr-2" /> Share
              </button>
              
              {currentAttachment && (
                <button
                  onClick={handleDownload}
                  className="flex items-center px-4 py-2 bg-erm-primary text-white rounded-lg hover:bg-erm-dark transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-erm-primary focus:ring-offset-2 shadow-md"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" /> Download
                </button>
              )}
              
              {hasMultipleAttachments && (
                <button
                  onClick={handleDownloadAll}
                  className="flex items-center px-4 py-2 bg-erm-dark text-white rounded-lg hover:bg-erm-primary transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-erm-dark focus:ring-offset-2 shadow-md"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" /> Download All
                </button>
              )}
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