'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const BlogsManagement = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [limit] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    competition_date: '',
    image1: null,
    image2: null
  });

  // Fetch blogs with pagination
  const fetchBlogs = async (page = 1, search = '') => {
    if (!user || user.role !== 'admin') {
      setError('Admin access required');
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetch(`/api/admin/blogs?${params}`, {
        headers: {
          'Authorization': `${user.email}:admin123`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
        setTotalPages(data.total_pages || 1);
        setTotalBlogs(data.total || 0);
        setCurrentPage(data.current_page || 1);
      } else {
        setError('Failed to fetch blogs');
      }
    } catch (err) {
      setError('Error fetching blogs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(currentPage, searchTerm);
  }, [currentPage, user]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs(1, searchTerm);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Create blog
  const handleCreateBlog = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('🔍 Starting blog creation...');
    console.log('🔍 User object:', user);

    if (!user) {
      console.error('🔍 No user found');
      setError('Authentication required - please login again');
      return;
    }

    if (!user.email) {
      console.error('🔍 User email not found');
      setError('User email not found - please login again');
      return;
    }

    if (user.role !== 'admin') {
      console.error('🔍 User role check failed:', user.role);
      setError('Admin access required');
      return;
    }

    console.log('🔍 User authentication checks passed');

    const form = new FormData();
    form.append('title', formData.title);
    form.append('content', formData.content);
    if (formData.competition_date) {
      form.append('competition_date', formData.competition_date);
    }
    if (formData.image1) {
      console.log('🔍 Adding image1:', formData.image1.name, formData.image1.size, 'bytes');
      form.append('image1', formData.image1);
    }
    if (formData.image2) {
      console.log('🔍 Adding image2:', formData.image2.name, formData.image2.size, 'bytes');
      form.append('image2', formData.image2);
    }

    try {
      console.log('🔍 Creating blog with data:', {
        title: formData.title,
        content: formData.content.length + ' chars',
        competition_date: formData.competition_date,
        image1: formData.image1 ? formData.image1.name : 'none',
        image2: formData.image2 ? formData.image2.name : 'none'
      });
      
      console.log('🔍 User info:', user);
      console.log('🔍 Authorization header:', `${user.email}:admin123`);
      
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Authorization': `${user.email}:admin123`
        },
        body: form
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        setSuccess('Blog created successfully!');
        setShowCreateForm(false);
        setFormData({ title: '', content: '', competition_date: '', image1: null, image2: null });
        fetchBlogs(currentPage, searchTerm);
      } else {
        const errorData = await response.text();
        console.error('🔍 Error response:', errorData);
        console.error('🔍 Error status:', response.status);
        setError(`Failed to create blog: ${errorData}`);
      }
    } catch (err) {
      console.error('🔍 Fetch error:', err);
      setError('Error creating blog: ' + err.message);
    }
  };

  // Update blog
  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user || user.role !== 'admin' || !editingBlog) {
      setError('Admin access required');
      return;
    }

    const form = new FormData();
    if (formData.title) form.append('title', formData.title);
    if (formData.content) form.append('content', formData.content);
    if (formData.competition_date) form.append('competition_date', formData.competition_date);
    if (formData.image1) form.append('image1', formData.image1);
    if (formData.image2) form.append('image2', formData.image2);

    try {
      const response = await fetch(`/api/blogs/${editingBlog.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `${user.email}:admin123`
        },
        body: form
      });

      if (response.ok) {
        setSuccess('Blog updated successfully!');
        setEditingBlog(null);
        setFormData({ title: '', content: '', competition_date: '', image1: null, image2: null });
        fetchBlogs(currentPage, searchTerm);
      } else {
        const errorData = await response.text();
        setError(`Failed to update blog: ${errorData}`);
      }
    } catch (err) {
      setError('Error updating blog: ' + err.message);
    }
  };

  // Delete blog
  const handleDeleteBlog = async (blogId) => {
    if (!user || user.role !== 'admin') {
      setError('Admin access required');
      return;
    }

    if (!confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `${user.email}:admin123`
        }
      });

      if (response.ok) {
        setSuccess('Blog deleted successfully!');
        // If we're on the last page and it becomes empty, go to previous page
        if (blogs.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
          fetchBlogs(currentPage - 1, searchTerm);
        } else {
          fetchBlogs(currentPage, searchTerm);
        }
      } else {
        const errorData = await response.text();
        setError(`Failed to delete blog: ${errorData}`);
      }
    } catch (err) {
      setError('Error deleting blog: ' + err.message);
    }
  };

  // Start editing
  const startEditing = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      competition_date: blog.competition_date || '',
      image1: null,
      image2: null
    });
    setShowCreateForm(false);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingBlog(null);
    setFormData({ title: '', content: '', competition_date: '', image1: null, image2: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading blogs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">📝</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Blogs Management
                </h1>
                <p className="text-gray-400 mt-1">
                  Create, edit, and manage blog posts and articles.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setEditingBlog(null);
                setFormData({ title: '', content: '', competition_date: '', image1: null, image2: null });
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {showCreateForm ? 'Cancel' : '+ Create Blog'}
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400">
            {success}
          </div>
        )}

        {/* Create/Edit Form */}
        {(showCreateForm || editingBlog) && (
          <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>
            <form onSubmit={editingBlog ? handleUpdateBlog : handleCreateBlog} className="space-y-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter blog title"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 font-medium mb-2">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={10}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="Enter blog content"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 font-medium mb-2">Competition Date (Optional)</label>
                <input
                  type="date"
                  name="competition_date"
                  value={formData.competition_date}
                  onChange={handleInputChange}
                  className="bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Image 1 (Optional)</label>
                  <input
                    type="file"
                    name="image1"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 font-medium mb-2">Image 2 (Optional)</label>
                  <input
                    type="file"
                    name="image2"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {editingBlog ? 'Update Blog' : 'Create Blog'}
                </button>
                {editingBlog && (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Blogs List */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">All Blog Posts ({totalBlogs})</h2>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search blogs..."
                className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Search
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                    fetchBlogs(1, '');
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Clear
                </button>
              )}
            </form>
          </div>
          
          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">�</span>
              </div>
              <p className="text-gray-400">No blog posts found. Create your first blog post!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-6 hover:bg-gray-700/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{blog.title}</h3>
                      <p className="text-gray-400 mb-3 line-clamp-2">
                        {blog.content.length > 150 
                          ? blog.content.substring(0, 150) + '...' 
                          : blog.content
                        }
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>By {blog.author_name}</span>
                        {blog.competition_date && (
                          <span>Competition: {blog.competition_date}</span>
                        )}
                        <span>Created: {new Date(blog.created_at).toLocaleDateString()}</span>
                        {blog.updated_at !== blog.created_at && (
                          <span>Updated: {new Date(blog.updated_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => startEditing(blog)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  {(blog.image1_path || blog.image2_path) && (
                    <div className="mt-4 flex space-x-2">
                      {blog.image1_path && (
                        <div className="h-20 w-20 bg-gray-600 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-400">IMG1</span>
                        </div>
                      )}
                      {blog.image2_path && (
                        <div className="h-20 w-20 bg-gray-600 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-400">IMG2</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-gray-400 text-sm">
                Showing {blogs.length > 0 ? ((currentPage - 1) * limit + 1) : 0} to {Math.min(currentPage * limit, totalBlogs)} of {totalBlogs} blogs
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
                          currentPage === pageNum
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogsManagement;
