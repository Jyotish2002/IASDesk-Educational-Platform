import React from 'react';

interface SimplePhoneLogoProps {
  size?: number;
  className?: string;
  color?: string;
}

const SimplePhoneLogo: React.FC<SimplePhoneLogoProps> = ({ 
  size = 24, 
  className = '',
  color = '#3B82F6'
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
    >
      {/* Phone Body */}
      <rect 
        x="25" 
        y="10" 
        width="50" 
        height="80" 
        rx="8" 
        ry="8" 
        fill={color}
        stroke="#ffffff"
        strokeWidth="2"
      />
      
      {/* Screen */}
      <rect 
        x="30" 
        y="20" 
        width="40" 
        height="55" 
        rx="3" 
        ry="3" 
        fill="#ffffff"
        opacity="0.9"
      />
      
      {/* Speaker */}
      <ellipse 
        cx="50" 
        cy="15" 
        rx="8" 
        ry="2" 
        fill="#ffffff"
        opacity="0.7"
      />
      
      {/* Home Button */}
      <circle 
        cx="50" 
        cy="83" 
        r="4" 
        fill="#ffffff"
        opacity="0.8"
      />
      
      {/* Call Icon on Screen */}
      <g transform="translate(50, 47.5)">
        <path 
          d="M-8,-4 C-6,-6 -4,-6 -2,-4 L0,-2 C2,-4 4,-4 6,-2 C8,0 8,2 6,4 C4,6 2,6 0,4 L-2,2 C-4,4 -6,4 -8,2 C-10,0 -10,-2 -8,-4 Z" 
          fill={color}
          opacity="0.6"
        />
      </g>
      
      {/* Signal Bars */}
      <g transform="translate(78, 25)">
        <rect x="0" y="8" width="2" height="2" fill={color} opacity="0.8"/>
        <rect x="3" y="6" width="2" height="4" fill={color} opacity="0.8"/>
        <rect x="6" y="4" width="2" height="6" fill={color} opacity="0.8"/>
        <rect x="9" y="2" width="2" height="8" fill={color} opacity="0.8"/>
      </g>
    </svg>
  );
};

export default SimplePhoneLogo;
