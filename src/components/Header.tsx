// src/components/Header.tsx - Enhanced with Global Search
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, CommandLineIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { StrapiProposal } from '@/types/strapi';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import UserDropdown from './UserDropdown';

interface HeaderProps {
  onResultClick?: (proposal: StrapiProposal) => void;
}

const Header: React.FC<HeaderProps> = ({ onResultClick }) => {
  const router = useRouter();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const {
    searchTerm,
    searchResults,
    isSearching,
    searchHistory,
    suggestions,
    searchContext,
    handleSearch,
    clearSearch,
    getAutoSuggestions,
  } = useGlobalSearch({ onResultClick });

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Auto-suggestions when typing
  useEffect(() => {
    if (localSearchTerm.length > 1) {
      const timer = setTimeout(() => {
        getAutoSuggestions(localSearchTerm);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [localSearchTerm, getAutoSuggestions]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (event.key === 'Escape' && isSearchModalOpen) {
        closeSearchModal();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isSearchModalOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchModalOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchModalOpen]);

  // Handle body scroll lock
  useEffect(() => {
    if (isSearchModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchModalOpen]);

  const closeSearchModal = useCallback(() => {
    setIsSearchModalOpen(false);
    setShowSuggestions(false);
    setFocusedIndex(-1);
  }, []);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    setFocusedIndex(-1);
    setShowSuggestions(value.length > 0);
  }, []);

  const handleSearchSubmit = useCallback((term?: string) => {
    const searchValue = term || localSearchTerm;
    if (searchValue.trim()) {
      handleSearch(searchValue);
      closeSearchModal();
    }
  }, [localSearchTerm, handleSearch, closeSearchModal]);

  const handleResultClick = useCallback((proposal: StrapiProposal) => {
    if (onResultClick) {
      onResultClick(proposal);
    }
    closeSearchModal();
  }, [onResultClick, closeSearchModal]);

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const allOptions = [
      ...suggestions.slice(0, 5),
      ...(searchResults?.proposals.slice(0, 5) || [])
    ];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => prev < allOptions.length - 1 ? prev + 1 : prev);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
        handleSearchSubmit(suggestions[focusedIndex]);
      } else if (focusedIndex >= suggestions.length && searchResults) {
        const resultIndex = focusedIndex - suggestions.length;
        if (searchResults.proposals[resultIndex]) {
          handleResultClick(searchResults.proposals[resultIndex]);
        }
      } else {
        handleSearchSubmit();
      }
    } else if (e.key === 'Escape') {
      closeSearchModal();
    }
  }, [suggestions, searchResults, focusedIndex, handleSearchSubmit, handleResultClick, closeSearchModal]);

  const getContextualPlaceholder = () => {
    return searchTerm 
      ? `"${searchTerm}" in ${searchContext.title}`
      : searchContext.placeholder;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-erm-primary to-erm-dark flex items-center justify-center shadow-sm">
              <img src="/images/ERM_Vertical_Green_Black_RGB.svg" alt="Logo" className="w-6 h-6 filter brightness-0 invert" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Commercial Content Hub</h1>
              <p className="text-xs text-neutral-500 hidden sm:block">Sustainability Document Management</p>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="w-full group relative bg-neutral-50/80 hover:bg-neutral-100/80 border border-neutral-200/60 hover:border-erm-primary/30 rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out hover:shadow-md"
              >
                <div className="flex items-center">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{searchContext.icon}</span>
                      <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400 group-hover:text-erm-primary transition-colors" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="text-neutral-500 group-hover:text-neutral-700">
                          {getContextualPlaceholder()}
                        </span>
                        {searchResults && (
                          <span className="text-xs bg-erm-primary text-white px-2 py-1 rounded-full">
                            {searchResults.totalHits} results
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {searchTerm && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSearch();
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
      </header>

      {/* Enhanced Search Modal */}
      {isSearchModalOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-start pt-16 pb-10 overflow-y-auto"
          style={{ zIndex: 99999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeSearchModal();
            }
          }}
        >
          <div 
            className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl mx-4 my-auto overflow-hidden border border-neutral-200/50" 
            style={{ zIndex: 100000 }}
          >
            
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-100/50 bg-gradient-to-r from-erm-primary/5 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-erm-primary to-erm-dark flex items-center justify-center">
                    <span className="text-xl">{searchContext.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">{searchContext.title}</h3>
                    <p className="text-sm text-neutral-500">
                      Searching in {router.pathname === '/' ? 'Dashboard' : router.pathname.replace('/', '').replace('-', ' ')}
                      {searchResults && ` • ${searchResults.totalHits} documents found`}
                    </p>
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
                  placeholder={searchContext.placeholder}
                  value={localSearchTerm}
                  onChange={handleSearchInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-12 pr-12 py-4 bg-neutral-50/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-erm-primary focus:border-erm-primary text-base placeholder-neutral-400 transition-all"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  {localSearchTerm && (
                    <button
                      onClick={() => {
                        setLocalSearchTerm('');
                        setShowSuggestions(false);
                      }}
                      className="p-1 rounded-full hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600"
                      title="Clear"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                  {isSearching && (
                    <div className="animate-spin h-4 w-4 border-2 border-erm-primary border-t-transparent rounded-full"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="max-h-96 overflow-y-auto">
              {/* Loading State */}
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3 text-neutral-600">
                    <div className="animate-spin h-5 w-5 border-2 border-erm-primary border-t-transparent rounded-full"></div>
                    <span className="font-medium">Searching {searchContext.title.toLowerCase()}...</span>
                  </div>
                </div>
              ) : localSearchTerm.length > 0 && searchResults ? (
                /* Search Results */
                <div>
                  {/* Results Header */}
                  <div className="px-6 py-3 bg-gradient-to-r from-erm-primary/10 to-transparent border-b border-neutral-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-erm-dark uppercase tracking-wider">
                        Found {searchResults.totalHits} documents in {searchResults.processingTime}ms
                      </p>
                      <span className="text-xs text-neutral-500">
                        Scope: {searchContext.scope}
                      </span>
                    </div>
                  </div>

                  {/* Search Results */}
                  {searchResults.proposals.slice(0, 8).map((result, index) => (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`p-4 border-b border-neutral-50 cursor-pointer transition-all group ${
                        index + suggestions.length === focusedIndex 
                          ? 'bg-erm-primary/10 border-erm-primary/20' 
                          : 'hover:bg-neutral-50/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-erm-primary to-erm-dark flex items-center justify-center text-white text-xs font-bold">
                              {result.Document_Type ? result.Document_Type[0] : 'D'}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-erm-dark">
                                <span dangerouslySetInnerHTML={{ 
                                  __html: (result as any)._highlightResults?.Unique_Id || result.unique_id || result.SF_Number || 'N/A' 
                                }} />
                              </h4>
                              <div className="flex items-center space-x-2 text-xs text-neutral-500 mt-1">
                                <span className="bg-erm-primary/10 text-erm-dark px-2 py-0.5 rounded-full">
                                  {result.Document_Type || 'Document'}
                                </span>
                                <span>•</span>
                                <span>{result.Industry || 'Business'}</span>
                                <span>•</span>
                                <span>{result.Region || 'Global'}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-600">
                            <span className="font-medium">Client:</span>{' '}
                            <span dangerouslySetInnerHTML={{ 
                              __html: (result as any)._highlightResults?.Client_Name || result.Client_Name || 'Business Client' 
                            }} />
                          </p>
                        </div>
                        <div className="text-xs text-erm-primary group-hover:text-erm-dark font-medium flex items-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-1">Open</span>
                          →
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* More Results Button */}
                  {searchResults.totalHits > 8 && (
                    <div className="p-4 border-t border-neutral-100 text-center">
                      <button
                        onClick={() => {
                          router.push(`/content-management?searchTerm=${encodeURIComponent(localSearchTerm)}`);
                          closeSearchModal();
                        }}
                        className="text-sm text-erm-primary hover:text-erm-dark font-medium"
                      >
                        View all {searchResults.totalHits} results in Content Management →
                      </button>
                    </div>
                  )}
                </div>
              ) : showSuggestions && suggestions.length > 0 ? (
                /* Suggestions */
                <div>
                  <div className="px-6 py-3 bg-gradient-to-r from-neutral-50 to-transparent border-b border-neutral-100">
                    <p className="text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Suggestions
                    </p>
                  </div>
                  {suggestions.slice(0, 8).map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSearchSubmit(suggestion)}
                      className={`p-3 border-b border-neutral-50 cursor-pointer transition-all group ${
                        index === focusedIndex 
                          ? 'bg-erm-primary/10 border-erm-primary/20' 
                          : 'hover:bg-neutral-50/80'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <MagnifyingGlassIcon className="h-4 w-4 text-neutral-400 group-hover:text-erm-primary" />
                        <span className="text-sm text-neutral-700 group-hover:text-erm-dark">
                          {suggestion}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Default state with contextual content */
                <div className="p-6 space-y-8">
                  {/* Search History */}
                  {searchHistory.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-neutral-700 flex items-center space-x-2">
                          <ClockIcon className="h-4 w-4" />
                          <span>Recent Searches</span>
                        </h4>
                        <button
                          onClick={() => {
                            // Clear search history
                            if (typeof window !== 'undefined') {
                              localStorage.removeItem('searchHistory');
                            }
                          }}
                          className="text-xs text-neutral-500 hover:text-red-600 hover:underline transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="space-y-2">
                        {searchHistory.slice(0, 4).map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearchSubmit(search)}
                            className="flex items-center w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors space-x-2"
                          >
                            <ClockIcon className="h-4 w-4 text-neutral-400" />
                            <span>{search}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contextual Quick Actions */}
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center space-x-2">
                      <FireIcon className="h-4 w-4" />
                      <span>Quick Search for {searchContext.title}</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {getQuickSearches().map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearchSubmit(search.term)}
                          className="text-left p-3 bg-white hover:bg-erm-primary/5 text-neutral-700 hover:text-erm-dark text-sm rounded-xl transition-all duration-200 border border-neutral-100 hover:border-erm-primary/30 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-erm-primary/10 rounded-lg flex items-center justify-center">
                                <span className="text-sm">{search.icon}</span>
                              </div>
                              <div>
                                <div className="font-medium">{search.term}</div>
                                <div className="text-xs text-neutral-500">{search.category}</div>
                              </div>
                            </div>
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
                  <span>Search context:</span>
                  <div className="flex items-center space-x-1 text-erm-primary font-medium">
                    <span>{searchContext.scope}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Helper function to get contextual quick searches
  function getQuickSearches() {
    const baseSearches = [
      { term: 'Environmental Impact Assessment', category: 'Environmental', icon: '🌍' },
      { term: 'Sustainability Report', category: 'Reporting', icon: '📊' },
      { term: 'Carbon Footprint Analysis', category: 'Analytics', icon: '📈' },
      { term: 'ESG Compliance', category: 'Governance', icon: '⚖️' },
    ];

    switch (searchContext.scope) {
      case 'dashboard':
        return [
          { term: 'Recent proposals', category: 'Recent', icon: '🕒' },
          { term: 'High value documents', category: 'Value', icon: '💰' },
          { term: 'Popular this month', category: 'Trending', icon: '🔥' },
          { term: 'My documents', category: 'Personal', icon: '👤' },
        ];
      case 'bookmarks':
        return [
          { term: 'Saved reports', category: 'Reports', icon: '💾' },
          { term: 'Favorite proposals', category: 'Proposals', icon: '⭐' },
          { term: 'Bookmarked assessments', category: 'Assessments', icon: '🔖' },
          { term: 'Important documents', category: 'Priority', icon: '🎯' },
        ];
      default:
        return baseSearches;
    }
  }
};

export default Header;