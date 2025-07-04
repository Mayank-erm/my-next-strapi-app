// src/components/DescriptionView.tsx
import React from 'react';
import DescriptionPanel from './DescriptionPanel';

interface DescriptionViewProps {
  proposal: {
    id: number;
    documentId: string;
    unique_id: string;
    SF_Number: string; // Keep in interface, but remove from direct display
    Client_Name: string;
    Client_Type: string;
    Client_Contact: string;
    Client_Contact_Title: string;
    Client_Journey: string;
    Document_Type: string;
    Document_Sub_Type: string;
    Document_Value_Range: string;
    Document_Outcome: string;
    Last_Stage_Change_Date: string;
    Industry: string;
    Sub_Industry: string;
    Service: string;
    Sub_Service: string;
    Business_Unit: string;
    Region: string;
    Country: string;
    State: string;
    City: string;
    Author: string;
    PIC: string;
    PM: string;
    Keywords: string;
    Commercial_Program: string;
    Project_Team: null;
    SMEs: null;
    Competitors: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    Description: any[];
    documentUrl?: string;
    proposalName?: string;
  };
  onRatingSubmit: (rating: number, comment: string) => void;
  getPlainTextFromRichText: (richTextBlocks: any[] | null | undefined) => string;
}

const DescriptionView: React.FC<DescriptionViewProps> = ({ proposal, onRatingSubmit, getPlainTextFromRichText }) => {
  console.log("DescriptionView: Proposal object received for display:", proposal);
  console.log("DescriptionView: proposal.Description directly (before || []):", proposal.Description);

  const plainDescription = getPlainTextFromRichText(proposal.Description || []);

  const formatValue = (value: string | number | null | undefined | any[]) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return 'N/A';
      const stringifiedElements = value.map(item => {
        if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
          return String(item);
        }
        return null;
      }).filter(Boolean).join(', ');
      return stringifiedElements || 'N/A';
    }
    return String(value);
  };

  const formatDate = (isoString: string | null | undefined) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    // Outer flex container that fills parent and manages vertical space for its children (title and scrollable area)
    <div className="flex flex-col flex-1 min-h-0 px-6 pt-6 pb-6"> {/* Added pb-6 for bottom spacing */}
    
      {/* NEW: This div is the unified scrollable area for both metadata and description panel */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2"> {/* Added flex-1, overflow-y-auto, custom-scrollbar, pr-2 */}
        
        {/* Metadata Section - no longer has its own overflow or fixed height */}
        <div className="bg-white rounded-lg shadow-md mb-6 border border-gray-200 p-6 flex-shrink-0"> {/* flex-shrink-0 to take only needed space */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Document Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-3 gap-x-6 text-sm text-gray-700">
            {/* Removed Unique ID and SF Number as they are in the modal header */}
            <div><span className="font-semibold text-gray-800">Client:</span> {formatValue(proposal.Client_Name)}</div>
            <div><span className="font-semibold text-gray-800">Client Type:</span> {formatValue(proposal.Client_Type)}</div>
            <div><span className="font-semibold text-gray-800">Client Contact:</span> {formatValue(proposal.Client_Contact)}</div>
            <div><span className="font-semibold text-gray-800">Contact Title:</span> {formatValue(proposal.Client_Contact_Title)}</div>
            <div><span className="font-semibold text-gray-800">Client Journey:</span> {formatValue(proposal.Client_Journey)}</div>
            
            <div><span className="font-semibold text-gray-800">Document Type:</span> {formatValue(proposal.Document_Type)}</div>
            <div><span className="font-semibold text-gray-800">Document Sub Type:</span> {formatValue(proposal.Document_Sub_Type)}</div>
            <div><span className="font-semibold text-gray-800">Value Range:</span> {formatValue(proposal.Document_Value_Range)}</div>
            <div><span className="font-semibold text-gray-800">Outcome:</span> {formatValue(proposal.Document_Outcome)}</div>
            <div><span className="font-semibold text-gray-800">Last Stage Change:</span> {formatDate(proposal.Last_Stage_Change_Date)}</div>
            
            <div><span className="font-semibold text-gray-800">Industry:</span> {formatValue(proposal.Industry)}</div>
            <div><span className="font-semibold text-gray-800">Sub Industry:</span> {formatValue(proposal.Sub_Industry)}</div>
            <div><span className="font-semibold text-gray-800">Service:</span> {formatValue(proposal.Service)}</div>
            <div><span className="font-semibold text-gray-800">Sub Service:</span> {formatValue(proposal.Sub_Service)}</div>
            <div><span className="font-semibold text-gray-800">Business Unit:</span> {formatValue(proposal.Business_Unit)}</div>
            
            <div><span className="font-semibold text-gray-800">Region:</span> {formatValue(proposal.Region)}</div>
            <div><span className="font-semibold text-gray-800">Country:</span> {formatValue(proposal.Country)}</div>
            <div><span className="font-semibold text-gray-800">State:</span> {formatValue(proposal.State)}</div>
            <div><span className="font-semibold text-gray-800">City:</span> {formatValue(proposal.City)}</div>
            
            <div><span className="font-semibold text-gray-800">Author:</span> {formatValue(proposal.Author)}</div>
            <div><span className="font-semibold text-gray-800">PIC:</span> {formatValue(proposal.PIC)}</div>
            <div><span className="font-semibold text-gray-800">PM:</span> {formatValue(proposal.PM)}</div>
            <div><span className="font-semibold text-gray-800">Keywords:</span> {formatValue(proposal.Keywords)}</div>
            <div><span className="font-semibold text-gray-800">Commercial Program:</span> {formatValue(proposal.Commercial_Program)}</div>
            
            <div><span className="font-semibold text-gray-800">Project Team:</span> {formatValue(proposal.Project_Team)}</div>
            <div><span className="font-semibold text-gray-800">SMEs:</span> {formatValue(proposal.SMEs)}</div>
            <div><span className="font-semibold text-gray-800">Competitors:</span> {formatValue(proposal.Competitors)}</div>
            
            <div><span className="font-semibold text-gray-800">Created At:</span> {formatDate(proposal.createdAt)}</div>
            <div><span className="font-semibold text-gray-800">Updated At:</span> {formatDate(proposal.updatedAt)}</div>
            <div><span className="font-semibold text-gray-800">Published At:</span> {formatDate(proposal.publishedAt)}</div>
          </div>
        </div>

        {/* Description and Ratings Panel - this now flows within the common scroll area */}
        <DescriptionPanel
          description={plainDescription}
          onRatingSubmit={onRatingSubmit}
        />
      </div>
    </div>
  );
};

export default DescriptionView;