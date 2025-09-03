'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Static hero images with content
  const carouselImages = [
    {
      id: 1,
      title: "KIIT Model United Nations",
      subtitle: "Empowering Future Diplomats",
      description: "Join us in exploring global issues and developing diplomatic skills through engaging simulations.",
      imageUrl: "/images/hero/hero-1.jpg"
    },
    {
      id: 2,
      title: "Global Leadership Training", 
      subtitle: "Building Tomorrow's Leaders",
      description: "Develop critical thinking, negotiation skills, and international perspective through our comprehensive programs.",
      imageUrl: "/images/hero/hero-2.jpg"
    },
    {
      id: 3,
      title: "International Conferences",
      subtitle: "Connect with Global Community", 
      description: "Participate in prestigious conferences and competitions to showcase your diplomatic abilities.",
      imageUrl: "/images/hero/hero-3.jpg"
    },
    {
      id: 4,
      title: "Excellence in Diplomacy",
      subtitle: "Awards & Recognition",
      description: "Celebrating our achievements and the success of our members in national and international competitions.",
      imageUrl: "/images/hero/hero-4.jpg"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-advance slides with hydration-safe timer
  useEffect(() => {
    if (typeof window === 'undefined') return; // Prevent SSR hydration issues

    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  return (
    <section id="home" className="relative h-screen overflow-hidden">
      {/* Hero Background Image - Below ripple effect */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/herobgimg.png"
          alt="KIIT MUN Hero Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* Background Ripple Effect */}
      <BackgroundRippleEffect 
        cellSize={35}
      />
      
      {/* Transparent overlay to blend with global background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10 pointer-events-none">
        {/* Additional gradient overlay for enhanced visual appeal */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 via-transparent to-blue-900/5"></div>
      </div>
      
      {/* Carousel Images - Semi-transparent overlay on gradient */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {carouselImages.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-60' : 'opacity-0'
            }`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Hide failed images - gradient background will remain visible
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="relative z-30 h-full flex items-center pointer-events-none">
        <div className="container-custom">
          <div className="max-w-4xl text-white">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 animate-slide-up text-white leading-tight">
              {carouselImages[currentSlide]?.title || "KIIT Model United Nations Society"}
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-blue-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {carouselImages[currentSlide]?.subtitle || "Empowering Future Diplomats"}
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-slide-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
              {carouselImages[currentSlide]?.description || "Fostering diplomatic excellence, global awareness, and leadership through structured debate and international relations"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up pointer-events-auto" style={{ animationDelay: '0.4s' }}>
              <a href="#about" className="btn-ghost text-lg px-8 py-3">
                Learn More
              </a>
              <a href="#blogs" className="btn-ghost text-lg px-8 py-3 border-purple-400 text-purple-400 hover:bg-purple-600 hover:text-white">
                Read Our Blogs
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {carouselImages.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="btn-ghost absolute left-4 top-1/2 transform -translate-y-1/2 z-40 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="btn-ghost absolute right-4 top-1/2 transform -translate-y-1/2 z-40 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {carouselImages.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`btn-ghost w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Hero;
