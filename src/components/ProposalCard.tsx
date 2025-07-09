// src/components/ProposalCard.tsx - HYDRATION SAFE VERSION
import React, { useState, useEffect } from 'react';
import {
  BookmarkIcon,
  EllipsisHorizontalIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PencilIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  TagIcon,
  EyeIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import DocumentPreviewModal from './DocumentPreviewModal';
import { StrapiProposal } from '@/types/strapi';

interface ProposalCardProps {
  proposal: StrapiProposal;
  isListView?: boolean;
  onEdit?: (id: number) => void;
  onArchive?: (id: number) => void;
  onShare?: (id: number) => void; // Changed from onDelete to onShare
  isBookmarked?: boolean;
  showToast?: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ 
  proposal, 
  isListView = false,
  onEdit,
  onArchive,
  onShare, // Changed prop name
  isBookmarked = false,
  showToast
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // HYDRATION FIX: Use state for client-only values
  const [clientOnlyData, setClientOnlyData] = useState({
    mockViews: 0,
    mockRating: '0.0',
    mockLastModified: '',
    isClient: false
  });

  // HYDRATION FIX: Initialize client-only data after hydration
  useEffect(() => {
    setClientOnlyData({
      mockViews: Math.floor(Math.random() * 500) + 50,
      mockRating: (Math.random() * 2 + 3).toFixed(1),
      mockLastModified: "2 hours ago",
      isClient: true
    });
  }, []);

  const toggleDropdown = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArchive) {
      onArchive(proposal.id);
    }
    if (showToast) {
      showToast(
        isBookmarked ? 'Bookmark Removed' : 'Bookmark Added',
        `Document ${isBookmarked ? 'removed from' : 'added to'} bookmarks`,
        'success'
      );
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) { // Use new onShare prop
      onShare(proposal.id);
    }
    const shareLink = proposal.documentUrl || window.location.href; // Fallback to current URL if no document URL
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        if (showToast) {
          showToast('Link Copied!', `Share link for ${proposal.unique_id} copied to clipboard.`, 'success');
        }
      })
      .catch((err) => {
        console.error('Failed to copy share link:', err);
        if (showToast) {
          showToast('Copy Failed', `Could not copy link for ${proposal.unique_id}.`, 'error');
        }
      });
    setIsDropdownOpen(false);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showToast) {
      showToast('Download Started', `Downloading ${proposal.unique_id}...`, 'info');
    }
    // Implement actual download logic here if not handled by parent (e.g., direct <a> tag download)
    // For now, assuming proposal.documentUrl is directly downloadable
    if (proposal.documentUrl) {
      const link = document.createElement('a');
      link.href = proposal.documentUrl;
      // Attempt to derive filename from URL if not explicitly available, or use unique_id
      const filename = proposal.documentUrl.split('/').pop() || (proposal.unique_id + '.pdf'); 
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (showToast) {
        showToast('Download Failed', 'No downloadable URL available for this document.', 'error');
      }
    }
    setIsDropdownOpen(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(proposal.id);
    }
    if (showToast) {
      showToast('Edit Mode', `Opening ${proposal.unique_id} for editing`, 'info');
    }
    setIsDropdownOpen(false);
  };

  const handlePreviewClick = () => {
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getDocumentTypeColor = (type: string) => {
    const colors = {
      'Proposal': 'bg-blue-50 text-blue-700 border-blue-200',
      'Report': 'bg-purple-50 text-purple-700 border-purple-200',
      'Presentation': 'bg-green-50 text-green-700 border-green-200',
      'Contract': 'bg-orange-50 text-orange-700 border-orange-200',
      'Assessment': 'bg-teal-50 text-teal-700 border-teal-200',
      default: 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors[type as keyof typeof colors] || colors.default;
  };

  const displayUniqueId = proposal.unique_id || proposal.SF_Number || 'N/A';

  return (
    <>
      <div 
        className={`group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-erm-primary/30 ${
          isListView 
            ? 'flex items-center p-6 hover:bg-gray-50/50' 
            : 'flex flex-col h-full'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handlePreviewClick}
      >
        {/* Enhanced Hover Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br from-erm-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isListView ? 'hidden' : ''}`} />

        {isListView ? (
          // Enhanced List View Layout
          <div className="flex flex-1 items-center justify-between space-x-6 relative z-10">
            {/* Left: Document Info */}
            <div className="flex items-center space-x-6 flex-1 min-w-0">
              {/* Document Type Badge */}
              <div className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getDocumentTypeColor(proposal.Document_Type)} shadow-sm`}>
                <TagIcon className="h-4 w-4 inline mr-2" />
                {proposal.Document_Type || 'Document'}
              </div>

              {/* Main Info */}
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-erm-primary transition-colors mb-2">
                  {displayUniqueId}
                </h3>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Industry:</span>
                    <span>{proposal.Industry || 'General'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Updated:</span>
                    <span>{formatDate(proposal.Last_Stage_Change_Date)}</span>
                  </div>
                  {/* Removed Client from here */}
                </div>
              </div>
            </div>

            {/* Right: Stats and Actions */}
            <div className="flex items-center space-x-6">
              {/* HYDRATION FIX: Only render stats after client hydration */}
              {clientOnlyData.isClient && (
                <div className="hidden xl:flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <EyeIcon className="h-4 w-4" />
                    <span>{clientOnlyData.mockViews}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    <span>{clientOnlyData.mockRating}</span>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                {/* Removed HeartIcon and handleFavorite */}

                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isBookmarked 
                      ? 'text-erm-primary bg-erm-primary/10 scale-110' 
                      : 'text-gray-400 hover:text-erm-primary hover:bg-erm-primary/10'
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
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-30">
                      {/* Removed Edit Document */}
                      <button 
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={handleShare}
                      >
                        <ShareIcon className="h-4 w-4 mr-3" />
                        Share Document
                      </button>
                      <button 
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={handleDownload}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-3" />
                        Download
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePreviewClick}
                  className="bg-gradient-to-r from-erm-primary to-erm-dark hover:from-erm-dark hover:to-erm-primary text-white font-semibold py-2 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <EyeIcon className="h-4 w-4 inline mr-2" />
                  Preview
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Enhanced Grid View Layout
          <div className="flex flex-col h-full">
            {/* Card Header */}
            <div className="relative p-6 pb-4 flex-1">
              {/* Top Row: Type Badge and Actions */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${getDocumentTypeColor(proposal.Document_Type)} shadow-sm`}>
                    <TagIcon className="h-3 w-3 inline mr-1" />
                    {proposal.Document_Type || 'Document'}
                  </div>
                  {proposal.Document_Sub_Type && (
                    <div className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                      {proposal.Document_Sub_Type}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  {/* Removed HeartIcon and handleFavorite */}

                  <button
                    onClick={handleBookmark}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                      isBookmarked 
                        ? 'text-erm-primary bg-erm-primary/10 scale-110' 
                        : 'text-gray-400 hover:text-erm-primary hover:bg-erm-primary/10'
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
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <EllipsisHorizontalIcon className="h-4 w-4" />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-30">
                        {/* Removed Edit Document */}
                        <button 
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={handleShare}
                        >
                          <ShareIcon className="h-4 w-4 mr-3" />
                          Share Document
                        </button>
                        <button 
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={handleDownload}
                        >
                          <ArrowDownTrayIcon className="h-4 w-4 mr-3" />
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-erm-primary transition-colors line-clamp-2">
                {displayUniqueId}
              </h3>

              {/* Document Info */}
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="font-medium">Industry:</span>
                  <span className="truncate">{proposal.Industry || 'General'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="font-medium">Updated:</span>
                  <span>{formatDate(proposal.Last_Stage_Change_Date)}</span>
                </div>
                {/* Removed Client from here */}
              </div>
            </div>

            {/* Card Footer */}
            <div className="mt-auto">
              {/* HYDRATION FIX: Only render stats after client hydration */}
              {clientOnlyData.isClient && (
                <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="h-3 w-3" />
                        <span>{clientOnlyData.mockViews}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                        <span>{clientOnlyData.mockRating}</span>
                      </div>
                    </div>
                    <span className="text-gray-400">Modified {clientOnlyData.mockLastModified}</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="p-6 pt-4">
                <button
                  onClick={handlePreviewClick}
                  className={`w-full bg-gradient-to-r from-erm-primary to-erm-dark hover:from-erm-dark hover:to-erm-primary text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105 ${
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
          </div>
        )}

        {/* Enhanced Loading State Overlay */}
        {isHovered && !isListView && (
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none transition-opacity duration-300" />
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