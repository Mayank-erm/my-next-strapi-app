// src/components/cms/AdvancedFilterSidebar.tsx - CLEAN FIXED VERSION

import React, { useState, useRef, useEffect } from 'react';
import {
  XMarkIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  DocumentTextIcon,
  TagIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Bars3Icon } from '@heroicons/react/24/solid';
import DateRangeFilter from './DateRangeFilter';
import RangeSliderFilter from './RangeSliderFilter';

// Import the FilterOptions interface
export interface FilterOptions {
  clientTypes: string[];
  documentTypes: string[];
  documentSubTypes: string[];
  industries: string[];
  subIndustries: string[];
  services: string[];
  subServices: string[];
  businessUnits: string[];
  regions: string[];
  countries: string[];
  states: string[];
  cities: string[];
}

interface AdvancedFilters {
  clientTypes: string[];
  documentTypes: string[];
  documentSubTypes: string[];
  industries: string[];
  subIndustries: string[];
  services: string[];
  subServices: string[];
  businessUnits: string[];
  regions: string[];
  countries: string[];
  states: string[];
  cities: string[];
  dateRange: [Date | null, Date | null];
  valueRange: [number, number];
}

interface FilterSidebarProps {
  filters: AdvancedFilters;
  onUpdateFilter: (filterKey: keyof AdvancedFilters, value: any) => void;
  onClearAll: () => void;
  activeFiltersCount: number;
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  
  // NEW PROPS FOR DYNAMIC OPTIONS
  filterOptions?: FilterOptions;
  isLoadingOptions?: boolean;
  onRefreshOptions?: () => void;
  filterOptionsError?: string | null;
}

// SearchableMultiSelect component
interface SearchableMultiSelectProps {
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  icon?: React.ElementType;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder,
  icon: Icon,
  isLoading = false,
  onRefresh,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options
    .filter(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 50);

  const handleToggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(item => item !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleSelectAll = () => {
    onChange(filteredOptions);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const displayText = selectedValues.length === 0 
    ? placeholder 
    : selectedValues.length === 1 
      ? selectedValues[0]
      : `${selectedValues.length} selected`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-erm-primary focus:border-erm-primary transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
      >
        <div className="flex items-center flex-1 min-w-0">
          {Icon && <Icon className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />}
          <span className="text-left text-sm text-gray-700 truncate">
            {isLoading ? 'Loading options...' : displayText}
          </span>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          {selectedValues.length > 0 && !isLoading && (
            <span className="bg-erm-primary text-white text-xs px-2 py-1 rounded-full font-medium">
              {selectedValues.length}
            </span>
          )}
          {isLoading && (
            <div className="animate-spin h-4 w-4 border-2 border-erm-primary border-t-transparent rounded-full"></div>
          )}
          <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-erm-primary focus:border-erm-primary"
              />
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <div className="space-x-2">
                <button
                  onClick={handleSelectAll}
                  disabled={filteredOptions.length === 0}
                  className="text-xs text-erm-primary hover:text-erm-dark font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Select All ({filteredOptions.length})
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={selectedValues.length === 0}
                  className="text-xs text-gray-500 hover:text-red-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All
                </button>
              </div>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="text-xs text-gray-500 hover:text-erm-primary font-medium flex items-center"
                  title="Refresh options"
                >
                  <ArrowPathIcon className="h-3 w-3 mr-1" />
                  Refresh
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              <div className="p-1">
                {filteredOptions.map((option) => (
                  <label
                    key={option}
                    className="flex items-center w-full px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors group"
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(option)}
                        onChange={() => handleToggleOption(option)}
                        className="sr-only"
                      />
                      <div className={`
                        w-4 h-4 border-2 rounded flex items-center justify-center transition-all duration-200
                        ${selectedValues.includes(option) 
                          ? 'bg-erm-primary border-erm-primary' 
                          : 'border-gray-300 group-hover:border-gray-400'
                        }
                      `}>
                        {selectedValues.includes(option) && (
                          <CheckIcon className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                    <span className="ml-3 text-sm text-gray-700 flex-1 truncate">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AdvancedFilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onUpdateFilter,
  onClearAll,
  activeFiltersCount,
  isOpen,
  onToggle,
  isMobile = false,
  filterOptions,
  isLoadingOptions = false,
  onRefreshOptions,
  filterOptionsError,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    client: true,
    document: true,
    business: false,
    location: false,
    dateValue: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const FilterSection: React.FC<{
    title: string;
    icon: React.ElementType;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    count?: number;
  }> = ({ title, icon: Icon, isExpanded, onToggle, children, count }) => (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-gray-900">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="bg-erm-primary text-white text-xs px-2 py-1 rounded-full font-medium">
              {count}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );

  if (!isOpen && !isMobile) return null;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-erm-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-erm-primary to-erm-dark flex items-center justify-center">
              <FunnelIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Advanced Filters</h2>
              <p className="text-xs text-gray-500">
                {isLoadingOptions ? 'Loading options...' : 'Live data from search index'}
              </p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="text-sm text-gray-600">
            {activeFiltersCount > 0 ? (
              <span className="font-medium text-erm-primary">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
              </span>
            ) : (
              <span>No filters applied</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onRefreshOptions && (
              <button
                onClick={onRefreshOptions}
                disabled={isLoadingOptions}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-erm-primary rounded transition-colors disabled:opacity-50"
                title="Refresh filter options"
              >
                <ArrowPathIcon className={`h-3 w-3 ${isLoadingOptions ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
            {activeFiltersCount > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs text-white bg-red-500 hover:bg-red-600 rounded-md font-medium transition-colors"
              >
                <ArrowPathIcon className="h-3 w-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {filterOptionsError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start">
            <span>{filterOptionsError}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <FilterSection
          title="Client Information"
          icon={BuildingOfficeIcon}
          isExpanded={expandedSections.client}
          onToggle={() => toggleSection('client')}
          count={filters.clientTypes.length}
        >
          <SearchableMultiSelect
            options={filterOptions?.clientTypes || []}
            selectedValues={filters.clientTypes}
            onChange={(values) => onUpdateFilter('clientTypes', values)}
            placeholder="Select client types..."
            icon={BuildingOfficeIcon}
            isLoading={isLoadingOptions}
            onRefresh={onRefreshOptions}
          />
        </FilterSection>

        <FilterSection
          title="Document Classification"
          icon={DocumentTextIcon}
          isExpanded={expandedSections.document}
          onToggle={() => toggleSection('document')}
          count={filters.documentTypes.length + filters.documentSubTypes.length}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Document Type</label>
              <SearchableMultiSelect
                options={filterOptions?.documentTypes || []}
                selectedValues={filters.documentTypes}
                onChange={(values) => onUpdateFilter('documentTypes', values)}
                placeholder="Select document types..."
                icon={DocumentTextIcon}
                isLoading={isLoadingOptions}
                onRefresh={onRefreshOptions}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Document Sub-Type</label>
              <SearchableMultiSelect
                options={filterOptions?.documentSubTypes || []}
                selectedValues={filters.documentSubTypes}
                onChange={(values) => onUpdateFilter('documentSubTypes', values)}
                placeholder="Select sub-types..."
                icon={TagIcon}
                isLoading={isLoadingOptions}
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection
          title="Business & Service"
          icon={Bars3Icon}
          isExpanded={expandedSections.business}
          onToggle={() => toggleSection('business')}
          count={filters.industries.length + filters.subIndustries.length + filters.services.length + filters.subServices.length + filters.businessUnits.length}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Industry</label>
              <SearchableMultiSelect
                options={filterOptions?.industries || []}
                selectedValues={filters.industries}
                onChange={(values) => onUpdateFilter('industries', values)}
                placeholder="Select industries..."
                isLoading={isLoadingOptions}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Sub-Industry</label>
              <SearchableMultiSelect
                options={filterOptions?.subIndustries || []}
                selectedValues={filters.subIndustries}
                onChange={(values) => onUpdateFilter('subIndustries', values)}
                placeholder="Select sub-industries..."
                isLoading={isLoadingOptions}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Service</label>
              <SearchableMultiSelect
                options={filterOptions?.services || []}
                selectedValues={filters.services}
                onChange={(values) => onUpdateFilter('services', values)}
                placeholder="Select services..."
                isLoading={isLoadingOptions}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Sub-Service</label>
              <SearchableMultiSelect
                options={filterOptions?.subServices || []}
                selectedValues={filters.subServices}
                onChange={(values) => onUpdateFilter('subServices', values)}
                placeholder="Select sub-services..."
                isLoading={isLoadingOptions}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Business Unit</label>
              <SearchableMultiSelect
                options={filterOptions?.businessUnits || []}
                selectedValues={filters.businessUnits}
                onChange={(values) => onUpdateFilter('businessUnits', values)}
                placeholder="Select business units..."
                isLoading={isLoadingOptions}
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection
          title="Location"
          icon={MapPinIcon}
          isExpanded={expandedSections.location}
          onToggle={() => toggleSection('location')}
          count={filters.regions.length + filters.countries.length + filters.states.length + filters.cities.length}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Region</label>
              <SearchableMultiSelect
                options={filterOptions?.regions || []}
                selectedValues={filters.regions}
                onChange={(values) => onUpdateFilter('regions', values)}
                placeholder="Select regions..."
                icon={MapPinIcon}
                isLoading={isLoadingOptions}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Country</label>
              <SearchableMultiSelect
                options={filterOptions?.countries || []}
                selectedValues={filters.countries}
                onChange={(values) => onUpdateFilter('countries', values)}
                placeholder="Select countries..."
                isLoading={isLoadingOptions}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">State</label>
              <SearchableMultiSelect
                options={filterOptions?.states || []}
                selectedValues={filters.states}
                onChange={(values) => onUpdateFilter('states', values)}
                placeholder="Select states..."
                isLoading={isLoadingOptions}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">City</label>
              <SearchableMultiSelect
                options={filterOptions?.cities || []}
                selectedValues={filters.cities}
                onChange={(values) => onUpdateFilter('cities', values)}
                placeholder="Select cities..."
                isLoading={isLoadingOptions}
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection
          title="Date & Value Range"
          icon={CalendarDaysIcon}
          isExpanded={expandedSections.dateValue}
          onToggle={() => toggleSection('dateValue')}
          count={(filters.dateRange[0] && filters.dateRange[1] ? 1 : 0) + (filters.valueRange[0] !== 0 || filters.valueRange[1] !== 1000000 ? 1 : 0)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Last Stage Change Date</label>
              <DateRangeFilter
                dateRange={filters.dateRange}
                setDateRange={(range) => onUpdateFilter('dateRange', range)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Document Value Range</label>
              <RangeSliderFilter
                label="Value Range"
                min={0}
                max={1000000}
                step={10000}
                range={filters.valueRange}
                setRange={(range) => onUpdateFilter('valueRange', range)}
                isCurrency={true}
              />
            </div>
          </div>
        </FilterSection>
      </div>

      {isMobile && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onToggle}
            className="w-full px-4 py-2 bg-erm-primary text-white rounded-lg hover:bg-erm-dark transition-colors text-sm font-medium"
          >
            Apply Filters ({activeFiltersCount})
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterSidebar;