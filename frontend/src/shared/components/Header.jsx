import React from 'react';

export function Header({ onLogoClick }) {
  const handleClick = (e) => {
    e.preventDefault();
    onLogoClick?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="w-full max-w-[1120px] mx-auto px-5 sm:px-8 pt-6 pb-2 flex items-center justify-between gap-4">
      <a href="/" onClick={handleClick} className="flex items-center gap-2.5 no-underline group" title="Ir al inicio y actualizar">
        <span className="brand-mark grid place-items-center w-9 h-9 rounded-full bg-[#2B1A22] text-[#FFFAF6] transition-transform group-hover:rotate-[-8deg]">
          <svg className="brand-orbit will-change-transform" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 13.2A8 8 0 1 1 10.8 4 6.5 6.5 0 0 0 20 13.2Z" fill="currentColor" opacity=".95" />
            <circle className="brand-dot" cx="17.2" cy="6.4" r="1.6" fill="#E9B64C" />
          </svg>
        </span>
        <span className="leading-none">
          <span className="font-display block text-[22px] font-semibold tracking-tight text-[#2B1A22]">FertilityLook</span>
          <span className="block text-[12.5px] text-[#715563] mt-0.5">Tu ciclo, en claro</span>
        </span>
      </a>

      <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium text-[#715563]" aria-label="Secciones">
        <a href="#calcular" className="hover:text-[#2B1A22] transition-colors">Calcular</a>
        <a href="#resultados" className="hover:text-[#2B1A22] transition-colors">Resultado</a>
        <a href="#historial" className="hover:text-[#2B1A22] transition-colors">Historial</a>
      </nav>

      <span className="inline-flex items-center gap-2 text-[12.5px] font-medium text-[#17604A] bg-[#DBEFE4]/70 border border-[#17604A]/15 rounded-full pl-2 pr-3 py-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#17604A] animate-pulse" aria-hidden="true" />
        Privado por diseño
      </span>
    </header>
  );
}
