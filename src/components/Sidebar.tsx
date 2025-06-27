import React from 'react';
// --- CHANGE: Updated LogoutIcon to ArrowLeftOnRectangleIcon ---
import { HomeIcon, FolderIcon, ClipboardDocumentListIcon, DocumentTextIcon, UsersIcon, CogIcon, ChartBarIcon, ArrowLeftOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

// Define SidebarLink component first, as it's used by Sidebar.
interface SidebarLinkProps {
  icon: React.ElementType; // Icon component from Heroicons
  text: string;
  active?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon: Icon, text, active }) => {
  // Add a console log to check the type of Icon *before* rendering
  // console.log(`Rendering SidebarLink for ${text}. Icon type: ${typeof Icon}`, Icon);
  // If typeof Icon is 'undefined', then the problem is with the import.

  return (
    <a
      href="#" // Replace with Next.js Link component if routing
      className={`flex items-center p-3 rounded-lg transition-colors duration-200
        ${active ? 'bg-strapi-green-light text-white shadow-md' : 'text-gray-200 hover:bg-strapi-green-light/70 hover:text-white'}
      `}
    >
      {/* Ensure Icon is a valid React component before rendering */}
      {Icon ? <Icon className="h-6 w-6 mr-4" /> : <div className="h-6 w-6 mr-4 bg-red-500">?</div>}
      <span className="font-medium text-lg">{text}</span>
    </a>
  );
};


// Sidebar component with navigation links.
// Mimics the screenshot's navigation items.
const Sidebar: React.FC = () => {
  // Add console logs here to check the imported icons' values
  // console.log('HomeIcon:', HomeIcon);
  // console.log('UserCircleIcon:', UserCircleIcon);
  // console.log('LogoutIcon:', ArrowLeftOnRectangleIcon); // Changed for console log


  return (
    <aside className="w-64 bg-strapi-green-dark text-white flex flex-col p-4 shadow-xl">
      {/* Top Logo/Brand placeholder */}
      <div className="flex items-center mb-6 px-2 py-4 border-b border-strapi-green-light/50">
        <div className="w-10 h-10 mr-3 rounded-full overflow-hidden bg-strapi-green-light flex items-center justify-center">
          {/* Smaller placeholder for the green circle logo */}
          <span className="text-white font-bold text-2xl">O</span>
        </div>
        <span className="text-xl font-bold">Commercial Content Hub</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 sidebar-scroll">
        <SidebarLink icon={HomeIcon} text="Home" active />
        <SidebarLink icon={FolderIcon} text="Content Types" />
        <SidebarLink icon={ClipboardDocumentListIcon} text="Collection Types" />
        <SidebarLink icon={DocumentTextIcon} text="Single Types" />
        <SidebarLink icon={UsersIcon} text="Users" />
        <SidebarLink icon={ChartBarIcon} text="Media Library" />
        <SidebarLink icon={CogIcon} text="Settings" />
        {/* Add more links as per your actual Strapi sidebar */}
      </nav>

      {/* Bottom User/Logout Section */}
      <div className="mt-auto pt-4 border-t border-strapi-green-light/50">
        <SidebarLink icon={UserCircleIcon} text="Profile" />
        <SidebarLink icon={ArrowLeftOnRectangleIcon} text="Logout" /> {/* --- CHANGE: Used ArrowLeftOnRectangleIcon --- */}
      </div>
    </aside>
  );
};

export default Sidebar;
