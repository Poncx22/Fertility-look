import React, { useCallback, useEffect, useMemo, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Header, Toast } from './shared/components';
import { CycleCalculatorForm, CycleResultsCard, CycleHistoryList } from './modules/cycle/components';
import { UserSelectOrRegister } from './modules/user/components';
import { cycleService } from './modules/cycle/services/cycleService';
import { userService } from './modules/user/services/userService';
import { ApiError } from './shared/services/apiClient';
import { formatFriendlyDate } from './shared/utils/dateUtils';

/**
 * Fondo continuo tipo aura de fases: hibisco, eucalipto y caléndula
 * a opacidad baja, solo transformaciones para no recostar el layout.
 */
function AmbientFlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="ambient-blob-a absolute -top-32 -left-32 h-[560px] w-[560px] rounded-full opacity-[0.22] blur-[90px] will-change-transform mix-blend-multiply"
        style={{ backgroundColor: '#B51B4D' }}
      />
      <div
        className="ambient-blob-b absolute top-[12%] -right-40 h-[620px] w-[620px] rounded-full opacity-[0.18] blur-[100px] will-change-transform mix-blend-multiply"
        style={{ backgroundColor: '#17604A' }}
      />
      <div
        className="ambient-blob-c absolute -bottom-48 left-[30%] h-[480px] w-[480px] rounded-full opacity-[0.24] blur-[90px] will-change-transform mix-blend-multiply"
        style={{ backgroundColor: '#B26A00' }}
      />
    </div>
  );
}

function getErrorMessage(err, fallback) {
  if (err instanceof ApiError) {
    if (err.data) {
      if (typeof err.data === 'object') {
        const vals = Object.values(err.data);
        if (vals.length) return vals.join('\n');
      }
      if (typeof err.data === 'string') return err.data;
    }
    return err.message || fallback;
  }
  return err?.message || fallback;
}

function parseDay(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function diffDays(a, b) {
  const ms = a.getTime() - b.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function toISO(d) {
  if (!d) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(d, n) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

/** Anillo del ciclo: cada bolita es un día (fecha) del ciclo actual.
 *  Si hoy cae fuera del ciclo guardado, la rueda rueda hacia adelante/atrás
 *  en múltiplos de la duración del ciclo para mostrar siempre el ciclo vigente. */
function CycleRing({ result }) {
  const model = useMemo(() => {
    if (result?.lastPeriodStart && result?.nextPeriodStart) {
      const start0 = parseDay(result.lastPeriodStart);
      const next0 = parseDay(result.nextPeriodStart);
      const len = Math.max(1, diffDays(next0, start0));
      const periodLen = result?.periodDays?.length || 5;
      // Fechas base del backend, con fallback por si faltara alguna
      const ovu0 = parseDay(result.estimatedOvulationDate) || addDays(next0, -14);
      const fStart0 = parseDay(result.fertileWindowStart) || addDays(ovu0, -5);
      const fEnd0 = parseDay(result.fertileWindowEnd) || addDays(ovu0, 1);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      // ¿En qué ciclo de este ritmo cae hoy? (puede ser anterior/posterior al guardado)
      const raw = diffDays(today, start0);
      const k = Math.floor(raw / len);
      const cycleStart = addDays(start0, k * len);
      const cycleNext = addDays(cycleStart, len); // próximo periodo del ciclo vigente
      const ovu = addDays(ovu0, k * len);
      const fStart = addDays(fStart0, k * len);
      const fEnd = addDays(fEnd0, k * len);
      const dayNum = raw - k * len + 1; // siempre 1..len
      return {
        len, periodLen, cycleStart, cycleNext, ovu, fStart, fEnd,
        ovuISO: toISO(ovu), fStartISO: toISO(fStart),
        periodoISO: toISO(cycleStart), nextISO: toISO(cycleNext),
        dayNum, preview: false, cyclesAhead: k,
      };
    }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(today); start.setDate(start.getDate() - 9);
    const len = 28;
    const period = new Set(Array.from({ length: 5 }, (_, i) => toISO(addDays(start, i))));
    return { len, fertile: new Set(), period, ovu: null, dayNum: 10, preview: true, start };
  }, [result]);

  const size = 248;
  const cx = size / 2, cy = size / 2, radius = 92;
  const dots = [];
  for (let i = 0; i < model.len; i++) {
    const angle = (i / model.len) * Math.PI * 2 - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    const isCurrent = i + 1 === model.dayNum;
    let fill = '#EADDD3';
    let r = 6;
    let stroke = 'none';
    let iso = null;
    if (model.preview) {
      // Sin registros: rueda en neutro, sin colores de fase
      fill = '#E4D9CF';
      if (isCurrent) fill = '#A89486';
    } else {
      // Cada bolita es una fecha: cycleStart + i, coloreada por fase real
      const date = addDays(model.cycleStart, i);
      iso = toISO(date);
      if (iso === model.ovuISO) { fill = '#B26A00'; r = 8; }
      else if (date >= model.fStart && date <= model.fEnd) fill = '#17604A';
      else if (i < model.periodLen) fill = '#B51B4D';
    }
    if (isCurrent) { stroke = '#2B1A22'; r = Math.max(r, 8); }
    dots.push({ x, y, fill, r, stroke, i, iso });
  }

  const phaseLabel = model.preview
    ? 'Sin registros · calcula para ver tu ciclo'
    : model.dayNum <= model.periodLen
      ? `Día ${model.dayNum} · periodo`
      : `Día ${model.dayNum} de ${model.len}`;

  const shortFmt = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })
      .format(new Date(y, m - 1, d)).replace('.', '');
  };
  // Caja exterior más grande (360) que la rueda SVG (248) para que las
  // fechas vivan en el margen y no tapen las bolitas del ciclo.
  const BOX = 360;
  const OFF = (BOX - size) / 2; // 56px de margen por lado
  const pushRaw = (dot, dist) => {
    const vx = dot.x - cx, vy = dot.y - cy;
    const mag = Math.hypot(vx, vy) || 1;
    return { x: dot.x + (vx / mag) * dist, y: dot.y + (vy / mag) * dist };
  };
  const clampSvg = (p) => ({
    x: Math.min(240, Math.max(8, p.x)),
    y: Math.min(240, Math.max(8, p.y)),
  });
  const toOuter = (p) => ({
    // La caja exterior comparte centro con el SVG, solo se suma el margen
    x: Math.min(BOX - 52, Math.max(52, p.x + OFF)),
    y: Math.min(BOX - 22, Math.max(22, p.y + OFF)),
  });

  // Índices reales por fecha (no por len-15): cada bolita es cycleStart + i
  const dotAt = (idx) => dots.find((d) => d.i === idx) || { x: cx, y: cy - radius };
  const ovuIdx = model.preview ? 0 : Math.max(0, diffDays(model.ovu, model.cycleStart));
  const fertileFrom = model.preview ? 0 : Math.max(0, diffDays(model.fStart, model.cycleStart));

  const todayLabel = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date());
  const cur = dots.find((d) => d.i + 1 === model.dayNum) || { x: cx, y: cy - radius };
  // Hoy: línea corta dentro del SVG + pastilla lejos, en el margen exterior
  const hoyLine = clampSvg(pushRaw(cur, 30));
  const hoyPos = toOuter(pushRaw(cur, 70));

  // Etiquetas de fecha solo al comienzo de cada proceso (ciclo vigente, no solo el guardado)
  // Periodo muestra el rango actual → próximo: ej. "Periodo 15 sep → 13 oct"
  const phaseStarts = model.preview ? [] : [
    { key: 'periodo', name: 'Periodo', date: model.periodoISO, endDate: model.nextISO, color: '#B51B4D', dot: dotAt(0), idx: 0 },
    { key: 'fertil', name: 'Fértil', date: model.fStartISO, color: '#17604A', dot: dotAt(fertileFrom), idx: fertileFrom },
    { key: 'ovu', name: 'Ovulación', date: model.ovuISO, color: '#B26A00', dot: dotAt(ovuIdx), idx: ovuIdx },
  ]
    // Si "hoy" cae justo sobre un inicio, se oculta esa etiqueta para no encimarse
    .filter((p) => p.date && p.idx + 1 !== model.dayNum)
    .map((p) => ({ ...p, line: clampSvg(pushRaw(p.dot, 30)), pos: toOuter(pushRaw(p.dot, 66)) }));

  return (
    <div className="ring-enter relative mx-auto w-[360px] max-w-full aspect-square my-2 overflow-visible">
      <div className="ring-breathe will-change-transform absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Anillo del ciclo, ${phaseLabel}`} className={`${model.preview ? 'opacity-80 saturate-0' : undefined} overflow-visible`}>
        <defs>
          <marker id="cycleDirArrow" viewBox="0 0 8 8" refX="6.5" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 z" fill="#9B8490" />
          </marker>
        </defs>
        <circle cx={cx} cy={cy} r={radius - 18} fill="none" stroke="#EADDD3" strokeWidth="1" strokeDasharray="2 5" opacity=".8" />
        {/* Sentido del ciclo: arco horario por fuera de las bolitas */}
        {(() => {
          const R = radius + 16;
          const a0 = -Math.PI / 2;
          const a1 = a0 + (300 * Math.PI) / 180; // 300° en sentido horario, deja hueco arriba
          const sx = cx + R * Math.cos(a0), sy = cy + R * Math.sin(a0);
          const ex = cx + R * Math.cos(a1), ey = cy + R * Math.sin(a1);
          return (
            <path
              d={`M ${sx} ${sy} A ${R} ${R} 0 1 1 ${ex} ${ey}`}
              fill="none" stroke="#9B8490" strokeWidth="1.5" opacity=".65"
              markerEnd="url(#cycleDirArrow)"
            />
          );
        })()}
        {dots.map((d) => (
          <g key={d.i}>
            {d.i + 1 === model.dayNum && <circle cx={d.x} cy={d.y} r={d.r + 5} fill="none" stroke="#2B1A22" strokeWidth="1.4" opacity=".55" />}
            <circle cx={d.x} cy={d.y} r={d.r} fill={d.fill} stroke={d.stroke} strokeWidth={d.stroke === 'none' ? 0 : 2} />
          </g>
        ))}
        {/* Líneas guía cortas: de la bolita hacia afuera, sin llegar a tapar */}
        {!model.preview && phaseStarts.map((p) => (
          <line key={`ln-${p.key}`} x1={p.dot.x} y1={p.dot.y} x2={p.line.x} y2={p.line.y} stroke={p.color} strokeWidth="1.2" opacity=".45" />
        ))}
        <line x1={cur.x} y1={cur.y} x2={hoyLine.x} y2={hoyLine.y} stroke="#2B1A22" strokeWidth="1.2" opacity=".45" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center pointer-events-none">
        <div>
          <p className="font-display text-[34px] font-semibold leading-none tracking-tight">{model.preview ? '—' : model.dayNum}</p>
          <p className="text-[11.5px] font-medium text-[#715563] mt-1">{model.preview ? 'sin registros' : `de ${model.len}`}</p>
          {!model.preview && model.cyclesAhead !== 0 && (
            <p className="text-[10px] font-semibold text-[#B26A00] mt-0.5">ciclo estimado</p>
          )}
        </div>
      </div>
      </div>
      {/* Hoy: pastilla oscura, en la zona exterior de la caja para no tapar bolitas */}
      <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: hoyPos.x, top: hoyPos.y }}>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#2B1A22] text-white text-[11px] font-semibold px-3.5 py-1.5 shadow-[0_8px_20px_-8px_rgba(43,26,34,.6)] ring-2 ring-white">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFFAF6]" aria-hidden="true" />
          Hoy · {todayLabel}
        </span>
      </div>
      {/* Inicios de fase: en la zona exterior, padding alto */}
      {!model.preview && phaseStarts.map((p) => (
        <div key={p.key} className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: p.pos.x, top: p.pos.y }}>
          <span
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white text-[#2B1A22] text-[11px] font-semibold px-3.5 py-1.5 shadow-[0_8px_20px_-10px_rgba(43,26,34,.35)] ring-2 ring-white border"
            style={{ borderColor: `${p.color}55` }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} aria-hidden="true" />
            {p.endDate ? `${p.name} ${shortFmt(p.date)} → ${shortFmt(p.endDate)}` : `${p.name} · ${shortFmt(p.date)}`}
          </span>
        </div>
      ))}
    </div>
  );
}

function Hero({ selectedUserId, users, result, historyCount }) {
  const selectedUser = users.find((u) => u.id === selectedUserId) || null;
  const firstName = selectedUser?.name?.trim().split(/\s+/)[0] || '';
  const now = new Date();
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const shortDay = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(y, m - 1, d)).replace('.', '');
  };
  const shortRange = (a, b) => {
    if (!a || !b) return '';
    const [, ma] = a.split('-').map(Number);
    const [, mb] = b.split('-').map(Number);
    const da = shortDay(a), db = shortDay(b);
    if (ma === mb) {
      const dayA = a.split('-')[2].replace(/^0/, '');
      return `${dayA} – ${db}`;
    }
    return `${da} – ${db}`;
  };
  const periodRange = result?.periodDays?.length
    ? shortRange(result.periodDays[0], result.periodDays[result.periodDays.length - 1])
    : '—';
  const fertileRange = result?.fertileWindowStart
    ? shortRange(result.fertileWindowStart, result.fertileWindowEnd)
    : '—';
  const ovuLabel = result?.estimatedOvulationDate
    ? shortDay(result.estimatedOvulationDate)
    : '—';
  const hasData = !!result;

  return (
    <section className="w-full grid lg:grid-cols-[minmax(0,1fr)_400px] gap-8 lg:gap-10 items-center pt-8 sm:pt-12 pb-8">
      <div className="rise">
        {selectedUser ? (
          <>
            <p className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-[#7A1032] bg-[#FBE3EB] border border-[#B51B4D]/15 rounded-full px-3 py-1.5 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B51B4D]" aria-hidden="true" />
              Perfil de {firstName}
            </p>
            <h2 className="font-display text-[38px] sm:text-[54px] font-semibold tracking-[-0.02em] leading-[1.02] text-[#2B1A22]">
              Hola, <span className="italic font-medium capitalize">{firstName.toLowerCase()}</span>. Esto dice tu ciclo hoy.
            </h2>
          </>
        ) : (
          <>
            <h2 className="font-display text-[38px] sm:text-[56px] font-semibold tracking-[-0.02em] leading-[1.02] text-[#2B1A22]">
              Entiende tu ciclo <span className="italic font-medium">de un vistazo.</span>
            </h2>
          </>
        )}
        <p className="text-[15.5px] sm:text-[16.5px] text-[#715563] leading-relaxed mt-4 max-w-[54ch]">
          {result
            ? `Último periodo ${formatFriendlyDate(result.lastPeriodStart)}. Ovulación estimada ${formatFriendlyDate(result.estimatedOvulationDate)}.`
            : 'Dinos cuándo empezó tu último periodo y te mostramos tu ventana fértil, tu ovulación y tu próximo periodo.'}
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 text-[13px] text-[#715563]">
          {historyCount > 0
            ? <span className="text-[#9B8490]">{historyCount} {historyCount === 1 ? 'cálculo guardado' : 'cálculos guardados'}</span>
            : <span className="text-[#9B8490]">Sin cálculos guardados todavía</span>}
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <a href="#calcular" className="inline-flex items-center gap-2 rounded-full bg-[#2B1A22] text-white text-[14px] font-semibold px-5 py-2.5 hover:bg-[#B51B4D] transition">
            Calcular ahora
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
          <a href="#historial" className="inline-flex items-center gap-2 rounded-full border border-[#EADDD3] bg-white/70 text-[14px] font-semibold px-5 py-2.5 hover:border-[#2B1A22]/30 transition">
            Ver historial
          </a>
        </div>
      </div>

      <div className="rise rise-1 rounded-[24px] border border-[#EADDD3] bg-white/75 backdrop-blur px-4 pt-5 pb-5 shadow-[0_1px_2px_rgba(43,26,34,.05),0_12px_32px_-12px_rgba(43,26,34,.14)] overflow-visible">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-[17px] font-semibold tracking-tight text-[#2B1A22]">Rueda del ciclo</h3>
          <span className="text-[11.5px] font-medium text-[#715563] rounded-full border border-[#EADDD3] bg-white px-2.5 py-1">Hoy · {formatFriendlyDate(todayISO)}</span>
        </div>
        <ul className="grid grid-cols-3 gap-2 mt-4 mb-5" aria-label="Fases del ciclo">
          <li className={`rounded-2xl border px-2 py-2 text-center ${hasData ? 'border-[#B51B4D]/15 bg-[#FBE3EB]/50' : 'border-[#EADDD3] bg-white/60'}`}>
            <span className={`mx-auto block w-2.5 h-2.5 rounded-full ${hasData ? 'bg-[#B51B4D]' : 'bg-[#C9BBAF]'}`} aria-hidden="true" />
            <p className={`text-[12px] font-semibold mt-1.5 leading-none ${hasData ? 'text-[#7A1032]' : 'text-[#9B8490]'}`}>Periodo</p>
            <p className="text-[10.5px] text-[#715563] mt-1 leading-tight">{periodRange}</p>
          </li>
          <li className={`rounded-2xl border px-2 py-2 text-center ${hasData ? 'border-[#17604A]/15 bg-[#DBEFE4]/50' : 'border-[#EADDD3] bg-white/60'}`}>
            <span className={`mx-auto block w-2.5 h-2.5 rounded-full ${hasData ? 'bg-[#17604A]' : 'bg-[#C9BBAF]'}`} aria-hidden="true" />
            <p className={`text-[12px] font-semibold mt-1.5 leading-none ${hasData ? 'text-[#0E4A37]' : 'text-[#9B8490]'}`}>Ventana fértil</p>
            <p className="text-[10.5px] text-[#715563] mt-1 leading-tight">{fertileRange}</p>
          </li>
          <li className={`rounded-2xl border px-2 py-2 text-center ${hasData ? 'border-[#B26A00]/20 bg-[#FCEDCB]/50' : 'border-[#EADDD3] bg-white/60'}`}>
            <span className={`mx-auto block w-2.5 h-2.5 rounded-full ${hasData ? 'bg-[#B26A00]' : 'bg-[#C9BBAF]'}`} aria-hidden="true" />
            <p className={`text-[12px] font-semibold mt-1.5 leading-none ${hasData ? 'text-[#7A4A00]' : 'text-[#9B8490]'}`}>Ovulación</p>
            <p className="text-[10.5px] text-[#715563] mt-1 leading-tight">{ovuLabel}</p>
          </li>
        </ul>
        <CycleRing result={result} />
        <p className="text-center text-[12.5px] text-[#715563] mt-4 leading-relaxed">
          {result ? 'El punto marcado es hoy, tu posición actual dentro del ciclo.' : 'Calcula tu registro y mira tu ciclo aquí.'}
        </p>
      </div>
    </section>
  );
}

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [calculating, setCalculating] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });
  const [historyError, setHistoryError] = useState(null);
  const historyRequestId = React.useRef(0);
  const rootRef = React.useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(
      {
        reduceMotion: '(prefers-reduced-motion: reduce)',
        fullMotion: '(prefers-reduced-motion: no-preference)',
      },
      (ctx) => {
        if (ctx.conditions.reduceMotion) return;
        gsap.to('.ambient-blob-a', { x: 140, y: 90, scale: 1.18, opacity: 0.32, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to('.ambient-blob-b', { x: -150, y: 100, scale: 1.15, opacity: 0.27, duration: 7.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to('.ambient-blob-c', { x: 110, y: -110, scale: 1.16, opacity: 0.33, duration: 5.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to('.ring-breathe', { scale: 1.03, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: 'center' });
        gsap.to('.brand-orbit', { y: -3, duration: 2.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to('.brand-dot', { scale: 1.5, opacity: 0.5, duration: 1.6, repeat: -1, yoyo: true, ease: 'sine.inOut', transformOrigin: 'center' });
      }
    );
    return () => mm.revert();
  }, { scope: rootRef });

  const notify = (message, type = 'info') => setToast({ message, type });

  const loadUsers = useCallback(async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('No se pudieron cargar usuarias:', err);
    }
  }, []);

  const loadHistory = useCallback(async (userId, { silent = false } = {}) => {
    const requestId = ++historyRequestId.current;
    setLoadingHistory(true);
    try {
      const data = await cycleService.getHistory(userId || undefined);
      if (requestId !== historyRequestId.current) return Array.isArray(data) ? data : [];
      setHistory(Array.isArray(data) ? data : []);
      setHistoryError(null);
      setLastUpdated(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      return Array.isArray(data) ? data : [];
    } catch (err) {
      if (requestId === historyRequestId.current) {
        setHistoryError(getErrorMessage(err, 'Verifica que el backend esté en http://localhost:8080'));
      }
      if (!silent) {
        notify(`No se pudo cargar el historial.\n${getErrorMessage(err, 'Verifica que el backend esté en http://localhost:8080')}`, 'error');
      }
      throw err;
    } finally {
      if (requestId === historyRequestId.current) setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadHistory(null);
  }, [loadUsers, loadHistory]);

  const handleSelectUser = async (id) => {
    setSelectedUserId(id);
    // Limpieza inmediata: evita que se siga viendo el resultado/historial de la usuaria anterior
    setResult(null);
    setHistory([]);
    setHistoryError(null);
    try {
      const data = await loadHistory(id);
      // Si la usuaria tiene registros, muestra su más reciente; si no, queda en blanco
      if (id) {
        setResult(data[0] ?? null);
      }
    } catch {
      setResult(null);
    }
  };

  const handleCreateUser = async (data) => {
    try {
      const created = await userService.createUser(data);
      notify(`Perfil guardado para ${created.name}.`, 'success');
      await loadUsers();
      return created;
    } catch (err) {
      const msg = err?.status === 409
        ? 'Ese correo ya está registrado. Usa otro email.'
        : getErrorMessage(err, 'No se pudo guardar el perfil.');
      notify(msg, 'error');
      throw err;
    }
  };

  const handleCalculate = async (payload) => {
    setCalculating(true);
    try {
      const data = await cycleService.calculateCycle(payload);
      setResult(data);
      notify(`Cálculo #${data.id} guardado en tu historial.`, 'success');
      await loadHistory(selectedUserId);
      document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      notify(getErrorMessage(err, 'No se pudo calcular. Verifica el backend.'), 'error');
    } finally {
      setCalculating(false);
    }
  };

  const handleRefreshHistory = async () => {
    try {
      const data = await loadHistory(selectedUserId);
      notify(`Historial al día. ${data.length} ${data.length === 1 ? 'registro' : 'registros'}.`, 'success');
    } catch {
      // loadHistory ya notificó el error
    }
  };

  const handleLogoClick = () => {
    loadUsers();
    handleRefreshHistory();
  };

  const handleDeleteUser = async (id) => {
    const target = users.find((u) => u.id === id);
    try {
      await userService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (selectedUserId === id) {
        setSelectedUserId(null);
        setResult(null);
        setHistory([]);
        await loadHistory(null, { silent: true });
      }
      notify(`Perfil de ${target?.name?.split(/\s+/)[0] || 'usuaria'} eliminado. Su historial se conserva.`, 'success');
    } catch (err) {
      const msg = err?.status === 404
        ? 'Ese perfil ya no existe.'
        : getErrorMessage(err, 'No se pudo eliminar el perfil.');
      notify(msg, 'error');
      try {
        await loadUsers();
      } catch {
        // ya se notificó arriba
      }
      throw err;
    }
  };

  const handleDeleteCycle = async (id) => {
    try {
      await cycleService.deleteCycle(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      setResult((prev) => (prev?.id === id ? null : prev));
      notify(`Cálculo #${id} eliminado de la base de datos.`, 'success');
    } catch (err) {
      const msg = err?.status === 404
        ? `El cálculo #${id} ya no existe.`
        : getErrorMessage(err, 'No se pudo eliminar. Verifica el backend.');
      notify(msg, 'error');
      try {
        await loadHistory(selectedUserId, { silent: true });
      } catch {
        // ya se notificó arriba
      }
      throw err;
    }
  };

  return (
    <div ref={rootRef} className="relative min-h-screen overflow-x-clip">
      <AmbientFlow />
      <div className="relative z-10">
      <Header onLogoClick={handleLogoClick} />
      <main className="max-w-[1120px] mx-auto px-5 sm:px-8 pb-16">
        <Hero selectedUserId={selectedUserId} users={users} result={result} historyCount={history.length} />

        <div className="grid lg:grid-cols-[380px_minmax(0,1fr)] gap-5 items-start">
          <div className="flex flex-col gap-5 lg:sticky lg:top-5">
            <div>
            <UserSelectOrRegister
              users={users}
              selectedUserId={selectedUserId}
              onSelect={handleSelectUser}
              onCreate={handleCreateUser}
              onDelete={handleDeleteUser}
            />
            </div>
            <div>
            <CycleCalculatorForm
              initialUserId={selectedUserId}
              loading={calculating}
              onSubmit={handleCalculate}
            />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {result ? (
              <div id="resultados" className="scroll-mt-6">
                <CycleResultsCard result={result} />
              </div>
            ) : (
              <div id="resultados" className="scroll-mt-6 rounded-[20px] border border-dashed border-[#EADDD3] bg-white/50 px-6 py-8 text-center">
                <p className="font-display text-[19px] text-[#2B1A22]">Tu resultado aparecerá aquí</p>
                <p className="text-[13.5px] text-[#715563] mt-1.5 max-w-[44ch] mx-auto leading-relaxed">
                  Al calcular verás tu ovulación estimada y cada fase del ciclo explicada en sencillo, sin tecnicismos.
                </p>
              </div>
            )}

            <div>
            <CycleHistoryList
              history={history}
              users={users}
              loading={loadingHistory}
              lastUpdated={lastUpdated}
              error={historyError}
              onRefresh={handleRefreshHistory}
              onDelete={handleDeleteCycle}
              onSelect={(item) => {
                setResult(item);
                document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-[#2B1A22] text-[#FFFAF6] mt-4">
        <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-10 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="brand-mark grid place-items-center w-9 h-9 rounded-full bg-[#FFFAF6] text-[#2B1A22]">
                <svg className="brand-orbit will-change-transform" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 13.2A8 8 0 1 1 10.8 4 6.5 6.5 0 0 0 20 13.2Z" fill="currentColor" opacity=".95" />
                  <circle className="brand-dot" cx="17.2" cy="6.4" r="1.6" fill="#B51B4D" />
                </svg>
              </span>
              <span className="leading-none">
                <span className="font-display block text-[20px] font-semibold tracking-tight">FertilityLook</span>
                <span className="block text-[12.5px] text-white/55 mt-0.5">Tu ciclo, en claro</span>
              </span>
            </div>
            <p className="text-[13px] text-white/55 leading-relaxed mt-4 max-w-[52ch]">
              Cálculo orientativo con el método estándar. No sustituye consejo médico.
            </p>
          </div>
          <nav className="flex md:flex-col gap-2 md:gap-2.5 md:text-right text-[13.5px] font-medium text-white/70" aria-label="Secciones">
            <a href="#calcular" className="hover:text-white transition-colors">Calcular</a>
            <a href="#resultados" className="hover:text-white transition-colors">Resultado</a>
            <a href="#historial" className="hover:text-white transition-colors">Historial</a>
          </nav>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row gap-1.5 sm:items-center justify-between text-[12.5px] text-white/50">
            <p>© {new Date().getFullYear()} FertilityLook. Todos los derechos reservados.</p>
            <p>Hecho con cuidado para tu bienestar.</p>
          </div>
        </div>
      </footer>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
      </div>
    </div>
  );
}

export default App;
