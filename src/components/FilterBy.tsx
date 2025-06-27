// src/components/FilterBy.tsx
import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface FilterByProps {
  isSidebarExpanded: boolean; // Prop to get sidebar state for left offset
}

const FilterBy: React.FC<FilterByProps> = ({ isSidebarExpanded }) => {
  // State for collapsible filter sections
  const [showContentTypes, setShowContentTypes] = useState(true);
  const [showServiceLines, setShowServiceLines] = useState(true);
  const [showIndustries, setShowIndustries] = useState(true);
  const [showRegions, setShowRegions] = useState(true);
  const [showDates, setShowDates] = useState(true);

  // Helper for toggle functions
  const toggleSection = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter((prev) => !prev);
  };

  const FilterSection: React.FC<{ title: string; children: React.ReactNode; isOpen: boolean; toggleOpen: () => void }> = ({ title, children, isOpen, toggleOpen }) => (
    <div className="mb-4 last:mb-0">
      <div
        className="flex justify-between items-center text-text-medium-gray hover:text-text-dark-gray cursor-pointer py-2 px-3 rounded-lg transition-colors duration-200"
        onClick={toggleOpen}
      >
        <span className="font-semibold text-base">{title}</span>
        {isOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
      </div>
      {isOpen && <ul className="mt-2 ml-4 space-y-2 text-text-light-gray text-sm">{children}</ul>}
    </div>
  );

  // Calculate left position dynamically
  const leftOffset = isSidebarExpanded ? '256px' : '80px'; // w-64 = 256px, w-20 = 80px

  return (
    <div
      className={`w-64 bg-white p-4 shadow-sm flex flex-col overflow-y-auto hidden md:block border-r border-strapi-light-gray
        h-[calc(100vh-64px)] fixed top-16 transition-all duration-300 ease-in-out z-10
      `}
      style={{ left: leftOffset }}
    >
      <h3 className="text-xl font-bold text-text-dark-gray mb-6">Filter By</h3>

      <div className="flex-1 overflow-y-auto pr-2">
        <FilterSection title="Content Type" isOpen={showContentTypes} toggleOpen={() => toggleSection(setShowContentTypes)}>
          <li>
            <label className="flex items-center">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-strapi-green-light rounded" defaultChecked />
              <span className="ml-2">Proposals</span>
            </label>
          </li>
        </FilterSection>

        <FilterSection title="Service Line" isOpen={showServiceLines} toggleOpen={() => toggleSection(setShowServiceLines)}>
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
          <li>Option 4</li>
          <li>Option 5</li>
        </FilterSection>

        <FilterSection title="Industry" isOpen={showIndustries} toggleOpen={() => toggleSection(setShowIndustries)}>
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
          <li>Option 4</li>
          <li>Option 5</li>
        </FilterSection>

        <FilterSection title="Region" isOpen={showRegions} toggleOpen={() => toggleSection(setShowRegions)}>
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
          <li>Option 4</li>
          <li>Option 5</li>
        </FilterSection>

        <FilterSection title="Date" isOpen={showDates} toggleOpen={() => toggleSection(setShowDates)}>
          <li>
            <input type="date" placeholder="dd-mm-yyyy" className="p-1 rounded border border-gray-300 bg-gray-50 text-gray-900 text-sm w-full" />
          </li>
        </FilterSection>
      </div>
    </div>
  );
};

export default FilterBy;