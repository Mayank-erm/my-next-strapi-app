// src/components/Header.tsx (UPDATED: Universal Search logic streamlined with URL query params)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MeiliSearch } from 'meilisearch';
import UserDropdown from './UserDropdown';
import { useRouter } from 'next/router';

// Define the interface for Strapi proposals
interface StrapiProposal {
  id: number;
  opportunityNumber: string;
  proposalName: string;
  clientName: string;
  pstatus: string;
  value: string | number;
  description?: any[] | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  proposedBy: string | null;
  chooseEmployee: number | null;
}

// Props for Header component - now explicitly takes the global searchTerm from Layout
interface HeaderProps {
  searchTerm: string; // The global search term from URL
  isLoading: boolean;
  onResultClick?: (proposal: StrapiProposal) => void;
}

// --- MeiliSearch Configuration ---
const MEILISEARCH_HOST = 'http://localhost:7700';
const MEILISEARCH_API_KEY = 'masterKey';

const searchClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

// Simple debouncing helper
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const Header: React.FC<HeaderProps> = ({ searchTerm, isLoading: propIsLoading, onResultClick }) => {
  const router = useRouter();
  const [internalSearchTerm, setInternalSearchTerm] = useState<string>(''); // Internal state for search modal input
  const [autocompleteResults, setAutocompleteResults] = useState<StrapiProposal[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activeFilterPills, setActiveFilterPills] = useState<string[]>([]);

  // Initialize internalSearchTerm from prop when modal opens
  useEffect(() => {
    if (isSearchModalOpen) {
      setInternalSearchTerm(searchTerm); // Sync with global search term from URL
    }
  }, [isSearchModalOpen, searchTerm]);

  const filterCategories = {
    'Service Line': ['Consulting', 'Engineering', 'Digital Solutions'],
    'Industry': ['Retail', 'Energy', 'Healthcare'],
    'Region': ['North America', 'Europe', 'Asia Pacific'],
    'Client Name': ['Globex Inc.', 'Stark Industries Inc.', 'Acme Corp Inc.'],
  };

  const handleFilterPillClick = (category: string, value: string) => {
    const newActivePills = activeFilterPills.includes(value)
      ? activeFilterPills.filter(pill => pill !== value)
      : [...activeFilterPills, value];
    setActiveFilterPills(newActivePills);
    debouncedAutocompleteSearch(internalSearchTerm);
  };

  const performAutocompleteSearch = async (query: string) => {
    if (query.length === 0 && activeFilterPills.length === 0) {
      setAutocompleteResults([]);
      return;
    }

    try {
      const meiliFilters = activeFilterPills.map(pill => {
        if (filterCategories['Service Line'].includes(pill)) return `service_line = "${pill}"`;
        if (filterCategories['Industry'].includes(pill)) return `industry = "${pill}"`;
        if (filterCategories['Region'].includes(pill)) return `region = "${pill}"`;
        if (filterCategories['Client Name'].includes(pill)) return `client_name = "${pill}"`;
        return '';
      }).filter(Boolean);

      const results = await searchClient.index('proposals').search(query, {
        limit: 10,
        filter: meiliFilters.length > 0 ? meiliFilters : undefined,
      });
      setAutocompleteResults(results.hits as StrapiProposal[] || []);
    } catch (error) {
      console.error("MeiliSearch error during autocomplete search:", error);
      setAutocompleteResults([]);
    }
  };

  const debouncedAutocompleteSearch = useCallback(debounce(performAutocompleteSearch, 300), [activeFilterPills]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInternalSearchTerm(query);
    debouncedAutocompleteSearch(query);
  };

  const handleResultClick = (proposal: StrapiProposal) => {
    if (onResultClick) {
        onResultClick(proposal);
    }
    closeSearchModal(false);
  };

  // Function to close the modal and optionally trigger a global search via URL
  const closeSearchModal = (triggerGlobalSearch: boolean = false) => {
    setIsSearchModalOpen(false);
    setAutocompleteResults([]);
    setActiveFilterPills([]);

    if (triggerGlobalSearch && internalSearchTerm) {
        // Construct new query object
        const newQuery = { ...router.query, searchTerm: internalSearchTerm };
        // Clean up empty search term
        if (!internalSearchTerm) delete newQuery.searchTerm;
        
        router.push({
            pathname: '/content-management', // Always redirect to CMS page for global search results
            query: newQuery
        }, undefined, { shallow: true });
    }
    // internalSearchTerm is reset by useEffect when modal closes via `isSearchModalOpen` change
  };

  // Keyboard Shortcut Logic for opening/closing modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (event.key === 'Escape' && isSearchModalOpen) {
        closeSearchModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchModalOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchModalOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchModalOpen]);


  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-white shadow-sm border-b border-strapi-light-gray
                 focus:outline-none focus:ring-0 focus:border-transparent"
      tabIndex={-1}
    >
      {/* Left section: Logo and Title */}
      <div className="flex items-center">
        <div className="w-8 h-8 mr-2 overflow-hidden flex items-center justify-center">
          <img src="/images/ERM_Vertical_Green_Black_RGB.svg" alt="ERM Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-xl font-semibold text-text-dark-gray">Commercial Content Hub</h1>
      </div>

      {/* Center section: Search bar (click to open modal) */}
      <div className="flex-1 mx-8 max-w-lg">
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-500 text-left
                     focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm flex items-center justify-between"
          aria-label="Open search"
        >
          <span className="flex items-center">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
            Search by keywords, titles, client name
          </span>
          <span className="text-xs text-gray-400 border border-gray-300 px-2 py-0.5 rounded-md hidden md:block">
            Ctrl K
          </span>
        </button>
      </div>

      {/* Right section: Icons and user info */}
      <div className="flex items-center divide-x divide-gray-200">
        <div className="pr-4">
          <BellIcon className="h-6 w-6 text-text-medium-gray cursor-pointer
                              focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2"
                     tabIndex={0}
          />
        </div>

        <div className="pl-4">
          <UserDropdown />
        </div>
      </div>

      {/* --- Search Modal Overlay --- */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-custom-overlay backdrop-blur-sm flex justify-center items-start pt-20 pb-10 z-50 overflow-y-auto">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 my-auto overflow-hidden">
            {/* Modal Header/Search Input */}
            <div className="p-4 border-b border-gray-200 flex items-center">
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-500 mr-3" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                className="flex-1 text-lg border-none focus:ring-0 focus:outline-none"
                value={internalSearchTerm}
                onChange={handleSearchInputChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        closeSearchModal(true); // Trigger global search on Enter
                    }
                }}
              />
              <button
                onClick={() => closeSearchModal(false)}
                className="ml-3 p-2 rounded-md hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200"
                aria-label="Close search"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <span className="ml-2 text-xs text-gray-400 border border-gray-300 px-2 py-0.5 rounded-md hidden md:inline-block">ESC</span>
            </div>

            {/* Modal Body / Search Results / Categories */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {propIsLoading && internalSearchTerm.length > 0 ? (
                <p className="text-gray-500 text-center py-4">Searching...</p>
              ) : internalSearchTerm.length > 0 && autocompleteResults.length > 0 ? (
                <>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Search Results</h4>
                  {autocompleteResults.map((hit: StrapiProposal) => (
                    <div
                      key={hit.id}
                      className="p-2 my-1 rounded-md hover:bg-gray-100 cursor-pointer text-gray-800 text-base"
                      onClick={() => handleResultClick(hit)}
                    >
                      {hit.proposalName} {hit.clientName ? `- ${hit.clientName}` : ''} ({hit.opportunityNumber})
                    </div>
                  ))}
                </>
              ) : internalSearchTerm.length > 0 && autocompleteResults.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No results found for "{internalSearchTerm}"</p>
              ) : (
                <p className="text-gray-500 text-center py-4">Start typing to search...</p>
              )}
              
              {/* "Narrow down by section" / Categories */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Narrow down by section</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(filterCategories).map(([category, options]) => (
                    <div key={category}>
                      <p className="text-xs font-medium text-gray-600 mb-1">{category}</p>
                      <div className="flex flex-wrap gap-2">
                        {options.map(option => (
                          <button
                            key={option}
                            onClick={() => handleFilterPillClick(category, option)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors
                                        ${activeFilterPills.includes(option)
                                          ? 'bg-strapi-green-light text-white shadow-sm'
                                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                                        focus:outline-none focus:ring-2 focus:ring-gray-300`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;