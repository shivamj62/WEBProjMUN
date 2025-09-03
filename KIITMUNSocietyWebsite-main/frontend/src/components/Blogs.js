'use client';

import { useState } from 'react';
import NewsCarousel from '@/components/ui/news-carousel';
import Link from 'next/link';

const Blogs = () => {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <section id="blogs" className="section-padding bg-gray-900">
        <div className="container-custom">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blogs" className="relative section-padding overflow-hidden">
      <div className="relative z-10 container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Latest Updates & Reports
          </h2>
          <div className="w-24 h-1 bg-primary-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Stay updated with our latest MUN conference reports, insights, and achievements 
            from competitions around the globe.
          </p>
        </div>

        {/* Debug Message */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">Loading news carousel...</p>        </div>

        {/* News Carousel */}
        <div className="mb-12 min-h-[400px]">
          <NewsCarousel
            maxSlides={6}
            autoPlay={true}
            autoPlayInterval={6000}
            showControls={true}
            showIndicators={true}
            className="mb-8"
          />
        </div>
      </div>
    </section>
  );
};

export default Blogs;
