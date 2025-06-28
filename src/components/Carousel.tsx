// src/components/Carousel.tsx (UPDATED: Modernized Arrows)
import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'; // Import solid icons for arrows

interface CarouselProps {
  latestProposals: {
    id: number;
    opportunityNumber: string;
    proposalName: string;
    clientName: string; // Added clientName for sub-header
  }[];
}

const Carousel: React.FC<CarouselProps> = ({ latestProposals }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === latestProposals.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? latestProposals.length - 1 : prevIndex + 1 // Changed to loop back to end
    );
  };

  const currentProposal = latestProposals[currentIndex];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8 h-48 flex flex-col justify-center items-center text-text-medium-gray text-xl border border-strapi-light-gray relative overflow-hidden">
      <h3 className="text-xl font-semibold mb-4 text-text-dark-gray">Latest Updates</h3>
      
      {latestProposals.length > 0 && currentProposal ? (
        <div className="flex flex-col items-center justify-center text-center">
          <h4 className="text-xl font-semibold text-text-dark-gray mb-1">
            {currentProposal.opportunityNumber} - {currentProposal.proposalName}
          </h4>
          <p className="text-sm text-text-medium-gray">{currentProposal.clientName}</p>
        </div>
      ) : (
        <span className="text-lg">No recent updates available.</span>
      )}

      {/* Modernized Navigation arrows */}
      {latestProposals.length > 1 && ( // Only show arrows if there's more than 1 proposal
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 p-2 rounded-full bg-gray-100/70 text-gray-600 shadow-md
                       hover:bg-gray-200 hover:text-gray-800 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2
                       flex items-center justify-center w-10 h-10" // Fixed size for roundness
            aria-label="Previous proposal"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 p-2 rounded-full bg-gray-100/70 text-gray-600 shadow-md
                       hover:bg-gray-200 hover:text-gray-800 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2
                       flex items-center justify-center w-10 h-10" // Fixed size for roundness
            aria-label="Next proposal"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  );
};

export default Carousel;
