// src/pages/index.tsx - COMPLETE VERSION WITH PROFESSIONAL ENHANCEMENTS
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
import { getBestDocumentUrl } from '@/config/documentMapping'; // Ensure this is imported
import { STRAPI_API_URL } from '@/config/apiConfig';
import { StrapiProposal } from '@/types/strapi';
import { extractProposalData } from '@/utils/dataHelpers';
import Toast from '@/components/Toast'; // Import Toast component
import { TbBackground } from 'react-icons/tb';

// --- MeiliSearch Configuration ---
const MEILISEARCH_HOST = process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY || 'masterKey';

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

  // Toast State
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('info');

  // Show toast notification
  const showToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastTitle(title);
    setToastMessage(message);
    setToastType(type);
    setIsToastOpen(true);
  }, []);

  // Enhanced fetch proposals function - FIXED FILTERABLE ATTRIBUTES
  const fetchProposals = useCallback(async (
    page: number,
    currentSearchTerm: string,
    currentSortBy: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching from MeiliSearch:', { 
        searchTerm: currentSearchTerm, 
        page, 
        sortBy: currentSortBy 
      });

      // FIXED: Use only the filterable attributes that actually exist
      const searchOptions: any = {
        offset: (page - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
        sort: [currentSortBy],
        attributesToRetrieve: ['*'], // Get all attributes
        // FIXED: Only use filterable attributes that exist in your index
        facets: [
          'Document_Type',
          'Industry', 
          'Region',
          'Business_Unit',
          'Client_Type'
        ],
      };

      // Search query - empty string returns all documents
      const searchQuery = currentSearchTerm || '';
      
      const meiliSearchResults = await meiliSearchClient
        .index('document_stores')
        .search(searchQuery, searchOptions);

      console.log('📊 MeiliSearch Results:', {
        hits: meiliSearchResults.hits?.length || 0,
        total: meiliSearchResults.estimatedTotalHits,
        processingTime: meiliSearchResults.processingTimeMs,
        facets: meiliSearchResults.facetDistribution
      });

      // Transform MeiliSearch results to StrapiProposal format
      const fetchedProposals: StrapiProposal[] = (meiliSearchResults.hits || []).map((hit: any) => {
        // Extract data from MeiliSearch hit - handle nested filters
        const extractedData = extractProposalData(hit); // Use existing helper
        return {
          ...extractedData,
          id: hit.id,
          documentId: hit.id.toString(),
          documentUrl: getBestDocumentUrl(extractedData), // Correctly get document URL
          value: extractedData.value, // Ensure value is numerical
        } as StrapiProposal;
      });

      setProposals(fetchedProposals);
      setTotalProposals(meiliSearchResults.estimatedTotalHits || 0);

      console.log('✅ Successfully loaded proposals:', fetchedProposals.length);

    } catch (err: any) {
      console.error('❌ MeiliSearch error:', err);
      
      // Better error handling with specific messages
      let errorMessage = 'Failed to load documents from search index.';
      
      if (err.message.includes('Invalid facet distribution')) {
        errorMessage = 'Search index configuration needs updating. Some filter attributes are not properly configured.';
      } else if (err.message.includes('index_not_found')) {
        errorMessage = 'Search index "document_stores" not found. Please ensure your documents are indexed in MeiliSearch.';
      } else if (err.message.includes('connection')) {
        errorMessage = 'Cannot connect to search service. Please ensure MeiliSearch is running.';
      }
      
      setError(`${errorMessage} (${err.message})`);
      setProposals([]);
      setTotalProposals(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch latest proposals for carousel - SIMPLIFIED VERSION
  const fetchLatestProposals = useCallback(async () => {
    try {
      console.log('🎠 Fetching latest proposals for carousel...');
      
      // Simplified search without facets for carousel
      const latestResults = await meiliSearchClient
        .index('document_stores')
        .search('', {
          limit: 5, // Get 5 latest for carousel
          sort: ['publishedAt:desc'],
          attributesToRetrieve: ['*'],
          // No facets for carousel to avoid issues
        });

      const latestProposalsData: StrapiProposal[] = (latestResults.hits || []).map((hit: any) => {
        const extractedData = extractProposalData(hit); // Use existing helper
        return {
          ...extractedData,
          id: hit.id,
          documentId: hit.id.toString(),
          documentUrl: getBestDocumentUrl(extractedData), // Correctly get document URL
          value: extractedData.value, // Ensure value is numerical
        } as StrapiProposal;
      });

      setLatestProposals(latestProposalsData);
      console.log('✅ Carousel data loaded:', latestProposalsData.length);

    } catch (err: any) {
      console.error('❌ Error fetching latest proposals:', err);
      // Don't show error for carousel, just log it
      setLatestProposals([]); // Set empty array as fallback
    }
  }, [showToast]); // Added showToast to dependencies

  // Effect to fetch data when search/page/sort changes
  useEffect(() => {
    fetchProposals(currentPage, searchTerm, sortBy);
  }, [searchTerm, currentPage, sortBy, fetchProposals]);

  // Effect to fetch latest proposals on mount
  useEffect(() => {
    fetchLatestProposals();
  }, [fetchLatestProposals]);

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
    setSelectedProposalForPreview(proposal);
    setIsDocumentPreviewOpen(true);
    
    // Update URL to show selected proposal
    if (router.query.proposalId !== String(proposal.id)) {
      router.push(`/?proposalId=${proposal.id}`, undefined, { shallow: true });
    }
  }, [router]);

  const closeDocumentPreview = useCallback(() => {
    setIsDocumentPreviewOpen(false);
    setSelectedProposalForPreview(null);
    
    // Remove proposalId from URL
    const { proposalId, ...queryWithoutProposalId } = router.query;
    router.push({ pathname: router.pathname, query: queryWithoutProposalId }, undefined, { shallow: true });
  }, [router]);

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
      onClearAllFilters={handleClearFilters}
    >
      {/* Carousel with latest proposals from MeiliSearch */}
      <div className="animate-professional-fade-in">
        <Carousel latestProposals={latestProposals} />
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Search Index Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
          <div className="mt-2 space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
            <button
              onClick={() => setError(null)}
              className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Popular Resources Section - Now uses content-display__header for consistency */}
      <div className="content-display__header" style={{background:'none'}}> {/* Applied the class */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full">
          <div className="content-display__title">
            <div className="content-display__count-indicator"></div>
            <h2 className="content-display__count-text">
              {searchTerm ? `Search Results (${totalProposals})` : `${totalProposals} Popular Resources `}
            </h2>
            {searchTerm && (
              <p className="text-sm text-gray-600">
                Showing results for "<span className="font-medium">{searchTerm}</span>"
              </p>
            )}
          </div>
          
          <div className="content-display__controls">
            <span className="content-display__sort-label">Sort by:</span>
            <div className="content-display__sort-select-wrapper">
              <select
                value={sortBy}
                onChange={handleSortByChange}
                className="content-display__sort-select">
                <option value="publishedAt:desc">Published Date (Newest)</option>
                <option value="publishedAt:asc">Published Date (Oldest)</option>
                <option value="unique_id:asc">Document ID (A-Z)</option>
                <option value="unique_id:desc">Document ID (Z-A)</option>
                <option value="Client_Name:asc">Client Name (A-Z)</option>
                <option value="updatedAt:desc">Recently Updated</option>
              </select>
              <div className="content-display__sort-icon"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" className="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5"></path></svg></div>
            </div>
            
            {/* View toggle */}
            <div className="content-display__view-toggle">
              <button
                onClick={() => setActiveView('grid')}
                className={`content-display__view-button ${
                  activeView === 'grid' 
                    ? 'content-display__view-button--active' 
                    : ''
                }`}
                title="Grid view"
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveView('list')}
                className={`content-display__view-button ${
                  activeView === 'list' 
                    ? 'content-display__view-button--active' 
                    : ''
                }`}
                title="List view"
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents grid/list with professional container */}
      <div className="animate-professional-fade-in" style={{ animationDelay: '0.2s' }}>
        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <svg className="animate-spin h-10 w-10 text-strapi-green-light mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl font-medium">Loading documents from search index...</p>
            <p className="text-sm text-gray-400 mt-1">This may take a moment on first load</p>
          </div>
        ) : proposals.length > 0 ? (
          /* Documents grid/list */
          <div className={activeView === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
            {proposals.map((proposal, index) => (
              <div 
                key={proposal.id} 
                className="animate-professional-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProposalCard 
                  proposal={proposal} 
                  isListView={activeView === 'list'} 
                  showToast={showToast} // Pass showToast to ProposalCard
                />
              </div>
            ))}
          </div>
        ) : (
          /* No results state */
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <span className="text-6xl mb-4" role="img" aria-label="No results">🔍</span>
            <p className="text-xl font-medium">
              {searchTerm ? 'No documents found matching your search' : 'No documents found in the index'}
            </p>
            <p className="text-md mt-2 text-center max-w-md">
              {searchTerm 
                ? 'Try adjusting your search terms or check the spelling.'
                : 'The search index may be empty or not yet synchronized with your content.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-strapi-green-light text-white rounded-lg hover:bg-strapi-green-dark transition-colors"
              >
                Refresh Page
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination with professional styling */}
      {totalPages > 1 && (
        <div className="animate-professional-fade-in" style={{ animationDelay: '0.3s' }}>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedProposalForPreview && (
        <DocumentPreviewModal
          proposal={selectedProposalForPreview}
          onClose={closeDocumentPreview}
        />
      )}
      <Toast
        isOpen={isToastOpen}
        onClose={() => setIsToastOpen(false)}
        title={toastTitle}
        message={toastMessage}
        type={toastType}
      />
    </Layout>
  );
};

// SIMPLIFIED SSR VERSION
export const getServerSideProps: GetServerSideProps<HomePageProps> = async (context) => {
  let initialProposals: StrapiProposal[] = [];
  let initialTotalProposals = 0;
  let initialLatestProposals: StrapiProposal[] = [];
  let initialError: string | null = null;

  const query = context.query;
  const page = parseInt(query.page as string || '1');
  const searchTerm = (query.searchTerm as string) || '';
  const sortBy = (query.sortBy as string) || 'publishedAt:desc';

  try {
    console.log('🚀 SSR: Initializing MeiliSearch client...');
    
    // Initialize MeiliSearch client for SSR
    const ssrMeiliClient = new MeiliSearch({
      host: MEILISEARCH_HOST,
      apiKey: MEILISEARCH_API_KEY,
    });

    // Test MeiliSearch connection with simple search (no facets)
    try {
      const testResult = await ssrMeiliClient.index('document_stores').search('', { limit: 1 });
      console.log('✅ SSR: MeiliSearch connection successful');
    } catch (meiliError) {
      console.warn('⚠️ SSR: MeiliSearch not available:', meiliError);
      throw new Error('Search index not available');
    }

    // Fetch main proposals - SIMPLIFIED
    const searchOptions: any = {
      offset: (page - 1) * ITEMS_PER_PAGE,
      limit: ITEMS_PER_PAGE,
      sort: [sortBy],
      attributesToRetrieve: ['*'],
      // NO FACETS in SSR to avoid configuration issues
    };

    const searchQuery = searchTerm || '';
    const meiliSearchResults = await ssrMeiliClient
      .index('document_stores')
      .search(searchQuery, searchOptions);

    initialProposals = (meiliSearchResults.hits || []).map((hit: any) => {
      const extractedData = extractProposalData(hit); // Use extractProposalData
      return {
        ...extractedData,
        id: hit.id,
        documentId: hit.id.toString(),
        documentUrl: getBestDocumentUrl(extractedData), // Correctly generate documentUrl
        value: extractedData.value, // Ensure numerical value
      } as StrapiProposal;
    });

    initialTotalProposals = meiliSearchResults.estimatedTotalHits || 0;

    // Fetch latest proposals for carousel - SIMPLIFIED
    const latestResults = await ssrMeiliClient
      .index('document_stores')
      .search('', {
        limit: 5,
        sort: ['publishedAt:desc'],
        attributesToRetrieve: ['*'],
      });

    initialLatestProposals = (latestResults.hits || []).map((hit: any) => {
      const extractedData = extractProposalData(hit); // Use extractProposalData
      return {
        ...extractedData,
        id: hit.id,
        documentId: hit.id.toString(),
        documentUrl: getBestDocumentUrl(extractedData), // Correctly generate documentUrl
        value: extractedData.value, // Ensure numerical value
      } as StrapiProposal;
    });

    console.log(`✅ SSR: Loaded ${initialProposals.length} proposals and ${initialLatestProposals.length} latest`);

  } catch (err: any) {
    console.error('❌ SSR: Failed to fetch from MeiliSearch:', err);
    initialError = `Search index unavailable: ${err.message}. Please ensure MeiliSearch is running and contains indexed documents.`;
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