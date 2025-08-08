import React from 'react';

interface StylizedPhoneLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

const StylizedPhoneLogo: React.FC<StylizedPhoneLogoProps> = ({ 
  size = 40, 
  className = '',
  animated = false
}) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Phone Container */}
      <div 
        className={`
          relative bg-gradient-to-br from-primary-500 to-primary-700 
          rounded-xl shadow-lg border-2 border-white/20
          ${animated ? 'animate-pulse-glow' : ''}
        `}
        style={{ 
          width: size, 
          height: size * 1.6,
          padding: size * 0.1
        }}
      >
        {/* Screen */}
        <div 
          className="bg-white/90 rounded-lg relative overflow-hidden"
          style={{ 
            width: '100%', 
            height: '100%'
          }}
        >
          {/* Top Speaker */}
          <div 
            className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-gray-400 rounded-full"
            style={{ 
              width: size * 0.3, 
              height: size * 0.05 
            }}
          />
          
          {/* Screen Content */}
          <div className="flex flex-col items-center justify-center h-full text-primary-600">
            {/* Call Icon */}
            <svg 
              width={size * 0.4} 
              height={size * 0.4} 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className={animated ? 'animate-bounce' : ''}
            >
              <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </div>
          
          {/* Home Button */}
          <div 
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-300 rounded-full"
            style={{ 
              width: size * 0.2, 
              height: size * 0.2 
            }}
          />
        </div>
        
        {/* Signal Bars */}
        <div className="absolute -top-2 -right-2 flex space-x-1">
          {[1, 2, 3].map((bar) => (
            <div
              key={bar}
              className={`
                bg-green-500 rounded-sm
                ${animated ? 'animate-ping' : ''}
              `}
              style={{ 
                width: size * 0.05, 
                height: size * (0.1 + bar * 0.05),
                animationDelay: `${bar * 0.2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.6);
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default StylizedPhoneLogo;
