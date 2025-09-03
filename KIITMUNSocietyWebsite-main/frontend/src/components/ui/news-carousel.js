'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { apiCall, API_ENDPOINTS } from '@/lib/api';
import Carousel from '@/components/ui/carousel';
import BlogDetailModal from '@/components/ui/blog-detail-modal';

const NewsCarousel = ({ 
  maxSlides = 6,
  autoPlay = true,
  autoPlayInterval = 6000,
  showControls = true,
  showIndicators = true,
  className = ''
}) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(API_ENDPOINTS.BLOGS.LIST);
      
      if (response.success && response.data && response.data.blogs) {
        // Transform blog data for carousel format
        const transformedBlogs = response.data.blogs
          .slice(0, maxSlides)
          .map(blog => {
            // Only use fallback if no image is provided by API
            let blogImage = null;
            if (blog.image1_url) {
              blogImage = `${process.env.NEXT_PUBLIC_API_URL}${blog.image1_url}`;
            } else if (blog.image_path) {
              blogImage = `${process.env.NEXT_PUBLIC_API_URL}${blog.image_path}`;
            } else {
              // Use fallback only when API provides no image
              blogImage = '/images/about-mun.png';
            }
            
            return {
              id: blog.id,
              title: blog.title,
              button: "Read More",
              src: blogImage,
              image_url: blogImage,
              summary: blog.content ? blog.content.substring(0, 200) + '...' : 'Read this exciting MUN report.',
              content: blog.content,
              author: blog.author || 'MUN Admin',
              date: blog.competition_date || blog.created_at,
              competition_date: blog.competition_date,
              created_at: blog.created_at,
              updated_at: blog.updated_at,
              image2_path: blog.image2_path,
              image3_path: blog.image3_path
            };
          });
        
        setBlogs(transformedBlogs);
      } else {
        setError('Failed to load blog posts');
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
      setError('Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [maxSlides]);

  const handleSlideClick = (blog) => {
    setSelectedBlog(blog);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBlog(null);
  };

  const handleRetry = () => {
    fetchBlogs();
  };

  // Loading State
  if (loading) {
    return (
      <div className={`w-full h-72 md:h-80 lg:h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg font-medium">Loading latest updates...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching the most recent MUN reports</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={`w-full h-72 md:h-80 lg:h-96 bg-gradient-to-br from-red-900 to-red-800 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Unable to Load Updates</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="btn-ghost inline-flex items-center px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (!blogs || blogs.length === 0) {
    return (
      <div className={`w-full h-72 md:h-80 lg:h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExternalLink className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            Coming Soon
          </h3>
          <p className="text-gray-300 mb-6 leading-relaxed">
            We're working on bringing you the latest updates and reports from our MUN activities. 
            Check back soon for exciting content!
          </p>
          <button
            onClick={handleRetry}
            className="btn-ghost inline-flex items-center px-6 py-3 text-white rounded-lg font-medium transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Carousel */}
      <Carousel
        slides={blogs}
        autoPlay={autoPlay}
        autoPlayInterval={autoPlayInterval}
        showControls={showControls}
        showIndicators={showIndicators}
        onSlideClick={handleSlideClick}
        className="shadow-2xl"
      />

      {/* Blog Detail Modal */}
      <BlogDetailModal
        blog={selectedBlog}
        isOpen={showModal}
        onClose={handleCloseModal}
      />

      {/* Quick Stats */}
      {blogs.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-secondary-600 text-sm">
            Showing {blogs.length} of the latest MUN reports
            {blogs.length < maxSlides && (
              <span className="text-primary-600 font-medium"> • More coming soon!</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsCarousel;
