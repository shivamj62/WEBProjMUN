"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";

export default function ResizableNavbarDemo() {
  const navItems = [
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
      name: "Contact",
      link: "#contact",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <NavbarButton variant="secondary">Login</NavbarButton>
            <NavbarButton variant="primary">Join MUN</NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
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
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                Login
              </NavbarButton>
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                Join MUN
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      <DemoContent />
    </div>
  );
}

const DemoContent = () => {
  return (
    <div className="container mx-auto p-8 pt-24">
      <h1 className="mb-4 text-center text-3xl font-bold">
        KIIT MUN Society - Resizable Navbar Demo
      </h1>
      <p className="mb-10 text-center text-sm text-zinc-500">
        Scroll down to see the navbar resize and transform. This demonstrates the{" "}
        <span className="font-medium">resizable</span> behavior of the navigation bar.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          {
            id: 1,
            title: "Model",
            width: "md:col-span-1",
            height: "h-60",
            bg: "bg-primary-100 dark:bg-primary-800",
          },
          {
            id: 2,
            title: "United",
            width: "md:col-span-2",
            height: "h-60",
            bg: "bg-primary-100 dark:bg-primary-800",
          },
          {
            id: 3,
            title: "Nations",
            width: "md:col-span-1",
            height: "h-60",
            bg: "bg-primary-100 dark:bg-primary-800",
          },
          {
            id: 4,
            title: "Diplomacy",
            width: "md:col-span-3",
            height: "h-60",
            bg: "bg-secondary-100 dark:bg-secondary-800",
          },
          {
            id: 5,
            title: "KIIT",
            width: "md:col-span-1",
            height: "h-60",
            bg: "bg-secondary-100 dark:bg-secondary-800",
          },
          {
            id: 6,
            title: "Leadership",
            width: "md:col-span-2",
            height: "h-60",
            bg: "bg-primary-100 dark:bg-primary-800",
          },
          {
            id: 7,
            title: "Global",
            width: "md:col-span-2",
            height: "h-60",
            bg: "bg-primary-100 dark:bg-primary-800",
          },
          {
            id: 8,
            title: "Debate",
            width: "md:col-span-1",
            height: "h-60",
            bg: "bg-secondary-100 dark:bg-secondary-800",
          },
          {
            id: 9,
            title: "International Relations",
            width: "md:col-span-2",
            height: "h-60",
            bg: "bg-secondary-100 dark:bg-secondary-800",
          },
          {
            id: 10,
            title: "Society",
            width: "md:col-span-1",
            height: "h-60",
            bg: "bg-primary-100 dark:bg-primary-800",
          },
        ].map((box) => (
          <div
            key={box.id}
            className={`${box.width} ${box.height} ${box.bg} flex items-center justify-center rounded-lg p-4 shadow-sm`}
          >
            <h2 className="text-xl font-medium text-center">{box.title}</h2>
          </div>
        ))}
      </div>
      
      {/* Add more content to demonstrate scrolling */}
      <div className="mt-16 space-y-8">
        <section className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">About Our MUN Society</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            The KIIT MUN Society is dedicated to fostering diplomatic skills and international awareness among students. 
            Through engaging simulations of United Nations proceedings, we provide a platform for intellectual growth 
            and global understanding.
          </p>
        </section>
        
        <section className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            To empower students with the skills of diplomacy, critical thinking, and public speaking while promoting 
            global citizenship and awareness of international affairs.
          </p>
        </section>
        
        <section className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Join Us</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Experience the thrill of international diplomacy and debate. Develop your leadership skills while 
            addressing some of the world's most pressing issues.
          </p>
        </section>
      </div>
    </div>
  );
};
