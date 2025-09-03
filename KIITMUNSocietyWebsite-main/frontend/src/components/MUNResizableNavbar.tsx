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

// Custom MUN Society Logo Component
const MUNSocietyLogo = () => {
  return (
    <a
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
    >
      {/* You can replace this with your actual MUN Society logo */}
      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-xs">MUN</span>
      </div>
      <span className="font-medium text-black dark:text-white">KIIT MUN Society</span>
    </a>
  );
};

export default function MUNResizableNavbar() {
  const navItems = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "About",
      link: "#about",
    },
    {
      name: "Blogs",
      link: "#blogs",
    },
    {
      name: "Coordinators",
      link: "#coordinators",
    },
    {
      name: "Resources",
      link: "#resources",
    },
    {
      name: "Contact",
      link: "#contact",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full">
      <Navbar className="fixed top-0">
        {/* Desktop Navigation */}
        <NavBody>
          <MUNSocietyLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <NavbarButton variant="secondary" href="/login">
              Member Login
            </NavbarButton>
            <NavbarButton variant="primary" href="/register">
              Join Society
            </NavbarButton>
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
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300 hover:text-primary-600 transition-colors duration-200"
              >
                <span className="block font-medium">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="secondary"
                className="w-full"
                href="/login"
              >
                Member Login
              </NavbarButton>
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
                href="/register"
              >
                Join Society
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}
