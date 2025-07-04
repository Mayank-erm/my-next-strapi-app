// src/pages/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import Carousel from '@/components/Carousel';
import ProposalCard from '@/components/ProposalCard';
import Pagination from '@/components/Pagination';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import DocumentPreviewModal from '@/components/DocumentPreviewModal';
import { MeiliSearch } from 'meilisearch';
import { getDocumentUrl } from '@/config/documentMapping'; // Import the new mapping helper

// --- MeiliSearch Configuration ---
const MEILISEARCH_HOST = 'http://localhost:7700';
export const MEILISEARCH_API_KEY = 'masterKey'; // Exported for potential use in Header or other components

const meiliSearchClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

// Define the interface for Strapi proposals
interface StrapiProposal {
  id: number;
  documentId: string;
  unique_id: string; // Added unique_id - this is the *interface property name*
  SF_Number: string; // Still keep SF_Number for now as it's used in DocumentPreviewModal
  Client_Name: string;
  Client_Type: string;
  Client_Contact: string;
  Client_Contact_Title: string;
  Client_Journey: string;
  Document_Type: string;
  Document_Sub_Type: string;
  Document_Value_Range: string;
  Document_Outcome: string;
  Last_Stage_Change_Date: string;
  Industry: string;
  Sub_Industry: string;
  Service: string;
  Sub_Service: string;
  Business_Unit: string;
  Region: string;
  Country: string;
  State: string;
  City: string;
  Author: string;
  PIC: string;
  PM: string;
  Keywords: string;
  Commercial_Program: string;
  Project_Team: null;
  SMEs: null;
  Competitors: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  Description: any[];
  documentUrl?: string; // Optional document URL from data source
  proposalName?: string; // Added for robustness in DocumentPreviewModal title fallback
}

// Helper to extract data regardless of Strapi 'attributes' nesting
const extractProposalData = (item: any): Omit<StrapiProposal, 'id' | 'documentId'> => {
  const data = item.attributes || item; // Use attributes if present, otherwise the item itself

  return {
    unique_id: data.Unique_Id || data.SF_Number || 'N/A', // Prefer Unique_Id, fallback to SF_Number
    SF_Number: data.SF_Number || data.Unique_Id || 'N/A', // Ensure SF_Number is populated
    Client_Name: data.Client_Name || 'N/A',
    Client_Type: data.Client_Type || 'N/A',
    Client_Contact: data.Client_Contact || 'N/A',
    Client_Contact_Title: data.Client_Contact_Title || 'N/A',
    Client_Journey: data.Client_Journey || 'N/A',
    Document_Type: data.Document_Type || 'N/A',
    Document_Sub_Type: data.Document_Sub_Type || 'N/A',
    Document_Value_Range: data.Document_Value_Range || 'N/A',
    Document_Outcome: data.Document_Outcome || 'N/A',
    Last_Stage_Change_Date: data.Last_Stage_Change_Date || 'N/A',
    Industry: data.Industry || 'N/A',
    Sub_Industry: data.Sub_Industry || 'N/A',
    Service: data.Service || 'N/A',
    Sub_Service: data.Sub_Service || 'N/A',
    Business_Unit: data.Business_Unit || 'N/A',
    Region: data.Region || 'N/A',
    Country: data.Country || 'N/A',
    State: data.State || 'N/A',
    City: data.City || 'N/A',
    Author: data.Author || 'N/A',
    PIC: data.PIC || 'N/A',
    PM: data.PM || 'N/A',
    Keywords: data.Keywords || 'N/A',
    Commercial_Program: data.Commercial_Program || 'N/A',
    Project_Team: data.Project_Team || null,
    SMEs: data.SMEs || null,
    Competitors: data.Competitors || 'N/A',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    publishedAt: data.publishedAt || new Date().toISOString(),
    Description: data.Description || [],
    documentUrl: data.documentUrl,
    proposalName: data.proposalName || data.SF_Number || data.Unique_Id || 'N/A', // Added for robustness
  };
};

const ITEMS_PER_PAGE = 8;

const HomePage: React.FC<HomePageProps> = ({
  initialProposals,
  initialTotalProposals,
  initialCurrentPage,
  initialLatestProposals,
  initialError,
  initialSortBy = 'publishedAt:desc',
}) => {
  const router = useRouter();
  const searchTerm = (router.query.searchTerm as string) || ''; // Read searchTerm from URL

  const [proposals, setProposals] = useState<StrapiProposal[]>(initialProposals);
  const [totalProposals, setTotalProposals] = useState<number>(initialTotalProposals);
  const [latestProposals, setLatestProposals] = useState<StrapiProposal[]>(initialLatestProposals);
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(initialCurrentPage);

  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [activeView, setActiveView] = useState('grid');

  // State for document preview modal
  const [isDocumentPreviewOpen, setIsDocumentPreviewOpen] = useState(false);
  const [selectedProposalForPreview, setSelectedProposalForPreview] = useState<StrapiProposal | null>(null);

  // Debounce for URL search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);


  const fetchProposals = useCallback(async (
    page: number,
    currentSearchTerm: string,
    currentSortBy: string
  ) => {
    setIsLoading(true);
    setError(null);

    const strapiApiUrl = 'http://localhost:1337/api/document-stores';
    let proposalsData: any = {};

    try {
      if (currentSearchTerm) {
        // Perform MeiliSearch when a search term is present
        const meiliSearchResults = await meiliSearchClient.index('document_stores').search(currentSearchTerm, {
          offset: (page - 1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
          sort: [currentSortBy],
        });

        // Map MeiliSearch results using the new helper
        const fetchedProposals: StrapiProposal[] = (meiliSearchResults.hits || []).map((hit: any) => ({
          ...extractProposalData(hit),
          id: hit.id,
          documentId: hit.id.toString(),
          documentUrl: getDocumentUrl(hit.SF_Number || hit.Unique_Id, hit.id.toString()),
        }));

        setProposals(fetchedProposals);
        setTotalProposals(meiliSearchResults.estimatedTotalHits || 0);

      } else {
        // Fallback to Strapi API for general listing when no search term
        const queryParams = new URLSearchParams();
        queryParams.append('pagination[page]', String(page));
        queryParams.append('pagination[pageSize]', String(ITEMS_PER_PAGE));
        queryParams.append('filters[publishedAt][$notNull]', 'true');
        queryParams.append('sort', currentSortBy);

        const response = await fetch(`${strapiApiUrl}?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error(`Strapi API returned status ${response.status}`);
        }
        proposalsData = await response.json();
        const fetchedProposals: StrapiProposal[] = (proposalsData.data || []).map((item: any) => ({
          // Map Strapi API results using the new helper
          ...extractProposalData(item),
          id: item.id,
          documentId: item.id.toString(),
          documentUrl: item.attributes?.documentUrl || getDocumentUrl(item.attributes?.SF_Number || item.attributes?.Unique_Id, item.id.toString()),
        }));
        setProposals(fetchedProposals);
        setTotalProposals(proposalsData.meta?.pagination?.total || 0);
      }
    } catch (err: any) {
      console.error('Failed to fetch proposals:', err);
      setError(`Failed to load data: ${err.message}. Please ensure all services are running and configured.`);
      setProposals([]);
      setTotalProposals(0);
    } finally {
      setIsLoading(false);
    }
  }, []);


  // Effect to re-fetch data and update URL when relevant state changes
  useEffect(() => {
    const newQuery: { [key: string]: string | string[] } = {
      page: String(currentPage),
      searchTerm: searchTerm, // Use searchTerm from URL
      sortBy: sortBy,
    };
    
    const cleanedQuery: { [key: string]: string | string[] } = {};
    for (const key in newQuery) {
        const value = newQuery[key];
        if (value !== '' && value !== null && value !== undefined && !(Array.isArray(value) && value.length === 0)) {
            if (key === 'page' && value === '1') continue;
            if (key === 'sortBy' && value === 'publishedAt:desc') continue;
            cleanedQuery[key] = value;
        }
    }

    const currentRouterQueryCopy = { ...router.query };
    Object.keys(currentRouterQueryCopy).forEach(key => {
        const value = currentRouterQueryCopy[key];
        if (!Object.prototype.hasOwnProperty.call(cleanedQuery, key) && 
            (value === '1' || value === 'publishedAt:desc' || 
             (Array.isArray(value) && value.length === 0) || value === '')) {
            delete currentRouterQueryCopy[key];
        }
    });

    const currentQueryString = new URLSearchParams(currentRouterQueryCopy as Record<string, string | string[]>).toString();
    const newQueryString = new URLSearchParams(cleanedQuery as Record<string, string | string[]>).toString();

    if (currentQueryString !== newQueryString) {
      router.replace({
        pathname: router.pathname,
        query: cleanedQuery,
      }, undefined, { shallow: true });
    }

    fetchProposals(
      currentPage,
      searchTerm, // Use searchTerm from URL
      sortBy
    );
  }, [
    currentPage,
    searchTerm, // Now reacts to URL searchTerm
    sortBy,
    router,
    fetchProposals
  ]);
  
  const handleClearFilters = useCallback(() => {
    router.replace({ pathname: router.pathname, query: {} }, undefined, { shallow: true }); // Clear all URL params
    setSortBy('publishedAt:desc');
    setCurrentPage(1);
  }, [router]);

  const handleSortByChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleSearchResultClick = useCallback(async (proposal: StrapiProposal) => {
    // When a preview is requested, fetch the full proposal data from Strapi
    // to ensure we have the most up-to-date documentUrl and Description.
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:1337/api/document-stores/${proposal.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch full proposal details for ID: ${proposal.id}`);
      }
      const fullProposalData = await response.json();
      const fetchedProposal: StrapiProposal = {
        ...extractProposalData(fullProposalData.data), // Use the helper for consistency
        id: fullProposalData.data.id,
        documentId: fullProposalData.data.id.toString(),
        documentUrl: fullProposalData.data.attributes?.documentUrl || getDocumentUrl(fullProposalData.data.attributes?.SF_Number || fullProposalData.data.attributes?.Unique_Id, fullProposalData.data.id.toString()),
      };
      setSelectedProposalForPreview(fetchedProposal);
      setIsDocumentPreviewOpen(true);
    } catch (err: any) {
      console.error("Error fetching full proposal for preview:", err);
      setError(`Failed to load document for preview: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeDocumentPreview = useCallback(() => {
    setIsDocumentPreviewOpen(false);
    setSelectedProposalForPreview(null);
  }, []);

  const totalPages = Math.ceil(totalProposals / ITEMS_PER_PAGE);

  return (
    <Layout
      searchTerm={searchTerm} // Pass searchTerm from URL
      isLoading={isLoading}
      onSearchResultClick={handleSearchResultClick}
      activeContentType="Proposals" // Default value, since no filter is applied here
      activeServiceLines={[]}
      activeIndustries={[]}
      activeRegions={[]}
      activeDate=""
      onContentTypeChange={() => {}}
      onServiceLineChange={() => {}}
      onIndustryChange={() => {}}
      onRegionChange={() => {}}
      onDateChange={() => {}}
      onSearchInFiltersChange={() => {}}
      onClearAllFilters={() => {}}
    >
      <Carousel latestProposals={latestProposals} />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-text-dark-gray mb-4 sm:mb-0">Popular resources</h2>
        <div className="flex items-center space-x-4 text-text-medium-gray text-sm flex-wrap">
          <span className="font-semibold">Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={handleSortByChange}
              className="p-2 border rounded-lg bg-white appearance-none pr-8 cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:border-transparent"
            >
              <option value="publishedAt:desc">Published Date (Newest)</option>
              <option value="publishedAt:asc">Published Date (Oldest)</option>
              {/* Changed SF_Number to unique_id for sorting options if MeiliSearch supports it */}
              <option value="unique_id:asc">Unique ID (A-Z)</option>
              <option value="unique_id:desc">Unique ID (Z-A)</option>
              <option value="Client_Name:asc">Client Name (A-Z)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDownIcon className="h-4 w-4" />
            </div>
          </div>
          
          <div className="flex space-x-2 ml-auto sm:ml-0 mt-2 sm:mt-0">
            <button
              onClick={() => setActiveView('grid')}
              className={`p-2 border rounded-lg text-gray-700 transition-colors
                          ${activeView === 'grid' ? 'bg-strapi-green-light text-white shadow-sm' : 'bg-white hover:bg-gray-100'}
                          focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM13 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
              </svg>
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`p-2 border rounded-lg text-gray-700 transition-colors
                          ${activeView === 'list' ? 'bg-strapi-green-light text-white shadow-sm' : 'bg-white hover:bg-gray-100'}
                          focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-500">
          <svg className="animate-spin h-10 w-10 text-strapi-green-light mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl font-medium">Loading proposals...</p>
        </div>
      ) : proposals.length > 0 ? (
        <div className={activeView === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
          {proposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} isListView={activeView === 'list'} />
          ))}
        </div>
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-500">
          <span className="text-6xl mb-4" role="img" aria-label="No results">🔍</span>
          <p className="text-xl font-medium">No published proposals found matching your criteria.</p>
          <p className="text-md mt-2">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      {/* Document Preview Modal, conditionally rendered */}
      {isDocumentPreviewOpen && selectedProposalForPreview && (
        <DocumentPreviewModal
          proposal={selectedProposalForPreview}
          onClose={closeDocumentPreview}
        />
      )}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (context) => {
  const STRAPI_API_URL = 'http://localhost:1337/api/document-stores';
  let initialProposals: StrapiProposal[] = [];
  let initialTotalProposals = 0;
  let initialLatestProposals: StrapiProposal[] = [];
  let initialError: string | null = null;

  const query = context.query;
  const page = parseInt(query.page as string || '1');
  const searchTerm = (query.searchTerm as string) || ''; // Read searchTerm from URL
  const sortBy = (query.sortBy as string) || 'publishedAt:desc';

  const offset = (page - 1) * ITEMS_PER_PAGE;


  const ssrQueryParams = new URLSearchParams();
  ssrQueryParams.append('pagination[page]', String(page));
  ssrQueryParams.append('pagination[pageSize]', String(ITEMS_PER_PAGE));
  ssrQueryParams.append('filters[publishedAt][$notNull]', 'true');
  ssrQueryParams.append('sort', sortBy);

  // Apply searchTerm filter if present in URL
  if (searchTerm) {
      // Assuming MeiliSearch is used for keyword search on homepage also
      const meiliSearchClient = new MeiliSearch({
        host: MEILISEARCH_HOST,
        apiKey: MEILISEARCH_API_KEY,
      });
      try {
        const meiliSearchResults = await meiliSearchClient.index('document_stores').search(searchTerm, {
          offset: offset,
          limit: ITEMS_PER_PAGE,
          sort: [sortBy],
        });
        initialProposals = meiliSearchResults.hits.map((hit: any) => ({
          ...extractProposalData(hit), // Use the helper for consistency
          id: hit.id,
          documentId: hit.id.toString(),
          documentUrl: getDocumentUrl(hit.SF_Number || hit.Unique_Id, hit.id.toString()),
        })) as StrapiProposal[] || [];
        initialTotalProposals = meiliSearchResults.estimatedTotalHits || 0;
      } catch (meiliError: any) {
        console.error('[getServerSideProps] MeiliSearch failed for Homepage:', meiliError);
        initialError = `Search failed: ${meiliError.message}. Falling back to general listing.`;
        // Fallback to Strapi API if MeiliSearch fails
        const response = await fetch(`${STRAPI_API_URL}?${ssrQueryParams.toString()}`);
        const data = await response.json();
        initialProposals = (data.data || []).map((item: any) => ({
          ...extractProposalData(item), // Use the helper for consistency
          id: item.id,
          documentId: item.id.toString(),
          documentUrl: item.attributes?.documentUrl || getDocumentUrl(item.attributes?.SF_Number || item.attributes?.Unique_Id, item.id.toString()),
        })) as StrapiProposal[] || [];
        initialTotalProposals = data.meta?.pagination?.total || 0;
      }

  } else {
    try {
      const proposalsResponse = await fetch(`${STRAPI_API_URL}?${ssrQueryParams.toString()}`);
      
      if (!proposalsResponse.ok) {
        throw new Error(`Strapi proposals API returned status ${proposalsResponse.status}`);
      }
      const proposalsData = await proposalsResponse.json();
      
      initialProposals = (proposalsData.data || []).map((item: any) => ({
        ...extractProposalData(item), // Use the helper for consistency
        id: item.id,
        documentId: item.id.toString(),
        documentUrl: item.attributes?.documentUrl || getDocumentUrl(item.attributes?.SF_Number || item.attributes?.Unique_Id, item.id.toString()),
      })) as StrapiProposal[] || [];
      initialTotalProposals = proposalsData.meta?.pagination?.total || 0;
    } catch (err: any) {
      console.error('[getServerSideProps] Failed to fetch data from Strapi:', err);
      initialError = `Failed to load data: ${err.message}. Please ensure Strapi is running and accessible at ${STRAPI_API_URL}.`;
    }
  }


  try {
    // Fetching latest 3 proposals for the carousel
    const latestProposalsResponse = await fetch(`${STRAPI_API_URL}?sort=publishedAt:desc&pagination[limit]=3`);
    if (!latestProposalsResponse.ok) {
      console.warn(`Strapi latest proposals API returned status ${latestProposalsResponse.status}. Carousel might not show latest data.`);
      initialLatestProposals = [];
    } else {
      const latestData = await latestProposalsResponse.json();
      initialLatestProposals = (latestData.data || []).map((item: any) => ({
        ...extractProposalData(item), // Use the helper for consistency
        id: item.id,
        documentId: item.id.toString(),
        documentUrl: item.attributes?.documentUrl || getDocumentUrl(item.attributes?.SF_Number || item.attributes?.Unique_Id, item.id.toString()),
      })) as StrapiProposal[] || [];
    }

  } catch (err: any) {
    console.error('[getServerSideProps] Failed to fetch latest data from Strapi:', err);
  }

  return {
    props: {
      initialProposals,
      initialTotalProposals,
      initialCurrentPage: page,
      initialLatestProposals,
      initialError,
      initialSortBy: sortBy,
    },
  };
};

export default HomePage;