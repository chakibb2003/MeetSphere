import React from 'react';

export default function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
        <mask id="people-mask">
          <rect width="32" height="24" fill="white" />
          
          {/* Top M-dip */}
          <circle cx="13" cy="-1" r="5" fill="black" />
          
          {/* Left Person */}
          <circle cx="7" cy="13" r="2" fill="black" />
          <path d="M 3 21 C 3 17, 11 17, 11 21" fill="black" />
          
          {/* Right Person */}
          <circle cx="19" cy="13" r="2" fill="black" />
          <path d="M 15 21 C 15 17, 23 17, 23 21" fill="black" />

          {/* Center Person (rendered last so it overrides side shoulders) */}
          <circle cx="13" cy="10" r="2.8" fill="black" />
          <path d="M 7.5 21 C 7.5 15, 18.5 15, 18.5 21" fill="black" />
        </mask>
      </defs>
      
      <g mask="url(#people-mask)">
        {/* Camera Body */}
        <rect x="2" y="3" width="22" height="18" rx="4" fill="url(#logo-grad)" />
        {/* Lens */}
        <path d="M 23 9 L 29 5 C 30 4.5, 31 5, 31 6 L 31 18 C 31 19, 30 19.5, 29 19 L 23 15 Z" fill="url(#logo-grad)" />
      </g>
    </svg>
  );
}
