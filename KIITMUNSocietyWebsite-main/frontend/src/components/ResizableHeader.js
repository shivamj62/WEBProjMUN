"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { User, LogOut, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import RegistrationModal from "./RegistrationModal";

// Custom MUN Society Logo Component
const MUNSocietyLogo = () => {
  return (
    <Link href="/" className="relative z-20 mr-4 flex items-center space-x-3 px-2 py-1 text-sm font-normal text-black group">
      {/* Desktop Logo */}
      <div className="hidden sm:block">
        <Image
          src="/images/logo/kiit-mun-logo.png"
          alt="KIIT MUN Society - Model United Nations"
          width={200}
          height={60}
          priority
          className="h-10 w-auto object-contain group-hover:opacity-90 transition-opacity duration-200"
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
  );
};

export default function ResizableHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navigation = [
    { name: "Home", link: "/" },
    { name: "About", link: "/#about" },
    { name: "Team", link: "/#team" },
    { 
      name: "Resources", 
      link: isAuthenticated ? "/resources-dashboard" : "/auth/login?redirect=resources"
    },
    { name: "Contact", link: "/#contact" },
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const openRegistrationModal = () => {
    setIsRegistrationModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeRegistrationModal = () => {
    setIsRegistrationModalOpen(false);
  };

  return (
    <>
      <div className="relative w-full">
        <Navbar className="fixed top-0">
          {/* Desktop Navigation */}
          <NavBody>
            <MUNSocietyLogo />
            <NavItems 
              items={navigation} 
              className="text-gray-200 hover:text-white text-sm"
              onItemClick={() => {}} // Add empty handler to prevent issues
            />
            
            {/* Desktop Auth Section */}
            <div className="flex items-center gap-2 ml-4">
              {isAuthenticated && user ? (
                <>
                  {/* Registration Button for Authenticated Users */}
                  <NavbarButton
                    variant="secondary"
                    onClick={openRegistrationModal}
                    className="hidden xl:flex items-center space-x-2 text-blue-300 hover:text-blue-200 bg-transparent text-xs px-3 py-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Register MUN</span>
                  </NavbarButton>
                  
                  {/* Admin Panel Button */}
                  {(user.role === 'admin' || user.role === 'administrator') && (
                    <NavbarButton
                      variant="secondary"
                      href="/admin"
                      className="text-purple-300 hover:text-purple-200 bg-transparent text-xs px-3 py-1"
                    >
                      Admin
                    </NavbarButton>
                  )}
                  
                  <span className="hidden xl:flex items-center space-x-2 text-gray-200 text-xs">
                    <User className="w-3 h-3" />
                    <span className="font-medium">{user.full_name || user.name}</span>
                  </span>
                  
                  <NavbarButton
                    variant="secondary"
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-300 hover:text-red-200 bg-transparent text-xs px-3 py-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Logout</span>
                  </NavbarButton>
                </>
              ) : (
                <>
                  <NavbarButton
                    variant="secondary"
                    href="/auth/admin-login"
                    className="text-red-300 hover:text-red-200 bg-transparent text-xs px-3 py-1"
                  >
                    Admin
                  </NavbarButton>
                  <NavbarButton
                    variant="secondary"
                    href="/auth/login"
                    className="text-gray-200 hover:text-white bg-transparent text-xs px-3 py-1"
                  >
                    Login
                  </NavbarButton>
                  <NavbarButton
                    variant="primary"
                    href="/auth/register"
                    className="bg-blue-500/80 hover:bg-blue-400/90 text-white text-xs px-3 py-1"
                  >
                    Join Us
                  </NavbarButton>
                </>
              )}
            </div>
          </NavBody>

          {/* Mobile Navigation */}
          <MobileNav>
            <MobileNavHeader>
              <MUNSocietyLogo />
              <MobileNavToggle
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </MobileNavHeader>

            <MobileNavMenu
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            >
              {navigation.map((item, idx) => (
                <Link
                  key={`mobile-link-${idx}`}
                  href={item.link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="relative text-gray-200 hover:text-blue-300 transition-colors duration-200"
                >
                  <span className="block font-medium">{item.name}</span>
                </Link>
              ))}
              
              {/* Mobile Auth Section */}
              <div className="flex w-full flex-col gap-4 mt-6 pt-6 border-t border-gray-700">
                {isAuthenticated && user ? (
                  <>
                    <NavbarButton
                      onClick={openRegistrationModal}
                      variant="secondary"
                      className="w-full text-blue-300 hover:text-blue-200 bg-transparent"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Register for MUN
                    </NavbarButton>
                    
                    {(user.role === 'admin' || user.role === 'administrator') && (
                      <NavbarButton
                        onClick={() => setIsMobileMenuOpen(false)}
                        variant="secondary"
                        href="/admin"
                        className="w-full text-purple-300 hover:text-purple-200 bg-transparent"
                      >
                        Admin Panel
                      </NavbarButton>
                    )}
                    
                    <div className="flex items-center space-x-2 text-gray-300 px-4 py-2">
                      <User className="w-4 h-4" />
                      <span>{user.full_name || user.name}</span>
                    </div>
                    
                    <NavbarButton
                      onClick={handleLogout}
                      variant="secondary"
                      className="w-full text-red-300 hover:text-red-200 bg-transparent"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </NavbarButton>
                  </>
                ) : (
                  <>
                    <NavbarButton
                      onClick={() => setIsMobileMenuOpen(false)}
                      variant="secondary"
                      href="/auth/admin-login"
                      className="w-full text-red-300 hover:text-red-200 bg-transparent"
                    >
                      Admin Login
                    </NavbarButton>
                    <NavbarButton
                      onClick={() => setIsMobileMenuOpen(false)}
                      variant="secondary"
                      href="/auth/login"
                      className="w-full text-gray-200 hover:text-white bg-transparent"
                    >
                      Member Login
                    </NavbarButton>
                    <NavbarButton
                      onClick={() => setIsMobileMenuOpen(false)}
                      variant="primary"
                      href="/auth/register"
                      className="w-full bg-blue-500/80 hover:bg-blue-400/90 text-white"
                    >
                      Join Our Society
                    </NavbarButton>
                  </>
                )}
              </div>
            </MobileNavMenu>
          </MobileNav>
        </Navbar>
      </div>

      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={isRegistrationModalOpen} 
        onClose={closeRegistrationModal} 
      />
    </>
  );
}
