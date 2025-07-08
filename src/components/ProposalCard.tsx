// src/components/ProposalCard.tsx - COMPLETE VERSION
import React, { useState } from 'react';
import {
  BookmarkIcon,
  EllipsisHorizontalIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PencilIcon,
  ArchiveBoxIcon,
  TrashIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  TagIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import DocumentPreviewModal from './DocumentPreviewModal';
import { StrapiProposal } from '@/types/strapi';

interface ProposalCardProps {
  proposal: StrapiProposal;
  isListView?: boolean;
  onEdit?: (id: number) => void;
  onArchive?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ 
  proposal, 
  isListView = false,
  onEdit,
  onArchive,
  onDelete
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleDropdown = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Document: ${proposal.unique_id}`);
    alert(`Link copied for ${proposal.unique_id || proposal.SF_Number}`);
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

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getDocumentTypeColor = (type: string) => {
    const colors = {
      'Proposal': 'bg-blue-100 text-blue-800 border-blue-200',
      'Report': 'bg-purple-100 text-purple-800 border-purple-200',
      'Presentation': 'bg-green-100 text-green-800 border-green-200',
      'Contract': 'bg-orange-100 text-orange-800 border-orange-200',
      default: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  const getIndustryIcon = (industry: string) => {
    return BuildingOfficeIcon;
  };

  const displayUniqueId = proposal.unique_id || proposal.SF_Number || 'N/A';
  const IndustryIcon = getIndustryIcon(proposal.Industry);

  // Mock data for enhanced features
  const mockViews = 142;
  const mockRating = 4.3;
  const mockLastModified = "2 hours ago";

  return (
    <>
      <div 
        className={`group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 cursor-pointer ${
          isListView 
            ? 'flex items-center p-4 hover:shadow-md hover:border-gray-200' 
            : 'flex flex-col hover:shadow-xl hover:border-strapi-green-light/30 hover:-translate-y-1'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handlePreviewClick}
      >
        {/* Hover Overlay Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br from-strapi-green-light/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isListView ? 'hidden' : ''}`} />

        {isListView ? (
          // List View Layout
          <div className="flex flex-1 items-center justify-between space-x-4 relative z-10">
            {/* Left: Document Info */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Document Type Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDocumentTypeColor(proposal.Document_Type)}`}>
                {proposal.Document_Type || 'Document'}
              </div>

              {/* Main Info */}
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-strapi-green-dark transition-colors">
                  {displayUniqueId}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center">
                    <IndustryIcon className="h-4 w-4 mr-1" />
                    {proposal.Industry || 'General'}
                  </span>
                  <span className="flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 mr-1" />
                    {formatDate(proposal.Last_Stage_Change_Date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Stats and Actions */}
            <div className="flex items-center space-x-6">
              {/* Stats */}
              <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <EyeIcon className="h-4 w-4 mr-1" />
                  <span>{mockViews}</span>
                </div>
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                  <span>{mockRating}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleBookmark}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked 
                      ? 'text-strapi-green-light bg-green-50' 
                      : 'text-gray-400 hover:text-strapi-green-light hover:bg-gray-50'
                  }`}
                  title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                >
                  {isBookmarked ? (
                    <BookmarkSolid className="h-5 w-5" />
                  ) : (
                    <BookmarkIcon className="h-5 w-5" />
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-30">
                      {onEdit && (
                        <button 
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={(e) => { e.stopPropagation(); onEdit(proposal.id); setIsDropdownOpen(false); }}
                        >
                          <PencilIcon className="h-4 w-4 mr-3" />
                          Edit
                        </button>
                      )}
                      <button 
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={handleShare}
                      >
                        <ShareIcon className="h-4 w-4 mr-3" />
                        Share
                      </button>
                      <button 
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={handleDownload}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-3" />
                        Download
                      </button>
                      {onArchive && (
                        <button 
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={(e) => { e.stopPropagation(); onArchive(proposal.id); setIsDropdownOpen(false); }}
                        >
                          <ArchiveBoxIcon className="h-4 w-4 mr-3" />
                          Archive
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          onClick={(e) => { e.stopPropagation(); onDelete(proposal.id); setIsDropdownOpen(false); }}
                        >
                          <TrashIcon className="h-4 w-4 mr-3" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePreviewClick}
                  className="bg-strapi-green-light hover:bg-strapi-green-dark text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Preview
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Grid View Layout
          <>
            {/* Card Header */}
            <div className="relative p-6 pb-4">
              {/* Top Row: Type Badge and Actions */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDocumentTypeColor(proposal.Document_Type)}`}>
                    <TagIcon className="h-3 w-3 inline mr-1" />
                    {proposal.Document_Type || 'Document'}
                  </div>
                  {proposal.Document_Sub_Type && (
                    <div className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {proposal.Document_Sub_Type}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={toggleBookmark}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      isBookmarked 
                        ? 'text-strapi-green-light bg-green-50 scale-110' 
                        : 'text-gray-400 hover:text-strapi-green-light hover:bg-gray-50'
                    }`}
                    title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    {isBookmarked ? (
                      <BookmarkSolid className="h-4 w-4" />
                    ) : (
                      <BookmarkIcon className="h-4 w-4" />
                    )}
                  </button>

                  <div className="relative">
                    <button
                      onClick={toggleDropdown}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <EllipsisHorizontalIcon className="h-4 w-4" />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-30">
                        {onEdit && (
                          <button 
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={(e) => { e.stopPropagation(); onEdit(proposal.id); setIsDropdownOpen(false); }}
                          >
                            <PencilIcon className="h-4 w-4 mr-3" />
                            Edit
                          </button>
                        )}
                        <button 
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={handleShare}
                        >
                          <ShareIcon className="h-4 w-4 mr-3" />
                          Share
                        </button>
                        <button 
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={handleDownload}
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-3" />
                          Download
                        </button>
                        {onArchive && (
                          <button 
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={(e) => { e.stopPropagation(); onArchive(proposal.id); setIsDropdownOpen(false); }}
                          >
                            <ArchiveBoxIcon className="h-4 w-4 mr-3" />
                            Archive
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            onClick={(e) => { e.stopPropagation(); onDelete(proposal.id); setIsDropdownOpen(false); }}
                          >
                            <TrashIcon className="h-4 w-4 mr-3" />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-strapi-green-dark transition-colors line-clamp-2">
                {displayUniqueId}
              </h3>

              {/* Document Info */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <IndustryIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium">Industry:</span>
                  <span className="ml-1 truncate">{proposal.Industry || 'General'}</span>
                </div>
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-medium">Last Updated:</span>
                  <span className="ml-1">{formatDate(proposal.Last_Stage_Change_Date)}</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="relative mt-auto">
              {/* Stats Bar */}
              <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <EyeIcon className="h-3 w-3 mr-1" />
                      <span>{mockViews} views</span>
                    </div>
                    <div className="flex items-center">
                      <StarIcon className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                      <span>{mockRating}</span>
                    </div>
                  </div>
                  <span className="text-gray-400">Modified {mockLastModified}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-4">
                <button
                  onClick={handlePreviewClick}
                  className={`w-full bg-strapi-green-light hover:bg-strapi-green-dark text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group-hover:scale-105 ${
                    isHovered ? 'animate-pulse' : ''
                  }`}
                >
                  <span className="flex items-center justify-center">
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Preview Document
                  </span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Loading State Overlay */}
        {isHovered && !isListView && (
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none" />
        )}
      </div>

      {/* Document Preview Modal */}
      {isPreviewModalOpen && (
        <DocumentPreviewModal
          proposal={proposal}
          onClose={closePreviewModal}
        />
      )}
    </>
  );
};

export default ProposalCard;