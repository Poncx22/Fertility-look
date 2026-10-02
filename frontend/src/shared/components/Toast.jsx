import React, { useEffect } from 'react';

export function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 4800);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  const tones = {
    error: 'bg-[#2B1A22] text-[#FFFAF6] border-white/10',
    success: 'bg-[#17604A] text-white border-white/10',
    info: 'bg-[#2B1A22] text-[#FFFAF6] border-white/10',
  };

  const dot = {
    error: 'bg-[#FF8FA3]',
    success: 'bg-[#7CE3B1]',
    info: 'bg-[#E9B64C]',
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md toast-enter" role="status" aria-live="polite">
      <div className={`flex items-start gap-3 border rounded-2xl pl-4 pr-3 py-3.5 shadow-[0_18px_50px_-12px_rgba(43,26,34,.45)] ${tones[type]}`}>
        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dot[type]}`} aria-hidden="true" />
        <p className="text-[13.5px] font-medium leading-relaxed flex-1 whitespace-pre-line">{message}</p>
        <button
          onClick={onClose}
          className="text-current opacity-60 hover:opacity-100 font-bold px-1.5 py-0.5 rounded-md"
          aria-label="Cerrar aviso"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </button>
      </div>
    </div>
  );
}
