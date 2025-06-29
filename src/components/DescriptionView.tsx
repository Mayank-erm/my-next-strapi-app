// src/components/DescriptionView.tsx
import React from 'react';
import DescriptionPanel from './DescriptionPanel'; // Assuming DescriptionPanel exists

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
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 mx-6 mt-6 border border-gray-200">
        <p className="text-xl font-bold text-gray-900 mb-4">{proposal.proposalName || 'N/A'}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-base text-gray-700">
          <div className="flex items-center"><span className="font-semibold text-gray-800 mr-2">Client:</span> {proposal.clientName || 'N/A'}</div>
          <div className="flex items-center"><span className="font-semibold text-gray-800 mr-2">Opportunity #:</span> {proposal.opportunityNumber || 'N/A'}</div>
          <div className="flex items-center"><span className="font-semibold text-gray-800 mr-2">Status:</span> <span className="font-semibold capitalize text-strapi-green-dark">{proposal.pstatus || 'N/A'}</span></div>
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

export default DescriptionView;