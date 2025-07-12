// src/hooks/useDynamicFilterOptions.ts
import { useState, useEffect, useCallback } from 'react';
import { MeiliSearch } from 'meilisearch';

// MeiliSearch Configuration
const MEILISEARCH_HOST = process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY || 'masterKey';

const meiliSearchClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

export interface FilterOptions {
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
}

export interface UseDynamicFilterOptionsReturn {
  filterOptions: FilterOptions;
  isLoading: boolean;
  error: string | null;
  refreshOptions: () => Promise<void>;
  getFilteredOptions: (field: keyof FilterOptions, searchTerm: string) => string[];
  getFacetCounts: (field: keyof FilterOptions) => { [key: string]: number };
}

export const useDynamicFilterOptions = (): UseDynamicFilterOptionsReturn => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    clientTypes: [],
    documentTypes: [],
    documentSubTypes: [],
    industries: [],
    subIndustries: [],
    services: [],
    subServices: [],
    businessUnits: [],
    regions: [],
    countries: [],
    states: [],
    cities: [],
  });

  const [facetCounts, setFacetCounts] = useState<{ [key: string]: { [value: string]: number } }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapping of filter keys to MeiliSearch field names
  const fieldMapping: { [K in keyof FilterOptions]: string } = {
    clientTypes: 'Client_Type',
    documentTypes: 'Document_Type',
    documentSubTypes: 'Document_Sub_Type',
    industries: 'Industry',
    subIndustries: 'Sub_Industry',
    services: 'Service',
    subServices: 'Sub_Service',
    businessUnits: 'Business_Unit',
    regions: 'Region',
    countries: 'Country',
    states: 'State',
    cities: 'City',
  };

  const fetchDistinctValues = useCallback(async (field: string): Promise<{ values: string[], counts: { [key: string]: number } }> => {
    try {
      console.log(`🔍 Fetching distinct values for field: ${field}`);
      
      const searchResults = await meiliSearchClient
        .index('document_stores')
        .search('', {
          facets: [field],
          limit: 0,
        });

      const facetDistribution = searchResults.facetDistribution;
      
      if (facetDistribution && facetDistribution[field]) {
        const counts = facetDistribution[field];
        
        const values = Object.keys(counts)
          .filter(value => value && value.trim() !== '' && value.toLowerCase() !== 'null' && value.toLowerCase() !== 'undefined')
          .sort((a, b) => {
            const countA = counts[a] || 0;
            const countB = counts[b] || 0;
            if (countA !== countB) {
              return countB - countA;
            }
            return a.localeCompare(b);
          });

        console.log(`✅ Found ${values.length} distinct values for ${field}:`, values.slice(0, 5));
        
        return { values, counts };
      }

      console.log(`⚠️ No facet distribution found for field: ${field}`);
      return { values: [], counts: {} };
      
    } catch (err: any) {
      console.error(`❌ Failed to fetch distinct values for ${field}:`, err);
      return { values: [], counts: {} };
    }
  }, []);

  const fetchAllFilterOptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting to fetch all filter options...');
      
      const index = meiliSearchClient.index('document_stores');
      
      try {
        await index.getStats();
        console.log('✅ MeiliSearch connection successful');
      } catch (connectionError) {
        throw new Error(`Cannot connect to MeiliSearch: ${connectionError}`);
      }

      const promises = Object.entries(fieldMapping).map(async ([key, field]) => {
        try {
          const result = await fetchDistinctValues(field);
          return { key: key as keyof FilterOptions, field, ...result };
        } catch (err) {
          console.warn(`⚠️ Failed to fetch values for ${field}, using empty array`);
          return { key: key as keyof FilterOptions, field, values: [], counts: {} };
        }
      });

      const results = await Promise.allSettled(promises);
      
      const newFilterOptions: FilterOptions = {
        clientTypes: [],
        documentTypes: [],
        documentSubTypes: [],
        industries: [],
        subIndustries: [],
        services: [],
        subServices: [],
        businessUnits: [],
        regions: [],
        countries: [],
        states: [],
        cities: [],
      };

      const newFacetCounts: { [key: string]: { [value: string]: number } } = {};

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const { key, field, values, counts } = result.value;
          newFilterOptions[key] = values;
          newFacetCounts[field] = counts;
        } else {
          console.error(`❌ Promise rejected:`, result.reason);
        }
      });

      setFilterOptions(newFilterOptions);
      setFacetCounts(newFacetCounts);

      const totalOptions = Object.values(newFilterOptions).flat().length;
      console.log('✅ Successfully loaded dynamic filter options:', {
        totalOptions,
        breakdown: Object.entries(newFilterOptions).reduce((acc, [key, values]) => {
          acc[key] = values.length;
          return acc;
        }, {} as { [key: string]: number })
      });

      if (totalOptions === 0) {
        setError('No filter options found. Check if your MeiliSearch index has filterable attributes configured.');
      }

    } catch (err: any) {
      console.error('❌ Failed to fetch filter options:', err);
      setError(`Failed to load filter options: ${err.message}`);
      
      setFilterOptions({
        clientTypes: [],
        documentTypes: [],
        documentSubTypes: [],
        industries: [],
        subIndustries: [],
        services: [],
        subServices: [],
        businessUnits: [],
        regions: [],
        countries: [],
        states: [],
        cities: [],
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchDistinctValues]); // REMOVED fieldMapping from dependencies

  const getFilteredOptions = useCallback((field: keyof FilterOptions, searchTerm: string): string[] => {
    const options = filterOptions[field] || [];
    if (!searchTerm.trim()) {
      return options;
    }
    
    return options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filterOptions]);

  const getFacetCounts = useCallback((field: keyof FilterOptions): { [key: string]: number } => {
    const meiliField = fieldMapping[field];
    return facetCounts[meiliField] || {};
  }, [facetCounts]); // Only depend on facetCounts, not fieldMapping

  const refreshOptions = useCallback(async () => {
    console.log('🔄 Refreshing filter options...');
    await fetchAllFilterOptions();
  }, [fetchAllFilterOptions]);

  // Load options on mount ONLY - with empty dependency array
  useEffect(() => {
    fetchAllFilterOptions();
  }, []); // EMPTY dependency array to run only once on mount

  return {
    filterOptions,
    isLoading,
    error,
    refreshOptions,
    getFilteredOptions,
    getFacetCounts,
  };
};