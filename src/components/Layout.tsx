// src/components/Layout.tsx - UPDATED WITH PROPER TOGGLE LOGIC
import React, { useState, useEffect } from 'react';
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

  // State for sidebar expansion - starts collapsed for cleaner look
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toggle sidebar expansion
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [router.pathname]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const HEADER_HEIGHT_PX = 64;
  const SIDEBAR_COLLAPSED_WIDTH_PX = 80;
  const SIDEBAR_EXPANDED_WIDTH_PX = 256;

  // Calculate left offset based on sidebar state
  const totalLeftOffset = isSidebarExpanded ? SIDEBAR_EXPANDED_WIDTH_PX : SIDEBAR_COLLAPSED_WIDTH_PX;

  return (
    <div className="flex flex-col min-h-screen bg-strapi-gray-bg font-inter">
      {/* Header component */}
      <Header
        searchTerm={currentSearchTerm}
        isLoading={isLoading}
        onResultClick={onSearchResultClick}
      />

      {/* Mobile hamburger button - positioned to not interfere with sidebar toggle */}
      <button
        className="md:hidden fixed top-4 right-4 z-40 p-2 rounded-md bg-white shadow-md text-gray-700
                   hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-erm-primary focus:ring-offset-2
                   transition-all duration-200"
        onClick={toggleMobileSidebar}
        aria-label="Toggle mobile sidebar"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Main content area below the header */}
      <div className="flex flex-1" style={{ paddingTop: `${HEADER_HEIGHT_PX}px` }}>
        {/* Main Navigation Sidebar - ALWAYS SHOW on desktop */}
        <div className="hidden md:block">
          <Sidebar
            isExpanded={isSidebarExpanded}
            onToggle={toggleSidebar}
          />
        </div>

        {/* Mobile Sidebar */}
        <div className={`
          md:hidden fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `} style={{ top: `${HEADER_HEIGHT_PX}px` }}>
          <div className="h-full">
            <Sidebar
              isExpanded={true} // Always expanded on mobile when open
              onToggle={toggleMobileSidebar}
            />
          </div>
        </div>

        {/* Mobile overlay */}
        {isMobileSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
            style={{ top: `${HEADER_HEIGHT_PX}px` }}
            onClick={toggleMobileSidebar}
          />
        )}

        {/* Content wrapper for Main Content */}
        <div
          className={`
            flex flex-1 transition-all duration-300 ease-in-out
            md:ml-20 ${isSidebarExpanded ? 'md:ml-64' : ''}
          `}
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
      <Footer />
    </div>
  );
};

export default Layout;