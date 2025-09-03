'use client';

import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook } from 'lucide-react';
import Image from 'next/image';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Our Team', href: '#team' },
    { name: 'Blogs', href: '#blogs' },
    { name: 'Resources', href: '#resources' },
    { name: 'Contact', href: '#contact' }
  ];

  const socialLinks = [
    {
      icon: <Instagram className="w-5 h-5" />,
      name: "Instagram",
      url: "https://instagram.com/kiitmun",
      color: "hover:text-pink-400"
    },
    {
      icon: <Linkedin className="w-5 h-5" />,
      name: "LinkedIn", 
      url: "https://linkedin.com/company/kiitmun",
      color: "hover:text-blue-400"
    },
    {
      icon: <Facebook className="w-5 h-5" />,
      name: "Facebook",
      url: "https://facebook.com/kiitmun", 
      color: "hover:text-blue-300"
    }
  ];

  return (
    <footer className="bg-transparent text-white">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Image
                  src="/images/logo/kiit-mun-logo.png"
                  alt="KIIT MUN Society"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <div className="font-serif font-bold text-xl">KIIT MUN Society</div>
                  <div className="text-sm text-secondary-400">Model United Nations</div>
                </div>
              </div>
              <p className="text-secondary-300 mb-6 leading-relaxed max-w-md">
                Empowering students to become global leaders through diplomatic excellence, 
                structured debate, and international relations. Join us in fostering understanding 
                and building bridges across cultures.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-secondary-300">
                  <Mail className="w-4 h-4 mr-3 text-primary-400" />
                  <a href="mailto:societykiitmun@gmail.com" className="hover:text-primary-400 transition-colors">
                    societykiitmun@gmail.com
                  </a>
                </div>
                <div className="flex items-center text-secondary-300">
                  <Phone className="w-4 h-4 mr-3 text-primary-400" />
                  <a href="tel:+919073313566" className="hover:text-primary-400 transition-colors">
                    +91 9073313566
                  </a>
                </div>
                <div className="flex items-start text-secondary-300">
                  <MapPin className="w-4 h-4 mr-3 mt-1 text-primary-400 flex-shrink-0" />
                  <span>KIIT University, Bhubaneswar, Odisha 751024</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-serif font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-secondary-300 hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect With Us */}
            <div>
              <h3 className="text-xl font-serif font-semibold mb-6">Connect With Us</h3>
              <div className="flex space-x-4 mb-6">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 bg-secondary-800 rounded-lg text-secondary-300 transition-all duration-300 hover:bg-secondary-700 ${social.color}`}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              <div className="text-secondary-300">
                <h4 className="font-semibold mb-2">Office Hours</h4>
                <div className="text-sm space-y-1">
                  <div>Mon - Fri: 10:00 AM - 4:00 PM</div>
                  <div>Saturday: 10:00 AM - 2:00 PM</div>
                  <div>Sunday: Closed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-secondary-800 py-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-serif font-semibold mb-2">Stay Updated</h3>
              <p className="text-secondary-300">
                Get the latest updates about MUN conferences, workshops, and events.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="btn-ghost whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-secondary-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-secondary-400 text-sm">
              © {currentYear} KIIT Model United Nations Society. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="/privacy" className="text-secondary-400 hover:text-primary-400 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-secondary-400 hover:text-primary-400 transition-colors">
                Terms of Service
              </a>
              <a href="/sitemap" className="text-secondary-400 hover:text-primary-400 transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
