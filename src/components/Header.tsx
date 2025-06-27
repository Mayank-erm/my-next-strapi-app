// src/components/Header.tsx
import React from 'react';
import { MagnifyingGlassIcon, BookmarkIcon, QuestionMarkCircleIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-white shadow-sm border-b border-strapi-light-gray">
      {/* Left section: Logo and Title in the header */}
      <div className="flex items-center">
  {/* Logo SVG - Directly in the header */}
  <div className="w-8 h-8 mr-2 overflow-hidden flex items-center justify-center">
    <img src="/images/ERM_Vertical_Green_Black_RGB.svg" alt="ERM Logo" className="w-full h-full object-contain" /> {/* Enhanced img tag */}
  </div>
  <h1 className="text-xl font-semibold text-text-dark-gray">Commercial Content Hub</h1>
</div>

      {/* Center section: Search bar */}
      <div className="flex-1 mx-8 max-w-lg">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder="Search by keywords, titles, client name"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Right section: Icons and user info */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-text-medium-gray text-sm">
          <BookmarkIcon className="h-5 w-5" />
          <span>Bookmarked</span>
        </div>
        <div className="flex items-center space-x-2 text-text-medium-gray text-sm">
          <QuestionMarkCircleIcon className="h-5 w-5" />
          <span>Need help?</span>
        </div>
        <BellIcon className="h-6 w-6 text-text-medium-gray cursor-pointer" />
        <UserCircleIcon className="h-8 w-8 text-strapi-green-light cursor-pointer" />
      </div>
    </header>
  );
};

export default Header;