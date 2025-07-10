// src/pages/bookmarks.tsx - FIXED VERSION WITH PROPER SEARCH RESULT HANDLING
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import { StrapiProposal } from '@/types/strapi';
import { extractProposalData } from '@/utils/dataHelpers';
import { getBestDocumentUrl } from '@/config/documentMapping';
import DocumentPreviewModal from '@/components/DocumentPreviewModal';
import Toast from '@/components/Toast';

const BookmarksPage: React.FC = () => {
  const router = useRouter();
  const urlSearchTerm = (router.query.searchTerm as string) || '';
  const urlProposalId = router.query.proposalId ? parseInt(router.query.proposalId as string, 10) : null;

  // State for preview modal
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

  // ENHANCED: Fetch complete document data for preview
  const fetchCompleteDocumentData = async (proposalId: number): Promise<StrapiProposal | null> => {
    try {
      console.log('🔍 Fetching complete document data for ID:', proposalId);
      
      const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337/api';
      const response = await fetch(`${strapiApiUrl}/document-stores/${proposalId}?populate=*`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
      }
      
      const apiData = await response.json();
      console.log('📄 Complete API response:', apiData);
      
      // Extract and enhance the proposal data
      const baseData = extractProposalData(apiData.data);
      
      // Create enhanced result with all available data
      const enhancedResult: StrapiProposal = {
        ...baseData,
        id: proposalId,
        documentId: proposalId.toString(),
        // Ensure we have the complete attachments data
        Attachments: apiData.data?.attributes?.Attachments || null,
        Description: apiData.data?.attributes?.Description || [],
        Project_Team: apiData.data?.attributes?.Project_Team || null,
        SMEs: apiData.data?.attributes?.SMEs || null,
        Pursuit_Team: apiData.data?.attributes?.Pursuit_Team || null,
        documentUrl: getBestDocumentUrl(apiData.data?.attributes || baseData),
      } as StrapiProposal;
      
      console.log('✅ Enhanced result for preview:', enhancedResult);
      return enhancedResult;
      
    } catch (error) {
      console.error('❌ Error fetching complete document data:', error);
      return null;
    }
  };

  // FIXED: Handle search result clicks with complete data fetching
  const handleSearchResultClick = useCallback(async (proposal: StrapiProposal) => {
    try {
      console.log('🎯 Search result clicked in Bookmarks:', proposal);
      
      // Fetch complete document data with attachments
      const completeDocument = await fetchCompleteDocumentData(proposal.id);
      
      if (completeDocument) {
        console.log('📄 Using complete document data for preview');
        setSelectedProposalForPreview(completeDocument);
      } else {
        console.warn('⚠️ Could not fetch complete document data, using search result');
        setSelectedProposalForPreview(proposal);
      }
      
      // Update URL to show selected proposal
      if (router.query.proposalId !== String(proposal.id)) {
        router.push(`/bookmarks?proposalId=${proposal.id}`, undefined, { shallow: true });
      }
      
    } catch (error) {
      console.error('❌ Error handling search result click:', error);
      // Fallback to using the search result as-is
      setSelectedProposalForPreview(proposal);
      router.push(`/bookmarks?proposalId=${proposal.id}`, undefined, { shallow: true });
    }
  }, [router]);

  // ENHANCED: Handle URL proposalId parameter for direct document access
  useEffect(() => {
    if (urlProposalId && !selectedProposalForPreview) {
      console.log('🔗 URL contains proposalId:', urlProposalId, 'fetching document...');
      
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
  }, [urlProposalId, selectedProposalForPreview, router]);

  // FIXED: Close preview modal and update URL
  const closePreviewModal = useCallback(() => {
    setSelectedProposalForPreview(null);
    
    // Remove proposalId from URL but keep other query parameters
    const { proposalId, ...queryWithoutProposalId } = router.query;
    router.push({ pathname: router.pathname, query: queryWithoutProposalId }, undefined, { shallow: true });
  }, [router]);

  // Clear filters handler
  const handleClearFilters = useCallback(() => {
    router.replace({ pathname: router.pathname, query: {} }, undefined, { shallow: true });
  }, [router]);

  // Layout props with proper search result handling
  const layoutProps = {
    isLoading: false,
    onSearchResultClick: handleSearchResultClick, // FIXED: Pass the proper handler
    // Removed FilterBy related props as the component is removed
    activeContentType: 'Bookmarks',
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
    onClearAllFilters: handleClearFilters,
  };

  return (
    <>
      <Layout {...layoutProps}>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-10">
          <span className="text-6xl mb-4" role="img" aria-label="Bookmark icon">🔖</span>
          <h2 className="text-3xl font-bold text-text-dark-gray mb-3">Your Bookmarked Items</h2>
          <p className="text-lg text-text-medium-gray text-center max-w-md mb-6">
            This page will display all your saved proposals and reports.
            Start by clicking the bookmark icon on any content card!
          </p>
          
          {/* Enhanced search info */}
          {urlSearchTerm && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 max-w-md">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Search in bookmarks:</span> "{urlSearchTerm}"
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Use the search bar above to find your bookmarked documents
              </p>
            </div>
          )}
          
          {/* Quick actions */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => router.push('/content-management')}
              className="px-6 py-3 bg-erm-primary text-white rounded-lg hover:bg-erm-dark transition-colors font-medium"
            >
              Browse All Documents
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </Layout>

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
    </>
  );
};

export default BookmarksPage;