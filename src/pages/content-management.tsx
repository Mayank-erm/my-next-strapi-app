// src/pages/content-management.tsx - COMPLETE LAYOUT FIX & BUG FIXES

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '@/components/Layout';
import ContentDisplay from '@/components/cms/ContentDisplay';
import Pagination from '@/components/Pagination'; // Keeping import, but using Load More
import AdvancedFilterSidebar from '@/components/cms/AdvancedFilterSidebar';
import ActiveFilterPills from '@/components/cms/ActiveFilterPills';
import Toast from '@/components/Toast';
import { MeiliSearch } from 'meilisearch';
import { useRouter } from 'next/router';
import { getBestDocumentUrl } from '@/config/documentMapping'; // Use getBestDocumentUrl
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
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true); // Desktop advanced filter sidebar toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false); // Mobile advanced filter sidebar overlay toggle

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
    valueRange: [0, 1000000], // Default value range
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
        // Ensure documentUrl is correctly set, using getBestDocumentUrl
        let documentUrl = extractedData.documentUrl || getBestDocumentUrl(extractedData);

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
      valueRange: [0, 1000000], // Reset to default values
    });
    setCurrentPage(1);
    router.replace({ pathname: router.pathname, query: {} }, undefined, { shallow: true });
    showToast('Filters Cleared', 'All filters have been cleared successfully', 'info');
  }, [router, showToast]);

  // Active filters count - FIXED LOGIC
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    // Count search term if not empty
    if (urlSearchTerm.trim()) {
      count++;
    }
    // Count date range if both dates are selected
    if (filters.dateRange[0] && filters.dateRange[1]) {
      count++;
    }
    // Count value range if different from default
    if (filters.valueRange[0] !== 0 || filters.valueRange[1] !== 1000000) {
      count++;
    }
    
    // Count multi-select filters only if they have selected items
    const multiSelectFilterKeys: Array<keyof AdvancedFilters> = [
      'clientTypes', 'documentTypes', 'documentSubTypes', 'industries', 
      'subIndustries', 'services', 'subServices', 'businessUnits', 
      'regions', 'countries', 'states', 'cities'
    ];
    multiSelectFilterKeys.forEach(key => {
      if (Array.isArray(filters[key]) && (filters[key] as string[]).length > 0) {
        count++; // Count as one active filter category, not per item
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
      case 'clear-filters': // Handle clear-filters action from empty state
        clearAllFilters();
        break;
      default:
        showToast('Action Completed', `${action} performed on ${selectedCount} document${selectedCount !== 1 ? 's' : ''}`, 'info');
    }
    
    setSelectedItems([]);
  }, [selectedItems, showToast, clearAllFilters]);

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

  // Layout props (Passed to the parent Layout component)
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
          documentUrl: getBestDocumentUrl(fullProposalData.data.attributes), // Use getBestDocumentUrl
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
    activeContentType: 'All', // These are placeholder for Layout's filter-by options
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
    showMainSidebar: true, // Tell Layout to always show the main navigation sidebar
  };

  const totalPages = Math.ceil(totalProposals / ITEMS_PER_PAGE);

  return (
    <Layout {...layoutProps}>
      {/* This container now acts as the content area *next to* the main green sidebar.
          It then contains the Advanced Filters sidebar and the main content. */}
      <div className="cms-page-outer-wrapper">

        {/* Advanced Filter Sidebar (left-middle column) */}
        {/* Uses sticky position on desktop, fixed for mobile overlay */}
        <aside className={`cms-filter-sidebar ${isFilterSidebarOpen ? 'open' : 'closed'} lg:block`}>
          <div className="h-full overflow-y-auto custom-scrollbar"> {/* Using generic custom-scrollbar from globals */}
            <AdvancedFilterSidebar
              filters={filters}
              onUpdateFilter={updateFilter}
              onClearAll={clearAllFilters}
              activeFiltersCount={activeFiltersCount}
              isOpen={isFilterSidebarOpen} // Controls desktop visibility
              onToggle={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)} // Desktop toggle (this button remains here as a visual cue in the sidebar itself)
            />
          </div>
        </aside>

        {/* Main Content Area (rightmost column, flexible width) */}
        {/* Its left margin will be handled by the cms-page-outer-wrapper's flex layout */}
        <main className="cms-main-content">
          {/* Header Bar for the Content Management Page itself - REMOVED FILTER BUTTON HERE */}
          {/* The filter button is now handled by ContentDisplay component */}
         
          {/* Error Display */}
          {error && (
            <div className="cms-error-message">
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

          {/* Content Area for Filter Pills and Document Display */}
          <div className="cms-content-area-inner custom-scrollbar"> {/* Apply custom-scrollbar here */}
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
              isFilterSidebarOpen={isFilterSidebarOpen} // Pass down state
              onToggleFilterSidebar={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)} // Pass down desktop toggle
              activeFiltersCount={activeFiltersCount} // Pass down count
              onToggleMobileFilterSidebar={() => setIsMobileFilterOpen(true)} // Pass mobile toggle
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
        </main>

        {/* Mobile Filter Overlay (full screen overlay for filter sidebar) */}
        {isMobileFilterOpen && (
          <div className="cms-mobile-filter-overlay" onClick={() => setIsMobileFilterOpen(false)}>
            <aside className="cms-mobile-filter-sidebar" onClick={e => e.stopPropagation()}>
              <AdvancedFilterSidebar
                filters={filters}
                onUpdateFilter={updateFilter}
                onClearAll={clearAllFilters}
                activeFiltersCount={activeFiltersCount}
                isOpen={true} // Always open when in mobile overlay
                onToggle={() => setIsMobileFilterOpen(false)} // Close mobile overlay (internal toggle)
                isMobile={true} // Indicate it's in mobile mode
              />
            </aside>
          </div>
        )}
      </div> {/* End of cms-page-outer-wrapper */}

      {/* Document Preview Modal (Renders via Portal, its DOM position here doesn't matter) */}
      {selectedProposalForPreview && (
        <DocumentPreviewModal
          proposal={selectedProposalForPreview}
          onClose={() => {
            setSelectedProposalForPreview(null);
            router.push('/content-management', undefined, { shallow: true });
          }}
        />
      )}

      {/* Toast Notifications (Renders via Portal, its DOM position here doesn't matter) */}
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