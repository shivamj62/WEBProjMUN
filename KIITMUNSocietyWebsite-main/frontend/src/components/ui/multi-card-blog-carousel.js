'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { apiCall, API_ENDPOINTS } from '@/lib/api';
import BlogDetailModal from '@/components/ui/blog-detail-modal';

const MultiCardBlogCarousel = ({ 
  showIndicators = true,
  autoPlay = true,
  autoPlayInterval = 6000,
  maxBlogs = 20 // Request more blogs from API
}) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use pagination to get more blogs
      const response = await apiCall(`${API_ENDPOINTS.BLOGS.LIST}?page=1&limit=${maxBlogs}`);
      
      if (response.success && response.data && response.data.blogs) {
        const transformedBlogs = response.data.blogs.map(blog => {
          let blogImage = null;
          if (blog.image1_url) {
            // If it's already a Cloudinary URL, use it directly
            blogImage = blog.image1_url.startsWith('http') ? blog.image1_url : `${process.env.NEXT_PUBLIC_API_URL}${blog.image1_url}`;
          } else if (blog.image_path) {
            blogImage = `${process.env.NEXT_PUBLIC_API_URL}${blog.image_path}`;
          } else {
            blogImage = '/images/about-mun.png';
          }
          
          return {
            id: blog.id,
            title: blog.title,
            content: blog.content,
            competition_date: blog.competition_date,
            image_url: blogImage,
            created_at: blog.created_at,
            author: blog.author || 'Admin'
          };
        });
        
        setBlogs(transformedBlogs);
      } else {
        setError('Failed to fetch blogs');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Error loading blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && blogs.length > 0) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, blogs.length, currentIndex]);

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const startAutoPlay = () => {
    if (autoPlay && blogs.length > 0) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, autoPlayInterval);
    }
  };

  const nextSlide = () => {
    if (blogs.length === 0 || isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % blogs.length;
      setTimeout(() => setIsTransitioning(false), 300);
      return newIndex;
    });
  };

  const prevSlide = () => {
    if (blogs.length === 0 || isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? blogs.length - 1 : prevIndex - 1;
      setTimeout(() => setIsTransitioning(false), 300);
      return newIndex;
    });
  };

  const goToSlide = (index) => {
    if (isTransitioning) return;
    setCurrentIndex(index);
  };

  // Touch handling
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    stopAutoPlay();
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const touchDiff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(touchDiff) > minSwipeDistance) {
      if (touchDiff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    
    startAutoPlay();
  };

  const handleBlogClick = (blog) => {
    setSelectedBlog(blog);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Calculate visible cards (main, side1, side2)
  const getVisibleCards = () => {
    if (blogs.length === 0) return [];
    
    const mainCard = blogs[currentIndex];
    const side1Card = blogs[(currentIndex + 1) % blogs.length];
    const side2Card = blogs[(currentIndex + 2) % blogs.length];
    
    return [
      { blog: mainCard, position: 'main', index: currentIndex },
      { blog: side1Card, position: 'side1', index: (currentIndex + 1) % blogs.length },
      { blog: side2Card, position: 'side2', index: (currentIndex + 2) % blogs.length }
    ];
  };

  const visibleCards = getVisibleCards();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading blogs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchBlogs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No blogs available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 py-8">
      {/* Navigation Buttons */}
      <button
        onClick={() => { stopAutoPlay(); prevSlide(); startAutoPlay(); }}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200 hover:scale-110"
        disabled={isTransitioning}
      >
        <ChevronLeft className="w-6 h-6 text-gray-700" />
      </button>
      
      <button
        onClick={() => { stopAutoPlay(); nextSlide(); startAutoPlay(); }}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200 hover:scale-110"
        disabled={isTransitioning}
      >
        <ChevronRight className="w-6 h-6 text-gray-700" />
      </button>

      {/* Carousel Container */}
      <div 
        className="relative h-96 overflow-hidden rounded-xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={stopAutoPlay}
        onMouseLeave={startAutoPlay}
      >
        <div className="flex h-full transition-all duration-300 ease-in-out">
          {visibleCards.map(({ blog, position, index }) => (
            <div
              key={`${blog.id}-${position}`}
              className={`
                relative overflow-hidden cursor-pointer transition-all duration-300
                ${position === 'main' 
                  ? 'w-[60%] h-full' 
                  : position === 'side1' 
                    ? 'w-[25%] h-full ml-2' 
                    : 'w-[15%] h-full ml-2'
                }
                ${position === 'main' ? 'z-10' : position === 'side1' ? 'z-5' : 'z-0'}
                hover:scale-105
              `}
              onClick={() => handleBlogClick(blog)}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${blog.image_url})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                {/* Date Badge */}
                {blog.competition_date && (
                  <div className="flex items-center mb-2 text-sm opacity-90">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(blog.competition_date)}
                  </div>
                )}

                {/* Title */}
                <h3 className={`font-bold mb-2 leading-tight ${
                  position === 'main' 
                    ? 'text-2xl' 
                    : position === 'side1' 
                      ? 'text-lg' 
                      : 'text-base'
                }`}>
                  {position === 'main' 
                    ? truncateText(blog.title, 80)
                    : position === 'side1'
                      ? truncateText(blog.title, 50)
                      : truncateText(blog.title, 30)
                  }
                </h3>

                {/* Content Preview (only for main card) */}
                {position === 'main' && blog.content && (
                  <p className="text-sm opacity-90 mb-3 leading-relaxed">
                    {truncateText(blog.content.replace(/<[^>]*>/g, ''), 120)}
                  </p>
                )}

                {/* Read More Button (only for main card) */}
                {position === 'main' && (
                  <button className="flex items-center text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors w-fit">
                    <span>Read More</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </button>
                )}

                {/* Author (for side cards) */}
                {position !== 'main' && (
                  <p className="text-xs opacity-75 mt-1">
                    By {blog.author}
                  </p>
                )}
              </div>

              {/* Position Indicator */}
              {position !== 'main' && (
                <div className="absolute top-4 right-4">
                  <div className="w-2 h-2 bg-white/60 rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      {showIndicators && blogs.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {blogs.map((_, index) => (
            <button
              key={index}
              onClick={() => { stopAutoPlay(); goToSlide(index); startAutoPlay(); }}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-blue-600 scale-110'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Blog Detail Modal */}
      {showModal && selectedBlog && (
        <BlogDetailModal
          blog={selectedBlog}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedBlog(null);
          }}
        />
      )}
    </div>
  );
};

export default MultiCardBlogCarousel;
