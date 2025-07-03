// src/components/Layout.tsx
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router'; // Import useRouter

// Define the interface for Strapi proposals (re-defined for prop types)
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

// Define the props that Layout now expects from HomePage (index.tsx) or CmsPage (content-management.tsx)
interface LayoutProps {
  children: React.ReactNode;
  isLoading: boolean; // Prop for internal search modal loading in Header
  onSearchResultClick: (proposal: StrapiProposal) => void; // Prop for search result click in Header
  // FilterBy related props were correctly removed as the component is removed
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
}) => {
  const router = useRouter();
  const currentSearchTerm = (router.query.searchTerm as string) || ''; // Get searchTerm directly from URL

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const HEADER_HEIGHT_PX = 64;
  const SIDEBAR_COLLAPSED_WIDTH_PX = 80;
  const SIDEBAR_EXPANDED_WIDTH_PX = 256;
  // FILTER_BY_WIDTH_PX removed as FilterBy is removed from the codebase

  const totalLeftOffset = isSidebarOpen
    ? SIDEBAR_EXPANDED_WIDTH_PX
    : SIDEBAR_COLLAPSED_WIDTH_PX; // Adjusted calculation as FilterBy is no longer a sidebar component

  return (
    <div className="flex flex-col min-h-screen bg-strapi-gray-bg font-inter">
      {/* Header component, now receives searchTerm from URL */}
      <Header
        searchTerm={currentSearchTerm} // Pass searchTerm from URL query
        isLoading={isLoading}
        onResultClick={onSearchResultClick}
      />

      {/* Hamburger icon for mobile/tablet to toggle sidebar */}
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
        {/* Collapsible Sidebar */}
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
          ></div>
        )}

        {/* Content wrapper for Main Content */}
        <div
          className="flex flex-1 transition-all duration-300 ease-in-out"
          style={{ paddingLeft: `${totalLeftOffset}px` }} // Padding adjusted
        >
          {/* FilterBy component removed from here as per request */}
          {/* Main Page Content - children from index.tsx or content-management.tsx */}
          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Footer component */}
      <Footer />
    </div>
  );
};

export default Layout;
