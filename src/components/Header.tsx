import React from 'react';
// --- CHANGE: Updated SearchIcon to MagnifyingGlassIcon ---
import { MagnifyingGlassIcon, BookmarkIcon, QuestionMarkCircleIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';

// Header component with search bar and user/notification icons
const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm border-b border-strapi-light-gray">
      {/* Left section: Logo and Title */}
      <div className="flex items-center">
        <div className="w-8 h-8 mr-2 rounded-full overflow-hidden">
          {/* Placeholder for your logo. Replace with an actual SVG or image. */}
          <svg className="w-full h-full text-strapi-green-dark" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 retro-reflectors01.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-text-dark-gray">Commercial Content Hub</h1>
      </div>

      {/* Center section: Search bar */}
      <div className="flex-1 mx-8 max-w-lg">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" /> {/* --- CHANGE: Used MagnifyingGlassIcon --- */}
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
