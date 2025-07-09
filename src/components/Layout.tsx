// src/components/Layout.tsx - COMPLETE UPDATED VERSION FOR NEW FILTER SIDEBAR
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';

// Define the interface for Strapi proposals
interface StrapiProposal {
  id: number;
  opportunityNumber: string;
  proposalName: string;
  clientName: string;
  pstatus: string;
  value: string | number;
  description?: any[] | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  proposedBy: string | null;
  chooseEmployee: number | null;
}

interface LayoutProps {
  children: React.ReactNode;
  isLoading: boolean;
  onSearchResultClick: (proposal: StrapiProposal) => void;
  activeContentType: string;
  activeServiceLines: string[];
  activeIndustries: string[];
  activeRegions: string[];
  activeDate: string;
  onContentTypeChange: (type: string) => void;
  onServiceLineChange: (lines: string[]) => void;
  onIndustryChange: (industries: string[]) => void;
  onRegionChange: (regions: string[]) => void;
  onDateChange: (date: string) => void;
  onSearchInFiltersChange: (term: string) => void;
  onClearAllFilters: () => void;
  // New optional prop to control whether to show the main sidebar
  showMainSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  isLoading,
  onSearchResultClick,
  activeContentType,
  activeServiceLines,
  activeIndustries,
  activeRegions,
  activeDate,
  onContentTypeChange,
  onServiceLineChange,
  onIndustryChange,
  onRegionChange,
  onDateChange,
  onSearchInFiltersChange,
  onClearAllFilters,
  showMainSidebar = true, // Default to true for backward compatibility
}) => {
  const router = useRouter();
  const currentSearchTerm = (router.query.searchTerm as string) || '';
  const isContentManagementPage = router.pathname === '/content-management';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const HEADER_HEIGHT_PX = 64;
  const SIDEBAR_COLLAPSED_WIDTH_PX = 80;
  const SIDEBAR_EXPANDED_WIDTH_PX = 256;

  // Calculate left offset - only apply for non-content-management pages
  // Calculate left offset - ALWAYS show main sidebar
  const totalLeftOffset = isSidebarOpen ? SIDEBAR_EXPANDED_WIDTH_PX : SIDEBAR_COLLAPSED_WIDTH_PX;

  return (
    <div className="flex flex-col min-h-screen bg-strapi-gray-bg font-inter">
      {/* Header component */}
      <Header
        searchTerm={currentSearchTerm}
        isLoading={isLoading}
        onResultClick={onSearchResultClick}
      />

      {/* Hamburger icon for mobile/tablet - show for all pages */}
      <button
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-white shadow-md text-gray-700
                   focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Main content area below the header */}
      <div className="flex flex-1" style={{ paddingTop: `${HEADER_HEIGHT_PX}px` }}>
        {/* Main Navigation Sidebar - ALWAYS SHOW */}
        <Sidebar
          isExpanded={isSidebarOpen}
          onMouseEnter={() => window.innerWidth >= 768 && setIsSidebarOpen(true)}
          onMouseLeave={() => window.innerWidth >= 768 && setIsSidebarOpen(false)}
        />

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Content wrapper for Main Content */}
        <div
          className="flex flex-1 transition-all duration-300 ease-in-out"
          style={{ paddingLeft: `${totalLeftOffset}px` }}
        >
          {/* Main Page Content */}
          <main className={`
            flex-1 overflow-auto
            ${isContentManagementPage ? '' : 'p-8'}
          `}>
            {children}
          </main>
        </div>
      </div>

      {/* Footer component - only show for non-content-management pages */}
      {!isContentManagementPage && <Footer />}
    </div>
  );
};

export default Layout;