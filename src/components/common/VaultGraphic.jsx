import React from 'react';

export function VaultGraphic({ className = '' }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Chrome Padlock / Safe Graphic illuminated by spotlight */}
      <div className="relative w-64 h-80 flex flex-col items-center justify-center animate-in fade-in duration-700">
        {/* Glow halo behind the lock */}
        <div className="absolute inset-0 bg-purple-500/20 rounded-full filter blur-3xl transform scale-75 pointer-events-none" />

        <svg
          viewBox="0 0 240 300"
          className="w-full h-full drop-shadow-[0_20px_50px_rgba(139,92,246,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Chrome Shackle Gradient */}
            <linearGradient id="chromeShackle" x1="50" y1="20" x2="190" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#CBD5E1" />
              <stop offset="50%" stopColor="#64748B" />
              <stop offset="75%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Chrome Body Gradient with Purple Reflection */}
            <linearGradient id="chromeBody" x1="40" y1="120" x2="200" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E0E7FF" />
              <stop offset="15%" stopColor="#C7D2FE" />
              <stop offset="35%" stopColor="#4338CA" />
              <stop offset="55%" stopColor="#1E1B4B" />
              <stop offset="75%" stopColor="#6366F1" />
              <stop offset="90%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>

            {/* Top Chrome Highlight */}
            <linearGradient id="topHighlight" x1="40" y1="120" x2="200" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#A5B4FC" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.9" />
            </linearGradient>

            {/* Floor Reflection Gradient */}
            <linearGradient id="floorReflection" x1="120" y1="280" x2="120" y2="340" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Shackle (Upper curved bar) */}
          <path
            d="M75 140 V75 C75 42 165 42 165 75 V140"
            stroke="url(#chromeShackle)"
            strokeWidth="24"
            strokeLinecap="round"
          />

          {/* Shackle inner highlight */}
          <path
            d="M78 135 V75 C78 48 162 48 162 75 V135"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Lock Body */}
          <rect
            x="45"
            y="125"
            width="150"
            height="145"
            rx="18"
            fill="url(#chromeBody)"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="1.5"
          />

          {/* Body Top Highlight Rim */}
          <rect
            x="48"
            y="128"
            width="144"
            height="8"
            rx="4"
            fill="url(#topHighlight)"
            opacity="0.85"
          />

          {/* Engraved Interlocking Circles Emblem (Brand logo on padlock) */}
          <g transform="translate(100, 175)">
            <circle
              cx="13"
              cy="12"
              r="14"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              fill="none"
              opacity="0.95"
            />
            <circle
              cx="27"
              cy="12"
              r="14"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              fill="none"
              opacity="0.95"
            />
          </g>

          {/* Keyhole / Cylinder */}
          <g transform="translate(120, 230)">
            <circle cx="0" cy="0" r="4.5" fill="#FFFFFF" opacity="0.9" />
            <path d="M-2.5 1 L2.5 1 L1.5 8 L-1.5 8 Z" fill="#FFFFFF" opacity="0.9" />
          </g>
        </svg>

        {/* Floor mirror reflection under padlock */}
        <div className="absolute -bottom-16 w-48 h-20 bg-gradient-to-b from-purple-500/25 to-transparent filter blur-md rounded-full transform scale-y-50" />
      </div>
    </div>
  );
}
