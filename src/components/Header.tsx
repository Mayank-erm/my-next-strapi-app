// src/components/Header.tsx (Updated: Dividers, Bookmark and Need Help moved)
import React, { useState, useCallback } from 'react';
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline'; // Removed BookmarkIcon, QuestionMarkCircleIcon
import { MeiliSearch } from 'meilisearch';
import UserDropdown from './UserDropdown';

const MEILISEARCH_HOST = 'http://localhost:7700';
const MEILISEARCH_API_KEY = 'masterKey';

const searchClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const performSearch = async (query: string) => {
    if (query.length > 2) {
      try {
        const results = await searchClient.index('proposals').search(query, {
          limit: 10,
        });
        setSearchResults(results.hits);
        console.log("MeiliSearch Results:", results.hits);
      } catch (error) {
        console.error("MeiliSearch error during search:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const debouncedSearch = useCallback(debounce(performSearch, 300), []);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-white shadow-sm border-b border-strapi-light-gray
                 focus:outline-none focus:ring-0 focus:border-transparent"
      tabIndex={-1}
    >
      {/* Left section: Logo and Title in the header */}
      <div className="flex items-center">
        <div className="w-8 h-8 mr-2 overflow-hidden flex items-center justify-center">
          <img src="/images/ERM_Vertical_Green_Black_RGB.svg" alt="ERM Logo" className="w-full h-full object-contain" />
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
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-500
                       focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={handleSearchInputChange}
          />
          {searchResults.length > 0 && searchTerm.length > 2 && (
            <div className="absolute bg-white border border-gray-200 mt-1 w-full rounded-md shadow-lg max-h-60 overflow-y-auto z-40">
              {searchResults.map((hit: any) => (
                <div key={hit.id} className="p-2 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer text-sm text-gray-800">
                  {hit.proposalName} {hit.clientName ? `- ${hit.clientName}` : ''} ({hit.opportunityNumber})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right section: Icons and user info with dividers */}
      {/* Applied divide-x to create vertical dividers */}
      <div className="flex items-center divide-x divide-gray-200">
        {/* Bell Icon */}
        <div className="pr-4"> {/* Padding before divider */}
          <BellIcon className="h-6 w-6 text-text-medium-gray cursor-pointer
                              focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2"
                     tabIndex={0}
          />
        </div>

        {/* User Profile Dropdown */}
        <div className="pl-4"> {/* Padding after divider */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;