// src/components/cms/MultiSelectFilter.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface DynamicMultiSelectProps {
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  icon?: React.ElementType;
  isLoading?: boolean;
  onRefresh?: () => void;
  maxDisplayItems?: number;
  showCounts?: boolean;
  optionCounts?: { [key: string]: number };
}

export const DynamicMultiSelectFilter: React.FC<DynamicMultiSelectProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder,
  icon: Icon,
  isLoading = false,
  onRefresh,
  maxDisplayItems = 50,
  showCounts = false,
  optionCounts = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options
    .filter(option => option.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, maxDisplayItems);

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
          {/* Search Header */}
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
            
            {/* Action Buttons */}
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

          {/* Options List */}
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
                    <div className="ml-3 flex-1 flex items-center justify-between">
                      <span className="text-sm text-gray-700 truncate">
                        {option}
                      </span>
                      {showCounts && optionCounts[option] && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({optionCounts[option]})
                        </span>
                      )}
                    </div>
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