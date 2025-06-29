// src/components/SidebarLink.tsx (Refactored for visual polish and consistency)
import React from 'react';
import Link from 'next/link'; // Use Next.js Link for client-side navigation

interface SidebarLinkProps {
  icon: React.ElementType; // Icon component from Heroicons
  text: string;
  href: string; // Add href for navigation
  active?: boolean;
  isSidebarExpanded: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon: Icon, text, href, active, isSidebarExpanded }) => {
  return (
    <Link
      href={href}
      className={`flex items-center py-2.5 rounded-lg transition-colors duration-200 group
        ${active ? 'bg-strapi-green-light text-white shadow-md' : 'text-gray-200 hover:bg-strapi-green-light/70 hover:text-white'}
        ${!isSidebarExpanded ? 'justify-center px-2' : 'px-4'}
        focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2
      `}
      title={!isSidebarExpanded ? text : ''}
    >
      <div className={`
        flex-shrink-0
        ${active ? 'text-white' : 'text-gray-300 group-hover:text-white'}
        transition-colors duration-200
      `}>
        {Icon ? <Icon className="h-6 w-6" /> : <div className="h-6 w-6 bg-red-500">?</div>}
      </div>
      {isSidebarExpanded && (
        <span className="font-medium text-lg ml-4 whitespace-nowrap">{text}</span>
      )}
    </Link>
  );
};

export default SidebarLink;