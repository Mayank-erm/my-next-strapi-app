// src/pages/content-management.tsx - PROFESSIONAL UX REDESIGN WITH NAVIGATION SIDEBAR
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '@/components/Layout';
import ContentDisplay from '@/components/cms/ContentDisplay';
import Pagination from '@/components/Pagination';
import AdvancedFilterSidebar from '@/components/cms/AdvancedFilterSidebar';
import ActiveFilterPills from '@/components/cms/ActiveFilterPills';
import Toast from '@/components/Toast';
import { MeiliSearch } from 'meilisearch';
import { useRouter } from 'next/router';
import { getDocumentUrl } from '@/config/documentMapping';
import { STRAPI_API_URL } from '@/config/apiConfig';
import { StrapiProposal } from '@/types/strapi';
import { extractProposalData } from '@/utils/dataHelpers';
import DocumentPreviewModal from '@/components/DocumentPreviewModal';
import { 
  AdjustmentsHorizontalIcon, 
  XMarkIcon, 
  FunnelIcon,
  DocumentTextIcon,
  BookmarkIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

// MeiliSearch Configuration
const MEILISEARCH_HOST = 'http://localhost:7700';
const MEILISEARCH_API_KEY = 'masterKey';

const meiliSearchClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

const ITEMS_PER_PAGE = 12;

// Enhanced Filter Interface
interface AdvancedFilters {
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
  dateRange: [Date | null, Date | null];
  valueRange: [number, number];
}

const CmsPage: React.FC = () => {
  const router = useRouter();
  const urlSearchTerm = (router.query.searchTerm as string) || '';

  // State Management
  const [selectedProposalForPreview, setSelectedProposalForPreview] = useState<StrapiProposal | null>(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Toast State
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('info');

  // Advanced Filters State
  const [filters, setFilters] = useState<AdvancedFilters>({
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
    dateRange: [null, null],
    valueRange: [0, 1000000],
  });

  // Content State
  const [proposals, setProposals] = useState<StrapiProposal[]>([]);
  const [totalProposals, setTotalProposals] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // View State
  const [sortBy, setSortBy] = useState<string>('publishedAt:desc');
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [bookmarkedItems, setBookmarkedItems] = useState<number[]>([]);

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(urlSearchTerm);

  useEffect(() => {
    setDebouncedSearchTerm(urlSearchTerm);
  }, [urlSearchTerm]);

  // Show toast notification
  const showToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastTitle(title);
    setToastMessage(message);
    setToastType(type);
    setIsToastOpen(true);
  }, []);

  // Advanced fetch function with comprehensive filtering
  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setProposals([]);
    setTotalProposals(0);

    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
      const meiliFilters: string[] = [];

      // Date Range Filter
      if (filters.dateRange[0] && filters.dateRange[1]) {
        const startDate = filters.dateRange[0].toISOString().split('T')[0];
        const endDate = filters.dateRange[1].toISOString().split('T')[0];
        meiliFilters.push(`Last_Stage_Change_Date >= "${startDate}" AND Last_Stage_Change_Date <= "${endDate}"`);
      }

      // Value Range Filter
      if (filters.valueRange[0] !== 0 || filters.valueRange[1] !== 1000000) {
        meiliFilters.push(`value >= ${filters.valueRange[0]} AND value <= ${filters.valueRange[1]}`);
      }

      // Multi-select filters
      const filterMapping = {
        'Client_Type': filters.clientTypes,
        'Document_Type': filters.documentTypes,
        'Document_Sub_Type': filters.documentSubTypes,
        'Industry': filters.industries,
        'Sub_Industry': filters.subIndustries,
        'Service': filters.services,
        'Sub_Service': filters.subServices,
        'Business_Unit': filters.businessUnits,
        'Region': filters.regions,
        'Country': filters.countries,
        'State': filters.states,
        'City': filters.cities,
      };

      Object.entries(filterMapping).forEach(([field, values]) => {
        if (values.length > 0) {
          const fieldFilters = values.map(value => `${field} = "${value}"`).join(' OR ');
          meiliFilters.push(`(${fieldFilters})`);
        }
      });

      const searchOptions: any = {
        offset: offset,
        limit: ITEMS_PER_PAGE,
        sort: [sortBy],
        facets: Object.keys(filterMapping),
      };

      if (meiliFilters.length > 0) {
        searchOptions.filter = meiliFilters.join(' AND ');
      }

      console.log("Advanced MeiliSearch Query:", {
        query: debouncedSearchTerm,
        filters: searchOptions.filter,
        facets: searchOptions.facets,
      });

      const meiliSearchResults = await meiliSearchClient
        .index('document_stores')
        .search(debouncedSearchTerm, searchOptions);

      const fetchedProposals: StrapiProposal[] = (meiliSearchResults.hits || []).map((hit: any) => {
        const extractedData = extractProposalData(hit);
        let documentUrl = extractedData.documentUrl;
        if (!documentUrl) {
          documentUrl = getDocumentUrl(extractedData.SF_Number || extractedData.unique_id, hit.id.toString());
        }

        return {
          ...extractedData,
          id: hit.id,
          documentId: hit.id.toString(),
          value: extractedData.value,
          documentUrl: documentUrl,
        };
      });

      setProposals(fetchedProposals);
      setTotalProposals(meiliSearchResults.estimatedTotalHits || 0);

    } catch (err: any) {
      console.error('Failed to fetch content from MeiliSearch:', err);
      setError(`Failed to load data: ${err.message}. Please ensure MeiliSearch is running and configured correctly.`);
      setProposals([]);
      setTotalProposals(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    debouncedSearchTerm,
    filters,
    sortBy,
  ]);

  // Trigger fetch when dependencies change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContent();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchContent]);

  // Filter update handlers
  const updateFilter = useCallback((filterKey: keyof AdvancedFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value,
    }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
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
      dateRange: [null, null],
      valueRange: [0, 1000000],
    });
    setCurrentPage(1);
    router.replace({ pathname: router.pathname, query: {} }, undefined, { shallow: true });
    showToast('Filters Cleared', 'All filters have been cleared successfully', 'info');
  }, [router, showToast]);

  // Active filters count - FUNCTIONAL
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (urlSearchTerm) count++;
    if (filters.dateRange[0] && filters.dateRange[1]) count++;
    if (filters.valueRange[0] !== 0 || filters.valueRange[1] !== 1000000) count++;
    
    Object.values(filters).forEach(filterValue => {
      if (Array.isArray(filterValue)) {
        count += filterValue.length;
      }
    });
    
    return count;
  }, [urlSearchTerm, filters]);

  // Bulk actions with toasts
  const handleBulkAction = useCallback((action: string) => {
    const selectedCount = selectedItems.length;
    
    switch (action) {
      case 'bookmark':
        setBookmarkedItems(prev => [...new Set([...prev, ...selectedItems])]);
        showToast('Documents Bookmarked', `${selectedCount} document${selectedCount !== 1 ? 's' : ''} added to bookmarks`, 'success');
        break;
      case 'download':
        showToast('Download Started', `Downloading ${selectedCount} document${selectedCount !== 1 ? 's' : ''}...`, 'info');
        break;
      case 'share':
        showToast('Share Links Generated', `Share links created for ${selectedCount} document${selectedCount !== 1 ? 's' : ''}`, 'success');
        break;
      default:
        showToast('Action Completed', `${action} performed on ${selectedCount} document${selectedCount !== 1 ? 's' : ''}`, 'info');
    }
    
    setSelectedItems([]);
  }, [selectedItems, showToast]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(proposals.map(p => p.id));
    } else {
      setSelectedItems([]);
    }
  }, [proposals]);

  const handleSelectItem = useCallback((id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  }, []);

  // Layout props - INCLUDE MAIN SIDEBAR
  const layoutProps = {
    searchTerm: urlSearchTerm,
    isLoading: isLoading,
    onResultClick: async (proposal: StrapiProposal) => {
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
          value: extractProposalData(fullProposalData.data).value,
          documentUrl: fullProposalData.data.attributes?.documentUrl || 
                       getDocumentUrl(fullProposalData.data.attributes?.SF_Number || 
                                    fullProposalData.data.attributes?.Unique_Id, 
                                    fullProposalData.data.id.toString()),
        };
        setSelectedProposalForPreview(fetchedProposal);
        if (router.query.proposalId !== String(proposal.id)) {
          router.push(`/content-management?proposalId=${proposal.id}`, undefined, { shallow: true });
        }
      } catch (err: any) {
        console.error("Error fetching full proposal for preview:", err);
        setError(`Failed to load document for preview: ${err.message}`);
        router.push('/content-management', undefined, { shallow: true });
      } finally {
        setIsLoading(false);
      }
    },
    activeContentType: 'All',
    activeServiceLines: [],
    activeIndustries: [],
    activeRegions: [],
    activeDate: '',
    onContentTypeChange: () => {},
    onServiceLineChange: () => {},
    onIndustryChange: () => {},
    onRegionChange: () => {},
    onDateChange: () => {},
    onSearchInFiltersChange: () => {},
    onClearAllFilters: clearAllFilters,
    showMainSidebar: true, // KEEP MAIN SIDEBAR VISIBLE
  };

  const totalPages = Math.ceil(totalProposals / ITEMS_PER_PAGE);

  return (
    <Layout {...layoutProps}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Advanced Filter Sidebar - FIXED POSITIONING */}
        <div className={`
          fixed left-25 top-22 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-lg z-30
          transition-all duration-300 ease-in-out overflow-hidden
          ${isFilterSidebarOpen ? 'w-80' : 'w-0'}
          ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}
        `}>
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-erm-primary scrollbar-track-gray-100">
            <AdvancedFilterSidebar
              filters={filters}
              onUpdateFilter={updateFilter}
              onClearAll={clearAllFilters}
              activeFiltersCount={activeFiltersCount}
              isOpen={isFilterSidebarOpen}
              onToggle={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
            />
          </div>
        </div>

        {/* Main Content Area - FIXED MARGINS */}
        <div className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isFilterSidebarOpen ? 'ml-80 lg:ml-96' : 'ml-16 lg:ml-64'}
        `}>
          {/* Header Bar */}
          <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-16 z-20">
            <div className="flex items-center justify-between">
              {/* Left: Title and Filter Toggle */}
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
                  className="p-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-200 lg:hidden"
                  title="Toggle filters"
                >
                  <FunnelIcon className="h-5 w-5 text-gray-600" />
                </button>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-erm-primary to-erm-dark flex items-center justify-center shadow-lg">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {totalProposals.toLocaleString()} documents available
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Stats and Filter Toggle */}
              <div className="flex items-center space-x-4">
                {/* Active Filters Badge - FUNCTIONAL */}
                {activeFiltersCount > 0 && (
                  <div className="flex items-center space-x-3 bg-erm-primary/10 text-erm-primary px-4 py-2 rounded-xl border border-erm-primary/20">
                    <FunnelIcon className="h-5 w-5" />
                    <span className="text-sm font-semibold">
                      {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                    </span>
                    <button
                      onClick={clearAllFilters}
                      className="ml-2 p-1 rounded-full hover:bg-erm-primary/20 transition-colors"
                      title="Clear all filters"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Desktop Filter Toggle */}
                <button
                  onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
                  className={`
                    hidden lg:flex items-center space-x-3 px-6 py-3 rounded-xl border transition-all duration-200 font-medium
                    ${isFilterSidebarOpen 
                      ? 'bg-erm-primary text-white border-erm-primary shadow-lg hover:bg-erm-dark' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }
                  `}
                  title={isFilterSidebarOpen ? "Hide filters" : "Show filters"}
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  <span className="text-sm">
                    {isFilterSidebarOpen ? 'Hide Filters' : 'Show Filters'}
                  </span>
                </button>

                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                  className="lg:hidden p-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
                  title="Toggle mobile filters"
                >
                  <FunnelIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-8 mt-6 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl relative" role="alert">
              <div className="flex items-center">
                <strong className="font-bold mr-2">Error:</strong>
                <span className="block sm:inline">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Content Display */}
          <div className="p-8 overflow-y-auto max-h-[calc(100vh-12rem)]">
            {/* Active Filter Pills - FUNCTIONAL */}
            <ActiveFilterPills
              filters={filters}
              searchTerm={urlSearchTerm}
              onUpdateFilter={updateFilter}
              onClearAllFilters={clearAllFilters}
              onClearSearch={() => router.replace({ pathname: router.pathname, query: {} }, undefined, { shallow: true })}
              showToast={showToast}
            />

            <ContentDisplay
              proposals={proposals}
              isLoading={isLoading}
              totalResults={totalProposals}
              sortBy={sortBy}
              setSortBy={setSortBy}
              activeView={activeView}
              setActiveView={setActiveView}
              selectedItems={selectedItems}
              onSelectAll={handleSelectAll}
              onSelectItem={handleSelectItem}
              onBulkAction={handleBulkAction}
              bookmarkedItems={bookmarkedItems}
              showToast={showToast}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Overlay - FIXED POSITIONING */}
        {isMobileFilterOpen && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileFilterOpen(false)}>
            <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white border-r border-gray-200 shadow-lg overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-erm-primary scrollbar-track-gray-100">
                <AdvancedFilterSidebar
                  filters={filters}
                  onUpdateFilter={updateFilter}
                  onClearAll={clearAllFilters}
                  activeFiltersCount={activeFiltersCount}
                  isOpen={true}
                  onToggle={() => setIsMobileFilterOpen(false)}
                  isMobile={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {selectedProposalForPreview && (
        <DocumentPreviewModal
          proposal={selectedProposalForPreview}
          onClose={() => {
            setSelectedProposalForPreview(null);
            router.push('/content-management', undefined, { shallow: true });
          }}
        />
      )}

      {/* Toast Notifications */}
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

export default CmsPage;