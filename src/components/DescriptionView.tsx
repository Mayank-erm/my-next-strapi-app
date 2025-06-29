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
      <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100 flex-shrink-0 mx-6 mt-6"> {/* Added mx, mt for consistent spacing */}
        <p className="text-lg font-semibold text-blue-800 mb-2">{proposal.proposalName}</p>
        <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
          <span><span className="font-medium">Client:</span> {proposal.clientName}</span>
          <span><span className="font-medium">Opportunity #:</span> {proposal.opportunityNumber}</span>
          <span><span className="font-medium">Status:</span> <span className="font-semibold capitalize">{proposal.pstatus}</span></span>
          <span><span className="font-medium">Value:</span> ${Number(proposal.value).toLocaleString()}</span>
          <span><span className="font-medium">Proposed By:</span> {proposal.proposedBy || 'N/A'}</span>
          <span><span className="font-medium">Published:</span> {new Date(proposal.publishedAt).toLocaleDateString()}</span>
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