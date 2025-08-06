import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Clock, User, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

interface CurrentAffairDetailType {
  _id: string;
  title: string;
  content?: string;
  summary: string;
  imageURL?: string;
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CurrentAffairDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<CurrentAffairDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<CurrentAffairDetailType[]>([]);

  const fetchRelatedArticles = async (category: string, currentId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/current-affairs?category=${encodeURIComponent(category)}&limit=3`
      );
      const data = await response.json();

      if (data.success && data.data) {
        const articles = data.data.currentAffairs || data.data;
        // Filter out the current article and take only 3
        const filtered = articles.filter((a: CurrentAffairDetailType) => a._id !== currentId).slice(0, 3);
        setRelatedArticles(filtered);
      }
    } catch (error) {
      console.error('Error fetching related articles:', error);
    }
  };

  const fetchArticle = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/current-affairs/${id}`);
      const data = await response.json();

      if (data.success && data.data) {
        setArticle(data.data.currentAffair || data.data);
        // Fetch related articles from the same category
        const articleData = data.data.currentAffair || data.data;
        if (articleData.category) {
          fetchRelatedArticles(articleData.category, articleData._id);
        }
      } else {
        throw new Error('Article not found');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      toast.error('Failed to load article');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content?: string) => {
    // Basic formatting for paragraphs
    if (!content) {
      return <p className="mb-4 text-gray-700 leading-relaxed">No content available.</p>;
    }
    
    return content.split('\n').filter(para => para.trim()).map((paragraph, index) => (
      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
        {paragraph.trim()}
      </p>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/current-affairs"
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Current Affairs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/current-affairs"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Current Affairs
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Article Header */}
          <div className="p-8 pb-6">
            <div className="flex items-center justify-between mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {article.category}
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(article.createdAt)}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>

            {article.summary && (
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                {article.summary}
              </p>
            )}

            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Article Body */}
          <div className="px-8 pb-8">
            <div className="prose prose-lg max-w-none">
              {formatContent(article.content)}
            </div>
          </div>

          {/* Article Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                Last updated: {formatDate(article.updatedAt)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <User className="h-4 w-4 mr-1" />
                Published by Admin
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle._id}
                  to={`/current-affairs/${relatedArticle._id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-200"
                >
                  <div className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mb-2">
                      {relatedArticle.category}
                    </span>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatDate(relatedArticle.createdAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-primary-600 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Stay Updated with Daily Current Affairs
          </h3>
          <p className="text-primary-100 mb-6">
            Join our comprehensive courses and never miss important current affairs updates
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Explore Our Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CurrentAffairDetail;
