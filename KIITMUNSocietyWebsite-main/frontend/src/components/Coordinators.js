'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Linkedin, Mail, Phone, X } from 'lucide-react';
import { FocusCards } from '@/components/ui/focus-cards';
import { ScrollAnimationWrapper } from '@/components/ui/scroll-animations';

const Coordinators = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const teamMembers = [
    {
      id: 1,
      name: "Shivam Jaiswal",
      role: "",
      department: "Coordinator",
      email: "shivam.jaiswal@kiit.ac.in",
      phone: "+91 9073313566",
      linkedin: "https://www.linkedin.com/in/shivam-jaiswal-15151b241/",
      image: "/images/team/shivam.jpg",
      description: " To many, he is an enigma, a leader whose principles stand tall, yet whose spirit roams unbound. You may meet him in the most unexpected places, but every encounter is a story, every glance a glimpse into a life driven by purpose, passion, and an unshakable belief in the extraordinary.",
      achievements: [
      ]
    },
    {
      id: 2,
      name: "Bhargav Kishore",
      role: "",
      department: "Coordinator",
      email: "2229028@kiit.ac.in",
      phone: "9987146940",
      linkedin: "https://linkedin.com/in/bhargavkishore",
      image: "/images/team/bhargav.png",
      description: "Bhargav has this uncanny mix of strategy, quick thinking, and just the right amount of charm to turn even the trickiest committee sessions around. He's been through enough conferences to know that it's not just about winning awards, it's about making sure everyone in the room feels heard and included",
      achievements: [
      ]
    },
    {
      id: 3,
      name: "Hriday Kandoi",
      role: "",
      department: "Asst. Coordinator",
      email: "23053734@kiit.ac.in",
      phone: "+918853204688",
      linkedin: "http://www.linkedin.com/in/hriday-kandoi",
      image: "/images/team/hriday.jpeg",
      description: "Hriday Kandoi lives by the motto To be or not to be. An eternal optimist with an infectious energy, he brings a unique blend of hard work, wit, and charisma to everything he pursues. Currently pursuing his B.Tech at Kalinga Institute of Industrial Technology Beyond academics, Hriday is a passionate photographer with a philosophical outlook, always seeking meaning through moments and memories.",
      achievements: [
      ]
    },
    {
      id: 4,
      name: "Daksh Jain",
      role: "",
      department: "Asst. Coordinator",
      email: "23053120@kiit.ac.in",
      phone: "+91 9717456098",
      linkedin: "http://www.linkedin.com/in/daksh-jain-219378299",
      image: "/images/team/daksh.jpg",
      description: "His journey isn't just about trophies (though there are plenty!), it's about consistent commitment to structured debate, crystal-clear argumentation, and a deep respect for diverse perspectives",
      achievements: [
      ]
    },
    {
      id: 5,
      name: "Subhrasweta Hota",
      role: "",
      department: "Chief Advisor",
      email: "24120017@kiit.ac.in",
      phone: "+91 82805 47899",
      linkedin: "https://www.linkedin.com/in/subhrasweta-hota-a9785230a",
      image: "/images/team/shivani.png",
      description: "Known for her ability to inspire, guide, and bring out the best in those she works with, she exemplifies the art of good leadership. Currently pursuing her Master's in Psychology, she finds intriguing parallels between global affairs and the human mind — because every resolution, after all, begins with understanding how people think",
      achievements: [
      ]
    }
  ];

    


  // Transform team data for focus cards format
  const cards = teamMembers.map(member => ({
    title: member.name,
    src: member.image,
    ...member // include all data for modal
  }));

  const handleCardClick = (index) => {
    setSelectedMember(cards[index]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMember(null);
  };

  return (
    <section id="team" className="relative section-padding overflow-hidden">
      <div className="relative z-10 container-custom">
        {/* Section Header */}
        <ScrollAnimationWrapper className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Our Leadership Team
          </h2>
          <div className="w-24 h-1 bg-primary-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Meet the dedicated individuals who guide and inspire our MUN community towards excellence 
            in diplomacy and international relations.
          </p>
        </ScrollAnimationWrapper>

        {/* Coordinators Focus Cards */}
        <ScrollAnimationWrapper className="max-w-5xl mx-auto">
          <FocusCards
            cards={cards}
            onCardClick={handleCardClick}
          />

          {/* Team Stats */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Meet our Core
              <span className="text-blue-400 font-medium"> • Leading with passion and expertise</span>
            </p>
          </div>
        </ScrollAnimationWrapper>

        {/* Coordinator Detail Modal */}
        <CoordinatorDetailModal
          member={selectedMember}
          isOpen={showModal}
          onClose={handleCloseModal}
        />

        {/* Call to Action */}
        <ScrollAnimationWrapper className="mt-16 text-center">
          <div className="border border-gray-700 rounded-2xl p-8 bg-transparent hover:bg-gray-800/20 transition-all duration-200">
            <h3 className="text-3xl font-serif font-bold mb-4 text-white">
              Ready to Join Our Team?
            </h3>
            <p className="text-xl mb-6 text-gray-200 leading-relaxed">
              We're always looking for passionate individuals to join our mission of promoting global understanding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#contact" className="btn-ghost text-lg px-8 py-3">
                Get In Touch
              </a>
              <a href="#resources" className="btn-ghost text-lg px-8 py-3">
                Learn More
              </a>
            </div>
          </div>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
};

// Custom Coordinator Detail Modal Component
const CoordinatorDetailModal = ({ 
  member, 
  isOpen, 
  onClose,
  className = ''
}) => {
  // Close modal on escape key with hydration-safe event listeners
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen && typeof window !== 'undefined') {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !member) return null;

  const formatContent = (content) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    return paragraphs.map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed text-gray-300">
        {paragraph.trim()}
      </p>
    ));
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`} suppressHydrationWarning>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-ghost absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 text-white hover:text-gray-200"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          
          {/* Header with Portrait Image */}
          <div className="relative h-80 md:h-96 lg:h-[450px] flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="relative w-48 h-64 md:w-56 md:h-72 lg:w-64 lg:h-80 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={member.src}
                alt={member.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Decorative Background Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-primary-600 rounded-full opacity-30"></div>
            <div className="absolute bottom-10 right-10 w-16 h-16 bg-gray-600 rounded-full opacity-30"></div>
            <div className="absolute top-1/2 left-8 w-12 h-12 bg-primary-500 rounded-full opacity-20"></div>
            
            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/70 to-transparent">
              <div className="text-center">
                <div className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium inline-block mb-2">
                  {member.role}
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {member.title}
                </h1>
                <p className="text-primary-100 text-lg mt-2">{member.department}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            
            {/* Contact Information */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800 border-l-4 border-primary-500 p-4 rounded-r-lg">
                <div className="flex items-center text-white mb-2">
                  <Mail className="w-4 h-4 mr-2" />
                  <h3 className="font-semibold text-sm">Email</h3>
                </div>
                <a href={`mailto:${member.email}`} className="text-gray-300 text-sm hover:text-primary-400 transition-colors">
                  {member.email}
                </a>
              </div>
              
              <div className="bg-gray-800 border-l-4 border-gray-600 p-4 rounded-r-lg">
                <div className="flex items-center text-white mb-2">
                  <Phone className="w-4 h-4 mr-2" />
                  <h3 className="font-semibold text-sm">Phone</h3>
                </div>
                <a href={`tel:${member.phone}`} className="text-gray-300 text-sm hover:text-gray-400 transition-colors">
                  {member.phone}
                </a>
              </div>
              
              <div className="bg-gray-800 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <div className="flex items-center text-white mb-2">
                  <Linkedin className="w-4 h-4 mr-2" />
                  <h3 className="font-semibold text-sm">LinkedIn</h3>
                </div>
                <a 
                  href={member.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 text-sm hover:text-blue-400 transition-colors"
                >
                  View Profile
                </a>
              </div>
            </div>

            {/* Main Content */}
            <div className="prose prose-lg max-w-none mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">About {member.title}</h2>
              {formatContent(member.description || 'No description available.')}
            </div>

            {/* Achievements */}
            {member.achievements && member.achievements.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 text-primary-400 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Key Achievements & Expertise
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {member.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-300">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-6 border-t border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-gray-400">
                  <span>KIIT MUN Society Leadership Team</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onClose}
                    className="btn-ghost px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg font-medium transition-colors duration-200"
                  >
                    Close
                  </button>
                  
                  <a
                    href={`mailto:${member.email}`}
                    className="btn-ghost px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200 inline-flex items-center"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coordinators;
