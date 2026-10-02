import React from 'react';

export function Card({ children, className = '', tone = 'paper', ...props }) {
  const tones = {
    paper: 'bg-[#FFFEFB]/90 border-[#EADDD3]',
    mist: 'bg-[#FFF4EC]/80 border-[#EADDD3]',
    ink: 'bg-[#2B1A22] border-[#2B1A22] text-[#FFFAF6]',
  };
  return (
    <div
      className={`w-full rounded-[20px] border ${tones[tone] || tones.paper} p-6 sm:p-7 shadow-[0_1px_2px_rgba(43,26,34,.05),0_12px_32px_-12px_rgba(43,26,34,.14)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
