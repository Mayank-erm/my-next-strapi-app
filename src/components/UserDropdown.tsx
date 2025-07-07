// src/components/UserDropdown.tsx - MODERN VERSION
import React, { useState, useRef, useEffect } from 'react';
import { 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ArrowLeftOnRectangleIcon, 
  ChevronDownIcon,
  BellIcon,
  UserIcon,
  QuestionMarkCircleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

interface UserDropdownProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notificationCount?: number;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ 
  userName = "Mayank Kumar",
  userEmail = "mayank@erm.com",
  userAvatar,
  notificationCount = 3
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const menuItems = [
    {
      icon: UserIcon,
      label: 'My Profile',
      action: () => console.log('Profile clicked'),
      shortcut: '⌘P'
    },
    {
      icon: Cog6ToothIcon,
      label: 'Settings',
      action: () => console.log('Settings clicked'),
      shortcut: '⌘,'
    },
    {
      icon: QuestionMarkCircleIcon,
      label: 'Help & Support',
      action: () => console.log('Help clicked'),
      shortcut: '⌘?'
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Profile Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-3 px-3 py-2 rounded-xl text-text-dark-gray hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2 group"
      >
        {/* Notification Bell */}
        <div className="relative">
          <BellIcon className="h-6 w-6 text-gray-500 group-hover:text-strapi-green-light transition-colors" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div className="relative">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt={userName}
              className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 group-hover:border-strapi-green-light transition-colors"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-strapi-green-light to-strapi-green-dark flex items-center justify-center text-white text-sm font-semibold border-2 border-gray-200 group-hover:border-strapi-green-light transition-colors">
              {getInitials(userName)}
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
        </div>

        {/* User Info - Hidden on Mobile */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-900 group-hover:text-strapi-green-dark transition-colors">
            {userName}
          </p>
          <p className="text-xs text-gray-500 truncate max-w-32">
            {userEmail}
          </p>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDownIcon 
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-in">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-strapi-green-light to-strapi-green-dark flex items-center justify-center text-white text-lg font-semibold">
                  {getInitials(userName)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userEmail}
                </p>
                <div className="flex items-center mt-1">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-xs text-green-600 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-strapi-green-dark transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5 text-gray-500 group-hover:text-strapi-green-light transition-colors" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <span className="text-xs text-gray-400 font-mono">{item.shortcut}</span>
              </button>
            ))}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => {
                toggleDarkMode();
                setIsOpen(false);
              }}
              className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-strapi-green-dark transition-colors group"
            >
              <div className="flex items-center space-x-3">
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5 text-gray-500 group-hover:text-strapi-green-light transition-colors" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-500 group-hover:text-strapi-green-light transition-colors" />
                )}
                <span className="font-medium">
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors ${isDarkMode ? 'bg-strapi-green-light' : 'bg-gray-300'} relative`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform absolute top-0.5 ${isDarkMode ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={() => {
                alert('Logged out');
                setIsOpen(false);
              }}
              className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3 group-hover:text-red-700" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;