// src/pages/index.tsx (UPDATED: Handles search result click, preview modal state, List View Layout)
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import Carousel from '@/components/Carousel';
import ProposalCard from '@/components/ProposalCard';
import Pagination from '@/components/Pagination';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import FilterBy from '@/components/FilterBy';
import DocumentPreviewModal from '@/components/DocumentPreviewModal'; // Import the preview modal
import { MeiliSearch } from 'meilisearch';

// --- MeiliSearch Configuration ---
const MEILISEARCH_HOST = 'http://localhost:7700';
const MEILISEARCH_API_KEY = 'masterKey';

const meiliSearchClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

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

// Define props for the HomePage component
interface HomePageProps {
  initialProposals: StrapiProposal[];
  initialTotalProposals: number;
  initialCurrentPage: number;
  initialLatestProposals: StrapiProposal[];
  initialError?: string | null;
  initialSearchTerm?: string;
  initialContentTypeFilter?: string;
  initialServiceLineFilter?: string[];
  initialIndustryFilter?: string[];
  initialRegionFilter?: string[];
  initialDateFilter?: string;
  initialSortBy?: string;
}

const ITEMS_PER_PAGE = 8;

const HomePage: React.FC<HomePageProps> = ({
  initialProposals,
  initialTotalProposals,
  initialCurrentPage,
  initialLatestProposals,
  initialError,
  initialSearchTerm = '',
  initialContentTypeFilter = 'Proposals',
  initialServiceLineFilter = [],
  initialIndustryFilter = [],
  initialRegionFilter = [],
  initialDateFilter = '',
  initialSortBy = 'publishedAt:desc',
}) => {
  const router = useRouter();

  const [proposals, setProposals] = useState<StrapiProposal[]>(initialProposals);
  const [totalProposals, setTotalProposals] = useState<number>(initialTotalProposals);
  const [latestProposals, setLatestProposals] = useState<StrapiProposal[]>(initialLatestProposals);
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(initialCurrentPage);

  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [contentTypeFilter, setContentTypeFilter] = useState<string>(initialContentTypeFilter);
  const [serviceLineFilter, setServiceLineFilter] = useState<string[]>(initialServiceLineFilter);
  const [industryFilter, setIndustryFilter] = useState<string[]>(initialIndustryFilter);
  const [regionFilter, setRegionFilter] = useState<string[]>(initialRegionFilter);
  const [dateFilter, setDateFilter] = useState<string>(initialDateFilter);
  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [activeView, setActiveView] = useState('grid'); // Default to grid view
  const [filterSearchTerm, setFilterSearchTerm] = useState<string>('');

  // State for document preview modal
  const [isDocumentPreviewOpen, setIsDocumentPreviewOpen] = useState(false);
  const [selectedProposalForPreview, setSelectedProposalForPreview] = useState<StrapiProposal | null>(null);


  // Debounce for search term
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
    currentContentType: string,
    currentServiceLines: string[],
    currentIndustries: string[],
    currentRegions: string[],
    currentDate: string,
    currentSortBy: string
  ) => {
    setIsLoading(true);
    setError(null);

    const strapiApiUrl = 'http://localhost:1337/api/proposals';
    let proposalsData: any = {};

    try {
      if (currentSearchTerm) {
        // Perform MeiliSearch when a search term is present
        const meiliSearchResults = await meiliSearchClient.index('proposals').search(currentSearchTerm, {
          offset: (page - 1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
        });

        setProposals(meiliSearchResults.hits as StrapiProposal[] || []);
        setTotalProposals(meiliSearchResults.estimatedTotalHits || 0);

      } else {
        // Fallback to Strapi API for general listing when no search term
        const offset = (page - 1) * ITEMS_PER_PAGE;
        const queryParams = new URLSearchParams();
        queryParams.append('pagination[start]', String(offset));
        queryParams.append('pagination[limit]', String(ITEMS_PER_PAGE));
        queryParams.append('populate', 'chooseEmployee');
        queryParams.append('filters[publishedAt][$notNull]', 'true');
        queryParams.append('sort', currentSortBy);

        const response = await fetch(`${strapiApiUrl}?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error(`Strapi API returned status ${response.status}`);
        }
        proposalsData = await response.json();
        setProposals(proposalsData.data || []);
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
      searchTerm: debouncedSearchTerm,
      contentType: contentTypeFilter,
      serviceLine: serviceLineFilter.join(','),
      industry: industryFilter.join(','),
      region: regionFilter.join(','),
      date: dateFilter,
      sortBy: sortBy,
    };
    
    const cleanedQuery: { [key: string]: string | string[] } = {};
    for (const key in newQuery) {
        const value = newQuery[key];
        if (value !== '' && value !== null && value !== undefined && !(Array.isArray(value) && value.length === 0)) {
            if (key === 'page' && value === '1') continue;
            if (key === 'contentType' && value === 'Proposals') continue;
            if (key === 'sortBy' && value === 'publishedAt:desc') continue;
            cleanedQuery[key] = value;
        }
    }

    const currentRouterQueryCopy = { ...router.query };
    Object.keys(currentRouterQueryCopy).forEach(key => {
        const value = currentRouterQueryCopy[key];
        if (!Object.prototype.hasOwnProperty.call(cleanedQuery, key) && 
            (value === '1' || value === 'Proposals' || value === 'publishedAt:desc' || 
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
      debouncedSearchTerm,
      contentTypeFilter,
      serviceLineFilter,
      industryFilter,
      regionFilter,
      dateFilter,
      sortBy
    );
  }, [
    currentPage,
    debouncedSearchTerm,
    contentTypeFilter,
    JSON.stringify(serviceLineFilter),
    JSON.stringify(industryFilter),
    JSON.stringify(regionFilter),
    dateFilter,
    sortBy,
    router,
    fetchProposals
  ]);

  const handleContentTypeChange = useCallback((type: string) => { 
    setContentTypeFilter(type); 
    setCurrentPage(1); 
  }, []);

  const handleServiceLineChange = useCallback((lines: string[]) => { 
    setServiceLineFilter(lines); 
    setCurrentPage(1); 
  }, []);

  const handleIndustryChange = useCallback((industries: string[]) => { 
    setIndustryFilter(industries); 
    setCurrentPage(1); 
  }, []);

  const handleRegionChange = useCallback((regions: string[]) => { 
    setRegionFilter(regions); 
    setCurrentPage(1); 
  }, []);

  const handleDateChange = useCallback((date: string) => { 
    setDateFilter(date); 
    setCurrentPage(1); 
  }, []);
  
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setContentTypeFilter('Proposals');
    setServiceLineFilter([]);
    setIndustryFilter([]);
    setRegionFilter([]);
    setDateFilter('');
    setSortBy('publishedAt:desc');
    setCurrentPage(1);
  }, []);

  const handleSearchTermChange = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const handleSearchInFiltersChange = useCallback((term: string) => {
    setFilterSearchTerm(term);
  }, []);

  const handleSortByChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  }, []);

  // Handler for when a search result is clicked in the Header modal
  const handleSearchResultClick = useCallback((proposal: StrapiProposal) => {
    setSelectedProposalForPreview(proposal);
    setIsDocumentPreviewOpen(true);
  }, []);

  // Handler to close the Document Preview Modal
  const closeDocumentPreview = useCallback(() => {
    setIsDocumentPreviewOpen(false);
    setSelectedProposalForPreview(null);
  }, []);

  const totalPages = Math.ceil(totalProposals / ITEMS_PER_PAGE);

  return (
    <Layout
      searchTerm={searchTerm}
      onSearchChange={handleSearchTermChange}
      isLoading={isLoading}
      onSearchResultClick={handleSearchResultClick} // Pass the new handler
      activeContentType={contentTypeFilter}
      activeServiceLines={serviceLineFilter}
      activeIndustries={industryFilter}
      activeRegions={regionFilter}
      activeDate={dateFilter}
      onContentTypeChange={handleContentTypeChange}
      onServiceLineChange={handleServiceLineChange}
      onIndustryChange={handleIndustryChange}
      onRegionChange={handleRegionChange}
      onDateChange={handleDateChange}
      onSearchInFiltersChange={handleSearchInFiltersChange}
      onClearAllFilters={handleClearFilters}
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
              <option value="proposalName:asc">Proposal Name (A-Z)</option>
              <option value="proposalName:desc">Proposal Name (Z-A)</option>
              <option value="clientName:asc">Client Name (A-Z)</option>
              <option value="opportunityNumber:asc">Opportunity Number (Asc)</option>
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
  const STRAPI_API_URL = 'http://localhost:1337/api/proposals';
  let initialProposals: StrapiProposal[] = [];
  let initialTotalProposals = 0;
  let initialLatestProposals: StrapiProposal[] = [];
  let initialError: string | null = null;

  const query = context.query;
  const page = parseInt(query.page as string || '1');
  const searchTerm = (query.searchTerm as string) || '';
  const contentType = (query.contentType as string) || 'Proposals';
  const serviceLine = query.serviceLine
    ? (Array.isArray(query.serviceLine) ? query.serviceLine : String(query.serviceLine).split(','))
    : [];
  const industry = query.industry
    ? (Array.isArray(query.industry) ? query.industry : String(query.industry).split(','))
    : [];
  const region = query.region
    ? (Array.isArray(query.region) ? query.region : String(query.region).split(','))
    : [];
  const date = (query.date as string) || '';
  const sortBy = (query.sortBy as string) || 'publishedAt:desc';


  const offset = (page - 1) * ITEMS_PER_PAGE;

  const ssrQueryParams = new URLSearchParams();
  ssrQueryParams.append('pagination[start]', String(offset));
  ssrQueryParams.append('pagination[limit]', String(ITEMS_PER_PAGE));
  ssrQueryParams.append('populate', 'chooseEmployee');
  ssrQueryParams.append('filters[publishedAt][$notNull]', 'true');
  ssrQueryParams.append('sort', sortBy);


  try {
    const proposalsResponse = await fetch(`${STRAPI_API_URL}?${ssrQueryParams.toString()}`);
    
    if (!proposalsResponse.ok) {
      throw new Error(`Strapi proposals API returned status ${proposalsResponse.status}`);
    }
    const proposalsData = await proposalsResponse.json();
    
    initialProposals = proposalsData.data || [];
    initialTotalProposals = proposalsData.meta?.pagination?.total || 0;

    const latestProposalsResponse = await fetch(`${STRAPI_API_URL}?sort=publishedAt:desc&pagination[limit]=2`);
    if (!latestProposalsResponse.ok) {
      console.warn(`Strapi latest proposals API returned status ${latestProposalsResponse.status}. Carousel might not show latest data.`);
      initialLatestProposals = [];
    } else {
      const latestData = await latestProposalsResponse.json();
      initialLatestProposals = latestData.data || [];
    }

  } catch (err: any) {
    console.error('[getServerSideProps] Failed to fetch data from Strapi:', err);
    initialError = `Failed to load data: ${err.message}. Please ensure Strapi is running and accessible at ${STRAPI_API_URL}.`;
  }

  return {
    props: {
      initialProposals,
      initialTotalProposals,
      initialCurrentPage: page,
      initialLatestProposals,
      initialError,
      initialSearchTerm: searchTerm,
      initialContentTypeFilter: contentType,
      initialServiceLineFilter: serviceLine as string[],
      initialIndustryFilter: industry as string[],
      initialRegionFilter: region as string[],
      initialDateFilter: date,
      initialSortBy: sortBy,
    },
  };
};

export default HomePage;