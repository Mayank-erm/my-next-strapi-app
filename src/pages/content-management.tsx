// COMPREHENSIVE FIX - content-management.tsx
// src/pages/content-management.tsx - COMPLETE LAYOUT FIX

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
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// MeiliSearch Configuration
const MEILISEARCH_HOST = 'http://localhost:7700';
const MEILISEARCH_API_KEY = 'masterKey';

const meiliSearchClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

const ITEMS_PER_PAGE = 24;

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

  // Lazy Loading State
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

  // Advanced fetch function with comprehensive filtering and lazy loading
  const fetchContent = useCallback(async (loadMore = false) => {
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
      setProposals([]);
      setTotalProposals(0);
    }

    const page = loadMore ? currentPage + 1 : currentPage;
    const offset = (page - 1) * ITEMS_PER_PAGE;

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

      if (loadMore) {
        setProposals(prev => [...prev, ...fetchedProposals]);
        setCurrentPage(page);
      } else {
        setProposals(fetchedProposals);
        setTotalProposals(meiliSearchResults.estimatedTotalHits || 0);
      }

      // Check if there are more pages
      const totalPages = Math.ceil((meiliSearchResults.estimatedTotalHits || 0) / ITEMS_PER_PAGE);
      setHasNextPage(page < totalPages);

    } catch (err: any) {
      console.error('Failed to fetch content from MeiliSearch:', err);
      setError(`Failed to load data: ${err.message}. Please ensure MeiliSearch is running and configured correctly.`);
      if (!loadMore) {
        setProposals([]);
        setTotalProposals(0);
      }
    } finally {
      if (loadMore) {
        setIsLoadingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [
    currentPage,
    debouncedSearchTerm,
    filters,
    sortBy,
  ]);

  // Load more function for lazy loading
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasNextPage) {
      fetchContent(true);
    }
  }, [fetchContent, isLoadingMore, hasNextPage]);

  // Trigger fetch when dependencies change
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchContent(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearchTerm, filters, sortBy]);

  // Filter update handlers
  const updateFilter = useCallback((filterKey: keyof AdvancedFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value,
    }));
    setCurrentPage(1);
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

  // Active filters count
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

  // Layout props
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
    showMainSidebar: true,
  };

  const totalPages = Math.ceil(totalProposals / ITEMS_PER_PAGE);

  return (
    <Layout {...layoutProps}>
      {/* FIXED: Proper Layout Container */}
      <div className="cms-layout-container">
        {/* Advanced Filter Sidebar - FIXED POSITIONING */}
        <div className={`cms-filter-sidebar ${isFilterSidebarOpen ? 'open' : 'closed'}`}>
          <div className="h-full overflow-y-auto custom-scrollbar-thin">
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
        <div className={`cms-content-area ${isFilterSidebarOpen ? 'with-filter' : 'without-filter'}`}>
          {/* Header Bar */}
          <div className="cms-header-bar">
            <div className="flex items-center justify-between">
              {/* Left: Simple Title */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-erm-primary to-erm-dark flex items-center justify-center shadow-md">
                  <DocumentTextIcon className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">All Content</h1>
              </div>

              {/* Right: Filter Controls */}
              <div className="flex items-center space-x-4">
                {/* Active Filters Badge */}
                {activeFiltersCount > 0 && (
                  <div className="flex items-center space-x-2 bg-erm-primary/10 text-erm-primary px-3 py-1.5 rounded-lg border border-erm-primary/20">
                    <FunnelIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {activeFiltersCount} active
                    </span>
                  </div>
                )}

                {/* Desktop Filter Toggle */}
                <button
                  onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
                  className={`
                    hidden lg:flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 font-medium
                    ${isFilterSidebarOpen 
                      ? 'bg-erm-primary text-white border-erm-primary shadow-md hover:bg-erm-dark' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }
                  `}
                  title={isFilterSidebarOpen ? "Hide filters" : "Show filters"}
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4" />
                  <span className="text-sm">
                    {isFilterSidebarOpen ? 'Hide Filters' : 'Show Filters'}
                  </span>
                </button>

                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                  className="lg:hidden p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  title="Toggle mobile filters"
                >
                  <FunnelIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="cms-error-display">
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
          <div className="cms-content-wrapper">
            {/* Active Filter Pills */}
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

            {/* Load More Button for Lazy Loading */}
            {hasNextPage && proposals.length > 0 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="bg-gradient-to-r from-erm-primary to-erm-dark text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoadingMore ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Loading More...</span>
                    </div>
                  ) : (
                    `Load More Documents`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        {isMobileFilterOpen && (
          <div className="cms-mobile-overlay" onClick={() => setIsMobileFilterOpen(false)}>
            <div className="cms-mobile-sidebar" onClick={e => e.stopPropagation()}>
              <div className="h-full overflow-y-auto custom-scrollbar-thin">
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