'use client';

import { useRouter, usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Users, 
  FileText, 
  FolderOpen, 
  BarChart3, 
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: BarChart3,
      current: pathname === '/admin'
    },
    {
      name: 'Members Management',
      href: '/admin/members',
      icon: Users,
      current: pathname === '/admin/members'
    },
    {
      name: 'Blogs Management',
      href: '/admin/blogs',
      icon: FileText,
      current: pathname === '/admin/blogs'
    },
    {
      name: 'Resources Management',
      href: '/admin/resources',
      icon: FolderOpen,
      current: pathname === '/admin/resources'
    }
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-lg">
          <div className="px-6 py-4">
            {/* Header with logo and title */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">KIIT MUN Society</h1>
                  <p className="text-sm text-gray-400">Admin Dashboard</p>
                </div>
              </div>
              
              {/* User info and logout */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl">
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {user?.name?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-400 capitalize">{user?.role || 'admin'}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 rounded-xl hover:bg-red-600/20 hover:text-red-400 transition-all duration-200 group"
                >
                  <LogOut className="mr-2 h-4 w-4 text-gray-400 group-hover:text-red-400 transition-colors duration-200" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Horizontal Navigation Menu */}
            <nav className="flex items-center space-x-2 overflow-x-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`
                      flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group whitespace-nowrap
                      ${item.current 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                      }
                    `}
                  >
                    <Icon className={`mr-2 h-4 w-4 ${item.current ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors duration-200`} />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="w-full">
          {/* Page content */}
          <main className="p-0">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;
