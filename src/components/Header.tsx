// src/components/Header.tsx
import React, { useState, useCallback } from 'react'; // Import useState and useCallback
import { MagnifyingGlassIcon, BookmarkIcon, QuestionMarkCircleIcon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { MeiliSearch } from 'meilisearch'; // Import MeiliSearch client library

// --- MeiliSearch Configuration ---
// Ensure these match your MeiliSearch instance details.
// For production, use environment variables (e.g., process.env.NEXT_PUBLIC_MEILISEARCH_HOST)
const MEILISEARCH_HOST = 'http://localhost:7700';
const MEILISEARCH_API_KEY = 'masterKey'; // IMPORTANT: Use your search API key, NOT the master key!

const searchClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

// Simple debouncing helper to limit API calls while typing
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]); // State to hold search results from MeiliSearch

  // Function to perform the actual MeiliSearch query
  const performSearch = async (query: string) => {
    if (query.length > 2) { // Only search if query is at least 3 characters long
      try {
        // Search in the 'proposals' index.
        // You can customize search parameters like attributesToRetrieve, limit, etc.
        const results = await searchClient.index('proposals').search(query, {
          // Example: retrieve only relevant fields to reduce payload size
          // attributesToRetrieve: ['id', 'proposalName', 'clientName', 'opportunityNumber'],
          limit: 10, // Limit number of results shown in autocomplete/dropdown
        });
        setSearchResults(results.hits);
        console.log("MeiliSearch Results:", results.hits); // For debugging: view results in console
      } catch (error) {
        console.error("MeiliSearch error during search:", error);
        setSearchResults([]); // Clear results on error
      }
    } else {
      setSearchResults([]); // Clear results if search term is too short
    }
  };

  // Debounced version of performSearch to prevent too many API calls
  const debouncedSearch = useCallback(debounce(performSearch, 300), []); // 300ms debounce delay

  // Handler for the search input field changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearch(query); // Trigger the debounced search
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-white shadow-sm border-b border-strapi-light-gray">
      {/* Left section: Logo and Title in the header */}
      <div className="flex items-center">
        {/* Logo SVG - Directly in the header */}
        <div className="w-8 h-8 mr-2 overflow-hidden flex items-center justify-center"> {/* Removed rounded-full */}
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
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm} // Controlled component for input field
            onChange={handleSearchInputChange} // Handle input changes to trigger search
          />
          {/* Optional: Display search results here, e.g., in an autocomplete dropdown */}
          {/* You would build a more sophisticated UI for this in a real application */}
          {searchResults.length > 0 && searchTerm.length > 2 && (
            <div className="absolute bg-white border border-gray-200 mt-1 w-full rounded-md shadow-lg max-h-60 overflow-y-auto z-40">
              {searchResults.map((hit: any) => (
                <div key={hit.id} className="p-2 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer text-sm text-gray-800">
                  {/* Display relevant fields from your MeiliSearch hit */}
                  {hit.proposalName} {hit.clientName ? `- ${hit.clientName}` : ''} ({hit.opportunityNumber})
                </div>
              ))}
            </div>
          )}
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