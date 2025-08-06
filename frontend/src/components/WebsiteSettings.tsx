import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Save,
  RefreshCw,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

interface WebsiteConfig {
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
  };
  features: {
    enableRegistration: boolean;
    enablePayment: boolean;
    enableLiveClasses: boolean;
    enableCurrentAffairs: boolean;
    enableTestSeries: boolean;
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
  analytics: {
    googleAnalyticsId: string;
    facebookPixelId: string;
  };
}

const WebsiteSettings: React.FC = () => {
  const [config, setConfig] = useState<WebsiteConfig>({
    siteName: 'IASDesk',
    siteDescription: 'Your Complete UPSC Preparation Platform',
    siteKeywords: 'UPSC, IAS, Civil Services, Online Courses, Current Affairs',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    contactEmail: 'info@iasdesk.com',
    contactPhone: '+91 9876543210',
    address: 'New Delhi, India',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: ''
    },
    seo: {
      metaTitle: 'IASDesk - Complete UPSC Preparation Platform',
      metaDescription: 'Prepare for UPSC Civil Services with our comprehensive courses, current affairs, and expert guidance.',
      ogImage: ''
    },
    features: {
      enableRegistration: true,
      enablePayment: true,
      enableLiveClasses: true,
      enableCurrentAffairs: true,
      enableTestSeries: true
    },
    maintenance: {
      enabled: false,
      message: 'We are currently under maintenance. Please check back later.'
    },
    analytics: {
      googleAnalyticsId: '',
      facebookPixelId: ''
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'social' | 'seo' | 'features' | 'maintenance' | 'analytics'>('general');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }
      
      const response = await fetch('${process.env.REACT_APP_API_URL}/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setConfig(prev => ({ ...prev, ...data.data }));
          toast.success('Settings loaded successfully from server');
        }
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      console.error('Error loading settings from server:', error);
      toast('Using default settings', { icon: 'ℹ️' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }
      
      const response = await fetch('${process.env.REACT_APP_API_URL}/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Settings saved successfully!');
        } else {
          throw new Error(data.message || 'Failed to save settings');
        }
      } else {
        throw new Error('Server is not responding');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (section: keyof WebsiteConfig, field: string, value: any) => {
    setConfig(prev => {
      const sectionData = prev[section];
      if (typeof sectionData === 'object' && sectionData !== null) {
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [section]: value
      };
    });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'social', label: 'Social Media', icon: Facebook },
    { id: 'seo', label: 'SEO', icon: Eye },
    { id: 'features', label: 'Features', icon: Settings },
    { id: 'maintenance', label: 'Maintenance', icon: RefreshCw },
    { id: 'analytics', label: 'Analytics', icon: Eye }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Settings className="h-6 w-6 mr-2 text-primary-600" />
                Website Settings
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure your website settings and preferences
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadSettings}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
              
              {/* Live Preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">Live Preview</h4>
                <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
                  <div className="flex items-center space-x-3 mb-3">
                    {config.logoUrl ? (
                      <img src={config.logoUrl} alt="Logo" className="h-8 w-8 rounded" />
                    ) : (
                      <div 
                        className="h-8 w-8 rounded flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: config.primaryColor }}
                      >
                        {config.siteName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900">{config.siteName}</h4>
                      <p className="text-sm text-gray-600">{config.siteDescription}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="px-3 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      Primary Button
                    </button>
                    <button 
                      className="px-3 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: config.secondaryColor }}
                    >
                      Secondary Button
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={config.siteName}
                    onChange={(e) => setConfig(prev => ({ ...prev, siteName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-12 h-10 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={config.siteDescription}
                    onChange={(e) => setConfig(prev => ({ ...prev, siteDescription: e.target.value }))}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    value={config.siteKeywords}
                    onChange={(e) => setConfig(prev => ({ ...prev, siteKeywords: e.target.value }))}
                    placeholder="UPSC, IAS, Civil Services, Online Courses"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={config.logoUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Favicon URL
                  </label>
                  <input
                    type="url"
                    value={config.faviconUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, faviconUrl: e.target.value }))}
                    placeholder="https://example.com/favicon.ico"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={config.contactEmail}
                    onChange={(e) => setConfig(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={config.contactPhone}
                    onChange={(e) => setConfig(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Address
                  </label>
                  <textarea
                    value={config.address}
                    onChange={(e) => setConfig(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Social Media Links</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Facebook className="h-4 w-4 inline mr-1" />
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={config.socialMedia.facebook}
                    onChange={(e) => updateConfig('socialMedia', 'facebook', e.target.value)}
                    placeholder="https://facebook.com/iasdesk"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Twitter className="h-4 w-4 inline mr-1" />
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={config.socialMedia.twitter}
                    onChange={(e) => updateConfig('socialMedia', 'twitter', e.target.value)}
                    placeholder="https://twitter.com/iasdesk"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Instagram className="h-4 w-4 inline mr-1" />
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={config.socialMedia.instagram}
                    onChange={(e) => updateConfig('socialMedia', 'instagram', e.target.value)}
                    placeholder="https://instagram.com/iasdesk"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Youtube className="h-4 w-4 inline mr-1" />
                    YouTube
                  </label>
                  <input
                    type="url"
                    value={config.socialMedia.youtube}
                    onChange={(e) => updateConfig('socialMedia', 'youtube', e.target.value)}
                    placeholder="https://youtube.com/iasdesk"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">SEO Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={config.seo.metaTitle}
                    onChange={(e) => updateConfig('seo', 'metaTitle', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={config.seo.metaDescription}
                    onChange={(e) => updateConfig('seo', 'metaDescription', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Open Graph Image
                  </label>
                  <input
                    type="url"
                    value={config.seo.ogImage}
                    onChange={(e) => updateConfig('seo', 'ogImage', e.target.value)}
                    placeholder="https://example.com/og-image.jpg"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x630px</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Website Features</h3>
                <div className="text-sm text-gray-600">
                  {Object.values(config.features).filter(Boolean).length} of {Object.keys(config.features).length} features enabled
                </div>
              </div>
              
              <div className="space-y-4">
                {Object.entries(config.features).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {getFeatureDescription(key)}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateConfig('features', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
              
              {config.maintenance.enabled && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <RefreshCw className="h-5 w-5 text-red-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-red-800">⚠️ Maintenance Mode is Currently ENABLED</h4>
                      <p className="text-sm text-red-700">
                        Your website is currently showing the maintenance page to all visitors.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Maintenance Mode</h4>
                    <p className="text-sm text-yellow-700">
                      When enabled, visitors will see a maintenance page instead of the website.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Enable Maintenance Mode</h4>
                    <p className="text-sm text-gray-600">
                      Put the website in maintenance mode
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.maintenance.enabled}
                      onChange={(e) => updateConfig('maintenance', 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maintenance Message
                  </label>
                  <textarea
                    value={config.maintenance.message}
                    onChange={(e) => updateConfig('maintenance', 'message', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="We are currently under maintenance..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Analytics & Tracking</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={config.analytics.googleAnalyticsId}
                    onChange={(e) => updateConfig('analytics', 'googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter your Google Analytics 4 measurement ID</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook Pixel ID
                  </label>
                  <input
                    type="text"
                    value={config.analytics.facebookPixelId}
                    onChange={(e) => updateConfig('analytics', 'facebookPixelId', e.target.value)}
                    placeholder="123456789012345"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter your Facebook Pixel ID for conversion tracking</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getFeatureDescription = (feature: string): string => {
  const descriptions: { [key: string]: string } = {
    enableRegistration: 'Allow new users to register on the platform',
    enablePayment: 'Enable payment processing for course purchases',
    enableLiveClasses: 'Enable live class functionality with Google Meet',
    enableCurrentAffairs: 'Show current affairs section and updates',
    enableTestSeries: 'Enable test series and mock exams'
  };
  return descriptions[feature] || 'Feature setting';
};

export default WebsiteSettings;
