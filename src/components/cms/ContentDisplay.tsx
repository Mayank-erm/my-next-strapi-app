// src/components/cms/ContentDisplay.tsx - ENHANCED WITH PROFESSIONAL UX
import React from 'react';
import { 
  ListBulletIcon, 
  Squares2X2Icon, 
  ChevronDownIcon,
  BookmarkIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  EyeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import ProposalCard from '@/components/ProposalCard';
import { StrapiProposal } from '@/types/strapi';

interface ContentDisplayProps {
  proposals: StrapiProposal[];
  isLoading: boolean;
  totalResults: number;
  sortBy: string;
  setSortBy: (sort: string) => void;
  activeView: 'grid' | 'list';
  setActiveView: (view: 'grid' | 'list') => void;
  selectedItems: number[];
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: number, checked: boolean) => void;
  onBulkAction: (action: string) => void;
  bookmarkedItems?: number[];
  showToast?: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
}

// Enhanced Bulk Actions Bar Component
const EnhancedBulkActionsBar: React.FC<{
  selectedCount: number;
  totalItems: number;
  onSelectAll: (checked: boolean) => void;
  onBulkAction: (action: string) => void;
  allSelected: boolean;
  showToast?: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
}> = ({
  selectedCount,
  totalItems,
  onSelectAll,
  onBulkAction,
  allSelected,
  showToast,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  const handleBulkAction = (action: string) => {
    onBulkAction(action);
    if (showToast) {
      switch (action) {
        case 'bookmark':
          showToast('Documents Bookmarked', `${selectedCount} document${selectedCount !== 1 ? 's' : ''} bookmarked successfully`, 'success');
          break;
        case 'download':
          showToast('Download Started', `Downloading ${selectedCount} document${selectedCount !== 1 ? 's' : ''}...`, 'info');
          break;
        case 'share':
          showToast('Share Links Generated', `Share links created for ${selectedCount} document${selectedCount !== 1 ? 's' : ''}`, 'success');
          break;
      }
    }
  };

  return (
    <div className="sticky top-32 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 mb-6 flex items-center justify-between transition-all duration-300 animate-slideInFromRight">
      <div className="flex items-center space-x-4">
        {/* Enhanced Checkbox */}
        <label className="flex items-center cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
            />
            <div className={`
              w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center
              ${allSelected 
                ? 'bg-erm-primary border-erm-primary shadow-lg' 
                : 'border-gray-300 group-hover:border-erm-primary'
              }
            `}>
              {allSelected && <CheckIcon className="h-3 w-3 text-white" />}
            </div>
          </div>
          <span className="ml-3 text-gray-900 font-medium">
            {selectedCount} of {totalItems} selected
          </span>
        </label>
        
        {/* Selection Info */}
        <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
          <span>•</span>
          <span>Bulk actions available</span>
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => handleBulkAction('bookmark')}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-erm-primary to-erm-dark text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
          title="Bookmark selected documents"
        >
          <BookmarkIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Bookmark</span>
        </button>
        
        <button
          onClick={() => handleBulkAction('download')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
          title="Download selected documents"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </button>
        
        <button
          onClick={() => handleBulkAction('share')}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
          title="Share selected documents"
        >
          <ShareIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
};

const ContentDisplay: React.FC<ContentDisplayProps> = ({
  proposals,
  isLoading,
  totalResults,
  sortBy,
  setSortBy,
  activeView,
  setActiveView,
  selectedItems,
  onSelectAll,
  onSelectItem,
  onBulkAction,
  bookmarkedItems = [],
  showToast,
}) => {
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleEdit = (id: number) => {
    if (showToast) {
      showToast('Edit Mode', `Opening document ${id} for editing`, 'info');
    }
  };

  const handleBookmark = (id: number) => {
    if (showToast) {
      const isBookmarked = bookmarkedItems.includes(id);
      showToast(
        isBookmarked ? 'Bookmark Removed' : 'Bookmark Added', 
        `Document ${isBookmarked ? 'removed from' : 'added to'} bookmarks`, 
        'success'
      );
    }
  };

  const handleShare = (id: number) => {
    if (showToast) {
      showToast('Share Link Generated', `Share link created for document ${id}`, 'success');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            All Content
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-erm-primary rounded-full"></div>
              <span className="font-medium">{totalResults.toLocaleString()} results</span>
            </div>
            {selectedItems.length > 0 && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-2">
                  <CheckIcon className="h-4 w-4 text-erm-primary" />
                  <span className="font-medium text-erm-primary">{selectedItems.length} selected</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 text-gray-600 text-sm flex-wrap">
          <span className="font-semibold text-gray-700">Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="p-3 pr-10 border border-gray-300 rounded-xl bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-erm-primary focus:border-erm-primary transition-all duration-200 font-medium"
            >
              <option value="publishedAt:desc">Published Date (Newest)</option>
              <option value="publishedAt:asc">Published Date (Oldest)</option>
              <option value="unique_id:asc">Document ID (A-Z)</option>
              <option value="unique_id:desc">Document ID (Z-A)</option>
              <option value="value:desc">Value (High to Low)</option>
              <option value="value:asc">Value (Low to High)</option>
              <option value="clientName:asc">Client Name (A-Z)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <ChevronDownIcon className="h-4 w-4" />
            </div>
          </div>

          <div className="flex space-x-2 ml-auto lg:ml-0">
            <button
              onClick={() => setActiveView('grid')}
              className={`p-3 border rounded-xl transition-all duration-200 font-medium ${
                activeView === 'grid' 
                  ? 'bg-erm-primary text-white border-erm-primary shadow-lg transform scale-105' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
              title="Grid view"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`p-3 border rounded-xl transition-all duration-200 font-medium ${
                activeView === 'list' 
                  ? 'bg-erm-primary text-white border-erm-primary shadow-lg transform scale-105' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
              title="List view"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <div className="relative mb-6">
            <div className="animate-spin h-12 w-12 border-4 border-erm-primary border-t-transparent rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <EyeIcon className="h-5 w-5 text-erm-primary" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading content...</h3>
          <p className="text-gray-500">Searching through your documents</p>
        </div>
      ) : proposals.length > 0 ? (
        <>
          {/* Enhanced Bulk Actions Bar */}
          <EnhancedBulkActionsBar
            selectedCount={selectedItems.length}
            totalItems={proposals.length}
            onSelectAll={onSelectAll}
            onBulkAction={onBulkAction}
            allSelected={selectedItems.length > 0 && selectedItems.length === proposals.length}
            showToast={showToast}
          />

          {/* Content Grid/List */}
          <div className={
            activeView === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "flex flex-col gap-4"
          }>
            {proposals.map((proposal, index) => (
              <div 
                key={proposal.id} 
                className="relative group animate-professional-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Enhanced Checkbox with ERM Colors */}
                <label className="absolute top-3 left-3 z-10 cursor-pointer group/checkbox">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedItems.includes(proposal.id)}
                      onChange={(e) => onSelectItem(proposal.id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className={`
                      w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center
                      ${selectedItems.includes(proposal.id)
                        ? 'bg-erm-primary border-erm-primary shadow-lg scale-110' 
                        : 'border-gray-300 bg-white group-hover/checkbox:border-erm-primary group-hover/checkbox:bg-erm-primary/5'
                      }
                    `}>
                      {selectedItems.includes(proposal.id) && (
                        <CheckIcon className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                </label>

                {/* Bookmark Indicator */}
                {bookmarkedItems.includes(proposal.id) && (
                  <div className="absolute top-3 right-3 z-10">
                    <BookmarkSolid className="h-5 w-5 text-erm-primary" />
                  </div>
                )}

                {/* Enhanced Proposal Card */}
                <ProposalCard
                  proposal={proposal}
                  isListView={activeView === 'list'}
                  onEdit={handleEdit}
                  onArchive={handleBookmark} // Changed from archive to bookmark
                  onDelete={handleShare} // Changed from delete to share
                  isBookmarked={bookmarkedItems.includes(proposal.id)}
                  showToast={showToast}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Enhanced Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <EyeIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-3">No content found</h3>
          <p className="text-gray-500 text-center max-w-md mb-6">
            No documents match your current criteria. Try adjusting your filters or search terms.
          </p>
          <div className="flex space-x-3">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-erm-primary text-white rounded-xl hover:bg-erm-dark transition-all duration-200 font-medium"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => onBulkAction('clear-filters')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentDisplay;