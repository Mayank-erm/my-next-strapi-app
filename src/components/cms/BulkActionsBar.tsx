// src/components/cms/BulkActionsBar.tsx (UPDATED: Only Download and Archive buttons)
import React from 'react';
import { ArchiveBoxIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'; // Removed TrashIcon, DocumentDuplicateIcon

interface BulkActionsBarProps {
  selectedCount: number;
  totalItems: number;
  onSelectAll: (checked: boolean) => void;
  onBulkAction: (action: string) => void;
  allSelected: boolean;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  totalItems,
  onSelectAll,
  onBulkAction,
  allSelected,
}) => {
  if (selectedCount === 0) {
    return null; // Don't render if no items are selected
  }

  return (
    <div className="sticky top-16 z-20 bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-4 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          className="h-5 w-5 text-strapi-green-light rounded border-gray-300 focus:ring-strapi-green-light focus:outline-none"
          checked={allSelected}
          onChange={(e) => onSelectAll(e.target.checked)}
          aria-label="Select all visible items"
        />
        <span className="text-text-dark-gray font-medium">
          {selectedCount} of {totalItems} selected
        </span>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => onBulkAction('download')}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm"
          aria-label="Download selected items"
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" /> Download
        </button>
        <button
          onClick={() => onBulkAction('archive')}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm"
          aria-label="Archive selected items"
        >
          <ArchiveBoxIcon className="h-5 w-5 mr-2" /> Archive
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;