// src/pages/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import Carousel from '@/components/Carousel';
import ProposalCard from '@/components/ProposalCard';
import Pagination from '@/components/Pagination';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { ChevronDownIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import DocumentPreviewModal from '@/components/DocumentPreviewModal';
import { MeiliSearch } from 'meilisearch';
import { getDocumentUrl } from '@/config/documentMapping';
import { STRAPI_API_URL } from '@/config/apiConfig';
import { StrapiProposal } from '@/types/strapi';
import { extractProposalData } from '@/utils/dataHelpers'; // Import shared helper


// --- MeiliSearch Configuration ---
const MEILISEARCH_HOST = 'http://localhost:7700';
export const MEILISEARCH_API_KEY = 'masterKey';

const meiliSearchClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

interface HomePageProps {
  initialProposals: StrapiProposal[];
  initialTotalProposals: number;
  initialCurrentPage: number;
  initialLatestProposals: StrapiProposal[];
  initialError?: string | null;
  initialSortBy?: string;
}

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
  const searchTerm = (router.query.searchTerm as string) || '';

  const [proposals, setProposals] = useState<StrapiProposal[]>(initialProposals);
  const [totalProposals, setTotalProposals] = useState<number>(initialTotalProposals);
  const [latestProposals, setLatestProposals] = useState<StrapiProposal[]>(initialLatestProposals);
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(initialCurrentPage);

  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [activeView, setActiveView] = useState('grid');

  const [isDocumentPreviewOpen, setIsDocumentPreviewOpen] = useState(false);
  const [selectedProposalForPreview, setSelectedProposalForPreview] = useState<StrapiProposal | null>(null);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  // fetchProposals useCallback definition (moved here to be before useEffects that use it)
  const fetchProposals = useCallback(async (
    page: number,
    currentSearchTerm: string,
    currentSortBy: string
  ) => {
    setIsLoading(true);
    setError(null);

    const strapiApiBaseUrl = STRAPI_API_URL.split('?')[0];
    
    try {
      if (currentSearchTerm) {
        const meiliSearchResults = await meiliSearchClient.index('document_stores').search(currentSearchTerm, {
          offset: (page - 1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
          sort: [currentSortBy],
        });

        const fetchedProposals: StrapiProposal[] = (meiliSearchResults.hits || []).map((hit: any) => ({
          ...extractProposalData(hit),
          id: hit.id,
          documentId: hit.id.toString(),
          documentUrl: getDocumentUrl(hit.SF_Number || hit.Unique_Id, hit.id.toString()),
        }));

        setProposals(fetchedProposals);
        setTotalProposals(meiliSearchResults.estimatedTotalHits || 0);

      } else {
        const queryParams = new URLSearchParams();
        queryParams.append('pagination[page]', String(page));
        queryParams.append('pagination[pageSize]', String(ITEMS_PER_PAGE));
        queryParams.append('filters[publishedAt][$notNull]', 'true');
        queryParams.append('sort', currentSortBy);

        const response = await fetch(`${strapiApiBaseUrl}?populate=*&${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error(`Strapi API returned status ${response.status}`);
        }
        const proposalsData = await response.json();
        const fetchedProposals: StrapiProposal[] = (proposalsData.data || []).map((item: any) => ({
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
  }, [
    // Dependencies for fetchProposals useCallback
    // These should not include fetchProposals itself
    currentPage, debouncedSearchTerm, sortBy, // arguments, not dependencies of useCallback
  ]);


  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProposals(currentPage, searchTerm, sortBy); // Pass the current state values directly to fetchProposals
    }, 500); // Debounce initial search term, if any
    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, sortBy, fetchProposals]); // fetchProposals is a dependency here

  
  const handleClearFilters = useCallback(() => {
    router.replace({ pathname: router.pathname, query: {} }, undefined, { shallow: true });
    setSortBy('publishedAt:desc');
    setCurrentPage(1);
  }, [router]);

  const handleSortByChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleSearchResultClick = useCallback(async (proposal: StrapiProposal) => {
    setIsLoading(true);
    try {
      const strapiApiBaseUrl = STRAPI_API_URL.split('?')[0];
      const response = await fetch(`${strapiApiBaseUrl}/${proposal.id}?populate=*`);
      if (!response.ok) {
        throw new Error(`Failed to fetch full proposal details for ID: ${proposal.id}`);
      }
      const fullProposalData = await response.json();
      const fetchedProposal: StrapiProposal = {
        ...extractProposalData(fullProposalData.data),
        id: fullProposalData.data.id,
        documentId: fullProposalData.data.id.toString(),
        documentUrl: fullProposalData.data.attributes?.documentUrl || getDocumentUrl(fullProposalData.data.attributes?.SF_Number || fullProposalData.data.attributes?.Unique_Id, fullProposalData.data.id.toString()),
      };
      setSelectedProposalForPreview(fetchedProposal);
      if (router.query.proposalId !== String(proposal.id)) {
        router.push(`/content-management?proposalId=${proposal.id}`, undefined, { shallow: true });
      }
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
      searchTerm={searchTerm}
      isLoading={isLoading}
      onSearchResultClick={handleSearchResultClick}
      activeContentType="Proposals"
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
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`p-2 border rounded-lg text-gray-700 transition-colors
                          ${activeView === 'list' ? 'bg-strapi-green-light text-white shadow-sm' : 'bg-white hover:bg-gray-100'}
                          focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2`}
            >
              <ListBulletIcon className="h-5 w-5" />
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

      {selectedProposalForPreview && (
        <DocumentPreviewModal
          proposal={selectedProposalForPreview}
          onClose={() => {
            router.push('/content-management', undefined, { shallow: true });
          }}
        />
      )}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (context) => {
  const STRAPI_API_BASE_URL = STRAPI_API_URL.split('?')[0];
  
  let initialProposals: StrapiProposal[] = [];
  let initialTotalProposals = 0;
  let initialLatestProposals: StrapiProposal[] = [];
  let initialError: string | null = null;

  const query = context.query;
  const page = parseInt(query.page as string || '1');
  const searchTerm = (query.searchTerm as string) || '';
  const sortBy = (query.sortBy as string) || 'publishedAt:desc';

  const offset = (page - 1) * ITEMS_PER_PAGE;


  const ssrQueryParams = new URLSearchParams();
  ssrQueryParams.append('pagination[page]', String(page));
  ssrQueryParams.append('pagination[pageSize]', String(ITEMS_PER_PAGE));
  ssrQueryParams.append('filters[publishedAt][$notNull]', 'true');
  ssrQueryParams.append('sort', sortBy);

  if (searchTerm) {
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
          ...extractProposalData(hit),
          id: hit.id,
          documentId: hit.id.toString(),
          documentUrl: getDocumentUrl(hit.SF_Number || hit.Unique_Id, hit.id.toString()),
        })) as StrapiProposal[] || [];
        initialTotalProposals = meiliSearchResults.estimatedTotalHits || 0;
      } catch (meiliError: any) {
        console.error('[getServerSideProps] MeiliSearch failed for Homepage:', meiliError);
        initialError = `Search failed: ${meiliError.message}. Falling back to general listing.`;
        const response = await fetch(`${STRAPI_API_BASE_URL}?populate=*&${ssrQueryParams.toString()}`);
        const data = await response.json();
        initialProposals = (data.data || []).map((item: any) => ({
          ...extractProposalData(item),
          id: item.id,
          documentId: item.id.toString(),
          documentUrl: item.attributes?.documentUrl || getDocumentUrl(item.attributes?.SF_Number || item.attributes?.Unique_Id, item.id.toString()),
        })) as StrapiProposal[] || [];
        initialTotalProposals = data.meta?.pagination?.total || 0;
      }

  } else {
    try {
      const proposalsResponse = await fetch(`${STRAPI_API_BASE_URL}?populate=*&${ssrQueryParams.toString()}`);
      
      if (!proposalsResponse.ok) {
        throw new Error(`Strapi proposals API returned status ${proposalsResponse.status}`);
      }
      const proposalsData = await proposalsResponse.json();
      
      initialProposals = (proposalsData.data || []).map((item: any) => ({
        ...extractProposalData(item),
        id: item.id,
        documentId: item.id.toString(),
        documentUrl: item.attributes?.documentUrl || getDocumentUrl(item.attributes?.SF_Number || item.attributes?.Unique_Id, item.id.toString()),
      })) as StrapiProposal[] || [];
      initialTotalProposals = proposalsData.meta?.pagination?.total || 0;
    } catch (err: any) {
      console.error('[getServerSideProps] Failed to fetch data from Strapi:', err);
      initialError = `Failed to load data: ${err.message}. Please ensure Strapi is running and accessible at ${STRAPI_API_BASE_URL}.`;
    }
  }


  try {
    const latestProposalsResponse = await fetch(`${STRAPI_API_BASE_URL}?sort=publishedAt:desc&pagination[limit]=3&populate=*`);
    if (!latestProposalsResponse.ok) {
      console.warn(`Strapi latest proposals API returned status ${latestProposalsResponse.status}. Carousel might not show latest data.`);
      initialLatestProposals = [];
    } else {
      const latestData = await latestProposalsResponse.json();
      // Corrected: map over latestData.data, not `latestProposals` itself
      initialLatestProposals = (latestData.data || []).map((item: any) => ({
        ...extractProposalData(item),
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