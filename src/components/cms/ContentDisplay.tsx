// src/components/cms/ContentDisplay.tsx (UPDATED: Sorting options reflect new sortable fields)
import React from 'react';
import { ListBulletIcon, Squares2X2Icon, TrashIcon, ArchiveBoxIcon, PencilIcon, ChevronDownIcon } from '@heroicons/react/24/outline'; // ADD ChevronDownIcon here
import ProposalCard from '@/components/ProposalCard';
import BulkActionsBar from './BulkActionsBar';

interface StrapiProposal {
  id: number;
  opportunityNumber: string;
  proposalName: string;
  clientName: string;
  pstatus: string;
  value: number; // Changed to number
  description?: string | null; // Changed to string
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  proposedBy: string | null;
  chooseEmployee: number | null;
  documentUrl?: string; // Added documentUrl for preview
}

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
}

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
}) => {
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const handleEdit = (id: number) => alert(`Editing item ${id}`);
  const handleArchive = (id: number) => alert(`Archiving item ${id}`);
  const handleDelete = (id: number) => {
    if (confirm(`Are you sure you want to delete item ${id}?`)) {
      alert(`Deleting item ${id}`);
      // In a real app: call API to delete, then re-fetch or remove from state
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-text-dark-gray mb-4 sm:mb-0">
          All Content ({totalResults} results)
        </h2>

        <div className="flex items-center space-x-4 text-text-medium-gray text-sm flex-wrap">
          <span className="font-semibold">Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="p-2 border rounded-lg bg-white appearance-none pr-8 cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:border-transparent"
            >
              <option value="publishedAt:desc">Published Date (Newest)</option>
              <option value="publishedAt:asc">Published Date (Oldest)</option>
              <option value="proposalName:asc">Name (A-Z)</option>
              <option value="proposalName:desc">Name (Z-A)</option>
              <option value="value:desc">Value (High to Low)</option> {/* New sort option */}
              <option value="value:asc">Value (Low to High)</option> {/* New sort option */}
              <option value="clientName:asc">Client Name (A-Z)</option> {/* Existing sort option */}
              <option value="opportunityNumber:asc">Opportunity Number (Asc)</option> {/* Existing sort option */}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDownIcon className="h-4 w-4" />
            </div>
          </div>

          <div className="flex space-x-2 ml-auto sm:ml-0 mt-2 sm:mt-0">
            <button
              onClick={() => setActiveView('grid')}
              className={`p-2 border rounded-lg text-gray-700 transition-colors
                          ${activeView === 'grid' ? 'bg-strapi-green-light text-white shadow-sm' : 'bg-white hover:bg-gray-100'}
                          focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2`}
              aria-label="Switch to grid view"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`p-2 border rounded-lg text-gray-700 transition-colors
                          ${activeView === 'list' ? 'bg-strapi-green-light text-white shadow-sm' : 'bg-white hover:bg-gray-100'}
                          focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2`}
              aria-label="Switch to list view"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-500">
          <svg className="animate-spin h-10 w-10 text-strapi-green-light mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl font-medium">Loading content...</p>
        </div>
      ) : proposals.length > 0 ? (
        <>
          <BulkActionsBar
            selectedCount={selectedItems.length}
            totalItems={proposals.length}
            onSelectAll={onSelectAll}
            onBulkAction={onBulkAction}
            allSelected={selectedItems.length > 0 && selectedItems.length === proposals.length}
          />

          <div className={activeView === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mt-4" : "flex flex-col gap-4 mt-4"}>
            {proposals.map((proposal) => (
              <div key={proposal.id} className="relative group">
                <input
                  type="checkbox"
                  className="absolute top-3 left-3 z-10 h-5 w-5 text-strapi-green-light rounded border-gray-300
                             focus:ring-strapi-green-light focus:outline-none"
                  checked={selectedItems.includes(proposal.id)}
                  onChange={(e) => onSelectItem(proposal.id, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select ${proposal.proposalName}`}
                />
                <ProposalCard
                  proposal={proposal}
                  isListView={activeView === 'list'}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                />
                {/* Individual Action Buttons (visible on hover/focus in grid, always in list) */}
                {/* These are now directly within ProposalCard when passed */}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-500">
          <span className="text-6xl mb-4" role="img" aria-label="No results">
            🤔
          </span>
          <p className="text-xl font-medium">No content found matching your criteria.</p>
          <p className="text-md mt-2">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
};

export default ContentDisplay;