'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, Calendar, FileText, Image as ImageIcon } from 'lucide-react';
import { apiCall, uploadFile, API_ENDPOINTS } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

const EditBlogPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const blogId = params.id;

  const [blog, setBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    competition_date: '',
    image1: null,
    image2: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [previewImages, setPreviewImages] = useState({
    image1: null,
    image2: null
  });

  useEffect(() => {
    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  const fetchBlog = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.BLOGS.GET(parseInt(blogId)));
      if (response.success && response.data) {
        const blogData = response.data;
        setBlog(blogData);
        
        setFormData({
          title: blogData.title,
          content: blogData.content,
          competition_date: blogData.competition_date ? blogData.competition_date.split('T')[0] : '',
          image1: null,
          image2: null
        });

        // Set existing image previews
        setPreviewImages({
          image1: blogData.image1_path ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${blogData.image1_path}` : null,
          image2: blogData.image2_path ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/images/${blogData.image2_path}` : null
        });
      } else {
        setSubmitError('Failed to load blog post');
      }
    } catch (error) {
      setSubmitError('Failed to load blog post');
      console.error('Error fetching blog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e, imageField) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size should be less than 10MB');
        return;
      }

      setFormData(prev => ({ ...prev, [imageField]: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages(prev => ({
          ...prev,
          [imageField]: e.target?.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (imageField) => {
    setFormData(prev => ({ ...prev, [imageField]: null }));
    setPreviewImages(prev => ({ ...prev, [imageField]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const formDataToSend = new FormData();
      
      // Only append fields that have changed
      if (formData.title !== blog?.title) {
        formDataToSend.append('title', formData.title);
      }
      
      if (formData.content !== blog?.content) {
        formDataToSend.append('content', formData.content);
      }
      
      const originalDate = blog?.competition_date ? blog.competition_date.split('T')[0] : '';
      if (formData.competition_date !== originalDate) {
        formDataToSend.append('competition_date', formData.competition_date);
      }
      
      if (formData.image1) {
        formDataToSend.append('image1', formData.image1);
      }
      
      if (formData.image2) {
        formDataToSend.append('image2', formData.image2);
      }

      const response = await uploadFile(
        API_ENDPOINTS.BLOGS.UPDATE(parseInt(blogId)), 
        formDataToSend
      );
      
      if (response.success) {
        router.push('/admin?tab=blogs');
      } else {
        setSubmitError(response.error || 'Failed to update blog post');
      }
    } catch (error) {
      setSubmitError('Failed to update blog post. Please try again.');
      console.error('Blog update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-secondary-700">Only administrators can edit blog posts.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-secondary-50">
          <Header />
          <main className="pt-24 pb-16">
            <div className="container-custom max-w-4xl">
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-secondary-600">Loading blog post...</p>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (!blog) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-secondary-50">
          <Header />
          <main className="pt-24 pb-16">
            <div className="container-custom max-w-4xl">
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Blog Not Found</h1>
                <p className="text-secondary-700 mb-6">The blog post you're trying to edit doesn't exist.</p>
                <button onClick={() => router.push('/admin')} className="btn-ghost border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white">
                  Return to Admin Dashboard
                </button>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-secondary-50">
        <Header />
        
        <main className="pt-24 pb-16">
          <div className="container-custom max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="btn-ghost border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <div>
                  <h1 className="text-3xl font-serif font-bold text-secondary-900">
                    Edit Blog Post
                  </h1>
                  <p className="text-secondary-600">
                    Updating: {blog.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="card">
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <X className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-red-800">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Blog Information
                  </h3>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-2">
                      Blog Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Enter an engaging blog title..."
                    />
                  </div>

                  <div>
                    <label htmlFor="competition_date" className="block text-sm font-medium text-secondary-700 mb-2">
                      Competition Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                      <input
                        type="date"
                        id="competition_date"
                        name="competition_date"
                        value={formData.competition_date}
                        onChange={handleInputChange}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-secondary-700 mb-2">
                      Blog Content *
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      required
                      rows={12}
                      className="input-field resize-y"
                      placeholder="Write your blog content here..."
                    />
                    <p className="text-sm text-secondary-500 mt-1">
                      {formData.content.length} characters
                    </p>
                  </div>
                </div>

                {/* Image Uploads */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Blog Images
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Image 1 */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Primary Image
                      </label>
                      {previewImages.image1 ? (
                        <div className="relative">
                          <img
                            src={previewImages.image1}
                            alt="Preview 1"
                            className="w-full h-48 object-cover rounded-lg border border-secondary-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage('image1')}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <div className="w-full h-48 border-2 border-dashed border-secondary-300 rounded-lg flex flex-col items-center justify-center text-secondary-500 hover:border-primary-400 hover:text-primary-600 transition-colors">
                            <Upload className="w-8 h-8 mb-2" />
                            <span>Click to upload new image</span>
                            <span className="text-xs">PNG, JPG, GIF up to 10MB</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'image1')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Image 2 */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Secondary Image
                      </label>
                      {previewImages.image2 ? (
                        <div className="relative">
                          <img
                            src={previewImages.image2}
                            alt="Preview 2"
                            className="w-full h-48 object-cover rounded-lg border border-secondary-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage('image2')}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <div className="w-full h-48 border-2 border-dashed border-secondary-300 rounded-lg flex flex-col items-center justify-center text-secondary-500 hover:border-primary-400 hover:text-primary-600 transition-colors">
                            <Upload className="w-8 h-8 mb-2" />
                            <span>Click to upload new image</span>
                            <span className="text-xs">PNG, JPG, GIF up to 10MB</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, 'image2')}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-secondary-600">
                    Upload new images to replace existing ones, or leave empty to keep current images.
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-secondary-200">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn-ghost border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.title || !formData.content}
                    className="btn-ghost border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Updating Blog...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Update Blog Post
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default EditBlogPage;
