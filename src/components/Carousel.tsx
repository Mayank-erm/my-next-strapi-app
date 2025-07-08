// src/components/Carousel.tsx - COMPLETE PROFESSIONALLY ENHANCED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';

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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Enhanced banner content with professional sustainability focus
  const banners = [
    {
      title: 'Environmental Impact Excellence',
      description: 'Leading sustainability assessments that drive meaningful change',
      gradient: 'from-emerald-500 via-[#007A5F] to-teal-600',
      icon: '🌍'
    },
    {
      title: 'Carbon Intelligence Solutions', 
      description: 'Advanced analytics for comprehensive footprint management',
      gradient: 'from-blue-600 via-[#007A5F] to-cyan-600',
      icon: '📊'
    },
    {
      title: 'Renewable Energy Insights',
      description: 'Strategic guidance for sustainable transformation',
      gradient: 'from-amber-500 via-[#007A5F] to-yellow-500',
      icon: '⚡'
    }
  ];

  const allSlides = [
    ...banners.map(banner => ({ type: 'banner', data: banner })),
    ...latestProposals.slice(0, 2).map(proposal => ({ type: 'proposal', data: proposal }))
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || allSlides.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % allSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, allSlides.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % allSlides.length);
  }, [allSlides.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + allSlides.length) % allSlides.length);
  }, [allSlides.length]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  if (allSlides.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-3xl p-8 mb-8 h-72 flex items-center justify-center overflow-hidden card-professional">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,122,95,0.1)_0%,transparent_70%)]"></div>
        <div className="text-center z-10 animate-professional-fade-in">
          <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <DocumentTextIcon className="h-8 w-8 text-[#007A5F]" />
          </div>
          <h3 className="text-xl font-bold text-neutral-700 mb-2">No Content Available</h3>
          <p className="text-neutral-500">Loading sustainability insights...</p>
        </div>
      </div>
    );
  }

  const currentSlide = allSlides[currentIndex];

  return (
    <div 
      className="relative w-full h-72 rounded-3xl mb-8 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Enhanced background with subtle patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200"></div>
      
      {/* Slide Content */}
      <div className="relative h-full">
        {currentSlide.type === 'proposal' ? (
          // Enhanced Proposal Slide
          <div className="relative h-full bg-gradient-to-br from-[#007A5F] via-[#00382C] to-emerald-800 flex items-center justify-center overflow-hidden">
            {/* Subtle animated background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-8 left-8 w-24 h-24 bg-white rounded-full animate-gentle-pulse"></div>
              <div className="absolute bottom-8 right-8 w-16 h-16 bg-white rounded-full animate-gentle-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 right-16 w-12 h-12 bg-white rounded-full animate-gentle-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            
            {/* Professional glass overlay */}
            <div className="absolute inset-0 glass-professional opacity-20"></div>
            
            <div className="relative z-10 text-center text-white px-8 max-w-2xl animate-professional-fade-in">
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/30">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Latest Document
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-3">
                {currentSlide.data.unique_id || 'Sustainability Document'}
              </h2>
              <p className="text-white/90 text-lg mb-2">
                {currentSlide.data.Document_Type || 'Environmental Assessment'}
              </p>
              <p className="text-white/70">
                Client: {currentSlide.data.Client_Name || 'ERM Client'}
              </p>
            </div>
          </div>
        ) : (
          // Enhanced Banner Slide
          <div className={`relative h-full bg-gradient-to-br ${currentSlide.data.gradient} flex items-center justify-center overflow-hidden`}>
            {/* Professional pattern overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.1)_0%,transparent_50%)] opacity-40"></div>
            
            {/* Subtle floating elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-gentle-pulse"></div>
              <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full animate-gentle-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-1/4 left-3/4 w-1.5 h-1.5 bg-white rounded-full animate-gentle-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            
            {/* Professional content container */}
            <div className="relative z-10 text-center text-white px-8 max-w-2xl">
              <div className="mb-6 animate-smooth-scale">
                <span className="text-5xl block mb-4 filter drop-shadow-lg">{currentSlide.data.icon}</span>
              </div>
              <h2 className="text-4xl font-bold mb-4 animate-professional-fade-in leading-tight">
                {currentSlide.data.title}
              </h2>
              <p className="text-white/90 text-xl animate-professional-fade-in" style={{ animationDelay: '0.2s' }}>
                {currentSlide.data.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Navigation Controls */}
      {allSlides.length > 1 && (
        <>
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 glass-professional hover:bg-white/20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 group/btn border border-white/20"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="h-6 w-6 text-white group-hover/btn:scale-110 transition-transform" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 glass-professional hover:bg-white/20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 group/btn border border-white/20"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="h-6 w-6 text-white group-hover/btn:scale-110 transition-transform" />
          </button>

          {/* Enhanced Pagination Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
            {allSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex 
                    ? 'w-8 h-3 bg-white shadow-lg' 
                    : 'w-3 h-3 bg-white/50 hover:bg-white/70 hover:scale-125'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Professional Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
            <div 
              className="h-full bg-white transition-all duration-500 ease-out"
              style={{ 
                width: `${((currentIndex + 1) / allSlides.length) * 100}%`,
              }}
            />
          </div>
        </>
      )}

      {/* Professional overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
};

export default Carousel;