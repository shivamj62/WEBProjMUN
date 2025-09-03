"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";

interface Card {
  title: string;
  src: string;
  role?: string;
  department?: string;
  description?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  [key: string]: any;
}

interface FocusCardsProps {
  cards: Card[];
  onCardClick?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
}

export const FocusCards: React.FC<FocusCardsProps> = ({
  cards,
  onCardClick,
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Cards per view based on screen size - hydration safe
  const getCardsPerView = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 3; // lg and above
      if (window.innerWidth >= 768) return 2; // md and above
      return 1; // mobile
    }
    return 1;
  };

  const [cardsPerView, setCardsPerView] = useState(1); // Start with 1 to match SSR

  // Set mounted state and initial cards per view
  useEffect(() => {
    setIsMounted(true);
    setCardsPerView(getCardsPerView());
  }, []);

  // Update cards per view on resize - only after mounting
  useEffect(() => {
    if (!isMounted) return;

    const handleResize = () => {
      setCardsPerView(getCardsPerView());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMounted]);

  const totalSlides = Math.ceil(cards.length / cardsPerView);

  // Auto-play functionality - only after mounting
  useEffect(() => {
    if (!isMounted || !isPlaying || isHovered || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, isHovered, totalSlides, autoPlayInterval, isMounted]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleCardClick = (cardIndex: number) => {
    onCardClick?.(cardIndex);
  };

  // Get visible cards for current slide
  const getVisibleCards = () => {
    const startIndex = currentIndex * cardsPerView;
    return cards.slice(startIndex, startIndex + cardsPerView);
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 text-lg">No coordinators available</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full max-w-7xl mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="grid gap-6"
            style={{
              gridTemplateColumns: `repeat(${cardsPerView}, 1fr)`
            }}
            suppressHydrationWarning
          >
            {getVisibleCards().map((card, idx) => {
              const actualIndex = currentIndex * cardsPerView + idx;
              return (
                <motion.div
                  key={`${card.title}-${currentIndex}-${idx}`}
                  className="relative group cursor-pointer"
                  onClick={() => handleCardClick(actualIndex)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gray-900 shadow-lg hover:shadow-2xl transition-all duration-300">
                    {/* Fixed aspect ratio container */}
                    <div className="relative aspect-[3/4] w-full">
                      <Image
                        src={card.src}
                        alt={card.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="text-white">
                          {card.role && (
                            <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium inline-block mb-2">
                              {card.role}
                            </div>
                          )}
                          <h3 className="text-xl font-bold mb-1 leading-tight">
                            {card.title}
                          </h3>
                          {card.department && (
                            <p className="text-primary-100 text-sm mb-2">
                              {card.department}
                            </p>
                          )}
                          {card.description && (
                            <p className="text-gray-200 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              {card.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Hover effect border */}
                      <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-primary-500 transition-all duration-300" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      {showControls && totalSlides > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 rounded-full p-3 text-white hover:text-gray-200 shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 rounded-full p-3 text-white hover:text-gray-200 shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Play/Pause Button */}
      {autoPlay && totalSlides > 1 && (
        <button
          onClick={togglePlayPause}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 opacity-0 group-hover:opacity-100 rounded-full p-2 text-white hover:text-gray-200 shadow-lg"
          aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>
      )}


    </div>
  );
};
