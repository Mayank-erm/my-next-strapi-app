// src/pages/content-management.tsx - FINAL FIXED VERSION WITH MODAL AND ATTACHMENT FIXES

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '@/components/Layout';
import ContentDisplay from '@/components/cms/ContentDisplay';
import Pagination from '@/components/Pagination';
import AdvancedFilterSidebar from '@/components/cms/AdvancedFilterSidebar';
import ActiveFilterPills from '@/components/cms/ActiveFilterPills';
import Toast from '@/components/Toast';
import { MeiliSearch } from 'meilisearch';
import { useRouter } from 'next/router';
import { getBestDocumentUrl } from '@/config/documentMapping';
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
  const urlProposalId = router.query.proposalId ? parseInt(router.query.proposalId as string, 10) : null;

  // State Management
  const [selectedProposalForPreview, setSelectedProposalForPreview] = useState<StrapiProposal | null>(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // ADDED: State to track URL parameter processing
  const [hasProcessedUrlParam, setHasProcessedUrlParam] = useState(false);

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

  // ENHANCED: Fetch complete document data for preview with better attachment handling
  const fetchCompleteDocumentData = async (proposalId: number): Promise<StrapiProposal | null> => {
    try {
      console.log('🔍 Fetching complete document data for ID:', proposalId);
      
      const strapiApiBaseUrl = STRAPI_API_URL.split('?')[0];
      
      // Try multiple API endpoint patterns for better compatibility
      let response = await fetch(`${strapiApiBaseUrl}/${proposalId}?populate[Attachments][populate]=*&populate[Description]=*&populate[Project_Team]=*&populate[SMEs]=*&populate[Pursuit_Team]=*`);
      
      if (!response.ok) {
        console.log('🔄 Trying fallback API call with populate=*');
        response = await fetch(`${strapiApiBaseUrl}/${proposalId}?populate=*`);
      }
      
      if (!response.ok) {
        console.log('🔄 Trying basic API call without populate');
        response = await fetch(`${strapiApiBaseUrl}/${proposalId}`);
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
      }
      
      const apiData = await response.json();
      console.log('📄 Complete API response:', apiData);
      
      // Handle different response structures
      let documentData = apiData;
      if (apiData.data) {
        documentData = apiData.data;
      }
      
      // Extract the attributes
      let attributes = documentData.attributes || documentData;
      
      console.log('📋 Document attributes:', attributes);
      console.log('📎 Raw Attachments data:', attributes.Attachments);
      
      // Enhanced attachment processing
      let processedAttachments = null;
      if (attributes.Attachments) {
        if (Array.isArray(attributes.Attachments)) {
          // Direct array of attachments
          processedAttachments = attributes.Attachments;
        } else if (attributes.Attachments.data && Array.isArray(attributes.Attachments.data)) {
          // Strapi v4 format with data wrapper
          processedAttachments = attributes.Attachments.data.map((item: any) => ({
            id: item.id,
            ...item.attributes,
            url: item.attributes?.url || `/uploads/${item.attributes?.hash}${item.attributes?.ext}`,
          }));
        } else if (typeof attributes.Attachments === 'object') {
          // Single attachment object
          processedAttachments = [attributes.Attachments];
        }
      }
      
      console.log('📎 Processed Attachments:', processedAttachments);
      
      // Extract and enhance the proposal data
      const baseData = extractProposalData(documentData);
      
      // Create enhanced result with all available data
      const enhancedResult: StrapiProposal = {
        ...baseData,
        id: proposalId,
        documentId: proposalId.toString(),
        // Enhanced attachment processing
        Attachments: processedAttachments,
        Description: attributes.Description || [],
        Project_Team: attributes.Project_Team || null,
        SMEs: attributes.SMEs || null,
        Pursuit_Team: attributes.Pursuit_Team || null,
        documentUrl: getBestDocumentUrl(attributes || baseData),
      } as StrapiProposal;
      
      console.log('✅ Enhanced result for preview:', {
        id: enhancedResult.id,
        unique_id: enhancedResult.unique_id,
        attachmentCount: enhancedResult.Attachments ? enhancedResult.Attachments.length : 0,
        documentUrl: enhancedResult.documentUrl
      });
      
      return enhancedResult;
      
    } catch (error) {
      console.error('❌ Error fetching complete document data:', error);
      return null;
    }
  };

  // FIXED: Handle search result clicks with better state management
  const handleSearchResultClick = useCallback(async (proposal: StrapiProposal) => {
    try {
      console.log('🎯 Search result clicked in CMS:', proposal);
      
      // Prevent multiple rapid clicks
      if (selectedProposalForPreview) {
        console.log('⚠️ Modal already open, ignoring click');
        return;
      }
      
      // Fetch complete document data with attachments
      const completeDocument = await fetchCompleteDocumentData(proposal.id);
      
      if (completeDocument) {
        console.log('📄 Using complete document data for preview');
        setSelectedProposalForPreview(completeDocument);
      } else {
        console.warn('⚠️ Could not fetch complete document data, using search result');
        setSelectedProposalForPreview(proposal);
      }
      
      // Mark as processed to prevent URL param from reopening
      setHasProcessedUrlParam(true);
      
      // Update URL to show selected proposal
      if (router.query.proposalId !== String(proposal.id)) {
        router.push(`/content-management?proposalId=${proposal.id}`, undefined, { shallow: true });
      }
      
    } catch (error) {
      console.error('❌ Error handling search result click:', error);
      // Fallback to using the search result as-is
      setSelectedProposalForPreview(proposal);
      setHasProcessedUrlParam(true);
      router.push(`/content-management?proposalId=${proposal.id}`, undefined, { shallow: true });
    }
  }, [router, selectedProposalForPreview]);

  // FIXED: Handle URL proposalId parameter for direct document access
  useEffect(() => {
    // Only process if we haven't already processed this URL param and there's no modal currently open
    if (urlProposalId && !selectedProposalForPreview && !hasProcessedUrlParam) {
      console.log('🔗 URL contains proposalId:', urlProposalId, 'fetching document...');
      
      // Mark as processed immediately to prevent re-processing
      setHasProcessedUrlParam(true);
      
      fetchCompleteDocumentData(urlProposalId).then(completeDocument => {
        if (completeDocument) {
          console.log('📄 Loaded document from URL parameter');
          setSelectedProposalForPreview(completeDocument);
        } else {
          console.warn('⚠️ Could not load document from URL parameter');
          // Remove invalid proposalId from URL
          const { proposalId, ...queryWithoutProposalId } = router.query;
          router.replace({ pathname: router.pathname, query: queryWithoutProposalId }, undefined, { shallow: true });
        }
      });
    }
    
    // Reset the flag when URL param changes or is removed
    if (!urlProposalId) {
      setHasProcessedUrlParam(false);
    }
  }, [urlProposalId, selectedProposalForPreview, hasProcessedUrlParam, router]);

  // Enhanced fetch function with comprehensive filtering and lazy loading
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
    if (urlSearchTerm.trim()) {
      count++;
    }
    if (filters.dateRange[0] && filters.dateRange[1]) {
      count++;
    }
    if (filters.valueRange[0] !== 0 || filters.valueRange[1] !== 1000000) {
      count++;
    }
    
    const multiSelectFilterKeys: Array<keyof AdvancedFilters> = [
      'clientTypes', 'documentTypes', 'documentSubTypes', 'industries', 
      'subIndustries', 'services', 'subServices', 'businessUnits', 
      'regions', 'countries', 'states', 'cities'
    ];
    multiSelectFilterKeys.forEach(key => {
      if (Array.isArray(filters[key]) && (filters[key] as string[]).length > 0) {
        count++;
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
      case 'clear-filters':
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

  // FIXED: Close preview modal and update URL with proper state management
  const closePreviewModal = useCallback(() => {
    console.log('🔒 Closing preview modal');
    
    // Clear the modal state first
    setSelectedProposalForPreview(null);
    
    // Mark that we're intentionally closing (to prevent reopening)
    setHasProcessedUrlParam(true);
    
    // Remove proposalId from URL but keep other query parameters
    const { proposalId, ...queryWithoutProposalId } = router.query;
    router.push({ pathname: router.pathname, query: queryWithoutProposalId }, undefined, { shallow: true })
      .then(() => {
        // Reset the flag after URL update is complete
        setTimeout(() => {
          setHasProcessedUrlParam(false);
        }, 100);
      });
  }, [router]);

  // Layout props (Passed to the parent Layout component)
  const layoutProps = {
    searchTerm: urlSearchTerm,
    isLoading: isLoading,
    onResultClick: handleSearchResultClick, // FIXED: Pass the proper handler
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
      <div className="cms-page-outer-wrapper">
        {/* Advanced Filter Sidebar */}
        <aside className={`cms-filter-sidebar ${isFilterSidebarOpen ? 'open' : 'closed'} lg:block`}>
          <div className="h-full overflow-y-auto custom-scrollbar">
            <AdvancedFilterSidebar
              filters={filters}
              onUpdateFilter={updateFilter}
              onClearAll={clearAllFilters}
              activeFiltersCount={activeFiltersCount}
              isOpen={isFilterSidebarOpen}
              onToggle={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="cms-main-content">
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
          <div className="cms-content-area-inner custom-scrollbar">
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
              isFilterSidebarOpen={isFilterSidebarOpen}
              onToggleFilterSidebar={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
              activeFiltersCount={activeFiltersCount}
              onToggleMobileFilterSidebar={() => setIsMobileFilterOpen(true)}
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

        {/* Mobile Filter Overlay */}
        {isMobileFilterOpen && (
          <div className="cms-mobile-filter-overlay" onClick={() => setIsMobileFilterOpen(false)}>
            <aside className="cms-mobile-filter-sidebar" onClick={e => e.stopPropagation()}>
              <AdvancedFilterSidebar
                filters={filters}
                onUpdateFilter={updateFilter}
                onClearAll={clearAllFilters}
                activeFiltersCount={activeFiltersCount}
                isOpen={true}
                onToggle={() => setIsMobileFilterOpen(false)}
                isMobile={true}
              />
            </aside>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {selectedProposalForPreview && (
        <DocumentPreviewModal
          proposal={selectedProposalForPreview}
          onClose={closePreviewModal}
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