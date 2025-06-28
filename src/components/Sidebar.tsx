// src/components/Sidebar.tsx (Updated: Added Bookmark Link)
import React from 'react';
import { HomeIcon, FolderIcon, ClipboardDocumentListIcon, DocumentTextIcon, UsersIcon, CogIcon, ChartBarIcon, BookmarkIcon } from '@heroicons/react/24/outline'; // Imported BookmarkIcon
import SidebarLink from './SidebarLink';

interface SidebarProps {
  isExpanded: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onMouseEnter, onMouseLeave }) => {
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
        <SidebarLink icon={HomeIcon} text="Home" active isSidebarExpanded={isExpanded} />
        {/* Added Bookmark link to sidebar */}
        <SidebarLink icon={BookmarkIcon} text="Bookmarked" isSidebarExpanded={isExpanded} />
        <SidebarLink icon={FolderIcon} text="Content Types" isSidebarExpanded={isExpanded} />
        <SidebarLink icon={ClipboardDocumentListIcon} text="Collection Types" isSidebarExpanded={isExpanded} />
        <SidebarLink icon={DocumentTextIcon} text="Single Types" isSidebarExpanded={isExpanded} />
        <SidebarLink icon={UsersIcon} text="Users" isSidebarExpanded={isExpanded} />
        <SidebarLink icon={ChartBarIcon} text="Media Library" isSidebarExpanded={isExpanded} />
        <SidebarLink icon={CogIcon} text="Settings" isSidebarExpanded={isExpanded} />
      </nav>

      {/* Removed Bottom User/Logout Section for cleaner sidebar */}
    </aside>
  );
};

export default Sidebar;