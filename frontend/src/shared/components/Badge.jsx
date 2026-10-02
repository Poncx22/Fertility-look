import React from 'react';

const VARIANTS = {
  rose: 'bg-[#FBE3EB] text-[#7A1032] border-[#B51B4D]/15',
  green: 'bg-[#DBEFE4] text-[#0E4A37] border-[#17604A]/15',
  gold: 'bg-[#FCEDCB] text-[#7A4A00] border-[#B26A00]/20',
  plum: 'bg-[#2B1A22] text-[#FFFAF6] border-transparent',
  ghost: 'bg-transparent text-[#715563] border-[#EADDD3]',
};

export function Badge({ children, variant = 'rose', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold leading-none border ${VARIANTS[variant] || VARIANTS.rose} ${className}`}
    >
      {children}
    </span>
  );
}
