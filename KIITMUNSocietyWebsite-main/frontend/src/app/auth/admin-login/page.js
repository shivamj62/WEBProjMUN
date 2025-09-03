'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, logout, isAuthenticated, user } = useAuth();
  const router = useRouter();

// Handle authentication and role checking
useEffect(() => {
    console.log('🔍 USEEFFECT DEBUG - isAuthenticated:', isAuthenticated);
    console.log('🔍 USEEFFECT DEBUG - user:', user);
    console.log('🔍 USEEFFECT DEBUG - user.role:', user?.role);
    
    if (isAuthenticated && user) {
        if (user.role === 'admin') {
            console.log('✅ USEEFFECT - Admin detected, redirecting to /admin');
            // Admin user - redirect to admin panel
            setTimeout(() => {
                router.push('/admin');
            }, 1000);
        } else {
            console.log('❌ USEEFFECT - Non-admin user detected:', user.role);
            // Non-admin user - show popup and redirect to home
            logout(); // Clear their session
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                  // Show popup
                  const popup = document.createElement('div');
                  popup.innerHTML = `
                    <div style="
                      position: fixed;
                      top: 20px;
                      right: 20px;
                      background: #ef4444;
                      color: white;
                      padding: 16px 24px;
                      border-radius: 8px;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                      z-index: 9999;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      font-size: 14px;
                      font-weight: 500;
                      max-width: 400px;
                      animation: slideIn 0.3s ease-out;
                    ">
                      You need to be an admin to access this page!
                    </div>
                  `;
                  
                  const style = document.createElement('style');
                  style.textContent = `
                    @keyframes slideIn {
                      from { transform: translateX(100%); opacity: 0; }
                      to { transform: translateX(0); opacity: 1; }
                    }
                  `;
                  document.head.appendChild(style);
                  document.body.appendChild(popup);
                  
                  setTimeout(() => {
                    if (popup.parentNode) popup.parentNode.removeChild(popup);
                    if (style.parentNode) style.parentNode.removeChild(style);
                  }, 4000);
                  
                  // Redirect to home
                  router.push('/');
                }
            }, 500);
        }
    }
}, [isAuthenticated, user, router, logout]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      console.log('🔍 LOGIN DEBUG - Full result:', result);
      console.log('🔍 LOGIN DEBUG - Result success:', result.success);
      console.log('🔍 LOGIN DEBUG - Result user:', result.user);
      console.log('🔍 LOGIN DEBUG - User role:', result.user?.role);
      console.log('🔍 LOGIN DEBUG - Role type:', typeof result.user?.role);
      
      if (result.success) {
        // Check if user is admin
        if (result.user?.role === 'admin') {
          console.log('✅ Admin login successful - redirecting to /admin');
          // Admin login successful - redirect will happen in useEffect
          router.push('/admin');
        } else {
          console.log('❌ Non-admin user detected:', result.user?.role);
          // Non-admin user logged in successfully
          logout(); // Clear their session
          
          // Show popup notification
          if (typeof window !== 'undefined') {
            const popup = document.createElement('div');
            popup.innerHTML = `
              <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                padding: 16px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                font-weight: 500;
                max-width: 400px;
                animation: slideIn 0.3s ease-out;
              ">
                You need to be an admin to access this page!
              </div>
            `;
            
            const style = document.createElement('style');
            style.textContent = `
              @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
            `;
            document.head.appendChild(style);
            document.body.appendChild(popup);
            
            setTimeout(() => {
              if (popup.parentNode) popup.parentNode.removeChild(popup);
              if (style.parentNode) style.parentNode.removeChild(style);
            }, 4000);
          }
          
          // Redirect to home
          setTimeout(() => router.push('/'), 1000);
        }
      } else {
        console.log('❌ Login failed:', result.error);
        setError(result.error || 'Invalid admin credentials');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Image
                src="/images/logo/kiit-mun-logo.png"
                alt="KIIT MUN Society"
                width={64}
                height={64}
                className="w-16 h-16 object-contain"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-red-900 mb-2">
            Admin Access
          </h1>
          <p className="text-red-700">
            Administrative login for KIIT MUN Society
          </p>
        </div>

        {/* Warning Notice */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">Restricted Access</p>
              <p>This login is exclusively for administrators. Only accounts with admin privileges can access this area.</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="card border-red-200">
          
          {/* Debug Test Button */}
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <button
              type="button"
              onClick={async () => {
                console.log('🧪 DIRECT API TEST STARTING...');
                try {
                  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                  const response = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: 'admin@munsociety.edu',
                      password: 'admin123'
                    })
                  });
                  
                  const data = await response.json();
                  console.log('🧪 DIRECT API RESPONSE:', data);
                  console.log('🧪 USER ROLE:', data.user?.role);
                  console.log('🧪 ROLE CHECK:', data.user?.role === 'admin');
                  
                  alert(`API Test: Role = ${data.user?.role}, Is Admin = ${data.user?.role === 'admin'}`);
                } catch (error) {
                  console.error('🧪 DIRECT API ERROR:', error);
                  alert(`API Error: ${error.message}`);
                }
              }}
              className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
            >
              🧪 Test Direct API Call
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="form-label">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-red-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10 border-red-200 focus:border-red-500 focus:ring-red-500"
                  placeholder="admin@kiitmun.org"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-red-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10 border-red-200 focus:border-red-500 focus:ring-red-500"
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-red-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-red-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Shield className="w-5 h-5 mr-2" />
              )}
              {isLoading ? 'Authenticating...' : 'Admin Login'}
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-8 space-y-3">
          <div className="text-sm text-red-700">
            Not an administrator?
          </div>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/auth/login"
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Member Login
            </Link>
            <span className="text-red-300">•</span>
            <Link 
              href="/"
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <div className="bg-red-100 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 text-sm text-red-800">
              <Shield className="w-4 h-4" />
              <span>Secure admin authentication</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
