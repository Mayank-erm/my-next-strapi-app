// src/components/Layout.tsx
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import FilterBy from './FilterBy';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const handleMouseEnter = () => setIsSidebarExpanded(true);
  const handleMouseLeave = () => setIsSidebarExpanded(false);

  const HEADER_HEIGHT_PX = 64; // Corresponds to Tailwind's h-16
  const SIDEBAR_COLLAPSED_WIDTH_PX = 80; // Corresponds to Tailwind's w-20
  const SIDEBAR_EXPANDED_WIDTH_PX = 256; // Corresponds to Tailwind's w-64
  const FILTER_BY_WIDTH_PX = 256; // Corresponds to Tailwind's w-64

  // Calculate the total offset for the main content
  const totalLeftOffset = isSidebarExpanded
    ? SIDEBAR_EXPANDED_WIDTH_PX + FILTER_BY_WIDTH_PX
    : SIDEBAR_COLLAPSED_WIDTH_PX + FILTER_BY_WIDTH_PX;

  return (
    <div className="flex flex-col min-h-screen bg-strapi-gray-bg font-inter">
      {/* Header (sticky at the top) */}
      <Header />

      {/* Main content area below the header */}
      {/* The top padding is for the fixed header. The left padding is for the fixed sidebar + filter. */}
      <div className="flex flex-1" style={{ paddingTop: `${HEADER_HEIGHT_PX}px` }}>
        {/* Collapsible Sidebar */}
        <Sidebar
          isExpanded={isSidebarExpanded}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        {/* Content wrapper for FilterBy and Main Content */}
        {/* This div effectively pushes the content right to avoid overlap with fixed elements */}
        <div
          className="flex flex-1 transition-all duration-300 ease-in-out"
          style={{ paddingLeft: `${totalLeftOffset}px` }}
        >
          {/* Filter By Component - fixed width, directly adjacent to the sidebar */}
          <FilterBy isSidebarExpanded={isSidebarExpanded} />

          {/* Main Page Content */}
          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;