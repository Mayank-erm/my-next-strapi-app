// src/hooks/useGlobalSearch.ts - Enhanced Global Search Hook
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { MeiliSearch } from 'meilisearch';
import { StrapiProposal } from '@/types/strapi';

// Enhanced MeiliSearch client with better configuration
const searchClient = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY || 'masterKey',
});

// Search context configuration for different pages
export type SearchScope = 'global' | 'dashboard' | 'content-management' | 'bookmarks' | 'favorites';

interface SearchContextConfig {
  scope: SearchScope;
  title: string;
  placeholder: string;
  icon: string;
  filters?: Record<string, any>;
  facets?: string[];
  sortOptions: string[];
  maxResults: number;
}

const SEARCH_CONTEXTS: Record<string, SearchContextConfig> = {
  '/': {
    scope: 'dashboard',
    title: 'Dashboard Search',
    placeholder: 'Search recent documents, trends...',
    icon: '🏠',
    filters: {
      // Dashboard shows recent and high-value content
      publishedAt: ['>=', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()],
    },
    facets: ['Document_Type', 'Industry', 'Region', 'Business_Unit'],
    sortOptions: ['publishedAt:desc', 'value:desc', 'unique_id:asc'],
    maxResults: 12,
  },
  '/content-management': {
    scope: 'content-management',
    title: 'Content Library Search',
    placeholder: 'Search all documents, reports, proposals...',
    icon: '📚',
    filters: {},
    facets: ['Document_Type', 'Document_Sub_Type', 'Industry', 'Sub_Industry', 'Region', 'Country', 'Business_Unit'],
    sortOptions: ['publishedAt:desc', 'publishedAt:asc', 'unique_id:asc', 'unique_id:desc', 'value:desc', 'value:asc'],
    maxResults: 50,
  },
  '/bookmarks': {
    scope: 'bookmarks',
    title: 'Bookmarked Documents',
    placeholder: 'Search your bookmarked documents...',
    icon: '🔖',
    filters: {
      // This would be implemented with user-specific bookmark data
      isBookmarked: true,
    },
    facets: ['Document_Type', 'Industry'],
    sortOptions: ['bookmarked_at:desc', 'publishedAt:desc'],
    maxResults: 20,
  },
};

interface UseGlobalSearchProps {
  onResultClick?: (proposal: StrapiProposal) => void;
  customFilters?: Record<string, any>;
}

interface SearchResult {
  proposals: StrapiProposal[];
  totalHits: number;
  facetDistribution: Record<string, Record<string, number>>;
  processingTime: number;
  query: string;
  scope: SearchScope;
}

export const useGlobalSearch = ({ onResultClick, customFilters = {} }: UseGlobalSearchProps = {}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Get current search context based on route
  const searchContext = useMemo((): SearchContextConfig => {
    const currentPath = router.pathname;
    return SEARCH_CONTEXTS[currentPath] || {
      scope: 'global',
      title: 'Global Search',
      placeholder: 'Search all documents...',
      icon: '🔍',
      filters: {},
      facets: ['Document_Type', 'Industry', 'Region'],
      sortOptions: ['publishedAt:desc', 'unique_id:asc'],
      maxResults: 30,
    };
  }, [router.pathname]);

  // Update search term from URL
  useEffect(() => {
    const urlSearchTerm = (router.query.searchTerm as string) || '';
    if (urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [router.query.searchTerm]);

  // Load search history from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('searchHistory');
        if (saved) {
          setSearchHistory(JSON.parse(saved));
        }
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }, []);

  // Enhanced search function with context awareness
  const performSearch = useCallback(async (
    query: string,
    sortBy: string = searchContext.sortOptions[0],
    offset: number = 0,
    limit: number = searchContext.maxResults
  ): Promise<SearchResult | null> => {
    if (!query.trim()) {
      setSearchResults(null);
      return null;
    }

    setIsSearching(true);

    try {
      // Build search options based on context and custom filters
      const searchOptions: any = {
        offset,
        limit,
        sort: [sortBy],
        facets: searchContext.facets,
        attributesToRetrieve: [
          'Unique_Id','Client_Type','Last_Stage_Change_Date',
          'Document_Type', 'Document_Sub_Type', 'Industry', 'Sub_Industry','Service',
          'State', 'Sub_Service','Commercial_Program','Client_Contact_Buying_Center',
          'Region', 'Country', 'Business_Unit' ,'City',
          'Description'
        ],
        attributesToHighlight: [
          'Unique_Id', 'Client_Type', 'Document_Type', 'Description','Industry'
        ],
        highlightPreTag: '<mark class="bg-erm-primary bg-opacity-20 text-erm-dark rounded px-1">',
        highlightPostTag: '</mark>',
        attributesToCrop: ['Description'],
        cropLength: 200,
      };

      // Apply context-specific filters
      const contextFilters: string[] = [];

      // Dashboard filters
      if (searchContext.scope === 'dashboard') {
        contextFilters.push('publishedAt >= "2024-01-01"');
      }

      // Bookmarks filters (would need user-specific implementation)
      if (searchContext.scope === 'bookmarks') {
        // This would be implemented with actual user bookmark data
        contextFilters.push('isBookmarked = true');
      }

      // Apply custom filters
      Object.entries({ ...searchContext.filters, ...customFilters }).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          const [operator, filterValue] = value;
          contextFilters.push(`${key} ${operator} "${filterValue}"`);
        } else if (typeof value === 'string') {
          contextFilters.push(`${key} = "${value}"`);
        } else if (typeof value === 'boolean') {
          contextFilters.push(`${key} = ${value}`);
        }
      });

      if (contextFilters.length > 0) {
        searchOptions.filter = contextFilters.join(' AND ');
      }

      console.log(`🔍 Performing ${searchContext.scope} search:`, {
        query,
        context: searchContext.scope,
        filters: searchOptions.filter,
        facets: searchOptions.facets
      });

      const results = await searchClient.index('document_stores').search(query, searchOptions);

      // Transform results
      const transformedProposals: StrapiProposal[] = (results.hits || []).map((hit: any) => ({
        id: hit.id,
        documentId: hit.id.toString(),
        unique_id: hit.unique_id || hit.Unique_Id || hit.SF_Number || '',
        SF_Number: hit.SF_Number || hit.unique_id || '',
        Client_Name: hit.Client_Name || '',
        Client_Type: hit.Client_Type || '',
        Client_Contact: hit.Client_Contact || '',
        Client_Contact_Title: hit.Client_Contact_Title || '',
        Client_Journey: hit.Client_Journey || '',
        Document_Type: hit.Document_Type || '',
        Document_Sub_Type: hit.Document_Sub_Type || '',
        Document_Value_Range: hit.Document_Value_Range || '',
        Document_Outcome: hit.Document_Outcome || '',
        Last_Stage_Change_Date: hit.Last_Stage_Change_Date || '',
        Industry: hit.Industry || '',
        Sub_Industry: hit.Sub_Industry || '',
        Service: hit.Service || '',
        Sub_Service: hit.Sub_Service || '',
        Business_Unit: hit.Business_Unit || '',
        Region: hit.Region || '',
        Country: hit.Country || '',
        State: hit.State || '',
        City: hit.City || '',
        Author: hit.Author || '',
        PIC: hit.PIC || '',
        PM: hit.PM || '',
        Keywords: hit.Keywords || '',
        Commercial_Program: hit.Commercial_Program || '',
        Project_Team: hit.Project_Team || null,
        SMEs: hit.SMEs || null,
        Competitors: hit.Competitors || '',
        createdAt: hit.createdAt || new Date().toISOString(),
        updatedAt: hit.updatedAt || new Date().toISOString(),
        publishedAt: hit.publishedAt || new Date().toISOString(),
        Description: hit.Description || [],
        Attachments: hit.Attachments || null,
        Pursuit_Team: hit.Pursuit_Team || null,
        documentUrl: hit.documentUrl || '',
        value: hit.value || 0,
        proposalName: hit.proposalName || hit.SF_Number || hit.Unique_Id || '',
        // Include highlighted results for UI
        _highlightResults: hit._formatted,
      }));

      const searchResult: SearchResult = {
        proposals: transformedProposals,
        totalHits: results.estimatedTotalHits || 0,
        facetDistribution: results.facetDistribution || {},
        processingTime: results.processingTimeMs || 0,
        query,
        scope: searchContext.scope,
      };

      setSearchResults(searchResult);

      // Add to search history
      if (query.trim()) {
        const updatedHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
        setSearchHistory(updatedHistory);
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
          }
        } catch (error) {
          console.warn('Failed to save search history:', error);
        }
      }

      return searchResult;

    } catch (error) {
      console.error(`❌ ${searchContext.scope} search error:`, error);
      setSearchResults(null);
      return null;
    } finally {
      setIsSearching(false);
    }
  }, [searchContext, customFilters, searchHistory]);

  // Get search suggestions based on facets and history
  const getSuggestions = useCallback(async (query: string): Promise<string[]> => {
    if (query.length < 2) {
      return searchHistory.slice(0, 5);
    }

    try {
      // Get suggestions from search results facets
      const results = await searchClient.index('document_stores').search(query, {
        limit: 0,
        facets: ['Document_Type', 'Industry', 'Client_Type', 'Document_Sub_Type'],
      });

      const suggestions: string[] = [];
      
      // Extract suggestions from facets
      Object.entries(results.facetDistribution || {}).forEach(([facet, values]) => {
        Object.keys(values).forEach(value => {
          if (value.toLowerCase().includes(query.toLowerCase()) && !suggestions.includes(value)) {
            suggestions.push(value);
          }
        });
      });

      // Add relevant search history
      const historyMatches = searchHistory.filter(h => 
        h.toLowerCase().includes(query.toLowerCase()) && !suggestions.includes(h)
      );

      return [...suggestions.slice(0, 5), ...historyMatches.slice(0, 3)];

    } catch (error) {
      console.error('Error getting suggestions:', error);
      return searchHistory.slice(0, 5);
    }
  }, [searchHistory]);

  // Update URL with search term
  const updateSearchUrl = useCallback((term: string) => {
    const query = { ...router.query };
    if (term) {
      query.searchTerm = term;
    } else {
      delete query.searchTerm;
    }
    
    router.replace({
      pathname: router.pathname,
      query,
    }, undefined, { shallow: true });
  }, [router]);

  // Handle search submission
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    updateSearchUrl(term);
    performSearch(term);
  }, [updateSearchUrl, performSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults(null);
    updateSearchUrl('');
  }, [updateSearchUrl]);

  // Get auto-suggestions
  const getAutoSuggestions = useCallback(async (query: string) => {
    const suggestions = await getSuggestions(query);
    setSuggestions(suggestions);
    return suggestions;
  }, [getSuggestions]);

  return {
    // Search state
    searchTerm,
    searchResults,
    isSearching,
    searchHistory,
    suggestions,
    
    // Search context
    searchContext,
    
    // Search functions
    performSearch,
    handleSearch,
    clearSearch,
    getAutoSuggestions,
    
    // Result handling
    onResultClick: onResultClick || (() => {}),
    
    // URL management
    updateSearchUrl,
  };
};