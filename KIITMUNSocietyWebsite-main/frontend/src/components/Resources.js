'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, Lock, Users, BookOpen, Video } from 'lucide-react';
import { authenticatedApiCall, downloadFile, API_ENDPOINTS, getAuthCredentials } from '@/lib/api';
import { ScrollAnimationWrapper } from '@/components/ui/scroll-animations';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated by checking for auth data in localStorage
    const authData = getAuthCredentials();
    setIsAuthenticated(!!authData);
    
    if (authData) {
      fetchResources();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchResources = async () => {
    try {
      const response = await authenticatedApiCall(API_ENDPOINTS.RESOURCES.LIST);
      
      if (response.success && response.data && response.data.resources) {
        setResources(response.data.resources.slice(0, 8)); // Show latest 8 resources
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="w-8 h-8 text-orange-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="w-8 h-8 text-purple-500" />;
      default:
        return <FileText className="w-8 h-8 text-secondary-500" />;
    }
  };

  const downloadResource = async (resourceId, filename) => {
    try {
      await downloadFile(API_ENDPOINTS.RESOURCES.DOWNLOAD(resourceId), filename);
    } catch (error) {
      console.error('Failed to download resource:', error);
    }
  };

  const resourceCategories = [
    {
      icon: <BookOpen className="w-8 h-8 text-primary-600" />,
      title: "Study Materials",
      description: "Comprehensive guides, research papers, and educational resources for MUN preparation."
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Conference Archives",
      description: "Past conference materials, resolutions, and documentation from previous MUN events."
    },
    {
      icon: <Video className="w-8 h-8 text-purple-600" />,
      title: "Training Resources",
      description: "Video tutorials, training modules, and skill development materials for participants."
    }
  ];

  return (
    <section id="resources" className="relative section-padding overflow-hidden">
      <div className="relative z-10 container-custom">
        {/* Section Header */}
        <ScrollAnimationWrapper className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Member Resources
          </h2>
          <div className="w-24 h-1 bg-primary-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Access exclusive resources, study materials, and conference archives 
            available to our society members.
          </p>
        </ScrollAnimationWrapper>

        <ScrollAnimationWrapper>
        {!isAuthenticated ? (
          /* Not Authenticated State */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-4">
                Members Only
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                These resources are exclusively available to KIIT MUN Society members. 
                Please log in to access study materials, conference archives, and training resources.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/auth/login?redirect=resources" className="btn-ghost">
                  Member Login
                </a>
                <a href="/#contact" className="btn-ghost">
                  Join Our Society
                </a>
              </div>
            </div>
          </div>
        ) : loading ? (
          /* Loading State */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-600 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-600 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Resources Content */
          <>
            {/* Resource Categories */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {resourceCategories.map((category, index) => (
                <div key={index} className="card text-center hover:shadow-lg transition-shadow duration-300">
                  <div className="mb-4 flex justify-center">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-white mb-3">
                    {category.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {category.description}
                  </p>
                </div>
              ))}
            </div>

            {resources.length === 0 ? (
              /* No Resources State */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-12 h-12 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white mb-4">
                    Resources Coming Soon
                  </h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    We're currently updating our resource library. New materials will be available soon!
                  </p>
                  <a href="#contact" className="btn-ghost">
                    Get Notified
                  </a>
                </div>
              </div>
            ) : (
              /* Resources Grid */
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {resources.map((resource) => (
                    <div 
                      key={resource.id} 
                      className="card group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {getFileIcon(resource.original_filename)}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                            {resource.title}
                          </h3>
                          <p className="text-sm text-gray-300 mb-3 line-clamp-2 leading-relaxed">
                            {resource.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                            <span>{formatFileSize(resource.file_size)}</span>
                            <span>{formatDate(resource.uploaded_at)}</span>
                          </div>
                          <button
                            onClick={() => downloadResource(resource.id, resource.original_filename)}
                            className="btn-ghost flex items-center text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors group/btn"
                          >
                            <Download className="w-4 h-4 mr-2 transition-transform group-hover/btn:translate-y-0.5" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All Resources */}
                <div className="text-center">
                  <a href="/resources-dashboard" className="btn-ghost text-lg px-8 py-3">
                    View All Resources
                  </a>
                </div>
              </>
            )}
          </>
        )}
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
};

export default Resources;
