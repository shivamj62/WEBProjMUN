'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

const AdminDashboardPage = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <h1 className="text-white text-6xl font-bold">
          You are admin
        </h1>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboardPage;
