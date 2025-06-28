// src/components/UserDropdown.tsx (New Component, now with name and arrow)
import React, { useState } from 'react';
import { UserCircleIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon, ChevronDownIcon } from '@heroicons/react/24/outline'; // Import ChevronDownIcon

interface UserDropdownProps {
  userName?: string; // Optional prop for user's name
}

const UserDropdown: React.FC<UserDropdownProps> = ({ userName = "Mayank"}) => { // Default name
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 text-text-dark-gray hover:text-strapi-green-light transition-colors focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2 rounded-full px-2 py-1"
      >
        {/* You can replace UserCircleIcon with an actual <img> for avatar if available */}
        <UserCircleIcon className="h-8 w-8 text-strapi-green-light" />
        <span className="font-semibold text-base hidden sm:inline">{userName}</span> {/* Show name on larger screens */}
        <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} /> {/* Dropdown arrow */}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <Cog6ToothIcon className="h-5 w-5 mr-2" /> Settings
          </a>
          <button onClick={() => alert('Logged out')} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;