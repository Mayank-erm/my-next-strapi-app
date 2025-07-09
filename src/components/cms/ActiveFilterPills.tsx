// src/components/cms/ActiveFilterPills.tsx - FUNCTIONAL ACTIVE FILTER PILLS
import React from 'react';
import { XMarkIcon, CalendarDaysIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

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

interface ActiveFilterPillsProps {
  filters: AdvancedFilters;
  searchTerm: string;
  onUpdateFilter: (filterKey: keyof AdvancedFilters, value: any) => void;
  onClearAllFilters: () => void;
  onClearSearch?: () => void;
  showToast?: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
}

const ActiveFilterPills: React.FC<ActiveFilterPillsProps> = ({
  filters,
  searchTerm,
  onUpdateFilter,
  onClearAllFilters,
  onClearSearch,
  showToast,
}) => {
  // Create active filter items
  const activeFilterItems: Array<{
    key: string;
    label: string;
    value: string;
    icon?: React.ElementType;
    onRemove: () => void;
  }> = [];

  // Add search term
  if (searchTerm) {
    activeFilterItems.push({
      key: 'search',
      label: 'Search',
      value: searchTerm,
      onRemove: () => {
        if (onClearSearch) {
          onClearSearch();
        }
        if (showToast) {
          showToast('Search Cleared', 'Search term has been cleared', 'info');
        }
      },
    });
  }

  // Add date range
  if (filters.dateRange[0] && filters.dateRange[1]) {
    const startDate = filters.dateRange[0].toLocaleDateString();
    const endDate = filters.dateRange[1].toLocaleDateString();
    activeFilterItems.push({
      key: 'dateRange',
      label: 'Date Range',
      value: `${startDate} - ${endDate}`,
      icon: CalendarDaysIcon,
      onRemove: () => {
        onUpdateFilter('dateRange', [null, null]);
        if (showToast) {
          showToast('Date Filter Removed', 'Date range filter has been cleared', 'info');
        }
      },
    });
  }

  // Add value range
  if (filters.valueRange[0] !== 0 || filters.valueRange[1] !== 1000000) {
    const formatCurrency = (value: number) => {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
      return `$${value.toLocaleString()}`;
    };
    activeFilterItems.push({
      key: 'valueRange',
      label: 'Value Range',
      value: `${formatCurrency(filters.valueRange[0])} - ${formatCurrency(filters.valueRange[1])}`,
      icon: CurrencyDollarIcon,
      onRemove: () => {
        onUpdateFilter('valueRange', [0, 1000000]);
        if (showToast) {
          showToast('Value Filter Removed', 'Value range filter has been cleared', 'info');
        }
      },
    });
  }

  // Add multi-select filters
  const filterMappings: Array<{
    key: keyof AdvancedFilters;
    label: string;
    values: string[];
  }> = [
    { key: 'clientTypes', label: 'Client Type', values: filters.clientTypes },
    { key: 'documentTypes', label: 'Document Type', values: filters.documentTypes },
    { key: 'documentSubTypes', label: 'Document Sub-Type', values: filters.documentSubTypes },
    { key: 'industries', label: 'Industry', values: filters.industries },
    { key: 'subIndustries', label: 'Sub-Industry', values: filters.subIndustries },
    { key: 'services', label: 'Service', values: filters.services },
    { key: 'subServices', label: 'Sub-Service', values: filters.subServices },
    { key: 'businessUnits', label: 'Business Unit', values: filters.businessUnits },
    { key: 'regions', label: 'Region', values: filters.regions },
    { key: 'countries', label: 'Country', values: filters.countries },
    { key: 'states', label: 'State', values: filters.states },
    { key: 'cities', label: 'City', values: filters.cities },
  ];

  filterMappings.forEach(({ key, label, values }) => {
    values.forEach(value => {
      activeFilterItems.push({
        key: `${key}-${value}`,
        label,
        value,
        onRemove: () => {
          const newValues = values.filter(v => v !== value);
          onUpdateFilter(key, newValues);
          if (showToast) {
            showToast('Filter Removed', `${label} "${value}" has been removed`, 'info');
          }
        },
      });
    });
  });

  // Don't render if no active filters
  if (activeFilterItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-erm-primary/5 to-erm-primary/10 border border-erm-primary/20 rounded-xl p-4 mb-6 animate-slideInFromRight">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-erm-primary font-semibold">
          <span className="text-sm">Active Filters:</span>
          <span className="bg-erm-primary text-white text-xs px-2 py-1 rounded-full font-bold">
            {activeFilterItems.length}
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 flex-1">
          {activeFilterItems.map((item) => (
            <div
              key={item.key}
              className="group flex items-center space-x-2 bg-white border border-erm-primary/30 text-erm-primary px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-erm-primary hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
              onClick={item.onRemove}
              title={`Remove ${item.label}: ${item.value}`}
            >
              {item.icon && (
                <item.icon className="h-3 w-3 flex-shrink-0" />
              )}
              <span className="flex-shrink-0 text-xs font-medium opacity-75">
                {item.label}:
              </span>
              <span className="truncate max-w-32 font-semibold">
                {item.value}
              </span>
              <XMarkIcon className="h-3 w-3 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Clear All Button */}
        <button
          onClick={() => {
            onClearAllFilters();
            if (showToast) {
              showToast('All Filters Cleared', `${activeFilterItems.length} filters have been cleared`, 'success');
            }
          }}
          className="flex items-center space-x-1 bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          title="Clear all active filters"
        >
          <XMarkIcon className="h-3 w-3" />
          <span>Clear All</span>
        </button>
      </div>
    </div>
  );
};

export default ActiveFilterPills;