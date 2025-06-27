import React from 'react';
// --- Using Heroicons v1/legacy as requested ---
import { BookmarkIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'

// --- CHANGE 1: Updated ProposalCardProps interface to match the flat structure ---
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
  // Check if richTextBlocks is null, undefined, or an empty array
  if (!richTextBlocks || !ArrayOfBlocks(richTextBlocks) || richTextBlocks.length === 0) { // Check for ArrayOfBlocks
    return "";
  }

  return richTextBlocks.map(block => {
    // Ensure block and block.children exist before accessing
    if (block && block.type === 'paragraph' && Array.isArray(block.children)) {
      // Concatenate text from all children, ensuring child and child.text exist and are strings
      return block.children.map((child: any) => (child && typeof child.text === 'string') ? child.text : '').join('');
    }
    return ''; // Return empty string for non-paragraph blocks or invalid structures
  }).join('\n'); // Join paragraphs with newlines
};

// Type guard to ensure it's an array of objects for rich text
function ArrayOfBlocks(value: any): value is any[] {
  return Array.isArray(value) && value.every(item => typeof item === 'object' && item !== null);
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal }) => {
  // --- DEBUGGING LOGS: Check the 'proposal' object and its 'description' field directly ---
  console.log('[ProposalCard DEBUG] Received proposal object:', proposal);
  console.log('[ProposalCard DEBUG] Type of proposal.description:', typeof proposal?.description);
  console.log('[ProposalCard DEBUG] Value of proposal.description:', proposal?.description);
  // --- END DEBUGGING LOGS ---

  // Extracting plain text from the description for display
  // proposal.description is now correctly typed as potentially undefined/null directly
  const plainDescription = getPlainTextFromRichText(proposal.description); // No optional chaining needed here as it's directly on the prop.

  return (
    <div className="bg-proposal-bg rounded-lg shadow-card border border-proposal-border flex flex-col p-4 relative">
      {/* Header with Proposal type, Date, and Bookmark/More icons */}
      <div className="flex justify-between items-center text-sm mb-2">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-text-medium-gray border border-gray-200">Proposal</span>
          <span className="text-text-light-gray">{formatDate(proposal.publishedAt)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <BookmarkIcon className="h-5 w-5 text-text-light-gray cursor-pointer hover:text-strapi-green-light transition-colors" />
          <EllipsisHorizontalIcon className="h-5 w-5 text-text-light-gray cursor-pointer hover:text-text-dark-gray transition-colors" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text-dark-gray mb-1 truncate" title={proposal.proposalName}>
        {proposal.proposalName}
      </h3>

      {/* Client Name and Department (simulated) */}
      <p className="text-sm text-text-medium-gray mb-2">
        <span className="font-medium">{proposal.clientName}</span> Inc.
        {/* Assuming 'department' is part of the description or a separate field, here simulated */}
        {/* You might fetch Employee details separately to show department */}
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
        {/* You can add more details or actions here */}
      </div>
    </div>
  );
};

export default ProposalCard;
