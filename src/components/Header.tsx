// src/components/Header.tsx - CONTEXTUAL SEARCH WITH CONTEXT DROPDOWN
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, CommandLineIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import UserDropdown from './UserDropdown';
import { useRouter } from 'next/router';
import { StrapiProposal } from '@/types/strapi';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useSearchContext } from '@/hooks/useSearchContext';
import { extractProposalData } from '@/utils/dataHelpers';

interface HeaderProps {
  searchTerm: string;
  isLoading: boolean;
  onResultClick?: (proposal: StrapiProposal) => void;
}

const Header: React.FC<HeaderProps> = ({ searchTerm, isLoading: propIsLoading, onResultClick }) => {
  const router = useRouter();
  const [internalSearchTerm, setInternalSearchTerm] = useState<string>('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Context selection state
  const [selectedContext, setSelectedContext] = useState<string>('content-management'); // Default to CMS
  const [isContextDropdownOpen, setIsContextDropdownOpen] = useState(false);
  
  // Available search contexts
  const availableContexts = [
    { 
      key: 'content-management', 
      title: 'Content Library', 
      icon: '📚',
      description: 'Search all documents and reports' 
    },
    { 
      key: 'dashboard', 
      title: 'Recent & Trending', 
      icon: '🏠',
      description: 'Search recent and popular documents' 
    },
    { 
      key: 'bookmarks', 
      title: 'My Bookmarks', 
      icon: '🔖',
      description: 'Search saved documents' 
    },
  ];
  
  // Use contextual search hook to get page-specific context
  const {
    searchContext,
    isContextualSearch,
    switchToGlobalSearch,
    getContextualPlaceholder,
    getContextualSuggestions,
  } = useSearchContext();
  
  // Use the global search hook for actual search functionality
  const {
    searchResults,
    isSearching,
    searchError,
    performSearch,
    clearSearch,
  } = useGlobalSearch();

  // Get contextual suggestions based on current page
  const contextualSuggestions = useMemo(() => {
    const suggestions = getContextualSuggestions();
    return suggestions.map((term, index) => ({
      term,
      category: searchContext.title,
      icon: searchContext.icon,
      id: `contextual-${index}`
    }));
  }, [getContextualSuggestions, searchContext]);

  // Popular searches - now contextual based on page
  const popularSearches = useMemo(() => {
    switch (searchContext.context) {
      case 'dashboard':
        return [
          { term: 'Recent environmental reports', category: 'Recent', icon: '🆕' },
          { term: 'Popular sustainability proposals', category: 'Trending', icon: '📈' },
          { term: 'Latest carbon assessments', category: 'Current', icon: '🌱' },
          { term: 'High-value projects', category: 'Priority', icon: '💰' },
        ];
      case 'content-management':
        return [
          { term: 'Environmental Impact Assessment', category: 'Environmental', icon: '🌍' },
          { term: 'Sustainability Report', category: 'Reporting', icon: '📊' },
          { term: 'Carbon Footprint Analysis', category: 'Analytics', icon: '📈' },
          { term: 'ESG Compliance', category: 'Governance', icon: '⚖️' },
          { term: 'Renewable Energy', category: 'Energy', icon: '⚡' },
        ];
      case 'bookmarks':
        return [
          { term: 'My saved reports', category: 'Personal', icon: '📑' },
          { term: 'Bookmarked proposals', category: 'Saved', icon: '🔖' },
          { term: 'Favorite assessments', category: 'Favorites', icon: '⭐' },
          { term: 'Important documents', category: 'Priority', icon: '📌' },
        ];
      default:
        return [
          { term: 'Environmental Impact Assessment', category: 'Environmental', icon: '🌍' },
          { term: 'Sustainability Report', category: 'Reporting', icon: '📊' },
          { term: 'Carbon Footprint Analysis', category: 'Analytics', icon: '📈' },
        ];
    }
  }, [searchContext.context]);

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

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInternalSearchTerm(query);
    setFocusedIndex(-1);
    
    // Perform contextual search using the global search hook
    if (query.trim()) {
      performSearch(query);
    } else {
      clearSearch();
    }
  };

  const handleResultClick = async (result: StrapiProposal) => {
    try {
      // First try to use the callback if provided
      if (onResultClick) {
        onResultClick(result);
        closeSearchModal();
        return;
      }

      // Enhanced data fetching for better document preview
      console.log('🔍 Fetching complete document data for:', result.id);
      
      try {
        // Try to fetch complete data from Strapi API with all populated fields
        const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337/api';
        const response = await fetch(`${strapiApiUrl}/document-stores/${result.id}?populate=*`);
        
        if (response.ok) {
          const apiData = await response.json();
          console.log('📄 Raw API response:', apiData);
          
          // Extract and enhance the proposal data
          const baseData = extractProposalData(apiData.data);
          
          // Create enhanced result with all available data
          const enhancedResult: StrapiProposal = {
            // Start with search result data
            ...result,
            // Override with complete API data
            ...baseData,
            // Preserve search highlights
            _highlightResults: result._highlightResults,
            // Ensure we have an ID
            id: result.id || baseData.id || 0,
            documentId: result.documentId || baseData.documentId || result.id?.toString() || '0',
          };
          
          console.log('✅ Enhanced result for preview:', enhancedResult);
          
          // Call the result handler with enhanced data
          if (onResultClick) {
            onResultClick(enhancedResult);
          } else {
            // Navigate to content management with the proposal ID
            router.push(`/content-management?proposalId=${result.id}`);
          }
        } else {
          console.warn('⚠️ API fetch failed, using search result data');
          // Use the search result as-is
          if (onResultClick) {
            onResultClick(result);
          } else {
            router.push(`/content-management?proposalId=${result.id}`);
          }
        }
      } catch (fetchError) {
        console.error('❌ Error fetching from API:', fetchError);
        // Fallback to search result data
        if (onResultClick) {
          onResultClick(result);
        } else {
          router.push(`/content-management?proposalId=${result.id}`);
        }
      }
      
      closeSearchModal();
      
    } catch (error) {
      console.error('❌ Error in handleResultClick:', error);
      // Final fallback
      if (onResultClick) {
        onResultClick(result);
      } else {
        router.push(`/content-management?proposalId=${result.id}`);
      }
      closeSearchModal();
    }
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

      // Navigate based on selected context dropdown
      const searchParam = `searchTerm=${encodeURIComponent(internalSearchTerm)}`;
      
      let targetPath = '/content-management'; // Default fallback
      
      switch (selectedContext) {
        case 'dashboard':
          targetPath = '/';
          break;
        case 'content-management':
          targetPath = '/content-management';
          break;
        case 'bookmarks':
          targetPath = '/bookmarks';
          break;
        default:
          targetPath = '/content-management';
      }
      
      console.log('🔍 Navigating to:', targetPath, 'with context:', selectedContext);
      
      // Navigate to the selected context page with search term
      router.push(`${targetPath}?${searchParam}`);
      closeSearchModal();
    }
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
    clearSearch();
    setFocusedIndex(-1);
  };

  const handleQuickSearch = (searchText: string) => {
    setInternalSearchTerm(searchText);
    performSearch(searchText);
  };

  // Enhanced keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && searchResults[focusedIndex]) {
        handleResultClick(searchResults[focusedIndex]);
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

  // Handle body scroll lock when modal is open
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

  // Get contextual placeholder text
  const placeholderText = getContextualPlaceholder();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          {/* Commercial Content Hub Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-erm-primary to-erm-dark flex items-center justify-center shadow-sm">
              <img src="/images/ERM_Vertical_Green_Black_RGB.svg" alt="Logo" className="w-6 h-6 filter brightness-0 invert" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Commercial Content Hub</h1>
              <p className="text-xs text-neutral-500 hidden sm:block">Sustainability Document Management</p>
            </div>
          </div>

          {/* Enhanced Contextual Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="w-full group relative bg-neutral-50/80 hover:bg-neutral-100/80 border border-neutral-200/60 hover:border-erm-primary/30 rounded-2xl px-4 py-3.5 transition-all duration-200 ease-out hover:shadow-md"
              >
                <div className="flex items-center">
                  <div className="flex items-center space-x-3 flex-1">
                    <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400 group-hover:text-erm-primary transition-colors" />
                    <div className="flex-1 text-left">
                      {searchTerm ? (
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-erm-primary">"{searchTerm}"</span>
                          <span className="text-neutral-400 text-sm">— Press ⌘K to modify</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          {/* Show contextual placeholder WITHOUT context pill */}
                          <span className="text-neutral-500 group-hover:text-neutral-700">{placeholderText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {searchTerm && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Clear search but stay on current page
                          const { searchTerm: _, ...queryWithoutSearch } = router.query;
                          router.push({
                            pathname: router.pathname,
                            query: queryWithoutSearch
                          });
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

      {/* Enhanced Contextual Search Modal */}
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
            className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-3xl mx-4 my-auto overflow-hidden border border-neutral-200/50" 
            style={{ zIndex: 100000 }}
          >
            
            {/* Common Search Modal Header - No longer contextual specific */}
            <div className="p-6 border-b border-neutral-100/50 bg-gradient-to-r from-erm-primary/5 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-erm-primary to-erm-dark flex items-center justify-center">
                    <MagnifyingGlassIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">Search Documents</h3>
                    <p className="text-sm text-neutral-500">Find proposals, reports, and business documents</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={closeSearchModal}
                    className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Common Search Input */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search proposals, reports, environmental assessments..."
                  value={internalSearchTerm}
                  onChange={handleSearchInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-12 pr-12 py-4 bg-neutral-50/50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-erm-primary focus:border-erm-primary text-base placeholder-neutral-400 transition-all"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  {internalSearchTerm && (
                    <button
                      onClick={() => {
                        setInternalSearchTerm('');
                        clearSearch();
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
              {/* Error Display */}
              {searchError && (
                <div className="p-6 text-center">
                  <div className="text-red-600 font-medium mb-2">Search Error</div>
                  <div className="text-sm text-red-500">{searchError}</div>
                </div>
              )}

              {/* Search Results */}
              {isSearching && internalSearchTerm.length > 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3 text-neutral-600">
                    <div className="animate-spin h-5 w-5 border-2 border-erm-primary border-t-transparent rounded-full"></div>
                    <span className="font-medium">Searching documents...</span>
                  </div>
                </div>
              ) : internalSearchTerm.length > 0 && searchResults.length > 0 ? (
                <div>
                  <div className="px-6 py-3 bg-gradient-to-r from-erm-primary/10 to-transparent border-b border-neutral-100">
                    <p className="text-xs font-medium text-erm-dark uppercase tracking-wider">
                      Found {searchResults.length} documents
                    </p>
                  </div>
                  {searchResults.map((result, index) => (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`p-4 border-b border-neutral-50 cursor-pointer transition-all group ${
                        index === focusedIndex 
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
                                  __html: result._highlightResults?.Unique_Id || 
                                         result._highlightResults?.unique_id || 
                                         result._highlightResults?.SF_Number || 
                                         result.unique_id || 
                                         result.SF_Number || 
                                         'N/A' 
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
                              __html: result._highlightResults?.Client_Name || result.Client_Name || 'Business Client' 
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
                </div>
              ) : internalSearchTerm.length > 0 && searchResults.length === 0 && !isSearching && !searchError ? (
                <div className="py-16 text-center text-neutral-500">
                  <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MagnifyingGlassIcon className="h-10 w-10 text-neutral-400" />
                  </div>
                  <p className="text-lg font-medium text-neutral-700 mb-2">No documents found</p>
                  <p className="text-sm text-neutral-500 mb-6">Try different terms or change your search context below</p>
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => {
                        setInternalSearchTerm('');
                        clearSearch();
                      }}
                      className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1 rounded-full transition-colors"
                    >
                      Clear search
                    </button>
                    <button 
                      onClick={() => {
                        // Navigate to selected context with current search
                        let targetPath = '/content-management';
                        switch (selectedContext) {
                          case 'dashboard': targetPath = '/'; break;
                          case 'content-management': targetPath = '/content-management'; break;
                          case 'bookmarks': targetPath = '/bookmarks'; break;
                        }
                        if (internalSearchTerm) {
                          router.push(`${targetPath}?searchTerm=${encodeURIComponent(internalSearchTerm)}`);
                        } else {
                          router.push(targetPath);
                        }
                        closeSearchModal();
                      }}
                      className="text-xs bg-erm-primary hover:bg-erm-dark text-white px-3 py-1 rounded-full transition-colors"
                    >
                      Search in {availableContexts.find(c => c.key === selectedContext)?.title}
                    </button>
                  </div>
                </div>
              ) : (
                /* Default state with contextual sections */
                <div className="p-6 space-y-8">
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

                  {/* Popular Document Types - Now Universal */}
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-700 mb-4">
                      Popular Document Types
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {popularSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickSearch(search.term)}
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

            {/* Enhanced Contextual Footer with Context Dropdown */}
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
                
                {/* Context Selection Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsContextDropdownOpen(!isContextDropdownOpen)}
                    className="flex items-center space-x-2 text-erm-primary font-medium hover:text-erm-dark transition-colors bg-white border border-neutral-200 rounded-lg px-3 py-2"
                  >
                    <span>{availableContexts.find(c => c.key === selectedContext)?.icon}</span>
                    <span>Search in: {availableContexts.find(c => c.key === selectedContext)?.title}</span>
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${isContextDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isContextDropdownOpen && (
                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl z-50">
                      <div className="p-2">
                        <div className="text-xs font-semibold text-neutral-700 px-3 py-2 border-b border-neutral-100">
                          Choose Search Context
                        </div>
                        {availableContexts.map((context) => (
                          <button
                            key={context.key}
                            onClick={() => {
                              setSelectedContext(context.key);
                              setIsContextDropdownOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-erm-primary/5 ${
                              selectedContext === context.key 
                                ? 'bg-erm-primary/10 border border-erm-primary/20' 
                                : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{context.icon}</span>
                              <div>
                                <div className="font-medium text-neutral-900">{context.title}</div>
                                <div className="text-xs text-neutral-500">{context.description}</div>
                              </div>
                              {selectedContext === context.key && (
                                <div className="ml-auto w-2 h-2 bg-erm-primary rounded-full"></div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;