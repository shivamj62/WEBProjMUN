'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Mail, Phone, Building, Users } from 'lucide-react';

const RegistrationModal = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    coDel: '',
    committee1: '',
    committee2: '',
    committee3: '',
    kiitEmail: '',
    hostel: '',
    phoneNumber: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on escape key
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      // First try with FormData (method 1)
      const submissionData = new FormData();
      submissionData.append('Full Name ', formData.fullName.trim());
      submissionData.append('Co-Del(if any)', formData.coDel.trim());
      submissionData.append('Committee1/Portfolio1/Portfolio2', formData.committee1.trim());
      submissionData.append('Committee2/Portfolio1/Portfolio2', formData.committee2.trim());
      submissionData.append('Committee3/Portfolio1/Portfolio2', formData.committee3.trim());
      submissionData.append('KIIT Email ID', formData.kiitEmail.trim());
      submissionData.append('Hostel', formData.hostel.trim());
      submissionData.append('Phone Number', formData.phoneNumber.trim());

      console.log('Attempting FormData submission...');

      let response = await fetch('https://sheet2api.com/v1/pxviw1GQTuuk/web-registration/Sheet1', {
        method: 'POST',
        body: submissionData
      });

      // If FormData fails, try with URL-encoded form data (method 2)
      if (!response.ok) {
        console.log('FormData failed, trying URL-encoded...');
        
        const urlEncodedData = new URLSearchParams();
        urlEncodedData.append('Full Name ', formData.fullName.trim());
        urlEncodedData.append('Co-Del(if any)', formData.coDel.trim());
        urlEncodedData.append('Committee1/Portfolio1/Portfolio2', formData.committee1.trim());
        urlEncodedData.append('Committee2/Portfolio1/Portfolio2', formData.committee2.trim());
        urlEncodedData.append('Committee3/Portfolio1/Portfolio2', formData.committee3.trim());
        urlEncodedData.append('KIIT Email ID', formData.kiitEmail.trim());
        urlEncodedData.append('Hostel', formData.hostel.trim());
        urlEncodedData.append('Phone Number', formData.phoneNumber.trim());

        response = await fetch('https://sheet2api.com/v1/pxviw1GQTuuk/web-registration/Sheet1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: urlEncodedData.toString()
        });
      }

      console.log('Final response status:', response.status);

      if (response.ok) {
        const result = await response.text();
        console.log('Success response:', result);
        
        setSubmitStatus({
          type: 'success',
          message: 'Registration submitted successfully! We will contact you soon.'
        });
        
        // Reset form
        setFormData({
          fullName: '',
          coDel: '',
          committee1: '',
          committee2: '',
          committee3: '',
          kiitEmail: '',
          hostel: '',
          phoneNumber: ''
        });

        // Close modal after 3 seconds
        setTimeout(() => {
          onClose();
          setSubmitStatus({ type: '', message: '' });
        }, 3000);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Registration submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: `Failed to submit registration. Please try again or contact us directly.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">MUN Registration</h2>
            <p className="text-gray-400">Join our Model United Nations Society</p>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-2 hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-400" />
                Personal Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Co-Delegate (if any)
                  </label>
                  <input
                    type="text"
                    name="coDel"
                    value={formData.coDel}
                    onChange={handleInputChange}
                    placeholder="Co-delegate name (optional)"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* Committee Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-400" />
                Committee Preferences
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Choice Committee/Portfolio *
                  </label>
                  <input
                    type="text"
                    name="committee1"
                    value={formData.committee1}
                    onChange={handleInputChange}
                    placeholder="e.g., UNSC - Russia, ECOSOC - India"
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Second Choice Committee/Portfolio
                  </label>
                  <input
                    type="text"
                    name="committee2"
                    value={formData.committee2}
                    onChange={handleInputChange}
                    placeholder="Second preference (optional)"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Third Choice Committee/Portfolio
                  </label>
                  <input
                    type="text"
                    name="committee3"
                    value={formData.committee3}
                    onChange={handleInputChange}
                    placeholder="Third preference (optional)"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Mail className="w-5 h-5 mr-2 text-primary-400" />
                Contact Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    KIIT Email ID *
                  </label>
                  <input
                    type="email"
                    name="kiitEmail"
                    value={formData.kiitEmail}
                    onChange={handleInputChange}
                    placeholder="your.email@kiit.ac.in"
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Your contact number"
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all backdrop-blur-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Hostel *
                </label>
                <input
                  type="text"
                  name="hostel"
                  value={formData.hostel}
                  onChange={handleInputChange}
                  placeholder="Your hostel name/number"
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Status Message */}
            {submitStatus.message && (
              <div className={`p-4 rounded-lg border ${
                submitStatus.type === 'success' 
                  ? 'bg-green-900/50 border-green-500 text-green-300' 
                  : 'bg-red-900/50 border-red-500 text-red-300'
              }`}>
                {submitStatus.message}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-ghost px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RegistrationModal;
