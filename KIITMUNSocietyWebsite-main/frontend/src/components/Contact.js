'use client';

import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  Instagram, 
  Linkedin, 
  Facebook,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { ScrollAnimationWrapper } from '@/components/ui/scroll-animations';

const Contact = () => {
  const form = useRef();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Map EmailJS field names to state field names
    const fieldMap = {
      'from_name': 'name',
      'from_email': 'email',
      'subject': 'subject',
      'message': 'message'
    };
    
    const stateFieldName = fieldMap[name] || name;
    setFormData(prev => ({ ...prev, [stateFieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 
        !process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 
        !process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID) {
      console.error('EmailJS configuration is incomplete. Please check environment variables.');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    // Check for placeholder values
    if (process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' ||
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID') {
      console.error('Please configure your EmailJS Service ID and Template ID in .env.local');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    try {
      // Initialize EmailJS with your public key
      emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);
      
      // Send email using EmailJS
      const result = await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        form.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );
      
      console.log('Email sent successfully:', result.text);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset the form
      if (form.current) {
        form.current.reset();
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      primary: "munclub@kiit.ac.in",
      secondary: "societykiitmun@gmail.com",
      description: "For general inquiries and information",
      link: "mailto:munclub@kiit.ac.in"
    },
    {
      icon: Phone,
      title: "Call Us",
      primary: "+91 674 272 8637",
      secondary: "+91 XXXXX XXXXX",
      description: "Available during office hours",
      link: "tel:+916742728637"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      primary: "KIIT University",
      secondary: "Bhubaneswar, Odisha 751024",
      description: "Campus Location",
      link: "https://maps.google.com/?q=KIIT+University+Bhubaneswar"
    },
    {
      icon: Clock,
      title: 'Office Hours',
      primary: 'Monday - Friday: 10:00 AM - 6:00 PM',
      secondary: 'Saturday: 10:00 AM - 2:00 PM',
      description: 'Sunday: Closed'
    }
  ];

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com/kiitmun',
      color: 'bg-pink-600 hover:bg-pink-700'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://linkedin.com/company/kiitmun',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: 'https://facebook.com/kiitmun',
      color: 'bg-blue-800 hover:bg-blue-900'
    }
  ];

  const subjectOptions = [
    'General Inquiry',
    'Membership Information',
    'Event Registration',
    'Partnership Opportunity',
    'Media Inquiry',
    'Technical Support',
    'Other'
  ];

  return (
    <section id="contact" className="relative py-20 bg-gray-900">
      <div className="container-custom">
        {/* Section Header */}
        <ScrollAnimationWrapper className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
            Get In Touch
          </h2>
          <div className="w-24 h-1 bg-primary-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ready to join our diplomatic community or have questions about MUN? 
            We'd love to hear from you and help you get started.
          </p>
        </ScrollAnimationWrapper>

        <ScrollAnimationWrapper className="grid lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h3 className="text-3xl font-serif font-bold text-white mb-8">
              Connect With Us
            </h3>
            
            {/* Contact Cards */}
            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 group">
                  {info.link ? (
                    <a
                      href={info.link}
                      target={info.link.startsWith('http') ? '_blank' : undefined}
                      rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-start space-x-4"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                        <info.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">
                          {info.title}
                        </h4>
                        <p className="text-gray-300 font-medium">{info.primary}</p>
                        <p className="text-gray-400">{info.secondary}</p>
                        <p className="text-sm text-gray-500 mt-1">{info.description}</p>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-primary-400">
                        <info.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">
                          {info.title}
                        </h4>
                        <p className="text-gray-300 font-medium">{info.primary}</p>
                        <p className="text-gray-400">{info.secondary}</p>
                        <p className="text-sm text-gray-500 mt-1">{info.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Social Media */}
            <div className="mb-8">
              <h4 className="text-xl font-serif font-semibold text-white mb-4">
                Follow Us
              </h4>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 rounded-lg text-white transition-colors duration-300 ${social.color}`}
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Contact Options */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">
                Quick Contact
              </h4>
              <div className="space-y-3">
                <a
                  href="mailto:munclub@kiit.ac.in"
                  className="flex items-center text-primary-400 hover:text-primary-300 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-3" />
                  Send us an email
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
                <a
                  href="tel:+916742728637"
                  className="flex items-center text-primary-400 hover:text-primary-300 transition-colors"
                >
                  <Phone className="w-4 h-4 mr-3" />
                  Call us directly
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
                <a
                  href="https://wa.me/916742728637"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary-400 hover:text-primary-300 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  WhatsApp us
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="card">
              <h3 className="text-3xl font-serif font-bold text-secondary-900 mb-8">
                Send Us a Message
              </h3>

              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Send className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-green-800 font-medium">Message sent successfully!</h4>
                      <p className="text-green-700 text-sm">
                        Thank you for contacting us. We'll get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-red-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-red-800 font-medium">Failed to send message</h4>
                      <p className="text-red-700 text-sm">
                        {process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || 
                         process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' 
                          ? 'Email service is not configured yet. Please contact us directly via email or phone.'
                          : 'Please try again or contact us directly via email or phone.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="from_name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="from_email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-secondary-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select a subject</option>
                    {subjectOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-secondary-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="input-field resize-y"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-ghost border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white w-full flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm text-secondary-600 text-center">
                  By submitting this form, you agree to our privacy policy and terms of service.
                </p>
              </form>
            </div>
          </div>
        </ScrollAnimationWrapper>

        {/* Join MUN Community CTA */}
        <ScrollAnimationWrapper className="mt-16">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white text-center">
            <h3 className="text-3xl font-serif font-bold mb-4">
              Join the MUN Community
            </h3>
            <p className="text-xl mb-6 text-primary-100 max-w-2xl mx-auto">
              Interested in becoming a member? Learn more about our society and how you can get involved 
              in Model United Nations activities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#about" className="btn-ghost border border-gray-300 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500">
                Learn More About Us
              </a>
              <a href="/auth/register" className="btn-ghost border border-white text-white hover:bg-white hover:text-primary-600">
                Become a Member
              </a>
            </div>
          </div>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
};

export default Contact;
