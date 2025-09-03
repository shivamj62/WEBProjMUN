'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requiredRole,
  redirectTo = '/auth/login' 
}) => {
  const { user, isAuthenticated, isLoading, showPopup } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // User not authenticated
        if (requiredRole === 'admin') {
          showPopup('You need to be logged in as an admin to access this page!');
          router.push('/');
        } else {
          router.push(redirectTo);
        }
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        // User authenticated but doesn't have required role
        if (requiredRole === 'admin') {
          showPopup('You need to be an admin to access this page!');
          router.push('/');
          return;
        }
      }

      setIsChecking(false);
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, redirectTo, showPopup]);

  // Show loading state while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role
  return <>{children}</>;
};

export default ProtectedRoute;
