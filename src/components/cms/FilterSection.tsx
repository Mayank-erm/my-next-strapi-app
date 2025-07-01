// src/components/cms/FilterSection.tsx (Full updated code with refined layout, filter order, and spacing)
import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import DateRangeFilter from './DateRangeFilter';
import MultiSelectFilter from './MultiSelectFilter';
import RangeSliderFilter from './RangeSliderFilter';
import ActiveFilterPills from './ActiveFilterPills'; // Import ActiveFilterPills

interface FilterSectionProps {
  proposalStatuses: string[];
  setProposalStatuses: (statuses: string[]) => void;
  proposedByUsers: string[];
  setProposedByUsers: (users: string[]) => void;
  contentTypes: string[];
  setContentTypes: (types: string[]) => void;
  serviceLines: string[];
  setServiceLines: (lines: string[]) => void;
  industries: string[];
  setIndustries: (industries: string[]) => void;
  regions: string[];
  setRegions: (regions: string[]) => void;
  dateRange: [Date | null, Date | null];
  setDateRange: (range: [Date | null, Date | null]) => void;
  valueRange: [number, number];
  setValueRange: (range: [number, number]) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
  activeFilterPillsProps: {
      searchTerm: string;
      dateRange: [Date | null, Date | null];
      valueRange: [number, number];
      proposalStatuses: string[];
      proposedByUsers: string[];
      contentTypes: string[];
      serviceLines: string[];
      industries: string[];
      regions: string[];
      onClearFilter: () => void;
  };
}

const FilterSection: React.FC<FilterSectionProps> = ({
  proposalStatuses,
  setProposalStatuses,
  proposedByUsers,
  setProposedByUsers,
  contentTypes,
  setContentTypes,
  serviceLines,
  setServiceLines,
  industries,
  setIndustries,
  regions,
  setRegions,
  dateRange,
  setDateRange,
  valueRange,
  setValueRange,
  onApplyFilters,
  onClearFilters,
  activeFiltersCount,
  activeFilterPillsProps,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const mockProposalStatusOptions = ['Approved', 'Pending', 'Draft', 'Rejected', 'Submitted'];
  const mockProposedByOptions = ['John Doe', 'Jane Smith', 'George'];
  const mockContentTypeOptions = ['Proposal', 'Report', 'Presentation'];
  const mockServiceLineOptions = ['Consulting', 'Engineering', 'Digital Solutions'];
  const mockIndustryOptions = ['Retail', 'Energy', 'Healthcare'];
  const mockRegionOptions = ['North America', 'Europe', 'Asia Pacific'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Advanced Filters</h2>
      </div>

      <div className="p-6">
        {/* Active Filter Pills */}
        <ActiveFilterPills {...activeFilterPillsProps} />

        {/* Main Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          <MultiSelectFilter
            label="Content Type"
            options={mockContentTypeOptions}
            selectedOptions={contentTypes}
            setSelectedOptions={setContentTypes}
          />
          <MultiSelectFilter
            label="Service Line"
            options={mockServiceLineOptions}
            selectedOptions={serviceLines}
            setSelectedOptions={setServiceLines}
          />
          <MultiSelectFilter
            label="Industry"
            options={mockIndustryOptions}
            selectedOptions={industries}
            setSelectedOptions={setIndustries}
          />
          <MultiSelectFilter
            label="Region"
            options={mockRegionOptions}
            selectedOptions={regions}
            setSelectedOptions={setRegions}
          />
          <MultiSelectFilter
            label="Proposal Status"
            options={mockProposalStatusOptions}
            selectedOptions={proposalStatuses}
            setSelectedOptions={setProposalStatuses}
          />
          <MultiSelectFilter
            label="Proposed By"
            options={mockProposedByOptions}
            selectedOptions={proposedByUsers}
            setSelectedOptions={setProposedByUsers}
          />
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <ChevronUpIcon className="h-4 w-4 mr-2" />
                Hide Advanced Filters
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-4 w-4 mr-2" />
                Show Advanced Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </>
            )}
          </button>
        </div>

        {/* Collapsible Advanced Filters */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            <DateRangeFilter dateRange={dateRange} setDateRange={setDateRange} />
            <RangeSliderFilter
              label="Value Range"
              min={0}
              max={1000000}
              step={10000}
              range={valueRange}
              setRange={setValueRange}
              isCurrency={true}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            <XMarkIcon className="h-4 w-4 mr-2 inline" />
            Clear All
          </button>
          <button
            onClick={onApplyFilters}
            className="px-6 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-sm"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
export default FilterSection;