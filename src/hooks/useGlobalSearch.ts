// src/hooks/useGlobalSearch.ts - ENHANCED VERSION WITH BETTER ATTACHMENT HANDLING
import { useState, useCallback, useRef } from 'react';
import { MeiliSearch } from 'meilisearch';
import { StrapiProposal } from '@/types/strapi';
import { extractProposalData } from '@/utils/dataHelpers';
import { getBestDocumentUrl } from '@/config/documentMapping';

// MeiliSearch client configuration
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

interface UseGlobalSearchResult {
  searchResults: StrapiProposal[];
  isSearching: boolean;
  searchError: string | null;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
}

// Helper function to fetch complete document data from Strapi
const fetchCompleteDocumentData = async (proposalId: number): Promise<Partial<StrapiProposal> | null> => {
  try {
    const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337/api';
    const response = await fetch(`${strapiApiUrl}/document-stores/${proposalId}?populate=*`);
    
    if (!response.ok) {
      console.warn(`Could not fetch complete data for proposal ${proposalId}: ${response.status}`);
      return null;
    }
    
    const apiData = await response.json();
    const extractedData = extractProposalData(apiData.data);
    
    return {
      ...extractedData,
      // Ensure we preserve the complete attachment data
      Attachments: apiData.data?.attributes?.Attachments || null,
      Description: apiData.data?.attributes?.Description || [],
      Project_Team: apiData.data?.attributes?.Project_Team || null,
      SMEs: apiData.data?.attributes?.SMEs || null,
      Pursuit_Team: apiData.data?.attributes?.Pursuit_Team || null,
    };
  } catch (error) {
    console.warn(`Error fetching complete data for proposal ${proposalId}:`, error);
    return null;
  }
};

export const useGlobalSearch = (): UseGlobalSearchResult => {
  const [searchResults, setSearchResults] = useState<StrapiProposal[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Ref to track the latest search to avoid race conditions
  const searchIdRef = useRef(0);

  // Main search function with enhanced data fetching
  const performSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    // Increment search ID to handle race conditions
    const currentSearchId = ++searchIdRef.current;
    
    setIsSearching(true);
    setSearchError(null);

    try {
      console.log('🔍 Performing enhanced global search:', { query, searchId: currentSearchId });

      // Enhanced search options - SIMPLIFIED AND FIXED
      const searchOptions: any = {
        limit: 10, // Limit results for autocomplete
        attributesToRetrieve: [
          'id', 'documentId', 'SF_Number', 'Unique_Id', 'unique_id', 'Client_Name',
          'Document_Type', 'Industry', 'Region', 'publishedAt', 'updatedAt'
        ],
        attributesToHighlight: ['Unique_Id', 'unique_id', 'SF_Number', 'Client_Name', 'Document_Type'],
        highlightPreTag: '<mark class="bg-erm-primary bg-opacity-20 text-erm-dark rounded px-1">',
        highlightPostTag: '</mark>',
      };

      const results = await searchClient.index('document_stores').search(query, searchOptions);

      // Check if this search is still the latest one
      if (currentSearchId !== searchIdRef.current) {
        console.log('🔄 Search cancelled - newer search in progress');
        return;
      }

      console.log('📊 Search Results:', {
        hits: results.hits?.length || 0,
        total: results.estimatedTotalHits,
        processingTime: results.processingTimeMs
      });

      // ENHANCED: Transform results with better error handling and complete data fetching
      const transformedResults: StrapiProposal[] = await Promise.all(
        (results.hits || []).map(async (hit: any, index: number) => {
          try {
            console.log(`🔧 Processing hit ${index}:`, hit);

            // ENHANCED: Safe property access with fallbacks
            const id = hit.id || hit.documentId || index + 1;
            const unique_id = hit.unique_id || hit.Unique_Id || hit.SF_Number || `doc-${id}`;
            const documentId = hit.documentId || (id ? id.toString() : `${index + 1}`);

            // Create base proposal object with safe defaults
            const baseProposal: StrapiProposal = {
              id: typeof id === 'number' ? id : parseInt(id as string, 10) || index + 1,
              documentId: documentId,
              unique_id: unique_id,
              SF_Number: hit.SF_Number || hit.unique_id || unique_id,
              Client_Name: hit.Client_Name || 'Unknown Client',
              Client_Type: hit.Client_Type || '',
              Client_Contact: hit.Client_Contact || '',
              Client_Contact_Title: hit.Client_Contact_Title || '',
              Client_Journey: hit.Client_Journey || '',
              Document_Type: hit.Document_Type || 'Document',
              Document_Sub_Type: hit.Document_Sub_Type || '',
              Document_Value_Range: hit.Document_Value_Range || '',
              Document_Outcome: hit.Document_Outcome || '',
              Last_Stage_Change_Date: hit.Last_Stage_Change_Date || hit.updatedAt || new Date().toISOString(),
              Industry: hit.Industry || 'General',
              Sub_Industry: hit.Sub_Industry || '',
              Service: hit.Service || '',
              Sub_Service: hit.Sub_Service || '',
              Business_Unit: hit.Business_Unit || '',
              Region: hit.Region || 'Global',
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
              Attachments: hit.Attachments || null, // This will be enhanced below
              Pursuit_Team: hit.Pursuit_Team || null,
              documentUrl: '', // Will be set below
              value: typeof hit.value === 'number' ? hit.value : 0,
              proposalName: hit.proposalName || unique_id,
              // Add highlighted results for better UX
              _highlightResults: hit._formatted || {},
            };

            // ENHANCED: Try to fetch complete document data with attachments for search results
            // This is done asynchronously to not slow down the search too much
            if (baseProposal.id) {
              try {
                const completeData = await fetchCompleteDocumentData(baseProposal.id);
                if (completeData) {
                  // Merge complete data while preserving search-specific data
                  Object.assign(baseProposal, completeData, {
                    // Preserve these search-specific fields
                    _highlightResults: baseProposal._highlightResults,
                    id: baseProposal.id,
                    documentId: baseProposal.documentId,
                  });
                  console.log(`✅ Enhanced search result ${index} with complete data`);
                } else {
                  console.log(`⚠️ Could not fetch complete data for search result ${index}, using basic data`);
                }
              } catch (fetchError) {
                console.warn(`⚠️ Error fetching complete data for search result ${index}:`, fetchError);
                // Continue with basic data
              }
            }

            // Generate document URL using the helper function
            baseProposal.documentUrl = getBestDocumentUrl(baseProposal);

            console.log(`✅ Successfully processed search hit ${index}:`, {
              id: baseProposal.id,
              unique_id: baseProposal.unique_id,
              documentUrl: baseProposal.documentUrl,
              hasAttachments: !!baseProposal.Attachments
            });

            return baseProposal;

          } catch (hitError) {
            console.error(`❌ Error processing hit ${index}:`, hitError, hit);
            
            // Return a fallback proposal to prevent the entire search from failing
            const fallbackId = index + 1;
            return {
              id: fallbackId,
              documentId: fallbackId.toString(),
              unique_id: `fallback-${fallbackId}`,
              SF_Number: `fallback-${fallbackId}`,
              Client_Name: 'Error Processing Document',
              Client_Type: '',
              Client_Contact: '',
              Client_Contact_Title: '',
              Client_Journey: '',
              Document_Type: 'Document',
              Document_Sub_Type: '',
              Document_Value_Range: '',
              Document_Outcome: '',
              Last_Stage_Change_Date: new Date().toISOString(),
              Industry: 'General',
              Sub_Industry: '',
              Service: '',
              Sub_Service: '',
              Business_Unit: '',
              Region: 'Global',
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
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              publishedAt: new Date().toISOString(),
              Description: [],
              Attachments: null,
              Pursuit_Team: null,
              documentUrl: '',
              value: 0,
              proposalName: `fallback-${fallbackId}`,
              _highlightResults: {},
            } as StrapiProposal;
          }
        })
      );

      // Check again if this search is still the latest one
      if (currentSearchId !== searchIdRef.current) {
        console.log('🔄 Search cancelled after data processing - newer search in progress');
        return;
      }

      console.log(`✅ Successfully transformed ${transformedResults.length} search results with enhanced data`);
      setSearchResults(transformedResults);

    } catch (error: any) {
      // Only set error if this is still the latest search
      if (currentSearchId === searchIdRef.current) {
        console.error('❌ Enhanced global search error:', error);
        let errorMessage = 'Search failed. Please try again.';
        
        if (error.message.includes('index_not_found')) {
          errorMessage = 'Search index not found. Please ensure documents are indexed.';
        } else if (error.message.includes('connection') || error.message.includes('fetch')) {
          errorMessage = 'Cannot connect to search service. Please check if MeiliSearch is running.';
        }
        
        setSearchError(errorMessage);
        setSearchResults([]);
      }
    } finally {
      // Only update loading state if this is still the latest search
      if (currentSearchId === searchIdRef.current) {
        setIsSearching(false);
      }
    }
  }, []);

  // Debounced search function for better UX
  const debouncedSearch = useCallback(debounce(performSearch, 300), [performSearch]);

  const clearSearch = useCallback(() => {
    // Increment search ID to cancel any in-progress searches
    searchIdRef.current++;
    setSearchResults([]);
    setSearchError(null);
    setIsSearching(false);
  }, []);

  return {
    searchResults,
    isSearching,
    searchError,
    performSearch: debouncedSearch, // Use debounced version
    clearSearch,
  };
};