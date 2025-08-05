import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp,
  Star,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import testimonialsData from '../data/testimonials';

const Home: React.FC = () => {
  // Use first 3 testimonials for the home page
  const testimonials = testimonialsData.slice(0, 3);

  const examCategories = [
    {
      title: 'UPSC Civil Services',
      description: 'Live Google Meet sessions with expert faculty for IAS, IPS, IFS preparation',
      image: '/api/placeholder/300/200',
      courses: '25+ Courses',
      students: '50K+ Students',
      link: '/courses/upsc',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Class 5-12',
      description: 'Interactive online classes with one year access for complete school education',
      image: '/api/placeholder/300/200',
      courses: '40+ Courses',
      students: '1L+ Students',
      link: '/courses/school',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      title: 'SSC Exams',
      description: 'SSC CGL, CHSL, MTS, CPO and other competitive exams',
      image: '/api/placeholder/300/200',
      courses: '15+ Courses',
      students: '30K+ Students',
      link: '/courses/ssc',
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Banking',
      description: 'IBPS PO, Clerk, SBI, RBI and other banking exams',
      image: '/api/placeholder/300/200',
      courses: '20+ Courses',
      students: '25K+ Students',
      link: '/courses/banking',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      title: 'State PSC',
      description: 'State Public Service Commission exams for all states',
      image: '/api/placeholder/300/200',
      courses: '30+ Courses',
      students: '40K+ Students',
      link: '/courses/state-psc',
      gradient: 'from-teal-500 to-cyan-600'
    },
    {
      title: 'JEE & NEET',
      description: 'Engineering and Medical entrance exam preparation',
      image: '/api/placeholder/300/200',
      courses: '12+ Courses',
      students: '80K+ Students',
      link: '/courses/jee-neet',
      gradient: 'from-pink-500 to-rose-600'
    }
  ];

  const stats = [
    { label: 'Active Students', value: '5L+', icon: Users },
    { label: 'Expert Faculty', value: '500+', icon: Award },
    { label: 'Courses Available', value: '200+', icon: BookOpen },
    { label: 'Success Rate', value: '85%', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Ace Your
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> Competitive Exams</span>
                </h1>
                <p className="text-xl text-gray-200 leading-relaxed">
                  Join India's most trusted online education platform. Get expert guidance, 
                  comprehensive courses, and achieve your career goals with IASDesk.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-primary-600 bg-white rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Explore Courses
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border-2 border-white rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-200"
                >
                  Start Free Trial
                </Link>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span>5 Lakh+ Students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span>4.8+ Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-blue-400" />
                  <span>95% Success Rate</span>
                </div>
              </div>
            </div>

            <div className="lg:text-right">
              <div className="relative inline-block w-full">
                <div className="w-full">
                  <div className="aspect-video bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
                    <div className="h-full rounded-xl overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/-O5_0_KUYM8?si=Hxg13n75YsWq0uol&rel=0&modestbranding=1&showinfo=0"
                        title="IASDesk Demo Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-xl"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Categories Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Exam Category
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From UPSC to school education, we cover all major competitive exams 
              with expert faculty and comprehensive study material.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {examCategories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className="p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${category.gradient} text-white rounded-xl mb-6`}>
                    <BookOpen className="h-8 w-8" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {category.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <span className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {category.courses}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {category.students}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-primary-600 group-hover:text-primary-700 font-medium">
                    Explore Courses
                    <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Hear from our successful students who achieved their dreams with IASDesk
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-primary-600 font-medium">{testimonial.exam}</p>
                    <p className="text-sm text-gray-500">{testimonial.year}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-600 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Success Journey?
          </h2>
          <p className="text-xl text-gray-200 mb-8 leading-relaxed">
            Join thousands of successful students and get access to expert-designed courses, 
            live classes, and comprehensive study material.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/courses"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-primary-600 bg-white rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg"
            >
              Browse All Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border-2 border-white rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-200"
            >
              Get Started Free
            </Link>
          </div>
          
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              <span>7-Day Free Trial</span>
            </div>
            <div className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              <span>100% Quality Assured</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Expert Faculty</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
