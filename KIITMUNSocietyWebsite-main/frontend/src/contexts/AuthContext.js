'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuthCredentials, 
  saveAuthCredentials, 
  removeAuthCredentials,
  apiCall,
  API_ENDPOINTS
} from '@/lib/api';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to save complete auth data to localStorage
const saveAuthData = (token, user) => {
  if (typeof window === 'undefined') return;
  
  const authData = {
    token,
    user: {
      email: user.email,
      role: user.role,
      full_name: user.full_name || user.name,
      id: user.id
    },
    credentials: {
      email: user.email,
      password: user.password // Note: In production, avoid storing passwords
    }
  };
  
  localStorage.setItem('munAuth', JSON.stringify(authData.credentials));
  localStorage.setItem('munAuthToken', token);
  localStorage.setItem('munAuthUser', JSON.stringify(authData.user));
};

// Helper function to get complete auth data from localStorage
const getAuthData = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = localStorage.getItem('munAuthToken');
    const userStr = localStorage.getItem('munAuthUser');
    const credentialsStr = localStorage.getItem('munAuth');
    
    if (!token || !userStr || !credentialsStr) return null;
    
    return {
      token,
      user: JSON.parse(userStr),
      credentials: JSON.parse(credentialsStr)
    };
  } catch {
    return null;
  }
};

// Helper function to clear all auth data
const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('munAuth');
  localStorage.removeItem('munAuthToken');
  localStorage.removeItem('munAuthUser');
};

// Helper function to show popup messages
const showPopup = (message, type = 'error') => {
  if (typeof window === 'undefined') return;
  
  // Create popup element
  const popup = document.createElement('div');
  popup.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ef4444' : '#10b981'};
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
      ${message}
    </div>
  `;
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(popup);
  
  // Remove popup after 4 seconds
  setTimeout(() => {
    if (popup.parentNode) {
      popup.parentNode.removeChild(popup);
    }
    if (style.parentNode) {
      style.parentNode.removeChild(style);
    }
  }, 4000);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const authData = getAuthData();
      console.log('🏁 INIT DEBUG - Auth data from localStorage:', authData);
      
      if (authData) {
        console.log('🏁 INIT DEBUG - User from localStorage:', authData.user);
        console.log('🏁 INIT DEBUG - User role from localStorage:', authData.user?.role);
        
        // Verify credentials by attempting login
        const response = await apiCall(API_ENDPOINTS.AUTH.LOGIN, {
          method: 'POST',
          body: authData.credentials, // apiCall will auto-stringify this
        });

        console.log('🏁 INIT DEBUG - Verification response:', response);

        if (response.success && response.data && response.data.success) {
          console.log('🏁 INIT DEBUG - Setting user from localStorage:', authData.user);
          setUser(authData.user);
          setAuthToken(authData.token);
          setIsAuthenticated(true);
        } else {
          console.log('🏁 INIT DEBUG - Verification failed, clearing auth data');
          // Invalid credentials, remove them
          clearAuthData();
        }
      } else {
        console.log('🏁 INIT DEBUG - No auth data found in localStorage');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    
    try {
      const credentials = { email, password };
      
      // Attempt login
      const response = await apiCall(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: credentials, // apiCall will auto-stringify this
      });

      console.log('🔍 AUTH DEBUG - API Response:', response);
      console.log('🔍 AUTH DEBUG - Response success:', response.success);
      console.log('🔍 AUTH DEBUG - Response data:', response.data);
      console.log('🔍 AUTH DEBUG - User data:', response.data?.user);
      console.log('🔍 AUTH DEBUG - User role:', response.data?.user?.role);

      if (response.success && response.data && response.data.success) {
        // Create token (in real app, this should come from backend)
        const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Save complete auth data to localStorage
        const userData = { ...response.data.user, password }; // Add password for credentials
        saveAuthData(token, userData);
        
        setUser(response.data.user);
        setAuthToken(token);
        setIsAuthenticated(true);
        
        console.log('✅ AUTH DEBUG - User set in context:', response.data.user);
        console.log('✅ AUTH DEBUG - Auth state updated, isAuthenticated: true');
        
        return { 
          success: true, 
          user: response.data.user,
          token 
        };
      } else {
        return { 
          success: false, 
          error: response.data?.error || response.error || 'Login failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
    
    // Redirect to home page after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const checkEmailAvailability = async (email) => {
    try {
      const response = await apiCall(API_ENDPOINTS.AUTH.CHECK_EMAIL, {
        method: 'POST',
        body: { email }, // apiCall will auto-stringify this
      });

      console.log('🔍 EMAIL CHECK DEBUG - Raw response:', response);
      console.log('🔍 EMAIL CHECK DEBUG - Response success:', response.success);
      console.log('🔍 EMAIL CHECK DEBUG - Response data:', response.data);

      // The response.data contains the EmailCheckResponse from backend
      if (response.success && response.data) {
        const emailData = response.data;
        
        console.log('🔍 EMAIL CHECK DEBUG - Email allowed:', emailData.allowed);
        console.log('🔍 EMAIL CHECK DEBUG - Account exists:', emailData.account_exists);
        
        if (emailData.allowed) {
          return { 
            success: true, 
            exists: emailData.account_exists || false,
            name: emailData.name,
            role: emailData.role
          };
        } else {
          return { 
            success: false, 
            exists: false, 
            error: 'Email not pre-approved for registration' 
          };
        }
      } else {
        return { 
          success: false, 
          exists: false, 
          error: response.error || 'Check failed' 
        };
      }
    } catch (error) {
      console.error('🔍 EMAIL CHECK DEBUG - Exception:', error);
      return { 
        success: false, 
        exists: false, 
        error: error instanceof Error ? error.message : 'Check failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiCall(API_ENDPOINTS.AUTH.CREATE_ACCOUNT, {
        method: 'POST',
        body: userData, // apiCall will auto-stringify this
      });

      if (response.success && response.data && response.data.success) {
        // Auto-login after successful registration
        const loginResult = await login(userData.email, userData.password);
        return loginResult;
      } else {
        return { 
          success: false, 
          error: response.data?.error || response.error || 'Registration failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  };

  // Function to check admin access and show popup if needed
  const checkAdminAccess = (showPopupOnFail = true) => {
    if (!isAuthenticated) {
      if (showPopupOnFail) {
        showPopup('You need to be logged in as an admin to access this page!');
      }
      return false;
    }
    
    if (user?.role !== 'admin') {
      if (showPopupOnFail) {
        showPopup('You need to be an admin to access this page!');
      }
      return false;
    }
    
    return true;
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    authToken,
    login,
    logout,
    checkEmailAvailability,
    register,
    checkAdminAccess,
    showPopup, // Export showPopup for use in components
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
