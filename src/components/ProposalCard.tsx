// src/components/ProposalCard.tsx (UPDATED: Triggers Preview Modal)
import React, { useState } from 'react';
import { BookmarkIcon, EllipsisHorizontalIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';
import DocumentPreviewModal from './DocumentPreviewModal'; // Import the new modal component

interface ProposalCardProps {
  proposal: {
    id: number;
    opportunityNumber: string;
    proposalName: string;
    clientName: string;
    pstatus: string;
    value: string | number;
    description?: any[] | null;
    publishedAt: string;
    proposedBy: string | null;
    chooseEmployee: number | null;
  };
}

// Helper to format date
const formatDate = (isoString: string) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB');
};

// Helper to extract plain text from Strapi Rich Text (Slate.js blocks)
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

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false); // State for preview modal

  const toggleDropdown = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleShare = () => {
    alert(`Sharing ${proposal.proposalName}`);
    setIsDropdownOpen(false);
  };

  const handleDownload = () => {
    alert(`Downloading ${proposal.proposalName}`);
    setIsDropdownOpen(false);
  };

  const handlePreviewClick = () => {
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
  };

  const plainDescription = getPlainTextFromRichText(proposal.description);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col p-5 hover:shadow-lg transition-all duration-300 ease-in-out relative group">
      {/* Header with Proposal type, Date, and Bookmark/More icons */}
      <div className="flex justify-between items-center text-sm mb-3">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors">Proposal</span>
          <span className="text-gray-500 text-xs">{formatDate(proposal.publishedAt)}</span>
        </div>
        <div className="flex items-center space-x-2 relative">
          <BookmarkIcon className="h-5 w-5 text-gray-400 cursor-pointer hover:text-strapi-green-dark transition-colors duration-200" />
          <EllipsisHorizontalIcon
            className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2"
            onClick={toggleDropdown}
          />
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-xl py-1 z-20 top-full transform translate-y-2">
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-strapi-green-light"
                onClick={handleShare}
              >
                <ShareIcon className="h-4 w-4 mr-2" /> Share
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-strapi-green-light"
                onClick={handleDownload}
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" /> Download
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-text-dark-gray mb-1.5 truncate" title={proposal.proposalName}>
        {proposal.proposalName}
      </h3>

      {/* Client Name and Department (simulated) */}
      <p className="text-sm text-gray-600 mb-2">
        <span className="font-semibold">{proposal.clientName}</span> Inc.
        <span className="block text-xs text-gray-400">({proposal.pstatus})</span>
      </p>

      {/* Description preview */}
      <p className="text-sm text-gray-700 line-clamp-3 mb-4 flex-grow">
        {plainDescription || 'No description available.'}
      </p>

      {/* Footer with Preview button */}
      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end items-center">
        <button
          onClick={handlePreviewClick} // Click to open preview modal
          className="bg-strapi-green-light hover:bg-strapi-green-dark text-white font-semibold py-2.5 px-6 rounded-lg
                     transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 shadow-md text-sm
                     focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2"
        >
          Preview
        </button>
      </div>

      {/* Document Preview Modal */}
      {isPreviewModalOpen && (
        <DocumentPreviewModal
          proposal={proposal} // Pass the entire proposal object
          onClose={closePreviewModal}
        />
      )}
    </div>
  );
};

export default ProposalCard;