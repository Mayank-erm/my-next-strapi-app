import React, { useState } from 'react';
import { BookmarkIcon, EllipsisHorizontalIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline'

interface ProposalCardProps {
  proposal: {
    id: number;
    opportunityNumber: string;
    proposalName: string;
    clientName: string;
    pstatus: string; // Using pstatus as per your Strapi field
    value: string | number; // Allow value to be string or number based on Strapi output
    description?: any[] | null; // Allow description to be optional, meaning it can be undefined or null
    publishedAt: string; // ISO date string
    // Add other fields like proposedBy, chooseEmployee that are now directly on the proposal object
    proposedBy: string | null;
    chooseEmployee: number | null;
  };
}

// Helper to format date
const formatDate = (isoString: string) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB'); // Example: 20/06/2019
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

  const toggleDropdown = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click from closing dropdown immediately
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

  const plainDescription = getPlainTextFromRichText(proposal.description);

  return (
    <div className="bg-proposal-bg rounded-lg shadow-card border border-proposal-border flex flex-col p-4 relative">
      {/* Header with Proposal type, Date, and Bookmark/More icons */}
      <div className="flex justify-between items-center text-sm mb-2">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-text-medium-gray border border-gray-200">Proposal</span>
          <span className="text-text-light-gray">{formatDate(proposal.publishedAt)}</span>
        </div>
        <div className="flex items-center space-x-2 relative"> {/* Added relative for dropdown positioning */}
          <BookmarkIcon className="h-5 w-5 text-text-light-gray cursor-pointer hover:text-strapi-green-light transition-colors" />
          <EllipsisHorizontalIcon
            className="h-5 w-5 text-text-light-gray cursor-pointer hover:text-text-dark-gray transition-colors"
            onClick={toggleDropdown}
          />
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 top-full"> {/* Position dropdown below ellipsis */}
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleShare}
              >
                <ShareIcon className="h-4 w-4 mr-2" /> Share
              </button>
              <button
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleDownload}
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" /> Download
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text-dark-gray mb-1 truncate" title={proposal.proposalName}>
        {proposal.proposalName}
      </h3>

      {/* Client Name and Department (simulated) */}
      <p className="text-sm text-text-medium-gray mb-2">
        <span className="font-medium">{proposal.clientName}</span> Inc.
        <span className="block text-xs text-text-light-gray">Retail</span>
      </p>

      {/* Description preview */}
      <p className="text-sm text-text-medium-gray line-clamp-2 mb-4">
        {plainDescription || 'No description available.'}
      </p>

      {/* Footer with Preview button */}
      <div className="mt-auto pt-3 border-t border-strapi-light-gray flex justify-between items-center">
        <button className="bg-strapi-green-light hover:bg-strapi-green-dark text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 shadow-md text-sm">
          Preview
        </button>
        {/* The download icon previously here is now part of the dropdown */}
      </div>
    </div>
  );
};

export default ProposalCard;