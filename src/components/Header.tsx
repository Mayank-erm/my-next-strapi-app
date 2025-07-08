// src/components/Header.tsx - ERM DESIGN SYSTEM
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, SparklesIcon, CommandLineIcon } from '@heroicons/react/24/outline';
import { MeiliSearch } from 'meilisearch';
import UserDropdown from './UserDropdown';
import { useRouter } from 'next/router';
import { StrapiProposal } from '@/types/strapi';

// MeiliSearch client
const searchClient = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY || 'masterKey',
});

// Debouncing helper
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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // ERM-themed popular searches for sustainability
  const popularSearches = [
    { term: 'Environmental Impact Assessment', category: 'Environmental', trending: true },
    { term: 'Carbon Footprint Analysis', category: 'Sustainability', trending: false },
    { term: 'Renewable Energy Solutions', category: 'Energy', trending: true },
    { term: 'ESG Compliance Report', category: 'Governance', trending: false },
    { term: 'Water Resource Management', category: 'Conservation', trending: true },
  ];

  // AI-powered sustainability suggestions
  const sustainabilitySuggestions = [
    'Documents with high environmental impact scores',
    'Recent climate change mitigation strategies',
    'Top-rated sustainability frameworks',
    'Trending carbon reduction initiatives'
  ];

  useEffect(() => {
    if (isSearchModalOpen) {
      setInternalSearchTerm(searchTerm);
    }
  }, [isSearchModalOpen, searchTerm]);

  // Load recent searches
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

  // Enhanced search function with sustainability focus
  const performAutocompleteSearch = async (query: string) => {
    if (query.length === 0) {
      setAutocompleteResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchClient.index('document_stores').search(query, {
        limit: 8,
        attributesToRetrieve: [
          'id', 'documentId', 'SF_Number', 'Unique_Id', 'Client_Name',
          'Document_Type', 'Industry', 'Region', 'publishedAt', 'updatedAt'
        ],
        attributesToHighlight: ['Unique_Id', 'Client_Name', 'Document_Type'],
        highlightPreTag: '<mark class="bg-emerald-200 text-emerald-900 rounded px-1">',
        highlightPostTag: '</mark>',
      });

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
        // Add highlighted results for better UX
        _highlightResults: hit._formatted,
      }));

      setAutocompleteResults(transformedResults);
    } catch (error) {
      console.error("Enhanced search error:", error);
      setAutocompleteResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedAutocompleteSearch = useCallback(debounce(performAutocompleteSearch, 300), []);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInternalSearchTerm(query);
    setFocusedIndex(-1);
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

      router.push(`/?searchTerm=${encodeURIComponent(internalSearchTerm)}`);
      closeSearchModal();
    }
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
    setAutocompleteResults([]);
    setFocusedIndex(-1);
  };

  const handleQuickSearch = (searchText: string) => {
    setInternalSearchTerm(searchText);
    setTimeout(() => {
      debouncedAutocompleteSearch(searchText);
    }, 100);
  };

  // Enhanced keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => 
        prev < autocompleteResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && autocompleteResults[focusedIndex]) {
        handleResultClick(autocompleteResults[focusedIndex]);
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === 'Escape') {
      closeSearchModal();
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchModalOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchModalOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
      <div className="flex items-center justify-between p-4">
        {/* ERM Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#007A5F] to-[#00382C] flex items-center justify-center shadow-sm">
            <img src="/images/ERM_Vertical_Green_Black_RGB.svg" alt="ERM Logo" className="w-6 h-6 filter brightness-0 invert" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">ERM Content Hub</h1>
            <p className="text-xs text-neutral-500 hidden sm:block">Sustainability Document Management</p>
          </div>
        </div>

        {/* Enhanced Search Bar with ERM styling */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="w-full group relative bg-neutral-50/80 hover:bg-neutral-100/80 border border-neutral-200/60 hover:border-[#007A5F]/30 rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out hover:shadow-md"
            >
              <div className="flex items-center">
                <div className="flex items-center space-x-3 flex-1">
                  <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400 group-hover:text-[#007A5F] transition-colors" />
                  <div className="flex-1 text-left">
                    {searchTerm ? (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-[#007A5F]">"{searchTerm}"</span>
                        <span className="text-neutral-400 text-sm">— Press ⌘K to modify</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-neutral-500 group-hover:text-neutral-700">Search sustainability documents...</span>
                        <SparklesIcon className="h-4 w-4 text-[#007A5F] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {searchTerm && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/');
                      }}
                      className="p-1 rounded-full bg-neutral-200 hover:bg-red-100 text-neutral-500 hover:text-red-600 transition-colors"
                      title="Clear search"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  )}
                  <div className="flex items-center bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded-lg font-mono">
                    <CommandLineIcon className="h-3 w-3 mr-1" />
                    ⌘K
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center">
          <UserDropdown />
        </div>
      </div>

      {/* Enhanced Search Modal with ERM styling */}
      {isSearchModalOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-start pt-16 pb-10 z-50 overflow-y-auto animate-erm-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeSearchModal();
            }
          }}
        >
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-3xl mx-4 my-auto overflow-hidden border border-neutral-200/50 animate-erm-scale-in">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-100/50 bg-gradient-to-r from-[#007A5F]/5 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#007A5F] to-[#00382C] flex items-center justify-center">
                    <MagnifyingGlassIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">Smart Search</h3>
                    <p className="text-sm text-neutral-500">AI-powered sustainability document discovery</p>
                  </div>
                </div>
                <button
                  onClick={closeSearchModal}
                  className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Enhanced Search Input */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search environmental reports, sustainability assessments..."
                  value={internalSearchTerm}
                  onChange={handleSearchInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-12 pr-12 py-4 bg-neutral-50/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-[#007A5F] focus:border-[#007A5F] text-base placeholder-neutral-400 transition-all"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  {internalSearchTerm && (
                    <button
                      onClick={() => {
                        setInternalSearchTerm('');
                        setAutocompleteResults([]);
                      }}
                      className="p-1 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600"
                      title="Clear"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                  {isSearching && (
                    <div className="animate-spin h-4 w-4 border-2 border-[#007A5F] border-t-transparent rounded-full"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="max-h-96 overflow-y-auto scrollbar-erm">
              {/* Search Results */}
              {isSearching && internalSearchTerm.length > 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3 text-neutral-600">
                    <div className="animate-spin h-5 w-5 border-2 border-[#007A5F] border-t-transparent rounded-full"></div>
                    <span className="font-medium">Searching sustainability documents...</span>
                  </div>
                </div>
              ) : internalSearchTerm.length > 0 && autocompleteResults.length > 0 ? (
                <div>
                  <div className="px-6 py-3 bg-gradient-to-r from-[#007A5F]/10 to-transparent border-b border-neutral-100">
                    <p className="text-xs font-medium text-[#00382C] uppercase tracking-wider flex items-center">
                      <SparklesIcon className="h-3 w-3 mr-1" />
                      Found {autocompleteResults.length} sustainability documents
                    </p>
                  </div>
                  {autocompleteResults.map((result, index) => (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`p-4 border-b border-neutral-50 cursor-pointer transition-all group ${
                        index === focusedIndex 
                          ? 'bg-[#007A5F]/10 border-[#007A5F]/20' 
                          : 'hover:bg-neutral-50/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-[#007A5F] flex items-center justify-center text-white text-xs font-bold">
                              {result.Document_Type ? result.Document_Type[0] : 'S'}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-[#00382C]">
                                <span dangerouslySetInnerHTML={{ 
                                  __html: result._highlightResults?.Unique_Id || result.unique_id || result.SF_Number || 'N/A' 
                                }} />
                              </h4>
                              <div className="flex items-center space-x-2 text-xs text-neutral-500 mt-1">
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                  {result.Document_Type || 'Document'}
                                </span>
                                <span>•</span>
                                <span>{result.Industry || 'Environmental'}</span>
                                <span>•</span>
                                <span>{result.Region || 'Global'}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-600">
                            <span className="font-medium">Client:</span>{' '}
                            <span dangerouslySetInnerHTML={{ 
                              __html: result._highlightResults?.Client_Name || result.Client_Name || 'Sustainability Client' 
                            }} />
                          </p>
                        </div>
                        <div className="text-xs text-[#007A5F] group-hover:text-[#00382C] font-medium flex items-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-1">Open</span>
                          →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : internalSearchTerm.length > 0 && autocompleteResults.length === 0 && !isSearching ? (
                <div className="py-16 text-center text-neutral-500">
                  <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MagnifyingGlassIcon className="h-10 w-10 text-neutral-400" />
                  </div>
                  <p className="text-lg font-medium text-neutral-700 mb-2">No sustainability documents found</p>
                  <p className="text-sm text-neutral-500 mb-6">Try different terms like "carbon", "environmental", or "ESG"</p>
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => setInternalSearchTerm('')}
                      className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1 rounded-full transition-colors"
                    >
                      Clear search
                    </button>
                    <button 
                      onClick={() => handleQuickSearch('sustainability')}
                      className="text-xs bg-[#007A5F] hover:bg-[#00382C] text-white px-3 py-1 rounded-full transition-colors"
                    >
                      Show sustainability docs
                    </button>
                  </div>
                </div>
              ) : (
                /* Default state with sustainability-focused sections */
                <div className="p-6 space-y-8">
                  {/* AI-Powered Sustainability Suggestions */}
                  <div>
                    <div className="flex items-center mb-4">
                      <SparklesIcon className="h-4 w-4 text-[#007A5F] mr-2" />
                      <h4 className="text-sm font-semibold text-neutral-700">Sustainability Insights</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sustainabilitySuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickSearch(suggestion)}
                          className="text-left p-3 bg-gradient-to-r from-emerald-50 to-[#007A5F]/5 hover:from-emerald-100 hover:to-[#007A5F]/10 text-neutral-700 hover:text-[#00382C] text-sm rounded-xl transition-all duration-200 border border-emerald-100 hover:border-[#007A5F]/20"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-emerald-200 rounded-lg flex items-center justify-center">
                              <SparklesIcon className="h-3 w-3 text-[#007A5F]" />
                            </div>
                            <span className="font-medium">{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-neutral-700">Recent Searches</h4>
                        <button
                          onClick={() => {
                            setRecentSearches([]);
                            if (typeof window !== 'undefined') {
                              localStorage.removeItem('recentSearches');
                            }
                          }}
                          className="text-xs text-neutral-500 hover:text-red-600 hover:underline transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="space-y-2">
                        {recentSearches.slice(0, 4).map((search, index) => (
                          <div key={index} className="flex items-center justify-between group">
                            <button
                              onClick={() => handleQuickSearch(search)}
                              className="flex-1 text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors flex items-center space-x-2"
                            >
                              <MagnifyingGlassIcon className="h-4 w-4 text-neutral-400" />
                              <span>{search}</span>
                            </button>
                            <button
                              onClick={() => {
                                const updated = recentSearches.filter((_, i) => i !== index);
                                setRecentSearches(updated);
                                if (typeof window !== 'undefined') {
                                  localStorage.setItem('recentSearches', JSON.stringify(updated));
                                }
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-600 transition-all"
                              title="Remove"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Sustainability Searches */}
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-700 mb-4">Popular Sustainability Topics</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {popularSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickSearch(search.term)}
                          className="text-left p-3 bg-white hover:bg-[#007A5F]/5 text-neutral-700 hover:text-[#00382C] text-sm rounded-xl transition-all duration-200 border border-neutral-100 hover:border-[#007A5F]/30 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-[#007A5F]/10 rounded-lg flex items-center justify-center">
                                <span className="text-xs font-bold text-[#00382C]">
                                  {search.term[0]}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">{search.term}</div>
                                <div className="text-xs text-neutral-500">{search.category}</div>
                              </div>
                            </div>
                            {search.trending && (
                              <div className="flex items-center space-x-1 bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-xs font-medium">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span>Trending</span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Modal Footer */}
            <div className="p-4 border-t border-neutral-100/50 bg-neutral-50/30">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 bg-white border border-neutral-200 rounded shadow-sm font-mono">↵</kbd>
                    <span>to search</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 bg-white border border-neutral-200 rounded shadow-sm font-mono">↑↓</kbd>
                    <span>to navigate</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <kbd className="px-2 py-1 bg-white border border-neutral-200 rounded shadow-sm font-mono">⌘K</kbd>
                    <span>to toggle</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Powered by</span>
                  <div className="flex items-center space-x-1 text-[#007A5F] font-medium">
                    <SparklesIcon className="h-3 w-3" />
                    <span>ERM AI</span>
                  </div>
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