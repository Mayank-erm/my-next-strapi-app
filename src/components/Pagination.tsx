// src/components/Pagination.tsx (Modified for a more subtle and standard look)
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'; // Import icons

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Determine which page numbers to show around the current page for a cleaner look
  const getPageNumbers = () => {
    const pageNumbersToShow = [];
    const maxPagesToShow = 5; // Adjust as needed
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (startPage > 1) {
      pageNumbersToShow.push(1);
      if (startPage > 2) {
        pageNumbersToShow.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbersToShow.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbersToShow.push('...');
      }
      pageNumbersToShow.push(totalPages);
    }
    return pageNumbersToShow;
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center px-3 py-1.5 rounded-lg
                   border border-strapi-light-gray bg-white
                   text-text-dark-gray font-medium
                   hover:bg-strapi-green-light hover:text-white transition-colors duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-strapi-light-gray
                   focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2"
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-4 w-4 mr-1" />
        Previous
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((pageNumber, index) => (
        <React.Fragment key={index}>
          {pageNumber === '...' ? (
            <span className="px-3 py-1.5 text-text-medium-gray">...</span>
          ) : (
            <button
              onClick={() => onPageChange(Number(pageNumber))}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors
                ${
                  currentPage === pageNumber
                    ? 'bg-strapi-green-dark text-white shadow-md'
                    : 'bg-white text-text-dark-gray hover:bg-gray-100 border border-strapi-light-gray'
                }
                focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2
              `}
              aria-current={currentPage === pageNumber ? "page" : undefined}
              aria-label={`Page ${pageNumber}`}
            >
              {pageNumber}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center px-3 py-1.5 rounded-lg
                   border border-strapi-light-gray bg-white
                   text-text-dark-gray font-medium
                   hover:bg-strapi-green-light hover:text-white transition-colors duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-400 disabled:hover:border-strapi-light-gray
                   focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2"
        aria-label="Next page"
      >
        Next
        <ChevronRightIcon className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
};

export default Pagination;