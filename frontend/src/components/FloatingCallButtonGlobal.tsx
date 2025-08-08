import React, { useState } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';

interface FloatingCallButtonProps {
  phoneNumber?: string;
  whatsappNumber?: string;
}

const FloatingCallButton: React.FC<FloatingCallButtonProps> = ({
  phoneNumber = process.env.REACT_APP_PHONE_NUMBER || '+91-9899530320',
  whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '+91-9899530320'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCall = () => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = () => {
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const message = encodeURIComponent('Hi! I would like to know more about IASDesk courses.');
    window.open(`https://api.whatsapp.com/send/?phone=${cleanNumber}&text=${message}&type=phone_number&app_absent=0`, '_blank');
  };

  return (
    <>
      {/* Floating Call Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Options Menu */}
        {isOpen && (
          <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 min-w-[220px] animate-fadeInUp">
            <div className="space-y-3">
              {/* WhatsApp Option */}
              <button
                onClick={handleWhatsApp}
                className="flex items-center w-full p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full mr-3">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold">WhatsApp Chat</div>
                  <div className="text-xs opacity-90">Quick response guaranteed</div>
                </div>
                <div className="text-xs opacity-75">✓</div>
              </button>

              {/* Call Option */}
              <button
                onClick={handleCall}
                className="flex items-center w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full mr-3">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold">Call Directly</div>
                  <div className="text-xs opacity-90">Instant support available</div>
                </div>
                <div className="text-xs opacity-75">📞</div>
              </button>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Main Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            group relative w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 
            text-white rounded-full shadow-2xl hover:shadow-3xl 
            transition-all duration-500 transform hover:scale-110 hover:-translate-y-1
            ${isOpen ? 'scale-110 shadow-3xl' : 'animate-bounce-slow'}
          `}
        >
          {/* Simple Phone Icon for Support */}
          <Phone 
            className={`
              h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              transition-all duration-300
              ${isOpen ? 'rotate-12 scale-110' : 'group-hover:rotate-6 group-hover:scale-110'}
            `} 
          />
          
          {/* Animated Ring Effects */}
          <div className="absolute inset-0 rounded-full border-2 border-primary-300 opacity-50 animate-ping-slow"></div>
          <div className="absolute inset-0 rounded-full border-2 border-primary-200 opacity-30 animate-ping-slow" style={{ animationDelay: '1s' }}></div>
          
          {/* Gradient Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 opacity-20 animate-pulse-glow"></div>
          
          {/* Phone Icon Pulse Ring */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping opacity-75"></div>
          )}
        </button>

        {/* Contact Info Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-20 right-0 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl">
            <div className="font-medium">Contact Support</div>
            <div className="text-xs opacity-75">Call or Chat instantly!</div>
            <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}

        {/* Floating Contact Number */}
        {!isOpen && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg">
            {phoneNumber}
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 3s infinite;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }

        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </>
  );
};

export default FloatingCallButton;
