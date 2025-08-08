import React from 'react';
import PhoneLogo from './PhoneLogo';
import StylizedPhoneLogo from './StylizedPhoneLogo';
import SimplePhoneLogo from './SimplePhoneLogo';

const PhoneLogoDemos: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Phone Logo Examples</h1>
      
      {/* Basic Phone Logo */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Basic Phone Logo (PhoneLogo)</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-center">
            <PhoneLogo size={24} variant="outline" />
            <p className="text-sm mt-2">Outline (24px)</p>
          </div>
          <div className="text-center">
            <PhoneLogo size={32} variant="filled" color="#3B82F6" />
            <p className="text-sm mt-2">Filled (32px)</p>
          </div>
          <div className="text-center">
            <PhoneLogo size={40} variant="gradient" />
            <p className="text-sm mt-2">Gradient (40px)</p>
          </div>
        </div>
        
        {/* Usage Example */}
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Usage:</h3>
          <code className="text-sm">
            {`<PhoneLogo size={32} variant="filled" color="#3B82F6" />`}
          </code>
        </div>
      </div>

      {/* Stylized Phone Logo */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Stylized Phone Logo (StylizedPhoneLogo)</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-center">
            <StylizedPhoneLogo size={40} />
            <p className="text-sm mt-2">Static (40px)</p>
          </div>
          <div className="text-center">
            <StylizedPhoneLogo size={50} animated={true} />
            <p className="text-sm mt-2">Animated (50px)</p>
          </div>
          <div className="text-center">
            <StylizedPhoneLogo size={60} />
            <p className="text-sm mt-2">Large (60px)</p>
          </div>
        </div>
        
        {/* Usage Example */}
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Usage:</h3>
          <code className="text-sm">
            {`<StylizedPhoneLogo size={50} animated={true} />`}
          </code>
        </div>
      </div>

      {/* Simple Phone Logo */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Simple Phone Logo (SimplePhoneLogo)</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-center">
            <SimplePhoneLogo size={40} color="#3B82F6" />
            <p className="text-sm mt-2">Blue (40px)</p>
          </div>
          <div className="text-center">
            <SimplePhoneLogo size={50} color="#10B981" />
            <p className="text-sm mt-2">Green (50px)</p>
          </div>
          <div className="text-center">
            <SimplePhoneLogo size={60} color="#F59E0B" />
            <p className="text-sm mt-2">Orange (60px)</p>
          </div>
        </div>
        
        {/* Usage Example */}
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Usage:</h3>
          <code className="text-sm">
            {`<SimplePhoneLogo size={50} color="#10B981" />`}
          </code>
        </div>
      </div>

      {/* In Buttons */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Phone Logos in Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PhoneLogo size={20} color="white" className="mr-2" />
            Call Now
          </button>
          
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <SimplePhoneLogo size={24} color="white" className="mr-2" />
            Contact Us
          </button>
          
          <button className="flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg hover:from-primary-600 hover:to-primary-800 transition-all transform hover:scale-105">
            <StylizedPhoneLogo size={30} className="mr-3" />
            Get Support
          </button>
        </div>
      </div>

      {/* Usage Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">When to Use Each Logo</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-medium">PhoneLogo</h3>
            <p className="text-sm text-gray-600">Best for: Icons in text, buttons, navigation menus</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-medium">StylizedPhoneLogo</h3>
            <p className="text-sm text-gray-600">Best for: Hero sections, feature highlights, call-to-action areas</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-medium">SimplePhoneLogo</h3>
            <p className="text-sm text-gray-600">Best for: Contact forms, footers, professional contexts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneLogoDemos;
