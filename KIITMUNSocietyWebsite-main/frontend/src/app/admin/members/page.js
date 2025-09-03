'use client';

// Members Management Page
import ProtectedRoute from '@/components/ProtectedRoute';
import MembersDataTable from '@/components/admin/members-data-table';

const MembersManagement = () => {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="container mx-auto py-8 px-6">
          <MembersDataTable />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MembersManagement;
