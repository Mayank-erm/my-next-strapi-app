// src/components/ProposalCard.tsx
import React, { useState } from 'react';
import {
  BookmarkIcon,
  EllipsisHorizontalIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PencilIcon,
  ArchiveBoxIcon,
  TrashIcon,
  CalendarDaysIcon, // For date
  BuildingOfficeIcon, // For industry
  TagIcon // For document type/subtype pills
} from '@heroicons/react/24/outline';
import DocumentPreviewModal from './DocumentPreviewModal';
import { StrapiProposal } from '@/types/strapi'; // Import centralized StrapiProposal interface

interface ProposalCardProps {
  proposal: StrapiProposal; // Use the centralized interface
  isListView?: boolean;
  onEdit?: (id: number) => void;
  onArchive?: (id: number) => void;
  onDelete?: (id: number) => void;
}

// Helper to format date for display on card
const formatDateShort = (isoString: string) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
};

// Helper function to get initials from a name
const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'N/A';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0]?.toUpperCase() || 'N/A';
};

const ProposalCard: React.FC<ProposalCardProps> = ({ 
  proposal, 
  isListView = false,
  onEdit,
  onArchive,
  onDelete
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const toggleDropdown = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleShare = () => {
    alert(`Sharing ${proposal.unique_id || proposal.SF_Number}`);
    setIsDropdownOpen(false);
  };

  const handleDownload = () => {
    alert(`Downloading ${proposal.unique_id || proposal.SF_Number}`);
    setIsDropdownOpen(false);
  };

  const handlePreviewClick = () => {
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
  };

  const displayUniqueId = proposal.unique_id || proposal.SF_Number || 'N/A';

  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-100 flex p-4 relative group
      ${isListView ? 'flex-row items-stretch w-full' : 'flex-col hover:shadow-lg transition-all duration-300 ease-in-out'}`}
    >
      {isListView ? (
        // --- List View Layout ---
        <div className="flex flex-1 items-center justify-between space-x-4">
          {/* Left Section: Unique ID, Document Types (compact) */}
          <div className="flex items-center space-x-4 flex-grow-0 min-w-0">
            {/* Type/Subtype Pills */}
            <div className="flex-shrink-0 flex items-center space-x-1">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full truncate max-w-[100px]">
                {proposal.Document_Type || 'N/A'}
              </span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full truncate max-w-[100px]">
                {proposal.Document_Sub_Type || 'N/A'}
              </span>
            </div>
            {/* Unique ID - Primary Identifier */}
            <h3 className="text-base font-bold text-text-dark-gray flex-grow truncate" title={displayUniqueId}>
              {displayUniqueId}
            </h3>
          </div>

          {/* Middle Section: Last Change, Industry (compact) */}
          <div className="flex items-center space-x-4 flex-grow justify-end min-w-0 pr-4"> {/* Added padding to separate from actions */}
            <p className="flex items-center text-sm text-gray-700 whitespace-nowrap">
              <CalendarDaysIcon className="h-4 w-4 mr-1 text-gray-500 flex-shrink-0" />
              <span className="font-semibold">Last Change:</span> <span className="truncate">{formatDateShort(proposal.Last_Stage_Change_Date)}</span>
            </p>
            <p className="flex items-center text-sm text-gray-700 whitespace-nowrap">
              <BuildingOfficeIcon className="h-4 w-4 mr-1 text-gray-500 flex-shrink-0" />
              <span className="font-semibold">Industry:</span> <span className="truncate">{proposal.Industry || 'N/A'}</span>
            </p>
          </div>

          {/* Right Section: Actions & Preview Button */}
          <div className="flex-shrink-0 flex items-center space-x-3 ml-auto pl-4 border-l border-gray-100">
            {/* Actions */}
            <div className="flex items-center space-x-2 relative">
              <BookmarkIcon className="h-5 w-5 text-gray-400 cursor-pointer hover:text-strapi-green-dark transition-colors duration-200" />
              <EllipsisHorizontalIcon
                className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-700 transition-colors duration-200"
                onClick={toggleDropdown}
              />
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-xl py-1 z-20 top-full transform translate-y-2">
                  {onEdit && (<button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); onEdit(proposal.id); setIsDropdownOpen(false); }}><PencilIcon className="h-4 w-4 mr-2" /> Edit</button>)}
                  {onArchive && (<button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); onArchive(proposal.id); setIsDropdownOpen(false); }}><ArchiveBoxIcon className="h-4 w-4 mr-2" /> Archive</button>)}
                  {onDelete && (<button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); onDelete(proposal.id); setIsDropdownOpen(false); }}><TrashIcon className="h-4 w-4 mr-2" /> Delete</button>)}
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleShare}>
                    <ShareIcon className="h-4 w-4 mr-2" /> Share
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleDownload}>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" /> Download
                  </button>
                </div>
              )}
            </div>
            {/* Preview Button */}
            <button
              onClick={handlePreviewClick}
              className="bg-strapi-green-light hover:bg-strapi-green-dark text-white font-semibold py-2 px-4 rounded-lg
                         transition-all duration-200 ease-in-out shadow-md text-sm whitespace-nowrap"
            >
              Preview
            </button>
          </div>
        </div>
      ) : (
        // --- Grid View Layout (from previous update) ---
        <>
          {/* Header (Top Row) - Document Type, Sub Type, Actions */}
          <div className="flex justify-between items-center text-sm mb-3 w-full">
            {/* Document Type & Sub Type Pills */}
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center">
                <TagIcon className="h-3 w-3 mr-1" /> {proposal.Document_Type || 'N/A'}
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full flex items-center">
                <TagIcon className="h-3 w-3 mr-1" /> {proposal.Document_Sub_Type || 'N/A'}
              </span>
            </div>
            
            {/* Actions (Bookmark, More Options) */}
            <div className="flex items-center space-x-2 relative">
              <BookmarkIcon className="h-5 w-5 text-gray-400 cursor-pointer hover:text-strapi-green-dark transition-colors duration-200" />
              <EllipsisHorizontalIcon
                className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2"
                onClick={toggleDropdown}
              />
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-xl py-1 z-20 top-full transform translate-y-2">
                  {onEdit && (<button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); onEdit(proposal.id); setIsDropdownOpen(false); }}><PencilIcon className="h-4 w-4 mr-2" /> Edit</button>)}
                  {onArchive && (<button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); onArchive(proposal.id); setIsDropdownOpen(false); }}><ArchiveBoxIcon className="h-4 w-4 mr-2" /> Archive</button>)}
                  {onDelete && (<button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); onDelete(proposal.id); setIsDropdownOpen(false); }}><TrashIcon className="h-4 w-4 mr-2" /> Delete</button>)}
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleShare}>
                    <ShareIcon className="h-4 w-4 mr-2" /> Share
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleDownload}>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" /> Download
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Unique ID as primary title, Date & Industry below */}
          <h3 className="text-xl font-bold text-text-dark-gray mb-2 truncate" title={displayUniqueId}>
            {displayUniqueId}
          </h3>

          <div className="text-sm text-gray-700 flex-grow w-full">
            <p className="flex items-center mb-1">
              <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-semibold">Last Change:</span> {formatDateShort(proposal.Last_Stage_Change_Date)}
            </p>
            <p className="flex items-center">
              <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-semibold">Industry:</span> {proposal.Industry || 'N/A'}
            </p>
          </div>

          {/* Preview Button - Bottom Aligned */}
          <div className={`pt-4 border-t border-gray-100 flex justify-end items-center w-full mt-4`}>
            <button
              onClick={handlePreviewClick}
              className="bg-strapi-green-light hover:bg-strapi-green-dark text-white font-semibold py-2.5 px-6 rounded-lg
                         transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 shadow-md text-sm
                         focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2"
            >
              Preview
            </button>
          </div>
        </>
      )}

      {/* Document Preview Modal */}
      {isPreviewModalOpen && (
        <DocumentPreviewModal
          proposal={proposal}
          onClose={closePreviewModal}
        />
      )}
    </div>
  );
};

export default ProposalCard;