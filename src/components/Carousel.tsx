// src/components/Carousel.tsx
import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'; // Navigation icons
import { DocumentTextIcon } from '@heroicons/react/24/solid'; // Icon for proposals
import { PhotoIcon } from '@heroicons/react/24/outline'; // Icon for banners
import { StrapiProposal } from '@/types/strapi'; // Import centralized StrapiProposal interface

interface CarouselProps {
  latestProposals: StrapiProposal[]; // Use the centralized StrapiProposal interface
}

const Carousel: React.FC<CarouselProps> = ({ latestProposals }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Define banner images (assuming they are in public/banners folder)
  // You should place your banner images in the `public/banners` directory
  const bannerImages = [
    '/banners/banner_1.png', // Example: public/banners/banner1.jpg
    '/banners/banner_2.png', // Example: public/banners/banner2.png
    // Add more banner paths as needed
  ];

  // Combine proposals and banners for carousel slides
  const allSlides = [
    ...latestProposals.map(p => ({ type: 'proposal', data: p })),
    ...bannerImages.map(b => ({ type: 'banner', data: b })),
  ];

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === allSlides.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? allSlides.length - 1 : prevIndex - 1
    );
  };

  const currentSlide = allSlides[currentIndex];

  if (allSlides.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 h-48 flex flex-col justify-center items-center text-gray-500 text-xl border border-gray-200 relative overflow-hidden">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Latest Updates</h3>
        <span className="text-lg">No recent updates or banners available.</span>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg shadow-xl mb-8 overflow-hidden h-64 flex items-center justify-center p-4 border border-gray-200">
      {/* Content Area for current slide */}
      <div className="w-full h-full flex items-center justify-center text-center transition-opacity duration-500 ease-in-out opacity-100">
        {currentSlide.type === 'proposal' ? (
          <div className="flex flex-col items-center max-w-lg">
            <DocumentTextIcon className="h-12 w-12 text-strapi-green-light mb-2" />
            <h4 className="text-2xl font-bold text-text-dark-gray mb-1">
              {currentSlide.data.unique_id || 'N/A Unique ID'}
            </h4>
            <p className="text-base text-text-medium-gray px-4">
              {currentSlide.data.Document_Type || 'N/A Client'} - {currentSlide.data.Document_Sub_Type || 'Untitled Proposal'}
            </p>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={currentSlide.data}
              alt="Promotional Banner"
              className="max-h-full max-w-full object-contain rounded-lg shadow-md"
            />
            <div className="absolute top-2 right-2 p-1 bg-white/70 rounded-md text-gray-600">
              <PhotoIcon className="h-5 w-5" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {allSlides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 p-2 rounded-full bg-gray-100/70 text-gray-600 shadow-md
                       hover:bg-gray-200 hover:text-gray-800 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2
                       flex items-center justify-center w-10 h-10 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 p-2 rounded-full bg-gray-100/70 text-gray-600 shadow-md
                       hover:bg-gray-200 hover:text-gray-800 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2
                       flex items-center justify-center w-10 h-10 z-10"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {allSlides.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
          {allSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 w-2.5 rounded-full transition-colors duration-300
                          ${idx === currentIndex ? 'bg-strapi-green-light scale-125' : 'bg-gray-300 hover:bg-gray-400'}
                          focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-1`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;