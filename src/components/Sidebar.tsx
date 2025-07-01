// src/components/Sidebar.tsx (Updated with new CMS Page Link)
import React from 'react';
import { HomeIcon, FolderIcon, ClipboardDocumentListIcon, DocumentTextIcon, UsersIcon, Cog6ToothIcon, ChartBarIcon, BookmarkIcon } from '@heroicons/react/24/outline'; // Imported BookmarkIcon
import SidebarLink from './SidebarLink';
import { useRouter } from 'next/router'; // To get current path for active link

interface SidebarProps {
  isExpanded: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onMouseEnter, onMouseLeave }) => {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <aside
      className={`flex flex-col bg-strapi-green-dark text-white shadow-xl transition-all duration-200 ease-in-out
        ${isExpanded ? 'w-64 px-4' : 'w-20 items-center px-2'} overflow-y-auto sidebar-scroll
        h-[calc(100vh-64px)] fixed top-16 z-20
        ${isExpanded ? 'left-0' : '-left-full md:left-0'} md:block
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="py-4"></div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 mb-6">
        <SidebarLink
          icon={HomeIcon}
          text="Home"
          href="/"
          active={currentPath === '/'}
          isSidebarExpanded={isExpanded}
        />
        <SidebarLink
          icon={DocumentTextIcon} // Using DocumentTextIcon for All Content / CMS Page
          text="All Content"
          href="/content-management"
          active={currentPath === '/content-management'}
          isSidebarExpanded={isExpanded}
        />
        <SidebarLink
          icon={BookmarkIcon}
          text="Bookmarked"
          href="/bookmarks"
          active={currentPath === '/bookmarks'}
          isSidebarExpanded={isExpanded}
        />
        <SidebarLink
          icon={FolderIcon}
          text="Content Types"
          href="/content-types"
          active={currentPath === '/content-types'}
          isSidebarExpanded={isExpanded}
        />
        <SidebarLink
          icon={ClipboardDocumentListIcon}
          text="Collection Types"
          href="/collection-types"
          active={currentPath === '/collection-types'}
          isSidebarExpanded={isExpanded}
        />
        {/* You can replace the below with actual single types or manage dynamically */}
        <SidebarLink
          icon={DocumentTextIcon}
          text="Single Types"
          href="/single-types"
          active={currentPath === '/single-types'}
          isSidebarExpanded={isExpanded}
        />
        <SidebarLink
          icon={UsersIcon}
          text="Users"
          href="/users"
          active={currentPath === '/users'}
          isSidebarExpanded={isExpanded}
        />
        <SidebarLink
          icon={ChartBarIcon}
          text="Media Library"
          href="/media-library"
          active={currentPath === '/media-library'}
          isSidebarExpanded={isExpanded}
        />
        <SidebarLink
          icon={Cog6ToothIcon} // Changed to Cog6ToothIcon for consistency
          text="Settings"
          href="/settings"
          active={currentPath === '/settings'}
          isSidebarExpanded={isExpanded}
        />
      </nav>
    </aside>
  );
};

export default Sidebar;