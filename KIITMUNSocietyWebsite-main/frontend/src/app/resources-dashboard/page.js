'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Download, FileText, BookOpen, Video, Search, Filter, Trash2, FolderOpen } from 'lucide-react';
import { authenticatedApiCall, downloadFile, API_ENDPOINTS } from '@/lib/api';

const ResourcesDashboardPage = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchTerm, fileTypeFilter, resources]);

  const fetchResources = async () => {
    try {
      const response = await authenticatedApiCall(API_ENDPOINTS.RESOURCES.LIST);
      if (response.success && response.data && response.data.resources) {
        setResources(response.data.resources);
      }
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.uploaded_by?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // File type filter
    if (fileTypeFilter !== 'all') {
      filtered = filtered.filter(resource => {
        const filename = resource.file_path || '';
        const extension = filename.split('.').pop()?.toLowerCase();
        switch (fileTypeFilter) {
          case 'documents':
            return ['pdf', 'doc', 'docx', 'txt'].includes(extension);
          case 'images':
            return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
          case 'videos':
            return ['mp4', 'avi', 'mov', 'wmv'].includes(extension);
          default:
            return true;
        }
      });
    }

    setFilteredResources(filtered);
  };

  const handleDownload = async (resource) => {
    try {
      await downloadFile(
        API_ENDPOINTS.RESOURCES.DOWNLOAD(resource.id),
        resource.title || 'download'
      );
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!user?.role || user.role !== 'admin') {
      alert('Only administrators can delete resources');
      return;
    }

    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await authenticatedApiCall(
        API_ENDPOINTS.RESOURCES.DELETE(resourceId),
        { method: 'DELETE' }
      );
      if (response.success) {
        await fetchResources(); // Refresh the list
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filePath) => {
    const extension = filePath?.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <Image className="w-8 h-8 text-green-600" />;
    }
    if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
      return <Video className="w-8 h-8 text-red-600" />;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
      return <FileText className="w-8 h-8 text-blue-600" />;
    }
    return <File className="w-8 h-8 text-secondary-600" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        <Header />
        
        <main className="pt-24 pb-16">
          <div className="container-custom">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
                Resources Dashboard
              </h1>
              <div className="w-24 h-1 bg-primary-500 mx-auto mb-6"></div>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Welcome back, <span className="font-semibold text-primary-400">{user?.full_name || user?.name}</span>! 
                Access and manage your exclusive MUN Society resources.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Search resources by title, description, or uploader..."
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-secondary-400" />
                <select
                  value={fileTypeFilter}
                  onChange={(e) => setFileTypeFilter(e.target.value)}
                  className="input-field min-w-[150px]"
                >
                  <option value="all">All Files</option>
                  <option value="documents">Documents</option>
                  <option value="images">Images</option>
                  <option value="videos">Videos</option>
                </select>
              </div>
            </div>

            {loading ? (
              /* Loading State */
              <div className="grid gap-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="card animate-pulse">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-secondary-300 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-secondary-300 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-secondary-300 rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredResources.length === 0 ? (
              /* No Resources State */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FolderOpen className="w-12 h-12 text-primary-600" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-secondary-900 mb-4">
                    {searchTerm || fileTypeFilter !== 'all' ? 'No resources found' : 'No resources available'}
                  </h3>
                  <p className="text-secondary-700 mb-6">
                    {searchTerm || fileTypeFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Resources will appear here when they are uploaded by administrators.'
                    }
                  </p>
                  {(searchTerm || fileTypeFilter !== 'all') && (
                    <div className="flex gap-4 justify-center">
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="btn-ghost"
                        >
                          Clear Search
                        </button>
                      )}
                      {fileTypeFilter !== 'all' && (
                        <button
                          onClick={() => setFileTypeFilter('all')}
                          className="btn-ghost"
                        >
                          Show All Files
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Resources List */
              <>
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-secondary-600">
                    {searchTerm || fileTypeFilter !== 'all'
                      ? `Found ${filteredResources.length} resource${filteredResources.length !== 1 ? 's' : ''}`
                      : `${filteredResources.length} resource${filteredResources.length !== 1 ? 's' : ''} available`
                    }
                  </p>
                  {user?.role === 'admin' && (
                    <span className="text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                      Admin Access
                    </span>
                  )}
                </div>

                <div className="grid gap-4">
                  {filteredResources.map((resource) => (
                    <div key={resource.id} className="card group hover:shadow-lg transition-shadow border-l-4 border-primary-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {getFileIcon(resource.file_path)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-secondary-900 truncate">
                              {resource.title}
                            </h4>
                            <p className="text-secondary-700 text-sm truncate">
                              {resource.description}
                            </p>
                            <div className="flex items-center text-xs text-secondary-500 space-x-4 mt-1">
                              <span>{formatFileSize(resource.file_size)}</span>
                              <span>Uploaded by {resource.uploaded_by}</span>
                              <span>{formatDate(resource.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => handleDownload(resource)}
                            className="btn-ghost flex items-center"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(resource.id)}
                              className="btn-ghost border-red-200 text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Dashboard Info Section */}
            <div className="mt-12 grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h3 className="text-xl font-serif font-bold text-white mb-4">
                  Resource Guidelines
                </h3>
                <div className="text-gray-300">
                  <h4 className="font-semibold mb-2">Allowed File Types:</h4>
                  <ul className="text-sm space-y-1 mb-4">
                    <li>• Documents: PDF, DOC, DOCX, TXT</li>
                    <li>• Images: JPG, PNG, GIF, WebP</li>
                    <li>• Videos: MP4, AVI, MOV</li>
                  </ul>
                  <h4 className="font-semibold mb-2">Important Notes:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Maximum file size: 50MB</li>
                    <li>• Resources are available to all members</li>
                    <li>• Only administrators can upload resources</li>
                    <li>• Only administrators can delete resources</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-xl font-serif font-bold text-green-900 mb-4">
                  Your Account
                </h3>
                <div className="text-green-800">
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold">Name:</span> {user?.full_name || user?.name}
                    </div>
                    <div>
                      <span className="font-semibold">Email:</span> {user?.email}
                    </div>
                    <div>
                      <span className="font-semibold">Role:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        user?.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user?.role === 'admin' ? 'Administrator' : 'Member'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Access Level:</span> Full Resources Access
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default ResourcesDashboardPage;
