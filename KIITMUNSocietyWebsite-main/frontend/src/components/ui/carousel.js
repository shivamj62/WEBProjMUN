'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

const Carousel = ({ 
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

  // Auto-play functionality with hydration-safe timer
  useEffect(() => {
    if (!isPlaying || isHovered || slides.length <= 1 || typeof window === 'undefined') return;

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
      <div className={`w-full h-72 bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-500 text-lg">No slides available</p>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full h-72 md:h-80 lg:h-96 overflow-hidden rounded-xl group ${className}`}
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
            {/* Background Image */}
            <div className="absolute inset-0 z-10">
              <img
                src={slide.src || slide.image_url}
                alt={slide.title || `Slide ${index + 1}`}
                className="w-full h-full object-cover"
                loading={index <= 1 ? 'eager' : 'lazy'}
                onError={(e) => {
                  // Only use fallback if the API-provided image fails to load
                  if (e.target.src !== '/images/about-mun.png') {
                    console.log('Image failed to load, using fallback:', e.target.src);
                    e.target.src = '/images/about-mun.png';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-end p-6 md:p-8 lg:p-12 z-20">
              <div className="text-white max-w-2xl">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                  {slide.title}
                </h3>
                
                {/* Role/Subtitle for leadership carousel */}
                {slide.subtitle && (
                  <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-3">
                    {slide.subtitle}
                  </div>
                )}
                
                {slide.summary && (
                  <p className="text-gray-200 text-sm md:text-base lg:text-lg mb-4 leading-relaxed line-clamp-3">
                    {slide.summary}
                  </p>
                )}

                {slide.author && (
                  <div className="flex items-center text-sm text-gray-300 mb-4">
                    <span>By {slide.author}</span>
                    {slide.date && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{new Date(slide.date).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                )}

                {slide.button && (
                  <button className="btn-ghost px-6 py-2 rounded-lg font-medium transition-colors duration-200 transform hover:scale-105">
                    {slide.button}
                  </button>
                )}
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
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={goToNext}
            className="btn-ghost absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100 rounded-full p-2"
            aria-label="Next slide"
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
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
