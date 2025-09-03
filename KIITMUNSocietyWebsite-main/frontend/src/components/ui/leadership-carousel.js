'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Carousel from '@/components/ui/carousel';
import BlogDetailModal from '@/components/ui/blog-detail-modal';

// Static leadership data using local images
const leadershipData = [
  {
    id: 1,
    title: "Sarah Johnson",
    role: "President",
    subtitle: "Leading the MUN Society to Excellence",
    image: "/images/leadership/president.jpg",
    content: `Sarah Johnson serves as the President of KIIT MUN Society, bringing exceptional leadership and diplomatic expertise to our organization. With over 3 years of MUN experience, she has represented various countries in international conferences and has been instrumental in organizing our flagship events.

Under her leadership, the society has grown to become one of the most active and recognized MUN societies in the region. Sarah's vision focuses on creating inclusive diplomatic discussions and fostering global awareness among students.

Her academic background in International Relations and her passion for global affairs make her an ideal leader for guiding our society towards new heights of excellence.`,
    achievements: [
      "Best Delegate at Harvard MUN 2023",
      "Outstanding Leadership Award",
      "Organized 5+ successful MUN conferences"
    ],
    contact: "president@kiitmun.org"
  },
  {
    id: 2,
    title: "Michael Chen",
    role: "Vice President",
    subtitle: "Driving Innovation in Diplomatic Education",
    image: "/images/leadership/vice-president.jpg",
    content: `Michael Chen, our Vice President, brings a unique perspective to diplomatic education through his innovative approach to MUN training and development. His technical background combined with his passion for international affairs has revolutionized our training programs.

Michael has been instrumental in developing our digital platforms for MUN simulations and has introduced cutting-edge technologies to enhance the delegate experience. His leadership in organizing virtual conferences during challenging times showcased his adaptability and forward-thinking approach.

With experience in both crisis committees and general assemblies, Michael ensures that our society remains at the forefront of MUN innovation while maintaining the traditional values of diplomatic discourse.`,
    achievements: [
      "Innovation in MUN Technology Award",
      "Best Crisis Director - Regional MUN 2023",
      "Developed Virtual MUN Platform"
    ],
    contact: "vp@kiitmun.org"
  },
  {
    id: 3,
    title: "Priya Sharma",
    role: "Secretary General",
    subtitle: "Orchestrating Excellence in MUN Operations",
    image: "/images/leadership/secretary-general.jpg",
    content: `Priya Sharma serves as our Secretary General, overseeing all operational aspects of the KIIT MUN Society. Her meticulous attention to detail and exceptional organizational skills ensure that every event runs smoothly and efficiently.

With extensive experience in chairing various committees, Priya brings deep knowledge of parliamentary procedure and diplomatic protocol. She has been responsible for maintaining the high standards of our conferences and ensuring that delegates receive the best possible MUN experience.

Her commitment to excellence and her ability to manage complex logistics while maintaining a welcoming environment for all participants makes her an invaluable leader in our organization.`,
    achievements: [
      "Best Chair - KIIT MUN 2023",
      "Excellence in Operations Award",
      "Managed 500+ delegate conferences"
    ],
    contact: "sg@kiitmun.org"
  },
  {
    id: 4,
    title: "David Williams",
    role: "Director of Training",
    subtitle: "Developing Tomorrow's Diplomats",
    image: "/images/leadership/training-director.jpg",
    content: `David Williams leads our training and development initiatives, focusing on building the next generation of skilled diplomats and global leaders. His comprehensive training programs have helped hundreds of students develop their public speaking, negotiation, and diplomatic skills.

David's approach to MUN education emphasizes practical application of international relations theory, ensuring that our members gain real-world understanding of global issues. His workshops on crisis management, resolution writing, and diplomatic communication are highly sought after.

His dedication to continuous learning and improvement has established our society as a premier training ground for students interested in international affairs and diplomacy.`,
    achievements: [
      "Outstanding Trainer Recognition",
      "Developed Comprehensive MUN Curriculum",
      "Trained 200+ successful delegates"
    ],
    contact: "training@kiitmun.org"
  },
  {
    id: 5,
    title: "Emily Rodriguez",
    role: "Director of External Affairs",
    subtitle: "Building Global Connections",
    image: "/images/leadership/external-affairs.jpg",
    content: `Emily Rodriguez manages our external relations and partnerships, connecting KIIT MUN Society with organizations worldwide. Her networking skills and diplomatic acumen have secured partnerships with prestigious universities and international organizations.

Emily coordinates our participation in external conferences and manages relationships with other MUN societies globally. Her efforts have significantly enhanced our society's reputation and provided members with unprecedented opportunities for international exposure.

Her vision of creating a global network of young leaders has materialized through various exchange programs and collaborative initiatives that she has spearheaded.`,
    achievements: [
      "Established 20+ International Partnerships",
      "Diplomatic Excellence Award",
      "Organized International Exchange Program"
    ],
    contact: "external@kiitmun.org"
  },
  {
    id: 6,
    title: "Alex Thompson",
    role: "Treasurer",
    subtitle: "Managing Resources for Maximum Impact",
    image: "/images/leadership/treasurer.jpg",
    content: `Alex Thompson serves as our Treasurer, ensuring the financial health and sustainability of the KIIT MUN Society. His background in economics and finance, combined with his passion for MUN, brings a unique perspective to resource management.

Alex has implemented efficient financial systems that have allowed our society to expand its activities while maintaining fiscal responsibility. His strategic approach to budgeting has enabled us to provide more scholarships and reduce participation costs for students.

His transparency in financial operations and his commitment to maximizing the impact of every dollar spent has earned him the trust and respect of all society members.`,
    achievements: [
      "Increased Society Budget by 40%",
      "Financial Transparency Award",
      "Established Student Scholarship Fund"
    ],
    contact: "treasurer@kiitmun.org"
  }
];

const LeadershipCarousel = ({ 
  autoPlay = true, 
  autoPlayInterval = 7000,
  showControls = true,
  showIndicators = true,
  className = ''
}) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Transform leadership data for carousel format
  const carouselSlides = leadershipData.map(member => ({
    id: member.id,
    title: member.title,
    subtitle: member.role,
    button: "Know More",
    src: member.image,
    image_url: member.image,
    summary: member.subtitle,
    content: member.content,
    author: member.role,
    date: new Date().toISOString(), // Current date for consistency
    role: member.role,
    achievements: member.achievements,
    contact: member.contact
  }));

  const handleSlideClick = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMember(null);
  };

  return (
    <div className={className}>
      {/* Leadership Carousel */}
      <Carousel
        slides={carouselSlides}
        autoPlay={autoPlay}
        autoPlayInterval={autoPlayInterval}
        showControls={showControls}
        showIndicators={showIndicators}
        onSlideClick={handleSlideClick}
        className="shadow-2xl"
      />

      {/* Leadership Detail Modal */}
      <LeadershipDetailModal
        member={selectedMember}
        isOpen={showModal}
        onClose={handleCloseModal}
      />

      {/* Leadership Stats */}
      <div className="mt-6 text-center">
        <p className="text-secondary-600 text-sm">
          Meet our {leadershipData.length} dedicated leaders
          <span className="text-primary-600 font-medium"> • Shaping the future of diplomacy</span>
        </p>
      </div>
    </div>
  );
};

// Custom Leadership Detail Modal Component
const LeadershipDetailModal = ({ 
  member, 
  isOpen, 
  onClose,
  className = ''
}) => {
  // Close modal on escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !member) return null;

  const formatContent = (content) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    return paragraphs.map((paragraph, index) => (
      <p key={index} className="mb-4 leading-relaxed text-gray-700">
        {paragraph.trim()}
      </p>
    ));
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200 text-white hover:text-gray-200"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          
          {/* Header with Image */}
          <div className="relative h-64 md:h-80 lg:h-96">
            <Image
              src={member.image_url}
              alt={member.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            
            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-2">
                {member.role}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                {member.title}
              </h1>
              <p className="text-primary-100 text-lg mt-2">{member.subtitle}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            
            {/* Contact Information */}
            <div className="bg-primary-50 border-l-4 border-primary-600 p-4 mb-8 rounded-r-lg">
              <h3 className="font-semibold text-primary-900 mb-2">Contact Information</h3>
              <p className="text-primary-800">{member.contact}</p>
            </div>

            {/* Main Content */}
            <div className="prose prose-lg max-w-none mb-8">
              {formatContent(member.content)}
            </div>

            {/* Achievements */}
            {member.achievements && member.achievements.length > 0 && (
              <div className="bg-gradient-to-br from-secondary-50 to-primary-50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-secondary-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-primary-600 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Key Achievements
                </h3>
                <ul className="space-y-2">
                  {member.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-secondary-700">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  <span>KIIT MUN Society Leadership Team</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
                  >
                    Close
                  </button>
                  
                  <a
                    href={`mailto:${member.contact}`}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200 inline-flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
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

export default LeadershipCarousel;
