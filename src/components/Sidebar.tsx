// src/components/Sidebar.tsx
import React from 'react';
import { HomeIcon, FolderIcon, ClipboardDocumentListIcon, DocumentTextIcon, UsersIcon, CogIcon, ChartBarIcon, ArrowLeftOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import SidebarLink from './SidebarLink';

interface SidebarProps {
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onMouseEnter, onMouseLeave }) => {
  return (
    <aside
      className={`flex flex-col bg-strapi-green-dark text-white shadow-xl transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-64 px-4' : 'w-20 items-center px-2'} overflow-y-auto sidebar-scroll
        h-[calc(100vh-64px)] fixed top-16 left-0 z-20 md:block hidden {/* Fixed position below header, adjusted height */}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* No top section/logo/title in sidebar as it's now in header. Remove the div completely */}
      <div className="py-4"></div> {/* This effectively acts as the padding/space above the home button */}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 mb-6">
        {/* Home button is preselected by default */}
        <SidebarLink icon={HomeIcon} text="Home" active isSidebarExpanded={isExpanded} />
        <SidebarLink icon={FolderIcon} text="Content Types" isSidebarExpanded={isExpanded} />
        <SidebarLink icon={ClipboardDocumentListIcon} text="Collection Types" isSidebarExpanded={isExpanded} />
        <SidebarLink icon={DocumentTextIcon} text="Single Types" isSidebarExpanded={isExpanded} />
        <SidebarLink icon={UsersIcon} text="Users" isSidebarExpanded={isExpanded} />
        <SidebarLink icon={ChartBarIcon} text="Media Library" isSidebarExpanded={isExpanded} />
        <SidebarLink icon={CogIcon} text="Settings" isSidebarExpanded={isExpanded} />
      </nav>

      {/* Bottom User/Logout Section */}
      <div className="mt-auto pt-4 border-t border-strapi-green-light/50">
        <SidebarLink icon={UserCircleIcon} text="Profile" isSidebarExpanded={isExpanded} />
        <SidebarLink icon={ArrowLeftOnRectangleIcon} text="Logout" isSidebarExpanded={isExpanded} />
      </div>
    </aside>
  );
};

export default Sidebar;