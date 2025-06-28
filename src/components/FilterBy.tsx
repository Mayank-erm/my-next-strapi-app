// src/components/FilterBy.tsx (UPDATED: Controlled Filter Inputs & Clear Button)
import React, { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Define props for FilterBy component
interface FilterByProps {
  isSidebarExpanded: boolean;
  // Current active filter values from parent (index.tsx)
  activeContentType: string;
  activeServiceLines: string[];
  activeIndustries: string[];
  activeRegions: string[];
  activeDate: string;
  // Callbacks to update filter values in parent
  onContentTypeChange: (type: string) => void;
  onServiceLineChange: (lines: string[]) => void;
  onIndustryChange: (industries: string[]) => void;
  onRegionChange: (regions: string[]) => void;
  onDateChange: (date: string) => void;
  onSearchInFiltersChange: (term: string) => void; // For search within filters
  onClearAllFilters: () => void; // For the "Clear" button
}

const FilterBy: React.FC<FilterByProps> = ({
  isSidebarExpanded,
  activeContentType,
  activeServiceLines,
  activeIndustries,
  activeRegions,
  activeDate,
  onContentTypeChange,
  onServiceLineChange,
  onIndustryChange,
  onRegionChange,
  onDateChange,
  onSearchInFiltersChange,
  onClearAllFilters
}) => {
  // Internal state for accordion collapse/expand behavior
  const [openSections, setOpenSections] = useState({
    contentType: true, // Content Type remains open by default as per previous request
    serviceLine: false,
    industries: false,
    regions: false,
    dates: false,
  });

  const toggleSection = (sectionName: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  // Handler for checkbox changes
  const handleCheckboxChange = (
    setter: (values: string[]) => void, // e.g., onServiceLineChange
    currentValues: string[],            // e.g., activeServiceLines
    value: string,                      // The checkbox value
    isChecked: boolean
  ) => {
    if (isChecked) {
      setter([...currentValues, value]);
    } else {
      setter(currentValues.filter(item => item !== value));
    }
  };

  // Helper component for each filter section
  const FilterSection: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; toggleOpen: () => void; count?: number }> = ({ title, children, isOpen, toggleOpen, count }) => (
    <div className="mb-2 last:mb-0">
      <button
        className="flex items-center justify-between w-full text-text-dark-gray hover:text-strapi-green-dark cursor-pointer py-2 px-1 focus:outline-none focus:ring-0"
        onClick={toggleOpen}
      >
        <div className="flex items-center space-x-2">
            {isOpen ? (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            ) : (
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            )}
            <span className="font-semibold text-base">{title}</span>
        </div>
        {count !== undefined && <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>}
      </button>
      {isOpen && <ul className="mt-2 ml-4 space-y-1 text-text-light-gray text-sm animate-fade-in">{children}</ul>}
    </div>
  );

  const leftOffset = isSidebarExpanded ? '256px' : '80px';

  return (
    <div
      className={`w-64 bg-white p-4 shadow-sm flex flex-col overflow-y-auto hidden md:block border-r border-strapi-light-gray
        h-[calc(100vh-64px)] fixed top-16 transition-all duration-300 ease-in-out z-10
        focus:outline-none focus:ring-0 focus:border-transparent`
      }
      style={{ left: leftOffset }}
      tabIndex={-1}
    >
      {/* Header section with title and Clear button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-text-dark-gray">Filter By</h3>
        <button
          onClick={onClearAllFilters} // Call the clear all filters handler from parent
          className="flex items-center text-sm text-gray-500 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-md px-2 py-1"
        >
          <XCircleIcon className="h-4 w-4 mr-1" />
          Clear
        </button>
      </div>

      {/* Search Input for filters (optional: this would filter the filter options themselves) */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => onSearchInFiltersChange(e.target.value)} // Pass search term to parent
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-500
                     focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <FilterSection title="Content Type" isOpen={openSections.contentType} toggleOpen={() => toggleSection('contentType')} count={1}>
          <li>
            <label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
              <input
                type="radio"
                name="contentType" // Use radio for single selection
                value="Proposals"
                checked={activeContentType === 'Proposals'}
                onChange={() => onContentTypeChange('Proposals')}
                className="form-radio h-4 w-4 text-strapi-green-light rounded focus:ring-strapi-green-light focus:outline-none" // form-radio for round
              />
              <span className="ml-2 text-gray-700">Proposals</span>
            </label>
          </li>
          <li>
            <label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
              <input
                type="radio"
                name="contentType"
                value="Reports"
                checked={activeContentType === 'Reports'}
                onChange={() => onContentTypeChange('Reports')}
                className="form-radio h-4 w-4 text-strapi-green-light rounded focus:ring-strapi-green-light focus:outline-none"
              />
              <span className="ml-2 text-gray-700">Reports</span>
            </label>
          </li>
           <li>
            <label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
              <input
                type="radio"
                name="contentType"
                value="All"
                checked={activeContentType === 'All'}
                onChange={() => onContentTypeChange('All')}
                className="form-radio h-4 w-4 text-strapi-green-light rounded focus:ring-strapi-green-light focus:outline-none"
              />
              <span className="ml-2 text-gray-700">All</span>
            </label>
          </li>
        </FilterSection>

        <FilterSection title="Service Line" isOpen={openSections.serviceLine} toggleOpen={() => toggleSection('serviceLine')} count={5}>
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded"
              checked={activeServiceLines.includes('Service Option 1')}
              onChange={(e) => handleCheckboxChange(onServiceLineChange, activeServiceLines, 'Service Option 1', e.target.checked)} />
            <span className="ml-2 text-gray-700">Service Option 1</span></label></li>
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded"
              checked={activeServiceLines.includes('Service Option 2')}
              onChange={(e) => handleCheckboxChange(onServiceLineChange, activeServiceLines, 'Service Option 2', e.target.checked)} />
            <span className="ml-2 text-gray-700">Service Option 2</span></label></li>
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded"
              checked={activeServiceLines.includes('Service Option 3')}
              onChange={(e) => handleCheckboxChange(onServiceLineChange, activeServiceLines, 'Service Option 3', e.target.checked)} />
            <span className="ml-2 text-gray-700">Service Option 3</span></label></li>
        </FilterSection>

        <FilterSection title="Industry" isOpen={openSections.industries} toggleOpen={() => toggleSection('industries')} count={3}>
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded"
              checked={activeIndustries.includes('Industry A')}
              onChange={(e) => handleCheckboxChange(onIndustryChange, activeIndustries, 'Industry A', e.target.checked)} />
            <span className="ml-2 text-gray-700">Industry A</span></label></li>
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded"
              checked={activeIndustries.includes('Industry B')}
              onChange={(e) => handleCheckboxChange(onIndustryChange, activeIndustries, 'Industry B', e.target.checked)} />
            <span className="ml-2 text-gray-700">Industry B</span></label></li>
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded"
              checked={activeIndustries.includes('Industry C')}
              onChange={(e) => handleCheckboxChange(onIndustryChange, activeIndustries, 'Industry C', e.target.checked)} />
            <span className="ml-2 text-gray-700">Industry C</span></label></li>
        </FilterSection>

        <FilterSection title="Region" isOpen={openSections.regions} toggleOpen={() => toggleSection('regions')} count={4}>
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded"
              checked={activeRegions.includes('North America')}
              onChange={(e) => handleCheckboxChange(onRegionChange, activeRegions, 'North America', e.target.checked)} />
            <span className="ml-2 text-gray-700">North America</span></label></li>
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded"
              checked={activeRegions.includes('Europe')}
              onChange={(e) => handleCheckboxChange(onRegionChange, activeRegions, 'Europe', e.target.checked)} />
            <span className="ml-2 text-gray-700">Europe</span></label></li>
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded"
              checked={activeRegions.includes('Asia Pacific')}
              onChange={(e) => handleCheckboxChange(onRegionChange, activeRegions, 'Asia Pacific', e.target.checked)} />
            <span className="ml-2 text-gray-700">Asia Pacific</span></label></li>
        </FilterSection>

        <FilterSection title="Date" isOpen={openSections.dates} toggleOpen={() => toggleSection('dates')}>
          <li>
            <input
              type="date"
              value={activeDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="p-2 rounded border border-gray-300 bg-gray-50 text-gray-900 text-sm w-full
                         focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:border-transparent"
            />
          </li>
        </FilterSection>
      </div>
    </div>
  );
};

export default FilterBy;