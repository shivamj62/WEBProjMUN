'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { ArrowLeft, Upload, X, Calendar, FileText, Image as ImageIcon } from 'lucide-react';
import { uploadFile, API_ENDPOINTS } from '@/lib/api';
import { useRouter } from 'next/navigation';

const CreateBlogPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    competition_date: '',
    image1: null,
    image2: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [previewImages, setPreviewImages] = useState({
    image1: null,
    image2: null
  });

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
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      
      if (formData.competition_date) {
        formDataToSend.append('competition_date', formData.competition_date);
      }
      
      if (formData.image1) {
        formDataToSend.append('image1', formData.image1);
      }
      
      if (formData.image2) {
        formDataToSend.append('image2', formData.image2);
      }

      const response = await uploadFile(API_ENDPOINTS.BLOGS.CREATE, formDataToSend);
      
      if (response.success) {
        router.push('/admin?tab=blogs');
      } else {
        setSubmitError(response.error || 'Failed to create blog post');
      }
    } catch (error) {
      setSubmitError('Failed to create blog post. Please try again.');
      console.error('Blog creation error:', error);
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
            <p className="text-secondary-700">Only administrators can create blog posts.</p>
          </div>
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
                    Create New Blog Post
                  </h1>
                  <p className="text-secondary-600">
                    Share the latest MUN conference reports and updates
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
                      placeholder="Write your blog content here... You can include details about the MUN conference, experiences, achievements, and insights."
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
                            <span>Click to upload image</span>
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
                            <span>Click to upload image</span>
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
                    Images are optional but recommended. The primary image will be used as the blog thumbnail.
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
                        Creating Blog...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Create Blog Post
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

export default CreateBlogPage;
