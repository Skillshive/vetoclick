import React from 'react';

export function Logo({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <img
      src="/assets/logo.jpg"
      alt="Hospilog Logo"
      className={`object-contain ${className}`}
      style={{ borderRadius: 8, ...style }}
    />
  );
}

export default Logo; 