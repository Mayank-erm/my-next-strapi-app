// src/pages/content-management.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '@/components/Layout';
import FilterSection from '@/components/cms/FilterSection'; // Re-added: FilterSection component
import ContentDisplay from '@/components/cms/ContentDisplay';
import Pagination from '@/components/Pagination';
import { MeiliSearch } from 'meilisearch';
import { useRouter } from 'next/router';
// No longer needed: import ActiveFilterPills from '@/components/cms/ActiveFilterPills'; // Now imported directly in FilterSection

// Define the interface for Strapi proposals (aligned with MeiliSearch schema provided)
interface StrapiProposal {
  id: number;
  documentId: string; // From MeiliSearch
  opportunityNumber: string;
  proposalName: string;
  clientName: string;
  pstatus: string;
  value: number; // Changed to number for range filtering
  description: string; // Assuming description is flat string for search
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  proposedBy: string;
  chooseEmployee: number | null;
  documentUrl?: string; // Add documentUrl for preview (will be derived/mocked)
}

// --- MeiliSearch Configuration ---
const MEILISEARCH_HOST = 'http://localhost:7700';
const MEILISEARCH_API_KEY = 'masterKey';

const meiliSearchClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

const ITEMS_PER_PAGE = 8;

const CmsPage: React.FC = () => {
  const router = useRouter();
  const urlSearchTerm = (router.query.searchTerm as string) || '';

  // Filter States - Re-added as per the user's clarification
  const [proposalStatuses, setProposalStatuses] = useState<string[]>([]);
  const [proposedByUsers, setProposedByUsers] = useState<string[]>([]);
  // Placeholder Multi-selects (require MeiliSearch schema update)
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [serviceLines, setServiceLines] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);

  // Collapsed Filters
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [valueRange, setValueRange] = useState<[number, number]>([0, 1000000]);


  // Display States
  const [sortBy, setSortBy] = useState<string>('publishedAt:desc');
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Data Fetching States
  const [proposals, setProposals] = useState<StrapiProposal[]>([]);
  const [totalProposals, setTotalProposals] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  // Use a debounced search term for MeiliSearch queries to avoid too many calls while typing
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(urlSearchTerm);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(urlSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [urlSearchTerm]);


  // Calculate active filters count for the "More Filters" button and ActiveFilterPills
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (urlSearchTerm) count++;
    if (dateRange[0] && dateRange[1]) count++;
    if (valueRange[0] !== 0 || valueRange[1] !== 1000000) count++; // Assuming default range
    if (proposalStatuses.length > 0) count++;
    if (proposedByUsers.length > 0) count++;
    if (contentTypes.length > 0) count++; // Placeholder filters
    if (serviceLines.length > 0) count++;
    if (industries.length > 0) count++;
    if (regions.length > 0) count++;
    return count;
  }, [urlSearchTerm, dateRange, valueRange, proposalStatuses, proposedByUsers, contentTypes, serviceLines, industries, regions]);


  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setProposals([]);
    setTotalProposals(0);

    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
      // --- Build MeiliSearch filter string --- Re-added filter building
      const meiliFilters: string[] = [];

      // Date Range Filter (publishedAt)
      if (dateRange[0] && dateRange[1]) {
        const startDate = dateRange[0].toISOString().split('T')[0];
        const endDate = dateRange[1].toISOString().split('T')[0];
        meiliFilters.push(`publishedAt >= "${startDate}" AND publishedAt <= "${endDate}"`);
      }

      // Value Range Filter (value)
      if (valueRange[0] !== 0 || valueRange[1] !== 1000000) { // Only filter if not default
        meiliFilters.push(`value >= ${valueRange[0]} AND value <= ${valueRange[1]}`);
      }

      // Proposal Statuses Filter (pstatus)
      if (proposalStatuses.length > 0) {
        const statusFilters = proposalStatuses.map(status => `pstatus = "${status}"`).join(' OR ');
        meiliFilters.push(`(${statusFilters})`);
      }

      // Proposed By Users Filter (proposedBy)
      if (proposedByUsers.length > 0) {
        const userFilters = proposedByUsers.map(user => `proposedBy = "${user}"`).join(' OR ');
        meiliFilters.push(`(${userFilters})`);
      }

      // --- Perform MeiliSearch Query ---
      const searchOptions: any = {
        offset: offset,
        limit: ITEMS_PER_PAGE,
        sort: [sortBy],
      };

      if (meiliFilters.length > 0) {
        searchOptions.filter = meiliFilters.join(' AND ');
      }

      console.log("MeiliSearch Query (q):", debouncedSearchTerm);
      console.log("MeiliSearch Query (filter):", searchOptions.filter);
      console.log("MeiliSearch Query (sort):", searchOptions.sort);


      const meiliSearchResults = await meiliSearchClient.index('document_stores').search(debouncedSearchTerm, searchOptions); // Index changed to document_stores

      // Map MeiliSearch results to StrapiProposal interface structure
      const fetchedProposals: StrapiProposal[] = (meiliSearchResults.hits || []).map((hit: any) => {
        let documentUrl = '';
        if (hit.documentId) {
            if (hit.proposalName?.includes("Excel")) documentUrl = `/documents/test_excel.xlsx - ESRS S3.csv`;
            else if (hit.proposalName?.includes("Word")) documentUrl = `/documents/test_word.docx`;
            else if (hit.proposalName?.includes("PPT")) documentUrl = `/documents/test_ppt.pptx`;
            else documentUrl = `/documents/test_pdf.pdf`;
        }

        return {
          id: hit.id,
          documentId: hit.documentId,
          opportunityNumber: hit.opportunityNumber || 'N/A',
          proposalName: hit.proposalName || 'Untitled',
          clientName: hit.clientName || 'Unknown Client',
          pstatus: hit.pstatus || 'draft',
          value: hit.value || 0,
          description: hit.description || '',
          createdAt: hit.createdAt,
          updatedAt: hit.updatedAt,
          publishedAt: hit.publishedAt,
          proposedBy: hit.proposedBy || 'N/A',
          chooseEmployee: hit.chooseEmployee || null,
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
    dateRange,
    valueRange,
    proposalStatuses,
    proposedByUsers,
    sortBy,
    contentTypes,
    serviceLines,
    industries,
    regions,
  ]);


  useEffect(() => {
    fetchContent();
  }, [currentPage, fetchContent]);


  const handleApplyFilters = useCallback(() => { // Re-added
    setCurrentPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    router.replace({ pathname: router.pathname, query: {} }, undefined, { shallow: true });

    setProposalStatuses([]); // Re-added filter state resets
    setProposedByUsers([]);
    setContentTypes([]);
    setServiceLines([]);
    setIndustries([]);
    setRegions([]);
    setDateRange([null, null]);
    setValueRange([0, 1000000]);
    setSortBy('publishedAt:desc');
    setCurrentPage(1);
  }, [router]);


  const totalPages = Math.ceil(totalProposals / ITEMS_PER_PAGE);

  const handleBulkAction = (action: string) => {
    alert(`Performing bulk action: ${action} on items: ${selectedItems.join(', ')}`);
    setSelectedItems([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(proposals.map(p => p.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(item => item !== id));
    }
  };

  const layoutProps = {
    searchTerm: urlSearchTerm,
    onSearchChange: (term: string) => router.replace({ pathname: router.pathname, query: { ...router.query, searchTerm: term } }, undefined, { shallow: true }),
    isLoading: isLoading,
    onResultClick: (proposal: StrapiProposal) => router.push(`/content-management?proposalId=${proposal.id}`),
    activeContentType: 'Proposals', // Re-added Filter-related props to LayoutProps
    activeServiceLines: serviceLines, // Pass actual state
    activeIndustries: industries,     // Pass actual state
    activeRegions: regions,         // Pass actual state
    activeDate: dateRange[0]?.toISOString().split('T')[0] || '', // Pass actual state
    onContentTypeChange: setContentTypes, // Pass setters
    onServiceLineChange: setServiceLines, // Pass setters
    onIndustryChange: setIndustries,     // Pass setters
    onRegionChange: setRegions,         // Pass setters
    onDateChange: (date: string) => { // Custom handler for date string
      const newDate = date ? new Date(date) : null;
      setDateRange([newDate, dateRange[1]]);
    },
    onSearchInFiltersChange: () => {}, // This is for internal filter search, not main search
    onClearAllFilters: handleClearAllFilters,
  };


  return (
    <Layout {...layoutProps}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-text-dark-gray mb-6">Content Management</h1>

        <FilterSection // Re-added FilterSection component
          proposalStatuses={proposalStatuses}
          setProposalStatuses={setProposalStatuses}
          proposedByUsers={proposedByUsers}
          setProposedByUsers={setProposedByUsers}
          contentTypes={contentTypes}
          setContentTypes={setContentTypes}
          serviceLines={serviceLines}
          setServiceLines={setServiceLines}
          industries={industries}
          setIndustries={setIndustries}
          regions={regions}
          setRegions={setRegions}

          dateRange={dateRange}
          setDateRange={setDateRange}
          valueRange={valueRange}
          setValueRange={setValueRange}

          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearAllFilters}
          activeFiltersCount={activeFiltersCount}
          // Pass all necessary states for ActiveFilterPills to FilterSection
          activeFilterPillsProps={{
              searchTerm: urlSearchTerm,
              dateRange: dateRange,
              valueRange: valueRange,
              proposalStatuses: proposalStatuses,
              proposedByUsers: proposedByUsers,
              contentTypes: contentTypes,
              serviceLines: serviceLines,
              industries: industries,
              regions: regions,
              onClearFilter: handleClearAllFilters,
          }}
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

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
        />

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </Layout>
  );
};

export default CmsPage;