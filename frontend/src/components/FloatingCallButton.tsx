import React, { useState } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';

interface FloatingCallButtonProps {
  phoneNumber?: string;
  whatsappNumber?: string;
}

const FloatingCallButton: React.FC<FloatingCallButtonProps> = ({
  phoneNumber = '+91-9899530320',
  whatsappNumber = '+91-9899530320'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCall = () => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hi! I would like to know more about IASDesk courses.');
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Floating Call Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Options Menu */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 min-w-[200px] animate-fadeInUp">
            <div className="space-y-3">
              {/* WhatsApp Option */}
              <button
                onClick={handleWhatsApp}
                className="flex items-center w-full p-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all duration-300 transform hover:scale-105"
              >
                <MessageCircle className="h-5 w-5 mr-3" />
                <span className="font-medium">WhatsApp</span>
              </button>

              {/* Call Option */}
              <button
                onClick={handleCall}
                className="flex items-center w-full p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                <Phone className="h-5 w-5 mr-3" />
                <span className="font-medium">Call Now</span>
              </button>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            floating-button group relative w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 
            text-white rounded-full shadow-2xl hover:shadow-3xl 
            transition-all-smooth transform hover:scale-110
            ${isOpen ? 'rotate-45' : ''}
          `}
          style={{
            animation: isOpen ? 'none' : 'rotation 4s infinite linear, pulse 2s infinite'
          }}
        >
          {/* Phone Icon */}
          <Phone 
            className={`
              h-6 w-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              transition-all duration-300
              ${isOpen ? 'rotate-45' : 'group-hover:rotate-12'}
            `} 
          />
          
          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-full bg-primary-400 opacity-30 animate-ping"></div>
          <div className="absolute inset-0 rounded-full bg-primary-300 opacity-20 animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute inset-0 rounded-full bg-primary-200 opacity-10 animate-ping" style={{ animationDelay: '1s' }}></div>
        </button>

        {/* Contact Info Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-20 right-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Need Help? Call or WhatsApp!
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes rotation {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }

        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </>
  );
};

export default FloatingCallButton;
