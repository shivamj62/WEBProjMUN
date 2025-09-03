'use client';

import { Users, Globe, Award, Target } from 'lucide-react';
import { ScrollAnimationWrapper } from '@/components/ui/scroll-animations';

const About = () => {
  const features = [
    {
      icon: <Globe className="w-8 h-8 text-primary-600" />,
      title: "Global Perspective",
      description: "Developing understanding of international relations and global issues through realistic simulations."
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: "Leadership Development",
      description: "Building essential leadership, negotiation, and public speaking skills through active participation."
    },
    {
      icon: <Award className="w-8 h-8 text-primary-600" />,
      title: "Academic Excellence",
      description: "Enhancing research abilities and critical thinking through comprehensive preparation and debate."
    },
    {
      icon: <Target className="w-8 h-8 text-primary-600" />,
      title: "Professional Network",
      description: "Connecting with like-minded students and building lasting relationships in the diplomatic community."
    }
  ];

  return (
    <section id="about" className="relative section-padding overflow-hidden">
      <div className="relative z-10 container-custom">
        {/* Section Header */}
        <ScrollAnimationWrapper className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            About KIIT MUN Society
          </h2>
          <div className="w-24 h-1 bg-primary-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            The KIIT Model United Nations Society is a premier student organization dedicated to fostering 
            diplomatic skills, global awareness, and leadership development through structured debate and simulation.
          </p>
        </ScrollAnimationWrapper>

        {/* Main Content */}
        <ScrollAnimationWrapper className="grid md:grid-cols-2 gap-16 items-center mb-16">
          {/* Text Content */}
          <div>
            <h3 className="text-3xl font-serif font-bold text-white mb-6">
              Our Mission
            </h3>
            <p className="text-lg text-gray-200 mb-6 leading-relaxed">
              At KIIT MUN Society, we believe in empowering students to become tomorrow's global leaders. 
              Through realistic simulations of the United Nations and other international bodies, we provide 
              a platform for students to engage with real-world issues and develop critical thinking skills.
            </p>
            <p className="text-lg text-gray-200 mb-6 leading-relaxed">
              Our society organizes regular conferences, workshops, and training sessions designed to enhance 
              participants' understanding of international relations, diplomacy, and current global affairs. 
              We strive to create an inclusive environment where students from all backgrounds can learn, 
              grow, and contribute to meaningful discussions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#blogs" className="btn-ghost">
                Read Our Latest Updates
              </a>
              <a href="#contact" className="btn-ghost">
                Join Our Community
              </a>
            </div>
          </div>

       
                <div className="relative max-w-md mx-auto">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                  <img 
                  src="/images/about-mun.png" 
                  alt="KIIT MUN Society members during conference"
                  className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-600 rounded-full opacity-10"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary-600 rounded-full opacity-10"></div>
          </div>
        </ScrollAnimationWrapper>

        {/* Features Grid */}
        <ScrollAnimationWrapper className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="card text-center hover:shadow-lg transition-shadow duration-300"
            >
              <div className="mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h4 className="text-xl font-serif font-semibold text-white mb-3">
                {feature.title}
              </h4>
              <p className="text-gray-200 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </ScrollAnimationWrapper>

        {/* Statistics */}
        <ScrollAnimationWrapper className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">5+</div>
            <div className="text-gray-300">Years Active</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">200+</div>
            <div className="text-gray-300">Members</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">15+</div>
            <div className="text-gray-300">Conferences</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">50+</div>
            <div className="text-gray-300">Awards Won</div>
          </div>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
};

export default About;
