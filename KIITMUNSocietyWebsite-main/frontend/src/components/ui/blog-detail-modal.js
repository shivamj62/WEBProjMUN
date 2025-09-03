'use client';

import React, { useEffect } from 'react';
import { X, Calendar, User, ExternalLink } from 'lucide-react';

const BlogDetailModal = ({ 
  blog, 
  isOpen, 
  onClose,
  className = ''
}) => {
  // Close modal on escape key with hydration-safe event listeners
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen && typeof window !== 'undefined') {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !blog) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content) => {
    // Simple paragraph formatting - split by double newlines
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    return paragraphs.map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed text-gray-300">
        {paragraph.trim()}
      </p>
    ));
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-ghost absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/30 transition-all duration-200 text-white hover:text-gray-200 rounded-full p-2"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          
          {/* Header Image */}
          {blog.image_url && (
            <div className="relative h-64 md:h-80 lg:h-96">
              <img
                src={blog.image_url}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {blog.title}
                </h1>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8">
            
            {/* Title (if no image) */}
            {!blog.image_url && (
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {blog.title}
              </h1>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-700">
              {blog.author && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-medium">{blog.author}</span>
                </div>
              )}
              
              {blog.date && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(blog.date)}</span>
                </div>
              )}

              {blog.competition_date && blog.competition_date !== blog.date && (
                <div className="flex items-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  <span>Competition: {formatDate(blog.competition_date)}</span>
                </div>
              )}
            </div>

            {/* Summary (if different from content) */}
            {blog.summary && blog.summary !== blog.content && (
              <div className="bg-gray-800 border-l-4 border-primary-600 p-4 mb-8 rounded-r-lg">
                <p className="text-lg text-gray-200 font-medium leading-relaxed">
                  {blog.summary}
                </p>
              </div>
            )}

            {/* Main Content */}
            <div className="prose prose-lg max-w-none">
              {blog.content ? (
                formatContent(blog.content)
              ) : (
                <p className="text-gray-400">No detailed content available.</p>
              )}
            </div>

            {/* Additional Images */}
            <div className="mt-8 space-y-6">
              {blog.image2_path && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${blog.image2_path}`}
                    alt={`${blog.title} - Image 2`}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              
              {blog.image3_path && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${blog.image3_path}`}
                    alt={`${blog.title} - Image 3`}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-gray-400">
                  {blog.updated_at && (
                    <span>Last updated: {formatDate(blog.updated_at)}</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onClose}
                    className="btn-ghost px-6 py-2 text-gray-300 rounded-lg font-medium transition-colors duration-200"
                  >
                    Close
                  </button>
                  
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailModal;
