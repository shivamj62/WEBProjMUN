'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  FolderOpen, 
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';
import { authenticatedApiCall, API_ENDPOINTS } from '@/lib/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_members: 0,
    total_blogs: 0,
    total_resources: 0,
    recent_registrations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await authenticatedApiCall(API_ENDPOINTS.ADMIN.DASHBOARD_STATS);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Members',
      value: stats.total_members,
      icon: Users,
      color: 'bg-blue-600',
      href: '/admin/members'
    },
    {
      title: 'Blog Posts',
      value: stats.total_blogs,
      icon: FileText,
      color: 'bg-green-600',
      href: '/admin/blogs'
    },
    {
      title: 'Resources',
      value: stats.total_resources,
      icon: FolderOpen,
      color: 'bg-purple-600',
      href: '/admin/resources'
    },
    {
      title: 'Recent Registrations',
      value: stats.recent_registrations,
      icon: TrendingUp,
      color: 'bg-orange-600',
      href: '/admin/members'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-gray-400 mt-2">
                Welcome back! Here's what's happening with your MUN Society.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const gradients = [
              'from-blue-500 to-blue-600',
              'from-green-500 to-green-600', 
              'from-purple-500 to-purple-600',
              'from-orange-500 to-orange-600'
            ];
            return (
              <div
                key={card.title}
                className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl"
              >
                <div className="flex items-center">
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${gradients[index]} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">{card.title}</p>
                    <p className="text-3xl font-bold text-white">{card.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-sm">⚡</span>
            </div>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="group bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/50 hover:from-blue-600/20 hover:to-purple-600/20 hover:border-blue-500/50 text-gray-300 hover:text-white p-6 rounded-xl text-left transition-all duration-300 hover:scale-105 shadow-lg">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="font-semibold text-lg mb-2">Manage Members</div>
              <div className="text-sm text-gray-400">Add, edit, or remove members</div>
            </button>
            
            <button className="group bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/50 hover:from-green-600/20 hover:to-blue-600/20 hover:border-green-500/50 text-gray-300 hover:text-white p-6 rounded-xl text-left transition-all duration-300 hover:scale-105 shadow-lg">
              <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="font-semibold text-lg mb-2">Create Blog Post</div>
              <div className="text-sm text-gray-400">Write and publish new content</div>
            </button>
            
            <button className="group bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600/50 hover:from-purple-600/20 hover:to-pink-600/20 hover:border-purple-500/50 text-gray-300 hover:text-white p-6 rounded-xl text-left transition-all duration-300 hover:scale-105 shadow-lg">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <div className="font-semibold text-lg mb-2">Upload Resources</div>
              <div className="text-sm text-gray-400">Add documents and files</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Activity className="h-5 w-5 text-white" />
            </div>
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-gray-300 ml-4 flex-1">Admin panel accessed</span>
              <span className="text-xs text-gray-500 bg-gray-600/50 px-3 py-1 rounded-full">Just now</span>
            </div>
            <div className="flex items-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
              <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-gray-300 ml-4 flex-1">Dashboard statistics loaded</span>
              <span className="text-xs text-gray-500 bg-gray-600/50 px-3 py-1 rounded-full">Few seconds ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
