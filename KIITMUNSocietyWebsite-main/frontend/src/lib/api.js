// API configuration and utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Get auth credentials from localStorage
export const getAuthCredentials = () => {
  if (typeof window === 'undefined') return null;
  
  const authData = localStorage.getItem('munAuth');
  if (!authData) return null;
  
  try {
    return JSON.parse(authData);
  } catch {
    return null;
  }
};

// Save auth credentials to localStorage
export const saveAuthCredentials = (credentials) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('munAuth', JSON.stringify(credentials));
};

// Remove auth credentials
export const removeAuthCredentials = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('munAuth');
};

// Create authorization header
export const createAuthHeader = (credentials) => {
  const auth = credentials || getAuthCredentials();
  if (!auth) return {};
  
  return {
    'Authorization': `${auth.email}:${auth.password}`
  };
};

// Generic API call function
export const apiCall = async (
  endpoint,
  options = {}
) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 API CALL DEBUG - URL:', url);
    console.log('🌐 API CALL DEBUG - API_BASE_URL:', API_BASE_URL);
    console.log('🌐 API CALL DEBUG - endpoint:', endpoint);
    console.log('🌐 API CALL DEBUG - Options:', options);
    
    // Prepare the request options
    const requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Handle body stringification for JSON requests
    if (requestOptions.body && typeof requestOptions.body === 'object') {
      requestOptions.body = JSON.stringify(requestOptions.body);
      console.log('🌐 API CALL DEBUG - Stringified body:', requestOptions.body);
    }
    
    console.log('🌐 API CALL DEBUG - Making fetch request to:', url);
    const response = await fetch(url, requestOptions);

    console.log('🌐 API CALL DEBUG - Response status:', response.status);
    console.log('🌐 API CALL DEBUG - Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('🌐 API CALL DEBUG - Error text:', errorText);
      return {
        success: false,
        error: errorText || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('🌐 API CALL DEBUG - Raw response data:', data);
    
    const result = {
      success: true,
      data,
    };
    console.log('🌐 API CALL DEBUG - Final result:', result);
    
    return result;
  } catch (error) {
    console.log('🌐 API CALL DEBUG - Catch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Authenticated API call
export const authenticatedApiCall = async (
  endpoint,
  options = {}
) => {
  const authHeader = createAuthHeader();
  
  return apiCall(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json', // Explicitly set Content-Type first
      ...authHeader,
      ...options.headers,
    },
  });
};

// File upload with authentication
export const uploadFile = async (
  endpoint,
  formData
) => {
  try {
    const authHeader = createAuthHeader();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...authHeader,
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: errorText || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

// Download file with authentication
export const downloadFile = async (
  endpoint,
  filename
) => {
  try {
    const authHeader = createAuthHeader();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: authHeader,
    });

    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } else {
      throw new Error('Download failed');
    }
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    CHECK_EMAIL: '/api/auth/check-email',
    CREATE_ACCOUNT: '/api/auth/create-account',
    LOGIN: '/api/auth/login',
  },
  
  // Blogs
  BLOGS: {
    LIST: '/api/blogs',
    GET: (id) => `/api/blogs/${id}`,
    CREATE: '/api/blogs',
    UPDATE: (id) => `/api/blogs/${id}`,
    DELETE: (id) => `/api/blogs/${id}`,
  },
  
  // Resources
  RESOURCES: {
    LIST: '/api/resources',
    UPLOAD: '/api/admin/resources/upload',
    DOWNLOAD: (id) => `/api/resources/${id}/download`,
    DELETE: (id) => `/api/resources/${id}`,
  },
  
  // Admin
  ADMIN: {
    DASHBOARD_STATS: '/api/admin/dashboard/stats',
    MEMBERS: '/api/admin/members',
    MEMBER_UPDATE: (id) => `/api/admin/members/${id}`,
    MEMBER_DELETE: (id) => `/api/admin/members/${id}`,
    ADD_EMAIL: '/api/admin/members/add-email',
    AUTHORS: '/api/admin/authors',
    CREATE_AUTHOR: '/api/admin/authors',
  },
  
  // Health
  HEALTH: '/health',
};
