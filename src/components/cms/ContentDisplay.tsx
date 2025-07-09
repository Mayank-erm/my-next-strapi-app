// src/components/cms/ContentDisplay.tsx - FIXED VERSION WITHOUT REDUNDANT HEADERS
import React from 'react';
import { 
  ListBulletIcon, 
  Squares2X2Icon, 
  ChevronDownIcon,
  BookmarkIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  EyeIcon,
  CheckIcon,
  AdjustmentsHorizontalIcon // Import AdjustmentsHorizontalIcon
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
  
  // New props for filter sidebar control
  isFilterSidebarOpen: boolean;
  onToggleFilterSidebar: () => void;
  activeFiltersCount: number;
  onToggleMobileFilterSidebar: () => void; // Added for mobile toggle
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
    <div className="content-bulk-actions">
      <div className="content-bulk-actions__info">
        <label className="content-bulk-actions__checkbox">
          <div className="content-bulk-actions__checkbox-wrapper">
            <input
              type="checkbox"
              className="sr-only"
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
            />
            <div className={`content-bulk-actions__checkbox-visual ${allSelected ? 'content-bulk-actions__checkbox-visual--checked' : ''}`}>
              {allSelected && <CheckIcon className="h-3 w-3 text-white" />}
            </div>
          </div>
          <span className="content-bulk-actions__text">
            {selectedCount} of {totalItems} selected
          </span>
        </label>
        
        <div className="content-bulk-actions__hint">
          <span>•</span>
          <span>Bulk actions available</span>
        </div>
      </div>

      <div className="content-bulk-actions__buttons">
        <button
          onClick={() => handleBulkAction('bookmark')}
          className="content-bulk-actions__button content-bulk-actions__button--primary"
          title="Bookmark selected documents"
        >
          <BookmarkIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Bookmark</span>
        </button>
        
        <button
          onClick={() => handleBulkAction('download')}
          className="content-bulk-actions__button content-bulk-actions__button--blue"
          title="Download selected documents"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Download</span>
        </button>
        
        <button
          onClick={() => handleBulkAction('share')}
          className="content-bulk-actions__button content-bulk-actions__button--purple"
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
  isFilterSidebarOpen, // New prop
  onToggleFilterSidebar, // New prop
  activeFiltersCount, // New prop
  onToggleMobileFilterSidebar, // New prop
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
    <div className="content-display">
      <div className="content-display__header">
        <div className="content-display__title">
          <div className="content-display__results-count">
            <div className="content-display__count-indicator"></div>
            <span className="content-display__count-text">
              {totalResults.toLocaleString()} documents
            </span>
          </div>
          {selectedItems.length > 0 && (
            <>
              <span className="content-display__separator">•</span>
              <div className="content-display__selected-info">
                <CheckIcon className="h-4 w-4 text-erm-primary" />
                <span className="content-display__selected-text">
                  {selectedItems.length} selected
                </span>
              </div>
            </>
          )}
        </div>

        <div className="content-display__controls">
          {/* NEW Filter Toggle Button for Desktop */}
          <button
            onClick={onToggleFilterSidebar}
            className={`
              hidden lg:flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 font-medium
              ${isFilterSidebarOpen
                ? 'bg-erm-primary text-white border-erm-primary shadow-md hover:bg-erm-dark'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }
            `}
            title={isFilterSidebarOpen ? "Hide filters" : "Show filters"}
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            <span className="text-sm">
              {isFilterSidebarOpen ? 'Hide Filters' : 'Filters'}
            </span>
            {activeFiltersCount > 0 && (
              <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                isFilterSidebarOpen 
                  ? 'bg-white text-erm-primary' 
                  : 'bg-erm-primary text-white'
              }`}>
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Mobile Filter Toggle Button (opens overlay) - kept as is */}
          <button
            onClick={onToggleMobileFilterSidebar}
            className="lg:hidden p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            title="Toggle mobile filters"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-600" />
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-erm-primary text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="content-display__sort">
            <span className="content-display__sort-label">Sort by:</span>
            <div className="content-display__sort-select-wrapper">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="content-display__sort-select"
              >
                <option value="publishedAt:desc">Published Date (Newest)</option>
                <option value="publishedAt:asc">Published Date (Oldest)</option>
                <option value="unique_id:asc">Document ID (A-Z)</option>
                <option value="unique_id:desc">Document ID (Z-A)</option>
                <option value="value:desc">Value (High to Low)</option>
                <option value="value:asc">Value (Low to High)</option>
                <option value="clientName:asc">Client Name (A-Z)</option>
              </select>
              <div className="content-display__sort-icon">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="content-display__view-toggle">
            <button
              onClick={() => setActiveView('grid')}
              className={`content-display__view-button ${
                activeView === 'grid' 
                  ? 'content-display__view-button--active' 
                  : ''
              }`}
              title="Grid view"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`content-display__view-button ${
                activeView === 'list' 
                  ? 'content-display__view-button--active' 
                  : ''
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
        <div className="content-display__loading">
          <div className="content-display__loading-spinner">
            <div className="content-display__spinner"></div>
            <div className="content-display__loading-icon">
              <EyeIcon className="h-5 w-5 text-erm-primary" />
            </div>
          </div>
          <h3 className="content-display__loading-title">Loading content...</h3>
          <p className="content-display__loading-subtitle">Searching through your documents</p>
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
          <div className={`content-display__grid ${
            activeView === 'grid' 
              ? "content-display__grid--grid" 
              : "content-display__grid--list"
          }`}>
            {proposals.map((proposal, index) => (
              <div 
                key={proposal.id} 
                className="content-display__item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Enhanced Checkbox */}
                <label className="content-display__item-checkbox">
                  <div className="content-display__checkbox-wrapper">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedItems.includes(proposal.id)}
                      onChange={(e) => onSelectItem(proposal.id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className={`content-display__checkbox-visual ${
                      selectedItems.includes(proposal.id)
                        ? 'content-display__checkbox-visual--checked' 
                        : ''
                    }`}>
                      {selectedItems.includes(proposal.id) && (
                        <CheckIcon className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                </label>

                {/* Bookmark Indicator */}
                {bookmarkedItems.includes(proposal.id) && (
                  <div className="content-display__bookmark-indicator">
                    <BookmarkSolid className="h-5 w-5 text-erm-primary" />
                  </div>
                )}

                {/* Enhanced Proposal Card */}
                <ProposalCard
                  proposal={proposal}
                  isListView={activeView === 'list'}
                  onEdit={handleEdit}
                  onArchive={handleBookmark}
                  onDelete={handleShare}
                  isBookmarked={bookmarkedItems.includes(proposal.id)}
                  showToast={showToast}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Enhanced Empty State */
        <div className="content-display__empty">
          <div className="content-display__empty-icon">
            <EyeIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="content-display__empty-title">No content found</h3>
          <p className="content-display__empty-subtitle">
            No documents match your current criteria. Try adjusting your filters or search terms.
          </p>
          <div className="content-display__empty-actions">
            <button 
              onClick={() => window.location.reload()}
              className="content-display__empty-button content-display__empty-button--primary"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => onBulkAction('clear-filters')}
              className="content-display__empty-button content-display__empty-button--secondary"
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