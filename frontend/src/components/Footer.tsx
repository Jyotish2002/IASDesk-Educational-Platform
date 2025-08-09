import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  BookOpen,
  Users,
  Award,
  Heart
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'All Courses', path: '/courses' },
    { name: 'UPSC Preparation', path: '/courses?category=UPSC' },
    { name: 'SSC Exams', path: '/courses?category=SSC' },
    { name: 'Banking Exams', path: '/courses?category=Banking' },
    { name: 'Class 5-12', path: '/courses?category=Class%205-12' },
    { name: 'Current Affairs', path: '/current-affairs' }
  ];

  const examCategories = [
    { name: 'UPSC Civil Services', path: '/courses?category=UPSC' },
    { name: 'SSC CGL/CHSL', path: '/courses?category=SSC' },
    { name: 'Banking PO/Clerk', path: '/courses?category=Banking' },
    { name: 'Railway Exams', path: '/courses?category=Railway' },
    { name: 'State PSC', path: '/courses?category=State%20PSC' },
    { name: 'Defense Exams', path: '/courses?category=Defense' }
  ];

  const supportLinks = [
    { name: 'Help Center', path: '/help' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Refund Policy', path: '/refund' },
    { name: 'FAQ', path: '/faq' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* About Section */}
      <section className="bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">About IASDesk</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Empowering millions of students across India to achieve their dreams through quality education
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">280K+ Students</h3>
              <p className="text-gray-400">Learning and growing with us</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">500+ Courses</h3>
              <p className="text-gray-400">Across various exam categories</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-600 rounded-full mb-4">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">150+ Faculty</h3>
              <p className="text-gray-400">Expert educators and mentors</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">95% Success</h3>
              <p className="text-gray-400">Student satisfaction rate</p>
            </div>
          </div>

          <div className="bg-gray-700 rounded-2xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  At IASDesk, we believe that quality education should be accessible to everyone. 
                  Our mission is to democratize learning by providing world-class educational content, 
                  expert guidance, and innovative technology to help students achieve their career goals.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                    <span className="text-sm">Affordable Quality Education</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                    <span className="text-sm">Expert Faculty Support</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                    <span className="text-sm">Personalized Learning</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-primary-400 rounded-full mr-3"></div>
                    <span className="text-sm">24/7 Student Support</span>
                  </div>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=300&fit=crop"
                  alt="Students learning"
                  className="rounded-xl shadow-lg mx-auto lg:mx-0"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center mb-6">
                <GraduationCap className="h-8 w-8 text-primary-400" />
                <span className="ml-2 text-2xl font-bold">IASDesk</span>
              </Link>
              <p className="text-gray-400 mb-6 leading-relaxed">
                India's premier online education platform for competitive exams. 
                Join millions of students in their journey to success.
              </p>
              <div className="flex space-x-4">
                <a href="http://facebook.com/profile.php?id=61550458162498&mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                {/* <a href="https://twitter.com/iasdesk" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a> */}
                <a href="http://instagram.com/iasdesk365" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://www.youtube.com/@iasdesk365" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.path} 
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exam Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Exam Categories</h3>
              <ul className="space-y-3">
                {examCategories.map((category, index) => (
                  <li key={index}>
                    <Link 
                      to={category.path} 
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Contact & Support</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-primary-400 mr-3" />
                  <span className="text-gray-400">support@iasdesk.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-primary-400 mr-3" />
                  <span className="text-gray-400">+91 8750221352</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary-400 mr-3 mt-1" />
                  <span className="text-gray-400">New Delhi, India</span>
                </div>
              </div>
              <ul className="space-y-3">
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <Link 
                      to={link.path} 
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} IASDesk. All rights reserved. Made with ❤️ for students across India.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-white transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
