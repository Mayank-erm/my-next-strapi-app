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
import { getDocumentUrl } from '@/config/documentMapping';
import { STRAPI_API_URL } from '@/config/apiConfig';
import { StrapiProposal } from '@/types/strapi';
import { extractProposalData } from '@/utils/dataHelpers';

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
        const proposalData = {
          id: hit.id,
          documentId: hit.id.toString(),
          unique_id: hit.unique_id || hit.Unique_Id || hit.SF_Number || '',
          SF_Number: hit.SF_Number || hit.unique_id || '',
          Client_Name: hit.Client_Name || hit.filters?.Client_Name || '',
          Client_Type: hit.Client_Type || hit.filters?.Client_Type || '',
          Client_Contact: hit.Client_Contact || '',
          Client_Contact_Title: hit.Client_Contact_Title || '',
          Client_Journey: hit.Client_Journey || '',
          Document_Type: hit.Document_Type || hit.filters?.Document_Type || '',
          Document_Sub_Type: hit.Document_Sub_Type || hit.filters?.Document_Sub_Type || '',
          Document_Value_Range: hit.Document_Value_Range || '',
          Document_Outcome: hit.Document_Outcome || hit.filters?.Document_Outcome || '',
          Last_Stage_Change_Date: hit.Last_Stage_Change_Date || '',
          Industry: hit.Industry || hit.filters?.Industry || '',
          Sub_Industry: hit.Sub_Industry || hit.filters?.Sub_Industry || '',
          Service: hit.Service || hit.filters?.Service || '',
          Sub_Service: hit.Sub_Service || hit.filters?.Sub_Service || '',
          Business_Unit: hit.Business_Unit || hit.filters?.Business_Unit || '',
          Region: hit.Region || hit.filters?.Region || '',
          Country: hit.Country || hit.filters?.Country || '',
          State: hit.State || hit.filters?.State || '',
          City: hit.City || hit.filters?.City || '',
          Author: hit.Author || '',
          PIC: hit.PIC || '',
          PM: hit.PM || '',
          Keywords: hit.Keywords || '',
          Commercial_Program: hit.Commercial_Program || hit.filters?.Commercial_Program || '',
          Project_Team: hit.Project_Team || null,
          SMEs: hit.SMEs || null,
          Competitors: hit.Competitors || '',
          createdAt: hit.createdAt || new Date().toISOString(),
          updatedAt: hit.updatedAt || new Date().toISOString(),
          publishedAt: hit.publishedAt || new Date().toISOString(),
          Description: hit.Description || [],
          Attachments: hit.Attachments || null,
          Pursuit_Team: hit.Pursuit_Team || null,
          documentUrl: hit.documentUrl || hit.Document_Path || getDocumentUrl(
            hit.SF_Number || hit.unique_id, 
            hit.id.toString()
          ),
          value: hit.value || 0,
          proposalName: hit.proposalName || hit.SF_Number || hit.unique_id || '',
        };
        
        return proposalData as StrapiProposal;
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
        return {
          id: hit.id,
          documentId: hit.id.toString(),
          unique_id: hit.unique_id || hit.Unique_Id || hit.SF_Number || '',
          SF_Number: hit.SF_Number || hit.unique_id || '',
          Client_Name: hit.Client_Name || hit.filters?.Client_Name || '',
          Client_Type: hit.Client_Type || hit.filters?.Client_Type || '',
          Client_Contact: hit.Client_Contact || '',
          Client_Contact_Title: hit.Client_Contact_Title || '',
          Client_Journey: hit.Client_Journey || '',
          Document_Type: hit.Document_Type || hit.filters?.Document_Type || '',
          Document_Sub_Type: hit.Document_Sub_Type || hit.filters?.Document_Sub_Type || '',
          Document_Value_Range: hit.Document_Value_Range || '',
          Document_Outcome: hit.Document_Outcome || hit.filters?.Document_Outcome || '',
          Last_Stage_Change_Date: hit.Last_Stage_Change_Date || '',
          Industry: hit.Industry || hit.filters?.Industry || '',
          Sub_Industry: hit.Sub_Industry || hit.filters?.Sub_Industry || '',
          Service: hit.Service || hit.filters?.Service || '',
          Sub_Service: hit.Sub_Service || hit.filters?.Sub_Service || '',
          Business_Unit: hit.Business_Unit || hit.filters?.Business_Unit || '',
          Region: hit.Region || hit.filters?.Region || '',
          Country: hit.Country || hit.filters?.Country || '',
          State: hit.State || hit.filters?.State || '',
          City: hit.City || hit.filters?.City || '',
          Author: hit.Author || '',
          PIC: hit.PIC || '',
          PM: hit.PM || '',
          Keywords: hit.Keywords || '',
          Commercial_Program: hit.Commercial_Program || hit.filters?.Commercial_Program || '',
          Project_Team: hit.Project_Team || null,
          SMEs: hit.SMEs || null,
          Competitors: hit.Competitors || '',
          createdAt: hit.createdAt || new Date().toISOString(),
          updatedAt: hit.updatedAt || new Date().toISOString(),
          publishedAt: hit.publishedAt || new Date().toISOString(),
          Description: hit.Description || [],
          Attachments: hit.Attachments || null,
          Pursuit_Team: hit.Pursuit_Team || null,
          documentUrl: hit.documentUrl || hit.Document_Path || getDocumentUrl(
            hit.SF_Number || hit.unique_id, 
            hit.id.toString()
          ),
          value: hit.value || 0,
          proposalName: hit.proposalName || hit.SF_Number || hit.unique_id || '',
        } as StrapiProposal;
      });

      setLatestProposals(latestProposalsData);
      console.log('✅ Carousel data loaded:', latestProposalsData.length);

    } catch (err: any) {
      console.error('❌ Error fetching latest proposals:', err);
      // Don't show error for carousel, just log it
      setLatestProposals([]); // Set empty array as fallback
    }
  }, []);

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

      {/* Popular Resources Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 card-professional">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-dark-gray mb-2">
              {searchTerm ? `Search Results (${totalProposals})` : `Popular Resources (${totalProposals})`}
            </h2>
            {searchTerm && (
              <p className="text-sm text-gray-600">
                Showing results for "<span className="font-medium">{searchTerm}</span>"
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-text-medium-gray text-sm flex-wrap mt-4 sm:mt-0">
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
                <option value="unique_id:asc">Document ID (A-Z)</option>
                <option value="unique_id:desc">Document ID (Z-A)</option>
                <option value="Client_Name:asc">Client Name (A-Z)</option>
                <option value="updatedAt:desc">Recently Updated</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
            </div>
            
            {/* View toggle */}
            <div className="flex space-x-2 ml-auto sm:ml-0 mt-2 sm:mt-0">
              <button
                onClick={() => setActiveView('grid')}
                className={`p-2 border rounded-lg text-gray-700 transition-colors
                            ${activeView === 'grid' ? 'bg-strapi-green-light text-white shadow-sm' : 'bg-white hover:bg-gray-100'}
                            focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2`}
                title="Grid view"
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveView('list')}
                className={`p-2 border rounded-lg text-gray-700 transition-colors
                            ${activeView === 'list' ? 'bg-strapi-green-light text-white shadow-sm' : 'bg-white hover:bg-gray-100'}
                            focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2`}
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

    initialProposals = (meiliSearchResults.hits || []).map((hit: any) => ({
      id: hit.id,
      documentId: hit.id.toString(),
      unique_id: hit.unique_id || hit.Unique_Id || hit.SF_Number || '',
      SF_Number: hit.SF_Number || hit.unique_id || '',
      Client_Name: hit.Client_Name || hit.filters?.Client_Name || '',
      Document_Type: hit.Document_Type || hit.filters?.Document_Type || '',
      Industry: hit.Industry || hit.filters?.Industry || '',
      Region: hit.Region || hit.filters?.Region || '',
      Service: hit.Service || hit.filters?.Service || '',
      publishedAt: hit.publishedAt || new Date().toISOString(),
      createdAt: hit.createdAt || new Date().toISOString(),
      updatedAt: hit.updatedAt || new Date().toISOString(),
      documentUrl: hit.documentUrl || hit.Document_Path || '',
      value: hit.value || 0,
      // Fill in other required fields with defaults
      Client_Type: hit.Client_Type || '',
      Client_Contact: hit.Client_Contact || '',
      Client_Contact_Title: hit.Client_Contact_Title || '',
      Client_Journey: hit.Client_Journey || '',
      Document_Sub_Type: hit.Document_Sub_Type || '',
      Document_Value_Range: hit.Document_Value_Range || '',
      Document_Outcome: hit.Document_Outcome || '',
      Last_Stage_Change_Date: hit.Last_Stage_Change_Date || '',
      Sub_Industry: hit.Sub_Industry || '',
      Sub_Service: hit.Sub_Service || '',
      Business_Unit: hit.Business_Unit || '',
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
      Description: hit.Description || [],
      Attachments: hit.Attachments || null,
      Pursuit_Team: hit.Pursuit_Team || null,
      proposalName: hit.proposalName || hit.SF_Number || hit.unique_id || '',
    }));

    initialTotalProposals = meiliSearchResults.estimatedTotalHits || 0;

    // Fetch latest proposals for carousel - SIMPLIFIED
    const latestResults = await ssrMeiliClient
      .index('document_stores')
      .search('', {
        limit: 5,
        sort: ['publishedAt:desc'],
        attributesToRetrieve: ['*'],
      });

    initialLatestProposals = (latestResults.hits || []).map((hit: any) => ({
      id: hit.id,
      documentId: hit.id.toString(),
      unique_id: hit.unique_id || hit.Unique_Id || hit.SF_Number || '',
      SF_Number: hit.SF_Number || hit.unique_id || '',
      Client_Name: hit.Client_Name || hit.filters?.Client_Name || '',
      Document_Type: hit.Document_Type || hit.filters?.Document_Type || '',
      Industry: hit.Industry || hit.filters?.Industry || '',
      Region: hit.Region || hit.filters?.Region || '',
      Service: hit.Service || hit.filters?.Service || '',
      publishedAt: hit.publishedAt || new Date().toISOString(),
      createdAt: hit.createdAt || new Date().toISOString(),
      updatedAt: hit.updatedAt || new Date().toISOString(),
      documentUrl: hit.documentUrl || hit.Document_Path || '',
      value: hit.value || 0,
      // Fill remaining fields
      Client_Type: hit.Client_Type || '',
      Client_Contact: hit.Client_Contact || '',
      Client_Contact_Title: hit.Client_Contact_Title || '',
      Client_Journey: hit.Client_Journey || '',
      Document_Sub_Type: hit.Document_Sub_Type || '',
      Document_Value_Range: hit.Document_Value_Range || '',
      Document_Outcome: hit.Document_Outcome || '',
      Last_Stage_Change_Date: hit.Last_Stage_Change_Date || '',
      Sub_Industry: hit.Sub_Industry || '',
      Sub_Service: hit.Sub_Service || '',
      Business_Unit: hit.Business_Unit || '',
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
      Description: hit.Description || [],
      Attachments: hit.Attachments || null,
      Pursuit_Team: hit.Pursuit_Team || null,
      proposalName: hit.proposalName || hit.SF_Number || hit.unique_id || '',
    }));

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