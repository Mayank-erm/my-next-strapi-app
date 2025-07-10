// src/hooks/useSearchContext.ts - FIXED VERSION THAT RESPECTS PAGE CONTEXT
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { MeiliSearch } from 'meilisearch';
import { StrapiProposal } from '@/types/strapi';

// MeiliSearch client
const searchClient = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY || 'masterKey',
});

// Define search contexts for different pages
export type SearchContext = 'dashboard' | 'content-management' | 'bookmarks' | 'global';

interface SearchContextConfig {
  context: SearchContext;
  title: string;
  description: string;
  icon: string;
  filters?: Record<string, any>;
  placeholder: string;
  suggestions: string[];
}

// Configuration for each page context
const SEARCH_CONTEXTS: Record<string, SearchContextConfig> = {
  '/': {
    context: 'dashboard',
    title: 'Dashboard Search',
    description: 'Search recent and trending documents',
    icon: '🏠',
    placeholder: 'Search recent documents, trends...',
    suggestions: [
      'Environmental Impact Assessment',
      'Sustainability Report',
      'Carbon Footprint Analysis',
      'ESG Compliance Document',
      'Renewable Energy Proposal'
    ],
    filters: {
      sort: ['publishedAt:desc'],
      limit: 6,
    }
  },
  '/content-management': {
    context: 'content-management',
    title: 'Content Library',
    description: 'Search all documents and reports',
    icon: '📚',
    placeholder: 'Search all documents, reports, proposals...',
    suggestions: [
      'Environmental Impact Assessment',
      'Sustainability Report',
      'Carbon Footprint Analysis',
      'ESG Compliance Document',
      'Renewable Energy Proposal'
    ],
    filters: {
      sort: ['publishedAt:desc'],
      limit: 10,
    }
  },
  '/bookmarks': {
    context: 'bookmarks',
    title: 'Bookmarked Documents',
    description: 'Search your saved documents',
    icon: '🔖',
    placeholder: 'Search your bookmarked documents...',
    suggestions: [
      'Environmental Impact Assessment',
      'Sustainability Report',
      'Carbon Footprint Analysis',
      'ESG Compliance Document',
      'Renewable Energy Proposal'
    ],
    filters: {
      sort: ['bookmarked_at:desc'],
      limit: 8,
    }
  }
};

interface UseSearchContextReturn {
  // Context information
  searchContext: SearchContextConfig;
  isContextualSearch: boolean;
  
  // Search state
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: StrapiProposal[];
  isSearching: boolean;
  
  // Search functionality
  performContextualSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
  
  // Context switching - FIXED: No longer forces navigation
  switchToGlobalSearch: () => void;
  getContextualPlaceholder: () => string;
  getContextualSuggestions: () => string[];
}

export const useSearchContext = (): UseSearchContextReturn => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<StrapiProposal[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isContextualSearch, setIsContextualSearch] = useState<boolean>(true);

  // Get current search context based on route
  const searchContext = useMemo((): SearchContextConfig => {
    const currentPath = router.pathname;
    return SEARCH_CONTEXTS[currentPath] || {
      context: 'global',
      title: 'Global Search',
      description: 'Search across all content',
      icon: '🔍',
      placeholder: 'Search all documents...',
      suggestions: ['Search everything'],
      filters: {}
    };
  }, [router.pathname]);

  // Update search term from URL and check for global mode
  useEffect(() => {
    const urlSearchTerm = (router.query.searchTerm as string) || '';
    const isGlobalMode = router.query.globalSearch === 'true';
    
    if (urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
    }
    
    // Update contextual search state based on URL parameter
    setIsContextualSearch(!isGlobalMode);
  }, [router.query.searchTerm, router.query.globalSearch]);

  // Perform contextual search
  const performContextualSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Check if we're in global search mode
    const isGlobalMode = router.query.globalSearch === 'true' || !isContextualSearch;
    
    if (isGlobalMode) {
      // Use global search
      performGlobalSearch(query);
      return;
    }

    setIsSearching(true);

    try {
      // Build search options based on context
      const searchOptions: any = {
        limit: searchContext.filters?.limit || 8,
        sort: searchContext.filters?.sort || ['publishedAt:desc'],
        attributesToRetrieve: [
          'id', 'documentId', 'SF_Number', 'Unique_Id', 'Client_Name',
          'Document_Type', 'Industry', 'Region', 'publishedAt', 'updatedAt'
        ],
        attributesToHighlight: ['Unique_Id', 'Client_Name', 'Document_Type'],
        highlightPreTag: '<mark class="bg-erm-primary bg-opacity-20 text-erm-dark rounded px-1">',
        highlightPostTag: '</mark>',
      };

      // Add context-specific filters
      const contextFilters: string[] = [];
      
      switch (searchContext.context) {
        case 'dashboard':
          // Dashboard: Show recent and high-value documents
          contextFilters.push('publishedAt >= "2024-01-01"'); // Recent documents
          break;
          
        case 'content-management':
          // Content Management: No additional filters (show all)
          break;
          
        case 'bookmarks':
          // Bookmarks: Filter by user's bookmarked items
          // This would need user-specific bookmark data
          // For now, we'll simulate with a placeholder filter
          contextFilters.push('Document_Type EXISTS'); // Placeholder
          break;
      }

      if (contextFilters.length > 0) {
        searchOptions.filter = contextFilters.join(' AND ');
      }

      console.log(`🔍 Performing ${searchContext.context} search:`, {
        query,
        context: searchContext.context,
        filters: searchOptions.filter,
        options: searchOptions
      });

      const results = await searchClient.index('document_stores').search(query, searchOptions);

      const transformedResults: StrapiProposal[] = (results.hits || []).map((hit: any) => ({
        id: hit.id,
        documentId: hit.id.toString(),
        unique_id: hit.unique_id || hit.Unique_Id || hit.SF_Number || '',
        SF_Number: hit.SF_Number || hit.unique_id || '',
        Client_Name: hit.Client_Name || '',
        Client_Type: '',
        Client_Contact: '',
        Client_Contact_Title: '',
        Client_Journey: '',
        Document_Type: hit.Document_Type || '',
        Document_Sub_Type: '',
        Document_Value_Range: '',
        Document_Outcome: '',
        Last_Stage_Change_Date: '',
        Industry: hit.Industry || '',
        Sub_Industry: '',
        Service: '',
        Sub_Service: '',
        Business_Unit: '',
        Region: hit.Region || '',
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
        updatedAt: hit.updatedAt || new Date().toISOString(),
        publishedAt: hit.publishedAt || new Date().toISOString(),
        Description: [],
        Attachments: null,
        Pursuit_Team: null,
        documentUrl: '',
        value: 0,
        proposalName: hit.SF_Number || hit.Unique_Id || '',
        // Add highlighted results for better UX
        _highlightResults: hit._formatted,
      }));

      setSearchResults(transformedResults);

      console.log(`✅ Found ${transformedResults.length} results for ${searchContext.context}`);

    } catch (error) {
      console.error(`❌ ${searchContext.context} search error:`, error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchContext, router.query.globalSearch, isContextualSearch]);

  // Clear search - STAYS ON CURRENT PAGE
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    
    // Clear URL search parameter but stay on current page
    const { searchTerm: _, ...queryWithoutSearch } = router.query;
    router.replace({
      pathname: router.pathname,
      query: queryWithoutSearch
    }, undefined, { shallow: true });
  }, [router]);

  // Switch to global search - FIXED: Actually removes contextual filters
  const switchToGlobalSearch = useCallback(() => {
    console.log('🌐 Switching to global search mode');
    setIsContextualSearch(false);
    
    // If there's a search term, perform global search on current page
    if (searchTerm) {
      // Update URL to indicate global search mode
      const currentQuery = { ...router.query };
      currentQuery.globalSearch = 'true';
      
      router.replace({
        pathname: router.pathname,
        query: currentQuery
      }, undefined, { shallow: true });
      
      // Perform search WITHOUT contextual filters by using 'global' context
      performGlobalSearch(searchTerm);
    } else {
      // Just mark as global mode for future searches
      const currentQuery = { ...router.query };
      currentQuery.globalSearch = 'true';
      
      router.replace({
        pathname: router.pathname,
        query: currentQuery
      }, undefined, { shallow: true });
    }
  }, [router, searchTerm]);

  // Perform global search without contextual filters
  const performGlobalSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      // Global search options - NO contextual filters
      const searchOptions: any = {
        limit: 10, // Standard limit for global search
        sort: ['publishedAt:desc'],
        attributesToRetrieve: [
          'id', 'documentId', 'SF_Number', 'Unique_Id', 'Client_Name',
          'Document_Type', 'Industry', 'Region', 'publishedAt', 'updatedAt'
        ],
        attributesToHighlight: ['Unique_Id', 'Client_Name', 'Document_Type'],
        highlightPreTag: '<mark class="bg-erm-primary bg-opacity-20 text-erm-dark rounded px-1">',
        highlightPostTag: '</mark>',
        // NO FILTERS - this is the key difference for global search
      };

      console.log('🌐 Performing global search:', {
        query,
        options: searchOptions
      });

      const results = await searchClient.index('document_stores').search(query, searchOptions);

      const transformedResults: StrapiProposal[] = (results.hits || []).map((hit: any) => ({
        id: hit.id,
        documentId: hit.id.toString(),
        unique_id: hit.unique_id || hit.Unique_Id || hit.SF_Number || '',
        SF_Number: hit.SF_Number || hit.unique_id || '',
        Client_Name: hit.Client_Name || '',
        Client_Type: '',
        Client_Contact: '',
        Client_Contact_Title: '',
        Client_Journey: '',
        Document_Type: hit.Document_Type || '',
        Document_Sub_Type: '',
        Document_Value_Range: '',
        Document_Outcome: '',
        Last_Stage_Change_Date: '',
        Industry: hit.Industry || '',
        Sub_Industry: '',
        Service: '',
        Sub_Service: '',
        Business_Unit: '',
        Region: hit.Region || '',
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
        updatedAt: hit.updatedAt || new Date().toISOString(),
        publishedAt: hit.publishedAt || new Date().toISOString(),
        Description: [],
        Attachments: null,
        Pursuit_Team: null,
        documentUrl: '',
        value: 0,
        proposalName: hit.SF_Number || hit.Unique_Id || '',
        _highlightResults: hit._formatted,
      }));

      setSearchResults(transformedResults);

      console.log(`✅ Found ${transformedResults.length} global search results`);

    } catch (error) {
      console.error('❌ Global search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Get contextual placeholder
  const getContextualPlaceholder = useCallback((): string => {
    if (!isContextualSearch || router.query.globalSearch === 'true') {
      return 'Search all documents...';
    }
    return searchContext.placeholder;
  }, [isContextualSearch, searchContext.placeholder, router.query.globalSearch]);

  // Get contextual suggestions
  const getContextualSuggestions = useCallback((): string[] => {
    return isContextualSearch 
      ? searchContext.suggestions 
      : ['Search everything', 'All documents', 'Global search'];
  }, [isContextualSearch, searchContext.suggestions]);

  return {
    // Context information
    searchContext,
    isContextualSearch,
    
    // Search state
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    
    // Search functionality
    performContextualSearch,
    clearSearch,
    
    // Context switching
    switchToGlobalSearch,
    getContextualPlaceholder,
    getContextualSuggestions,
  };
};