'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  alt?: string;
}

export default function Logo({
  className = 'h-10 w-10',
  alt = 'CA-VISIT Mascot Logo',
}: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      className={`object-contain rounded-xl shadow-xs transition-transform group-hover:scale-105 ${className}`}
    />
  );
}
