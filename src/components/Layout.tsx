// src/components/Layout.tsx (Updated: Integrates Footer)
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import FilterBy from './FilterBy';
import Footer from './Footer'; // Import the new Footer component
import { Bars3Icon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const HEADER_HEIGHT_PX = 64;
  const SIDEBAR_COLLAPSED_WIDTH_PX = 80;
  const SIDEBAR_EXPANDED_WIDTH_PX = 256;
  const FILTER_BY_WIDTH_PX = 256;

  const totalLeftOffset = isSidebarOpen
    ? SIDEBAR_EXPANDED_WIDTH_PX + FILTER_BY_WIDTH_PX
    : SIDEBAR_COLLAPSED_WIDTH_PX + FILTER_BY_WIDTH_PX;

  return (
    <div className="flex flex-col min-h-screen bg-strapi-gray-bg font-inter">
      {/* Header (sticky at the top) */}
      <Header />

      {/* Hamburger icon for mobile/tablet */}
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
          // On mobile, sidebar is closed when clicking overlay. On desktop, hover state will manage it.
          onMouseEnter={() => window.innerWidth >= 768 && setIsSidebarOpen(true)} // Only expand on hover for desktop (md and up)
          onMouseLeave={() => window.innerWidth >= 768 && setIsSidebarOpen(false)} // Only collapse on hover for desktop
        />

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Content wrapper for FilterBy and Main Content */}
        <div
          className="flex flex-1 transition-all duration-300 ease-in-out"
          style={{ paddingLeft: `${totalLeftOffset}px` }}
        >
          {/* Filter By Component - fixed width, directly adjacent to the sidebar */}
          <FilterBy isSidebarExpanded={isSidebarOpen} />

          {/* Main Page Content */}
          <main className="flex-1 p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;