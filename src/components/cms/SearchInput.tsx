// src/components/cms/SearchInput.tsx
import React from 'react';

interface SearchInputProps {
  label: string; // Added label prop
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ElementType; // Optional icon, though not used in its current generic usage
}

const SearchInput: React.FC<SearchInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  icon: Icon,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
        <input
          type="text"
          className={`block w-full py-2.5 pr-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-500
                   focus:outline-none focus:ring-1 focus:ring-strapi-green-light focus:border-strapi-green-light sm:text-sm
                   ${Icon ? 'pl-10' : 'pl-3'}`} // Adjust padding if icon is present
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
      </div>
    </div>
  );
};

export default SearchInput;