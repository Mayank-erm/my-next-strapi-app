// src/components/FilterBy.tsx (Updated to replicate filter design from sample image)
import React, { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Imported new icons

interface FilterByProps {
  isSidebarExpanded: boolean;
}

const FilterBy: React.FC<FilterByProps> = ({ isSidebarExpanded }) => {
  // Set all to false except contentType by default
  const [openSections, setOpenSections] = useState({
    contentType: true, // Content Type remains open as per previous request
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

  // Helper component for each filter section
  const FilterSection: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; toggleOpen: () => void; count?: number }> = ({ title, children, isOpen, toggleOpen, count }) => (
    <div className="mb-2 last:mb-0"> {/* Adjusted margin for closer sections */}
      <button
        className="flex items-center justify-between w-full text-text-dark-gray hover:text-strapi-green-dark cursor-pointer py-2 px-1 focus:outline-none focus:ring-0" // Removed default ring for a cleaner look on section title buttons
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
        {count !== undefined && <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{count}</span>} {/* Display count */}
      </button>
      {isOpen && <ul className="mt-2 ml-4 space-y-1 text-text-light-gray text-sm animate-fade-in">{children}</ul>} {/* Adjusted ml for checkboxes */}
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
        <h3 className="text-xl font-bold text-text-dark-gray">Filter By</h3> {/* Kept "Filter By" title */}
        <button className="flex items-center text-sm text-gray-500 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-md px-2 py-1">
          <XCircleIcon className="h-4 w-4 mr-1" />
          Clear
        </button>
      </div>

      {/* Search Input for filters */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-500
                     focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <FilterSection title="Content Type" isOpen={openSections.contentType} toggleOpen={() => toggleSection('contentType')} count={1}> {/* Placeholder count */}
          <li>
            <label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded focus:ring-strapi-green-light focus:outline-none" defaultChecked />
              <span className="ml-2 text-gray-700">Proposals</span>
            </label>
          </li>
        </FilterSection>

        <FilterSection title="Service Line" isOpen={openSections.serviceLine} toggleOpen={() => toggleSection('serviceLine')} count={5}> {/* Placeholder count */}
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"><input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded" /><span className="ml-2 text-gray-700">Service Option 1</span></label></li>
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"><input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded" /><span className="ml-2 text-gray-700">Service Option 2</span></label></li>
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"><input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded" /><span className="ml-2 text-gray-700">Service Option 3</span></label></li>
        </FilterSection>

        <FilterSection title="Industry" isOpen={openSections.industries} toggleOpen={() => toggleSection('industries')} count={3}> {/* Placeholder count */}
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"><input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded" /><span className="ml-2 text-gray-700">Industry A</span></label></li>
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"><input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded" /><span className="ml-2 text-gray-700">Industry B</span></label></li>
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"><input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded" /><span className="ml-2 text-gray-700">Industry C</span></label></li>
        </FilterSection>

        <FilterSection title="Region" isOpen={openSections.regions} toggleOpen={() => toggleSection('regions')} count={4}> {/* Placeholder count */}
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"><input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded" /><span className="ml-2 text-gray-700">North America</span></label></li>
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"><input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded" /><span className="ml-2 text-gray-700">Europe</span></label></li>
          <li><label className="flex items-center py-1.5 px-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"><input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded" /><span className="ml-2 text-gray-700">Asia Pacific</span></label></li>
        </FilterSection>

        <FilterSection title="Date" isOpen={openSections.dates} toggleOpen={() => toggleSection('dates')}>
          <li>
            <input
              type="date"
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