import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI, currentAffairsAPI } from '../../services/api';

interface CurrentAffairAdmin {
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

interface CreateCurrentAffairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingArticle?: CurrentAffairAdmin | null;
}

const CreateCurrentAffairModal: React.FC<CreateCurrentAffairModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingArticle
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    tags: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingArticle) {
      setFormData({
        title: editingArticle.title,
        content: editingArticle.content,
        summary: editingArticle.summary,
        category: editingArticle.category,
        tags: editingArticle.tags.join(', '),
        isActive: editingArticle.isActive
      });
    } else {
      setFormData({
        title: '',
        content: '',
        summary: '',
        category: '',
        tags: '',
        isActive: true
      });
    }
  }, [editingArticle, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestBody = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        isActive: formData.isActive
      };

      console.log('Request body:', requestBody);

      let response;
      if (editingArticle) {
        response = await adminAPI.updateCurrentAffair(editingArticle._id, requestBody);
      } else {
        response = await adminAPI.createCurrentAffair(requestBody);
      }

      console.log('Response data:', response.data);

      if (response.data.success) {
        toast.success(editingArticle ? 'Article updated successfully!' : 'Article created successfully!');
        onSuccess();
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to save article');
      }
    } catch (error: any) {
      console.error('Error saving article:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      toast.error(`Failed to save article: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingArticle ? 'Edit Current Affair' : 'Create New Current Affair'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary *
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select Category</option>
              <option value="National">National</option>
              <option value="International">International</option>
              <option value="Economics">Economics</option>
              <option value="Politics">Politics</option>
              <option value="Environment">Environment</option>
              <option value="Science & Technology">Science & Technology</option>
              <option value="Defense">Defense</option>
              <option value="Sports">Sports</option>
              <option value="Awards & Honors">Awards & Honors</option>
              <option value="Government Schemes">Government Schemes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., UPSC, Current Affairs, Government"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active (visible to users)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingArticle ? 'Update Article' : 'Create Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminCurrentAffairs: React.FC = () => {
  const [articles, setArticles] = useState<CurrentAffairAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<CurrentAffairAdmin | null>(null);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await adminAPI.getAdminCurrentAffairs(1, 50); // Get first 50 articles
      
      if (response.data.success && response.data.data) {
        let articles = response.data.data.currentAffairs || response.data.data;
        
        // Filter by category if selected
        if (selectedCategory !== 'all') {
          articles = articles.filter(article => article.category === selectedCategory);
        }
        
        setArticles(articles as CurrentAffairAdmin[]);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const response = await adminAPI.deleteCurrentAffair(id);
      
      if (response.data.success) {
        toast.success('Article deleted successfully');
        fetchArticles();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Error deleting article:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete article';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (article: CurrentAffairAdmin) => {
    setEditingArticle(article);
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setEditingArticle(null);
    setShowModal(true);
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Current Affairs Management</h1>
          <p className="text-gray-600">Manage current affairs articles for public viewing</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Article
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="National">National</option>
              <option value="International">International</option>
              <option value="Economics">Economics</option>
              <option value="Politics">Politics</option>
              <option value="Environment">Environment</option>
              <option value="Science & Technology">Science & Technology</option>
              <option value="Defense">Defense</option>
              <option value="Sports">Sports</option>
              <option value="Awards & Honors">Awards & Honors</option>
              <option value="Government Schemes">Government Schemes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading articles...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600">No articles found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <tr key={article._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                          {article.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {article.summary}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {article.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(article.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <a
                          href={`/current-affairs/${article._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleEdit(article)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(article._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <CreateCurrentAffairModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingArticle(null);
        }}
        onSuccess={fetchArticles}
        editingArticle={editingArticle}
      />
    </div>
  );
};

export default AdminCurrentAffairs;
