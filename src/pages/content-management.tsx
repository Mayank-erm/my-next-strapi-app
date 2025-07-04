// src/pages/content-management.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '@/components/Layout';
import FilterSection from '@/components/cms/FilterSection';
import ContentDisplay from '@/components/cms/ContentDisplay';
import Pagination from '@/components/Pagination';
import { MeiliSearch } from 'meilisearch';
import { useRouter } from 'next/router';
import { getDocumentUrl } from '@/config/documentMapping';
import { STRAPI_API_URL } from '@/config/apiConfig';
import { StrapiProposal } from '@/types/strapi';

// --- MeiliSearch Configuration ---
const MEILISEARCH_HOST = 'http://localhost:7700';
const MEILISEARCH_API_KEY = 'masterKey';

const meiliSearchClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

// Helper to extract data regardless of Strapi 'attributes' nesting and convert Document_Value_Range to number
const extractProposalData = (item: any): Omit<StrapiProposal, 'id' | 'documentId'> => {
  const data = item.attributes || item;

  const parseValueRange = (rangeStr: string | undefined | null): number => {
    if (!rangeStr) return 0;
    const match = rangeStr.match(/^(\d+)([KM]?)/i);
    if (match) {
      let value = parseFloat(match[1]);
      const suffix = match[2]?.toUpperCase();
      if (suffix === 'K') value *= 1000;
      if (suffix === 'M') value *= 1000000;
      return value;
    }
    return 0;
  };

  return {
    unique_id: data.Unique_Id || data.SF_Number || 'N/A',
    SF_Number: data.SF_Number || data.Unique_Id || 'N/A',
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
    value: parseValueRange(data.Document_Value_Range), // Convert range string to number
    proposalName: data.proposalName || data.SF_Number || data.Unique_Id || 'N/A',
    
    Attachments: data.Attachments || null,
    Pursuit_Team: data.Pursuit_Team || null,

    opportunityNumber: data.opportunityNumber,
    opportunity_number: data.opportunity_number,
    proposal_name: data.proposal_name,
    client_name: data.client_name,
    service_line: data.service_line,
    region: data.region,
    document_type: data.document_type,
    document_sub_type: data.document_sub_type,
  };
};

const ITEMS_PER_PAGE = 8;

const CmsPage: React.FC = () => {
  const router = useRouter();
  const urlSearchTerm = (router.query.searchTerm as string) || '';

  // Moved selectedProposalForPreview to be the first state declaration
  const [selectedProposalForPreview, setSelectedProposalForPreview] = useState<StrapiProposal | null>(null); 

  // All other useState declarations follow
  const [proposalStatuses, setProposalStatuses] = useState<string[]>([]);
  const [proposedByUsers, setProposedByUsers] = useState<string[]>([]);
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [serviceLines, setServiceLines] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [valueRange, setValueRange] = useState<[number, number]>([0, 1000000]);

  const [sortBy, setSortBy] = useState<string>('publishedAt:desc');
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [proposals, setProposals] = useState<StrapiProposal[]>([]);
  const [totalProposals, setTotalProposals] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(urlSearchTerm);
  
   useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(urlSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [urlSearchTerm]);


  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (urlSearchTerm) count++;
    if (dateRange[0] && dateRange[1]) count++;
    if (valueRange[0] !== 0 || valueRange[1] !== 1000000) count++;
    if (proposalStatuses.length > 0) count++;
    if (proposedByUsers.length > 0) count++;
    if (contentTypes.length > 0) count++;
    if (serviceLines.length > 0) count++;
    if (industries.length > 0) count++;
    if (regions.length > 0) count++;
    return count;
  }, [urlSearchTerm, dateRange, valueRange, proposalStatuses, proposedByUsers, contentTypes, serviceLines, industries, regions]);


  // fetchContent useCallback definition (moved here to be before useEffects that use it)
  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setProposals([]);
    setTotalProposals(0);

    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    
    const strapiApiBaseUrl = STRAPI_API_URL.split('?')[0];

    try {
      const meiliFilters: string[] = [];

      if (dateRange[0] && dateRange[1]) {
        const startDate = dateRange[0].toISOString().split('T')[0];
        const endDate = dateRange[1].toISOString().split('T')[0];
        meiliFilters.push(`publishedAt >= "${startDate}" AND publishedAt <= "${endDate}"`);
      }

      if (valueRange[0] !== 0 || valueRange[1] !== 1000000) {
        meiliFilters.push(`value >= ${valueRange[0]} AND value <= ${valueRange[1]}`);
      }

      if (proposalStatuses.length > 0) {
        const statusFilters = proposalStatuses.map(status => `Document_Outcome = "${status}"`).join(' OR ');
        meiliFilters.push(`(${statusFilters})`);
      }

      if (proposedByUsers.length > 0) {
        const userFilters = proposedByUsers.map(user => `Author = "${user}"`).join(' OR ');
        meiliFilters.push(`(${userFilters})`);
      }

      if (contentTypes.length > 0) {
        const typeFilters = contentTypes.map(type => `Document_Type = "${type}"`).join(' OR ');
        meiliFilters.push(`(${typeFilters})`);
      }
      if (serviceLines.length > 0) {
        const serviceFilters = serviceLines.map(line => `Service = "${line}"`).join(' OR ');
        meiliFilters.push(`(${serviceFilters})`);
      }
      if (industries.length > 0) {
        const industryFilters = industries.map(industry => `Industry = "${industry}"`).join(' OR ');
        meiliFilters.push(`(${industryFilters})`);
      }
      if (regions.length > 0) {
        const regionFilters = regions.map(region => `Region = "${region}"`).join(' OR ');
        meiliFilters.push(`(${regionFilters})`);
      }


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


      const meiliSearchResults = await meiliSearchClient.index('document_stores').search(debouncedSearchTerm, searchOptions);

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

  // useEffects come after state and useCallback definitions
  useEffect(() => {
    fetchContent();
  }, [currentPage, fetchContent]);


  const handleApplyFilters = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    router.replace({ pathname: router.pathname, query: {} }, undefined, { shallow: true });

    setProposalStatuses([]);
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
    },
    activeContentType: 'Proposals',
    activeServiceLines: serviceLines,
    activeIndustries: industries,
    activeRegions: regions,
    activeDate: dateRange[0]?.toISOString().split('T')[0] || '',
    onContentTypeChange: setContentTypes,
    onServiceLineChange: setServiceLines,
    onIndustryChange: setIndustries,
    onRegionChange: setRegions,
    onDateChange: (date: string) => {
      const newDate = date ? new Date(date) : null;
      setDateRange([newDate, dateRange[1]]);
    },
    onSearchInFiltersChange: () => {},
    onClearAllFilters: handleClearAllFilters,
  };


  // useEffect for handling modal open/close based on URL query param (comes after states and fetchContent)
  useEffect(() => {
    const proposalId = router.query.proposalId;
    if (proposalId && !selectedProposalForPreview) {
      const foundProposal = proposals.find(p => String(p.id) === proposalId);
      if (foundProposal) {
        setSelectedProposalForPreview(foundProposal);
      } else if (!isLoading) {
        const fetchIndividualProposal = async () => {
          setIsLoading(true);
          try {
            const strapiApiBaseUrl = STRAPI_API_URL.split('?')[0];
            const response = await fetch(`${strapiApiBaseUrl}/${proposalId}?populate=*`);
            if (!response.ok) {
              throw new Error(`Failed to fetch individual proposal for ID: ${proposalId}`);
            }
            const data = await response.json();
            const fetchedProposal: StrapiProposal = {
              ...extractProposalData(data.data),
              id: data.data.id,
              documentId: data.data.id.toString(),
              value: extractProposalData(data.data).value,
              documentUrl: data.data.attributes?.documentUrl || getDocumentUrl(data.data.attributes?.SF_Number || data.data.attributes?.Unique_Id, data.data.id.toString()),
            };
            setSelectedProposalForPreview(fetchedProposal);
          } catch (err: any) {
            console.error("Error fetching individual proposal for preview:", err);
            setError(`Failed to load document for preview: ${err.message}`);
            router.push('/content-management', undefined, { shallow: true });
          } finally {
            setIsLoading(false);
          }
        };
        fetchIndividualProposal();
      }
    } else if (!proposalId && selectedProposalForPreview) {
      setSelectedProposalForPreview(null);
    }
  }, [router.query.proposalId, proposals, isLoading, selectedProposalForPreview]);


  return (
    <Layout {...layoutProps}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-text-dark-gray mb-6">Content Management</h1>

        <FilterSection
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

export default CmsPage;