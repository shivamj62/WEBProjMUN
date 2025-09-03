'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const PortraitCarousel = ({ 
  slides = [], 
  autoPlay = true, 
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  onSlideClick,
  className = ''
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || isHovered || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, isHovered, slides.length, autoPlayInterval]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSlideClick = useCallback((slide, index) => {
    if (onSlideClick) {
      onSlideClick(slide, index);
    }
  }, [onSlideClick]);

  if (!slides || slides.length === 0) {
    return (
      <div className={`w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-400 text-lg">No profiles available</p>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full h-[500px] md:h-[550px] lg:h-[600px] overflow-hidden rounded-xl group shadow-2xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides Container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className="w-full h-full flex-shrink-0 relative cursor-pointer leadership-card-bg"
            onClick={() => handleSlideClick(slide, index)}
          >
            {/* Background with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
              {/* Decorative Background Elements */}
              <div className="absolute top-10 right-10 w-24 h-24 bg-primary-600 rounded-full opacity-20"></div>
              <div className="absolute bottom-16 left-8 w-16 h-16 bg-gray-600 rounded-full opacity-30"></div>
              <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-primary-500 rounded-full opacity-15"></div>
              <div className="absolute bottom-1/3 right-1/4 w-12 h-12 bg-gray-500 rounded-full opacity-20"></div>
            </div>

            {/* Desktop Layout: Side by Side */}
            <div className="hidden md:flex h-full">
              {/* Content Area - Left Side */}
              <div className="flex-1 flex items-center p-8 lg:p-12">
                <div className="text-white max-w-lg">
                  <h3 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                    {slide.title}
                  </h3>
                  
                  {slide.subtitle && (
                    <div className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium inline-block mb-4">
                      {slide.subtitle}
                    </div>
                  )}
                  
                  {slide.author && (
                    <div className="text-gray-300 text-sm mb-4 font-medium">
                      {slide.author}
                    </div>
                  )}
                  
                  {slide.summary && (
                    <p className="text-gray-300 text-base lg:text-lg mb-6 leading-relaxed">
                      {slide.summary}
                    </p>
                  )}

                  {slide.button && (
                    <button className="btn-ghost px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
                      {slide.button}
                    </button>
                  )}
                </div>
              </div>

              {/* Portrait Image - Right Side */}
              <div className="flex-shrink-0 flex items-center justify-center p-8 lg:p-12">
                <div className="relative">
                  <img
                    src={slide.src || slide.image_url || '/api/placeholder/300/400'}
                    alt={slide.title || `Profile ${index + 1}`}
                    className="w-56 h-72 lg:w-64 lg:h-80 object-cover rounded-lg shadow-2xl border-4 border-gray-600 transform transition-transform duration-300 group-hover:scale-105"
                    loading={index <= 1 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.target.style.display = 'none';
                      const container = e.target.parentElement;
                      container.innerHTML = `
                        <div class="w-56 h-72 lg:w-64 lg:h-80 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg shadow-2xl border-4 border-white flex items-center justify-center">
                          <div class="text-center text-gray-500">
                            <div class="text-6xl mb-2">👤</div>
                            <div class="text-sm font-medium">${slide.title}</div>
                          </div>
                        </div>
                      `;
                    }}
                  />
                  
                  {/* Image Shadow Effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Mobile Layout: Stacked */}
            <div className="md:hidden flex flex-col h-full">
              {/* Portrait Image - Top */}
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="relative">
                  <img
                    src={slide.src || slide.image_url || '/api/placeholder/300/400'}
                    alt={slide.title || `Profile ${index + 1}`}
                    className="w-40 h-52 object-cover rounded-lg shadow-xl border-3 border-gray-600"
                    loading={index <= 1 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const container = e.target.parentElement;
                      container.innerHTML = `
                        <div class="w-40 h-52 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg shadow-xl border-3 border-gray-600 flex items-center justify-center">
                          <div class="text-center text-gray-400">
                            <div class="text-4xl mb-1">👤</div>
                            <div class="text-xs font-medium">${slide.title}</div>
                          </div>
                        </div>
                      `;
                    }}
                  />
                </div>
              </div>

              {/* Content Area - Bottom */}
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-white text-center max-w-sm">
                  <h3 className="text-2xl font-bold mb-2 leading-tight">
                    {slide.title}
                  </h3>
                  
                  {slide.subtitle && (
                    <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium inline-block mb-3">
                      {slide.subtitle}
                    </div>
                  )}
                  
                  {slide.author && (
                    <div className="text-gray-300 text-sm mb-3 font-medium">
                      {slide.author}
                    </div>
                  )}
                  
                  {slide.summary && (
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3">
                      {slide.summary}
                    </p>
                  )}

                  {slide.button && (
                    <button className="btn-ghost px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                      {slide.button}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {showControls && slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="btn-ghost absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100 rounded-full p-2"
            aria-label="Previous profile"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={goToNext}
            className="btn-ghost absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100 rounded-full p-2"
            aria-label="Next profile"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Play/Pause Button */}
      {autoPlay && slides.length > 1 && (
        <button
          onClick={togglePlayPause}
          className="btn-ghost absolute top-4 right-4 bg-white/20 hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100 rounded-full p-2"
          aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </button>
      )}

      {/* Slide Indicators */}
      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`btn-ghost w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to profile ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PortraitCarousel;
