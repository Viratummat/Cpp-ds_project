import React from 'react';

export function BrandLogo({ className = '', textClassName = '', showText = true }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Interlocking Circles SVG Logo matching the reference photo */}
      <svg
        className="w-7 h-7 flex-shrink-0"
        viewBox="0 0 36 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Circle */}
        <circle
          cx="13"
          cy="12"
          r="9.5"
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="1.6"
        />
        {/* Right Circle (Interlocking) */}
        <circle
          cx="23"
          cy="12"
          r="9.5"
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="1.6"
        />
      </svg>

      {showText && (
        <span
          className={`font-sans font-bold tracking-[0.24em] text-white text-sm sm:text-base uppercase ${textClassName}`}
        >
          TANDEM
        </span>
      )}
    </div>
  );
}
