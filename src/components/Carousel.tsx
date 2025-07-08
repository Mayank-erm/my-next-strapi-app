// src/components/Carousel.tsx - PERFORMANCE OPTIMIZED VERSION
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Memoized banner content to prevent re-creation
  const banners = useMemo(() => [
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
  ], []);

  // Memoized slides to prevent unnecessary re-calculations
  const allSlides = useMemo(() => [
    ...banners.map(banner => ({ type: 'banner', data: banner })),
    ...latestProposals.slice(0, 2).map(proposal => ({ type: 'proposal', data: proposal }))
  ], [banners, latestProposals]);

  // Optimized auto-play with cleanup
  useEffect(() => {
    if (!isAutoPlaying || allSlides.length <= 1 || isTransitioning) return;
    
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex(prev => (prev + 1) % allSlides.length);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 4000); // Reduced from 5000ms for better UX

    return () => clearInterval(timer);
  }, [isAutoPlaying, allSlides.length, isTransitioning]);

  // Optimized navigation handlers with transition management
  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => (prev + 1) % allSlides.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [allSlides.length, isTransitioning]);

  const handlePrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => (prev - 1 + allSlides.length) % allSlides.length);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [allSlides.length, isTransitioning]);

  const handleDotClick = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentIndex, isTransitioning]);

  // Memoized mouse handlers to prevent re-creation
  const handleMouseEnter = useCallback(() => setIsAutoPlaying(false), []);
  const handleMouseLeave = useCallback(() => setIsAutoPlaying(true), []);

  if (allSlides.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-8 mb-8 h-64 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,122,95,0.1)_0%,transparent_70%)]"></div>
        <div className="text-center z-10 opacity-0 animate-erm-fade-in">
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
      className="relative w-full h-64 rounded-2xl mb-8 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Optimized background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 to-neutral-200"></div>
      
      {/* Slide Content with optimized transitions */}
      <div className={`relative h-full transition-opacity duration-300 ${isTransitioning ? 'opacity-90' : 'opacity-100'}`}>
        {currentSlide.type === 'proposal' ? (
          // Proposal Slide - Simplified animations
          <div className="relative h-full bg-gradient-to-br from-[#007A5F] via-[#00382C] to-emerald-800 flex items-center justify-center overflow-hidden">
            {/* Simplified background elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-8 left-8 w-20 h-20 bg-white rounded-full opacity-60"></div>
              <div className="absolute bottom-8 right-8 w-16 h-16 bg-white rounded-full opacity-40"></div>
            </div>
            
            <div className="relative z-10 text-center text-white px-8 max-w-2xl">
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Latest Document
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-3">
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
          // Banner Slide - Simplified animations
          <div className={`relative h-full bg-gradient-to-br ${currentSlide.data.gradient} flex items-center justify-center overflow-hidden`}>
            {/* Simplified pattern overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.1)_0%,transparent_50%)] opacity-30"></div>
            
            {/* Simplified floating elements */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full"></div>
              <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full"></div>
              <div className="absolute bottom-1/4 left-3/4 w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            
            <div className="relative z-10 text-center text-white px-8 max-w-2xl">
              <div className="mb-6">
                <span className="text-4xl block mb-4 filter drop-shadow-lg">{currentSlide.data.icon}</span>
              </div>
              <h2 className="text-3xl font-bold mb-4 leading-tight">
                {currentSlide.data.title}
              </h2>
              <p className="text-white/90 text-lg">
                {currentSlide.data.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Optimized Navigation Controls */}
      {allSlides.length > 1 && (
        <>
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 disabled:opacity-50 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 border border-white/20"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="h-5 w-5 text-white" />
          </button>
          
          <button
            onClick={handleNext}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 disabled:opacity-50 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 border border-white/20"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="h-5 w-5 text-white" />
          </button>

          {/* Optimized Pagination Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {allSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                disabled={isTransitioning}
                className={`transition-all duration-200 rounded-full disabled:opacity-50 ${
                  index === currentIndex 
                    ? 'w-6 h-2 bg-white shadow-lg' 
                    : 'w-2 h-2 bg-white/50 hover:bg-white/70 hover:scale-125'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Simplified Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
            <div 
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ 
                width: `${((currentIndex + 1) / allSlides.length) * 100}%`,
              }}
            />
          </div>
        </>
      )}

      {/* Simplified overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
};

export default Carousel;