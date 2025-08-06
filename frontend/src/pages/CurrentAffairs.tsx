import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ArrowRight, BookOpen, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface CurrentAffair {
  _id: string;
  title: string;
  content: string;
  summary: string;
  imageURL?: string;
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CurrentAffairs: React.FC = () => {
  const [currentAffairs, setCurrentAffairs] = useState<CurrentAffair[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories] = useState<string[]>([
    'National',
    'International',
    'Economics',
    'Politics',
    'Environment',
    'Science & Technology',
    'Defense',
    'Sports',
    'Awards & Honors',
    'Government Schemes'
  ]);

  const fetchCurrentAffairs = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedCategory === 'all' 
        ? '${process.env.REACT_APP_API_URL}/current-affairs'
        : `${process.env.REACT_APP_API_URL}/current-affairs?category=${encodeURIComponent(selectedCategory)}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.data) {
        setCurrentAffairs(data.data.currentAffairs || data.data);
      } else {
        throw new Error('Failed to fetch current affairs');
      }
    } catch (error) {
      console.error('Error fetching current affairs:', error);
      toast.error('Failed to load current affairs');
      setCurrentAffairs([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchCurrentAffairs();
  }, [fetchCurrentAffairs]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading current affairs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 mr-2 sm:mr-3" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Current Affairs</h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
              Stay updated with the latest news and current events important for competitive exam preparation
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Filter by category:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base w-full sm:w-auto"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs sm:text-sm text-gray-500">
            {currentAffairs.length} article{currentAffairs.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Current Affairs Grid */}
        {currentAffairs.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No current affairs found</h3>
            <p className="text-sm sm:text-base text-gray-600 px-4 sm:px-0">
              {selectedCategory === 'all'
                ? 'No current affairs articles are available yet.'
                : `No articles found in the ${selectedCategory} category.`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {currentAffairs.map((article) => (
              <div
                key={article._id}
                className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-200"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                    <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 w-fit">
                      {article.category}
                    </span>
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {formatDate(article.createdAt)}
                    </div>
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-3">
                    {article.summary || truncateContent(article.content)}
                  </p>
                  
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          +{article.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  <Link
                    to={`/current-affairs/${article._id}`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-xs sm:text-sm group"
                  >
                    Read full article
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-primary-600 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Want to stay ahead in your exam preparation?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Join our comprehensive courses with daily current affairs updates, expert analysis, and exam-focused content.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Explore Courses
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentAffairs;
