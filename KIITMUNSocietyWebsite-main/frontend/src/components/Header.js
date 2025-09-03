'use client';

import { useState } from 'react';
import { Menu, X, User, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import RegistrationModal from './RegistrationModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/#about' },
    { name: 'Team', href: '/#team' },
    { 
      name: 'Resources', 
      href: isAuthenticated ? '/resources-dashboard' : '/auth/login?redirect=resources'
    },
    { name: 'Contact', href: '/#contact' },
  ];

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const openRegistrationModal = () => {
    setIsRegistrationModalOpen(true);
    setIsMenuOpen(false);
  };

  const closeRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md shadow-sm border-b border-gray-800">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            {/* Desktop Logo */}
            <div className="hidden sm:block">
              <Image
                src="/images/logo/kiit-mun-logo.png"
                alt="KIIT MUN Society - Model United Nations"
                width={200}
                height={60}
                priority
                className="h-12 w-auto object-contain group-hover:opacity-90 transition-opacity duration-200"
              />
            </div>
            
            {/* Mobile Logo */}
            <div className="block sm:hidden">
              <Image
                src="/images/logo/kiit-mun-logo.png"
                alt="KIIT MUN Society"
                width={150}
                height={45}
                priority
                className="h-8 w-auto object-contain group-hover:opacity-90 transition-opacity duration-200"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-300 hover:text-primary-400 font-medium transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Auth Section */}
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-600">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-4">
                  {/* Registration Button for Authenticated Users */}
                  <button
                    onClick={openRegistrationModal}
                    className="btn-ghost flex items-center space-x-2 text-primary-400 hover:text-primary-300 font-medium transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register for MUN</span>
                  </button>
                  
                  {/* Admin Panel Button for Authenticated Admins */}
                  {(user.role === 'admin' || user.role === 'administrator') && (
                    <Link 
                      href="/admin"
                      className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
                    >
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  
                  <span className="flex items-center space-x-2 text-secondary-700">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{user.full_name || user.name}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn-ghost flex items-center space-x-2 text-secondary-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  {/* Admin Login Button - Always visible when logged out */}
                  <Link 
                    href="/auth/admin-login"
                    className="text-red-600 hover:text-red-700 font-medium transition-colors"
                  >
                    Admin Login
                  </Link>
                  <Link 
                    href="/auth/login"
                    className="text-secondary-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Member Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn-ghost text-sm px-4 py-2"
                  >
                    Join Us
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="btn-ghost md:hidden p-2 rounded-lg hover:bg-secondary-100"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-secondary-700" />
            ) : (
              <Menu className="w-6 h-6 text-secondary-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary-200">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 text-secondary-700 hover:text-primary-600 hover:bg-secondary-50 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Auth Section */}
              <div className="px-4 py-2 border-t border-secondary-200 mt-2 pt-4">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    {/* Registration Button for Mobile */}
                    <button
                      onClick={openRegistrationModal}
                      className="block w-full text-left py-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <UserPlus className="w-4 h-4 inline mr-2" />
                      Register for MUN
                    </button>
                    
                    {/* Admin Panel for Mobile */}
                    {(user.role === 'admin' || user.role === 'administrator') && (
                      <Link 
                        href="/admin"
                        className="block py-2 text-purple-600 hover:text-purple-700 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    
                    <div className="flex items-center space-x-2 text-secondary-700 py-2">
                      <User className="w-4 h-4" />
                      <span>{user.full_name || user.name}</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="btn-ghost flex items-center space-x-2 text-secondary-700 hover:text-red-600 py-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Admin Login Button for Mobile */}
                    <Link 
                      href="/auth/admin-login"
                      className="block py-2 text-red-600 hover:text-red-700 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Login
                    </Link>
                    <Link 
                      href="/auth/login"
                      className="block py-2 text-secondary-700 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Member Login
                    </Link>
                    <Link 
                      href="/auth/register"
                      className="block py-2 text-primary-600 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Join Our Society
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
      
      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={isRegistrationModalOpen} 
        onClose={closeRegistrationModal} 
      />
    </header>
  );
};

export default Header;
