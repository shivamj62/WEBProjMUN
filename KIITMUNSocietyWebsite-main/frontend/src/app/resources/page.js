'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const ResourcesRedirectPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect authenticated users to the dashboard
        router.push('/resources-dashboard');
      } else {
        // Redirect non-authenticated users to login
        router.push('/auth/login?redirect=resources');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-secondary-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default ResourcesRedirectPage;
