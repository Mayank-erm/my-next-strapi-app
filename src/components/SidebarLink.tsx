// src/components/SidebarLink.tsx (Updated for visual polish)
import React from 'react';

interface SidebarLinkProps {
  icon: React.ElementType; // Icon component from Heroicons
  text: string;
  active?: boolean;
  isSidebarExpanded: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon: Icon, text, active, isSidebarExpanded }) => {
  return (
    <a
      href="#" // Replace with Next.js Link component if routing
      className={`flex items-center py-2.5 rounded-lg transition-colors duration-200
        ${active ? 'bg-strapi-green-light text-white shadow-md' : 'text-gray-200 hover:bg-strapi-green-light/70 hover:text-white'}
        ${!isSidebarExpanded ? 'justify-center px-2' : 'px-4'} // Adjust padding based on expanded state
        focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2 // Focus styles
      `}
      title={!isSidebarExpanded ? text : ''} // Add title for tooltip on collapsed icons
    >
      {Icon ? <Icon className="h-6 w-6" /> : <div className="h-6 w-6 bg-red-500">?</div>}
      {isSidebarExpanded && ( // Conditionally render text based on sidebar state
        <span className="font-medium text-lg ml-4 whitespace-nowrap">{text}</span>
      )}
    </a>
  );
};

export default SidebarLink;