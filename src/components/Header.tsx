// src/components/Header.tsx - CLEAN VERSION WITH GREEN PALETTE
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MeiliSearch } from 'meilisearch';
import UserDropdown from './UserDropdown';
import { useRouter } from 'next/router';
import { StrapiProposal } from '@/types/strapi';

// MeiliSearch client
const searchClient = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY || 'masterKey',
});

// Simple debouncing helper
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

interface HeaderProps {
  searchTerm: string;
  isLoading: boolean;
  onResultClick?: (proposal: StrapiProposal) => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, isLoading: propIsLoading, onResultClick }) => {
  const router = useRouter();
  const [internalSearchTerm, setInternalSearchTerm] = useState<string>('');
  const [autocompleteResults, setAutocompleteResults] = useState<StrapiProposal[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Popular searches
  const popularSearches = ['Consulting', 'Engineering', 'Proposal', 'Energy', 'Digital Solutions'];

  // Initialize search term from prop when modal opens
  useEffect(() => {
    if (isSearchModalOpen) {
      setInternalSearchTerm(searchTerm);
    }
  }, [isSearchModalOpen, searchTerm]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
          setRecentSearches(JSON.parse(saved));
        }
      }
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
    }
  }, []);

  // Enhanced search function
  const performAutocompleteSearch = async (query: string) => {
    if (query.length === 0) {
      setAutocompleteResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchClient.index('document_stores').search(query, {
        limit: 6,
        attributesToRetrieve: [
          'id', 'documentId', 'SF_Number', 'Unique_Id', 'Client_Name',
          'Document_Type', 'Industry', 'Region', 'publishedAt', 'updatedAt'
        ],
      });

      // Transform results
      const transformedResults: StrapiProposal[] = (results.hits || []).map((hit: any) => ({
        id: hit.id,
        documentId: hit.documentId || hit.id.toString(),
        unique_id: hit.Unique_Id || hit.unique_id || hit.SF_Number || '',
        SF_Number: hit.SF_Number || '',
        Client_Name: hit.Client_Name || '',
        Document_Type: hit.Document_Type || '',
        Industry: hit.Industry || '',
        Region: hit.Region || '',
        publishedAt: hit.publishedAt || new Date().toISOString(),
        updatedAt: hit.updatedAt || new Date().toISOString(),
        // Fill required fields with defaults
        Client_Type: '',
        Client_Contact: '',
        Client_Contact_Title: '',
        Client_Journey: '',
        Document_Sub_Type: '',
        Document_Value_Range: '',
        Document_Outcome: '',
        Last_Stage_Change_Date: '',
        Sub_Industry: '',
        Service: '',
        Sub_Service: '',
        Business_Unit: '',
        Country: '',
        State: '',
        City: '',
        Author: '',
        PIC: '',
        PM: '',
        Keywords: '',
        Commercial_Program: '',
        Project_Team: null,
        SMEs: null,
        Competitors: '',
        createdAt: hit.createdAt || new Date().toISOString(),
        Description: [],
        Attachments: null,
        Pursuit_Team: null,
        documentUrl: '',
        value: 0,
        proposalName: hit.SF_Number || hit.Unique_Id || '',
      }));

      setAutocompleteResults(transformedResults);
    } catch (error) {
      console.error("MeiliSearch error:", error);
      setAutocompleteResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedAutocompleteSearch = useCallback(debounce(performAutocompleteSearch, 300), []);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInternalSearchTerm(query);
    debouncedAutocompleteSearch(query);
  };

  const handleResultClick = (proposal: StrapiProposal) => {
    if (onResultClick) {
      onResultClick(proposal);
    }
    closeSearchModal();
  };

  const handleSearchSubmit = () => {
    if (internalSearchTerm.trim()) {
      // Add to recent searches
      const updatedSearches = [internalSearchTerm, ...recentSearches.filter(s => s !== internalSearchTerm)].slice(0, 5);
      setRecentSearches(updatedSearches);
      
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
        }
      } catch (error) {
        console.warn('Failed to save recent searches:', error);
      }

      // Navigate to search results
      router.push(`/?searchTerm=${encodeURIComponent(internalSearchTerm)}`);
      closeSearchModal();
    }
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
    setAutocompleteResults([]);
  };

  const handleQuickSearch = (searchText: string) => {
    setInternalSearchTerm(searchText);
    setTimeout(() => {
      debouncedAutocompleteSearch(searchText);
    }, 100);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (event.key === 'Escape' && isSearchModalOpen) {
        closeSearchModal();
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
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-white shadow-sm border-b border-strapi-light-gray">
      {/* Left section: Logo and Title */}
      <div className="flex items-center">
        <div className="w-8 h-8 mr-2 overflow-hidden flex items-center justify-center">
          <img src="/images/ERM_Vertical_Green_Black_RGB.svg" alt="ERM Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-xl font-semibold text-text-dark-gray">Commercial Content Hub</h1>
      </div>

      {/* Center section: Modern Search bar */}
      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full group relative bg-gray-50/50 hover:bg-gray-100/50 border border-gray-200/60 hover:border-gray-300/60 rounded-xl px-4 py-3 transition-all duration-200 ease-out hover:shadow-sm"
            style={{ paddingRight: searchTerm ? '120px' : '80px' }}
          >
            <div className="flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-hover:text-strapi-green-light transition-colors mr-3" />
              <span className="text-sm text-gray-500 group-hover:text-gray-700 truncate">
                {searchTerm ? (
                  <>
                    <span className="font-medium text-strapi-green-light">"{searchTerm}"</span>
                    <span className="text-gray-400 ml-2">— Press ⌘K to modify</span>
                  </>
                ) : (
                  'Search documents, proposals, clients...'
                )}
              </span>
            </div>
            
            {/* Floating action indicators */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              {searchTerm && (
                <>
                  <span className="bg-strapi-green-light text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                    Active
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push('/');
                    }}
                    className="p-1 rounded-full bg-gray-200 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors shadow-sm"
                    title="Clear search"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </>
              )}
              <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-mono">
                ⌘K
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Right section: User Profile only */}
      <div className="flex items-center">
        <UserDropdown />
      </div>

      {/* Search Modal */}
      {isSearchModalOpen && (
        <div 
          className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex justify-center items-start pt-16 pb-10 z-50 overflow-y-auto animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeSearchModal();
            }
          }}
        >
          <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl mx-4 my-auto overflow-hidden border border-gray-200/50 animate-scale-in">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Search Documents</h3>
                  <p className="text-sm text-gray-500 mt-1">Find proposals, reports, and client documents</p>
                </div>
                <button
                  onClick={closeSearchModal}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Search Input */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by document ID, client name, industry, type..."
                  value={internalSearchTerm}
                  onChange={handleSearchInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-strapi-green-light focus:border-strapi-green-light text-base placeholder-gray-400 transition-all"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  {internalSearchTerm && (
                    <button
                      onClick={() => {
                        setInternalSearchTerm('');
                        setAutocompleteResults([]);
                      }}
                      className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                      title="Clear"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                  {isSearching && (
                    <div className="animate-spin h-4 w-4 border-2 border-strapi-green-light border-t-transparent rounded-full"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="max-h-96 overflow-y-auto">
              {/* Search Results */}
              {isSearching && internalSearchTerm.length > 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="animate-spin h-5 w-5 border-2 border-strapi-green-light border-t-transparent rounded-full"></div>
                    <span className="font-medium">Searching documents...</span>
                  </div>
                </div>
              ) : internalSearchTerm.length > 0 && autocompleteResults.length > 0 ? (
                <div>
                  <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Found {autocompleteResults.length} results
                    </p>
                  </div>
                  {autocompleteResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="p-4 border-b border-gray-50 hover:bg-green-50/50 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-strapi-green-dark">
                              {result.unique_id || result.SF_Number || 'N/A'}
                            </h4>
                            {result.Document_Type && (
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                {result.Document_Type}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-1">
                            <span className="font-medium">Client:</span> {result.Client_Name || 'N/A'} • 
                            <span className="font-medium"> Industry:</span> {result.Industry || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Region: {result.Region || 'N/A'}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400 group-hover:text-strapi-green-light font-medium">
                          View →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : internalSearchTerm.length > 0 && autocompleteResults.length === 0 && !isSearching ? (
                <div className="py-12 text-center text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-1">No documents found</p>
                  <p className="text-sm text-gray-500">Try different search terms or check your spelling</p>
                </div>
              ) : (
                /* Default state */
                <div className="p-6 space-y-6">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">Recent Searches</h4>
                        <button
                          onClick={() => {
                            setRecentSearches([]);
                            if (typeof window !== 'undefined') {
                              localStorage.removeItem('recentSearches');
                            }
                          }}
                          className="text-xs text-gray-500 hover:text-red-600 hover:underline"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.slice(0, 3).map((search, index) => (
                          <div key={index} className="flex items-center justify-between group">
                            <button
                              onClick={() => handleQuickSearch(search)}
                              className="flex-1 text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              {search}
                            </button>
                            <button
                              onClick={() => {
                                const updated = recentSearches.filter((_, i) => i !== index);
                                setRecentSearches(updated);
                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('recentSearches', JSON.stringify(updated));
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                              title="Remove"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Popular Searches</h4>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickSearch(search)}
                          className="px-3 py-2 bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-strapi-green-dark text-sm rounded-lg transition-colors font-medium"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/30">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 bg-white border border-gray-200 rounded shadow-sm">Enter</kbd>
                    <span>to search</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 bg-white border border-gray-200 rounded shadow-sm">↑↓</kbd>
                    <span>to navigate</span>
                  </span>
                </div>
                <span className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-white border border-gray-200 rounded shadow-sm">ESC</kbd>
                  <span>to close</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;