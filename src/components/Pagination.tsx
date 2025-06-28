// src/components/Pagination.tsx (Modified)
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-strapi-green-light text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-strapi-green-dark transition-colors"
      >
        Previous
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentPage === page ? 'bg-strapi-green-dark text-white shadow-md' : 'bg-gray-100 text-text-dark-gray hover:bg-gray-200'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-strapi-green-light text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-strapi-green-dark transition-colors"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;