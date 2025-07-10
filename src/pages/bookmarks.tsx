// src/pages/bookmarks.tsx - FINAL FIXED VERSION WITH MODAL AND ATTACHMENT FIXES
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
  
  // ADDED: State to track URL parameter processing
  const [hasProcessedUrlParam, setHasProcessedUrlParam] = useState(false);
  
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

  // ENHANCED: Fetch complete document data for preview with better attachment handling
  const fetchCompleteDocumentData = async (proposalId: number): Promise<StrapiProposal | null> => {
    try {
      console.log('🔍 Fetching complete document data for ID:', proposalId);
      
      const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337/api';
      const baseUrl = strapiApiUrl.split('?')[0];
      
      // Try multiple API endpoint patterns for better compatibility
      let response = await fetch(`${baseUrl}/document-stores/${proposalId}?populate[Attachments][populate]=*&populate[Description]=*&populate[Project_Team]=*&populate[SMEs]=*&populate[Pursuit_Team]=*`);
      
      if (!response.ok) {
        console.log('🔄 Trying fallback API call with populate=*');
        response = await fetch(`${baseUrl}/document-stores/${proposalId}?populate=*`);
      }
      
      if (!response.ok) {
        console.log('🔄 Trying basic API call without populate');
        response = await fetch(`${baseUrl}/document-stores/${proposalId}`);
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
      console.log('🎯 Search result clicked in Bookmarks:', proposal);
      
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
        router.push(`/bookmarks?proposalId=${proposal.id}`, undefined, { shallow: true });
      }
      
    } catch (error) {
      console.error('❌ Error handling search result click:', error);
      // Fallback to using the search result as-is
      setSelectedProposalForPreview(proposal);
      setHasProcessedUrlParam(true);
      router.push(`/bookmarks?proposalId=${proposal.id}`, undefined, { shallow: true });
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

  // Clear filters handler
  const handleClearFilters = useCallback(() => {
    router.replace({ pathname: router.pathname, query: {} }, undefined, { shallow: true });
  }, [router]);

  // Layout props with proper search result handling
  const layoutProps = {
    searchTerm: urlSearchTerm,
    isLoading: false,
    onResultClick: handleSearchResultClick, // FIXED: Pass the proper handler
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
              <button
                onClick={handleClearFilters}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Clear search
              </button>
            </div>
          )}
          
          {/* URL parameter info */}
          {urlProposalId && !selectedProposalForPreview && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4 max-w-md">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Loading document:</span> ID {urlProposalId}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Fetching complete document data...
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
          
          {/* Additional helpful info */}
          <div className="mt-8 text-center max-w-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Use Bookmarks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">📚</div>
                <div className="font-medium text-gray-800 mb-1">Find Documents</div>
                <div>Browse documents in the Content Library or Dashboard</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">🔖</div>
                <div className="font-medium text-gray-800 mb-1">Bookmark Items</div>
                <div>Click the bookmark icon on any document card</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">🔍</div>
                <div className="font-medium text-gray-800 mb-1">Search Bookmarks</div>
                <div>Use the search bar to find specific bookmarked documents</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">📄</div>
                <div className="font-medium text-gray-800 mb-1">Quick Access</div>
                <div>All your saved documents will appear here for easy access</div>
              </div>
            </div>
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