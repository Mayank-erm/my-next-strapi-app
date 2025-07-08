// src/components/Carousel.tsx - MINIMAL VERSION FOR DEBUGGING
import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface StrapiProposal {
  id: number;
  unique_id: string;
  publishedAt: string;
  Document_Type?: string;
  Industry?: string;
  Client_Name?: string;
}

interface CarouselProps {
  latestProposals: StrapiProposal[];
}

const Carousel: React.FC<CarouselProps> = ({ latestProposals }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Simple banner content
  const banners = [
    {
      title: 'Environmental Impact Assessment',
      description: 'Comprehensive sustainability analysis',
      gradient: 'from-green-600 to-emerald-700'
    },
    {
      title: 'Carbon Footprint Management', 
      description: 'Track and reduce emissions',
      gradient: 'from-blue-600 to-teal-700'
    }
  ];

  const allSlides = [
    ...banners.map(banner => ({ type: 'banner', data: banner })),
    ...latestProposals.map(proposal => ({ type: 'proposal', data: proposal }))
  ];

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % allSlides.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + allSlides.length) % allSlides.length);
  };

  if (allSlides.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-8 mb-8 h-64 flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">No Content Available</h3>
        </div>
      </div>
    );
  }

  const currentSlide = allSlides[currentIndex];

  return (
    <div className="relative bg-white rounded-2xl shadow-lg border mb-8 overflow-hidden h-64">
      <div className="relative w-full h-full">
        {currentSlide.type === 'proposal' ? (
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 h-full flex items-center justify-center p-8">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-2">
                {currentSlide.data.unique_id || 'Document'}
              </h2>
              <p className="text-white/80">
                {currentSlide.data.Document_Type || 'Sustainability Document'}
              </p>
            </div>
          </div>
        ) : (
          <div className={`bg-gradient-to-r ${currentSlide.data.gradient} h-full flex items-center justify-center p-8`}>
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-2">{currentSlide.data.title}</h2>
              <p className="text-white/80">{currentSlide.data.description}</p>
            </div>
          </div>
        )}
      </div>

      {allSlides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-700" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {allSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Carousel;