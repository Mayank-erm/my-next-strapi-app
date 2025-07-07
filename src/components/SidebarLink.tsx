// src/components/SidebarLink.tsx - ENHANCED VERSION
import React from 'react';
import Link from 'next/link';

interface SidebarLinkProps {
  icon: React.ElementType;
  text: string;
  href: string;
  active?: boolean;
  isSidebarExpanded: boolean;
  badge?: string | number | null;
  notification?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  icon: Icon, 
  text, 
  href, 
  active, 
  isSidebarExpanded, 
  badge,
  notification = false 
}) => {
  return (
    <Link
      href={href}
      className={`flex items-center py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
        ${active 
          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30' 
          : 'text-white/80 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10'
        }
        ${!isSidebarExpanded ? 'justify-center px-3' : 'px-4'}
        focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent
      `}
      title={!isSidebarExpanded ? text : ''}
    >
      {/* Background gradient for active state */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50 rounded-xl"></div>
      )}
      
      {/* Icon container */}
      <div className={`
        flex-shrink-0 relative
        ${active ? 'text-white' : 'text-white/70 group-hover:text-white'}
        transition-colors duration-200
      `}>
        {Icon ? <Icon className="h-6 w-6" /> : <div className="h-6 w-6 bg-red-500">?</div>}
        
        {/* Notification dot */}
        {notification && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-strapi-green-dark animate-pulse"></div>
        )}
      </div>

      {/* Text and badge */}
      {isSidebarExpanded && (
        <div className="flex items-center justify-between flex-1 ml-4 min-w-0">
          <span className="font-medium text-base whitespace-nowrap truncate">{text}</span>
          
          {/* Badge */}
          {badge && (
            <span className={`
              ml-2 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0
              ${active 
                ? 'bg-white/30 text-white' 
                : 'bg-white/10 text-white/80 group-hover:bg-white/20 group-hover:text-white'
              }
              transition-colors duration-200
            `}>
              {typeof badge === 'number' && badge > 999 ? '999+' : badge}
            </span>
          )}
        </div>
      )}

      {/* Active indicator */}
      {active && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
      )}
      
      {/* Hover effect */}
      <div className={`
        absolute inset-0 rounded-xl transition-opacity duration-200
        ${active ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}
        bg-gradient-to-r from-white/5 to-white/10
      `}></div>
    </Link>
  );
};

export default SidebarLink;