'use client';

import { useState } from 'react';
import { Users, Newspaper, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import NewsCarousel from '@/components/ui/news-carousel';
import LeadershipCarousel from '@/components/ui/leadership-carousel';

/**
 * Unified Section Component that can display either:
 * 1. Leadership Team Carousel (using static images from /public/images/leadership/)
 * 2. News/Blogs Carousel (using dynamic data from API)
 * 3. Both carousels with toggle functionality
 */
const UnifiedCarouselSection = ({ 
  showLeadership = true, 
  showNews = true, 
  defaultView = 'leadership' // 'leadership' or 'news'
}) => {
  const [activeView, setActiveView] = useState(defaultView);

  // If only one carousel type is enabled, show it directly
  if (showLeadership && !showNews) {
    return (
      <section id="leadership" className="section-padding bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="container-custom">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-secondary-900 mb-6">
              Our Leadership Team
            </h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
            <p className="text-xl text-secondary-700 max-w-3xl mx-auto mb-8">
              Meet the dedicated leaders who drive the KIIT MUN Society forward, 
              fostering diplomatic excellence and global awareness among students.
            </p>
          </div>

          {/* Leadership Carousel */}
          <div className="mb-12">
            <LeadershipCarousel
              autoPlay={true}
              autoPlayInterval={8000}
              showControls={true}
              showIndicators={true}
              className="mb-8"
            />
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Link href="/leadership" className="btn-ghost text-lg px-8 py-3">
              Meet Our Full Team
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (showNews && !showLeadership) {
    return (
      <section id="news" className="section-padding bg-secondary-50">
        <div className="container-custom">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-secondary-900 mb-6">
              Latest Updates & Reports
            </h2>
            <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
            <p className="text-xl text-secondary-700 max-w-3xl mx-auto mb-8">
              Stay updated with our latest MUN conference reports, insights, and achievements 
              from competitions around the globe.
            </p>
          </div>

          {/* News Carousel */}
          <div className="mb-12">
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
  }

  // Both carousels enabled - show toggle interface
  return (
    <section id="showcase" className="section-padding bg-gradient-to-br from-secondary-50 via-white to-primary-50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-secondary-900 mb-6">
            {activeView === 'leadership' ? 'Our Leadership Team' : 'Latest Updates & Reports'}
          </h2>
          <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
          <p className="text-xl text-secondary-700 max-w-3xl mx-auto mb-8">
            {activeView === 'leadership' 
              ? 'Meet the dedicated leaders who drive the KIIT MUN Society forward, fostering diplomatic excellence and global awareness among students.'
              : 'Stay updated with our latest MUN conference reports, insights, and achievements from competitions around the globe.'
            }
          </p>

          {/* Toggle Buttons */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <button
              onClick={() => setActiveView('leadership')}
              className={`btn-ghost flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeView === 'leadership'
                  ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-secondary-600 hover:bg-primary-50 shadow-md'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              Leadership Team
            </button>
            <button
              onClick={() => setActiveView('news')}
              className={`btn-ghost flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeView === 'news'
                  ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-secondary-600 hover:bg-primary-50 shadow-md'
              }`}
            >
              <Newspaper className="w-5 h-5 mr-2" />
              Latest News
            </button>
          </div>
        </div>

        {/* Dynamic Carousel Content */}
        <div className="mb-12">
          {activeView === 'leadership' ? (
            <div className="transition-all duration-500 ease-in-out">
              <LeadershipCarousel
                autoPlay={true}
                autoPlayInterval={8000}
                showControls={true}
                showIndicators={true}
                className="mb-8"
              />
            </div>
          ) : (
            <div className="transition-all duration-500 ease-in-out">
              <NewsCarousel
                maxSlides={6}
                autoPlay={true}
                autoPlayInterval={6000}
                showControls={true}
                showIndicators={true}
                className="mb-8"
              />
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          {activeView === 'leadership' && (
            <Link href="/leadership" className="btn-ghost text-lg px-8 py-3 inline-flex items-center">
              Meet Our Full Team
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">6</div>
            <div className="text-secondary-600">Leadership Roles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
            <div className="text-secondary-600">Active Members</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">15+</div>
            <div className="text-secondary-600">Conferences</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">100+</div>
            <div className="text-secondary-600">Participants</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UnifiedCarouselSection;
