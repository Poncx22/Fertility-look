import React from 'react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { formatFriendlyDate, formatFullDate, daysUntil } from '../../../shared/utils/dateUtils';

function DayChips({ days = [], cls }) {
  if (!days?.length) return <p className="text-[13px] text-[#9B8490]">Sin días en esta fase.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {days.map((d) => (
        <span key={d} title={formatFullDate(d)} className={`text-[12px] font-medium px-2.5 py-1 rounded-full border ${cls}`}>
          {formatFriendlyDate(d)}
        </span>
      ))}
    </div>
  );
}

/**
 * Resultado con línea de tiempo de fases.
 */
export function CycleResultsCard({ result }) {
  if (!result) return null;

  const nextIn = daysUntil(result.nextPeriodStart);
  const ovuIn = daysUntil(result.estimatedOvulationDate);

  const phaseNote =
    ovuIn < -2
      ? 'Ya pasó la ovulación de este ciclo. El próximo cálculo te situará de nuevo.'
      : ovuIn <= 1 && ovuIn >= -1
        ? 'Estás en torno al día de ovulación. Es el momento de mayor probabilidad.'
        : ovuIn > 1 && ovuIn <= 6
          ? `La ovulación llegará en ${ovuIn} días. Tu ventana fértil ya está abierta o a punto de abrirse.`
          : ovuIn > 6
            ? `Faltan ${ovuIn} días para la ovulación. Aún estás en fase previa.`
            : `La ovulación fue hace ${Math.abs(ovuIn)} días.`;

  return (
    <Card className="!p-0 overflow-hidden" >
      <div className="p-6 sm:p-7 pb-5">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge variant="rose">Cálculo #{result.id}</Badge>
          {result.userId && <Badge variant="ghost">{result.userName || `Perfil #${result.userId}`}</Badge>}
          <Badge variant={nextIn < 0 ? 'ghost' : 'green'}>
            {nextIn < 0 ? 'Ciclo anterior' : nextIn === 0 ? 'El periodo empieza hoy' : `Periodo en ${nextIn} días`}
          </Badge>
        </div>

        <h3 className="font-display text-[24px] sm:text-[28px] font-semibold tracking-tight leading-tight capitalize">
          {formatFullDate(result.estimatedOvulationDate)}
        </h3>
        <p className="text-[13.5px] text-[#715563] mt-1">Día estimado de ovulación · {ovuIn === 0 ? 'es hoy' : ovuIn > 0 ? `faltan ${ovuIn} días` : `fue hace ${Math.abs(ovuIn)} días`}</p>

        {/* Línea de tiempo */}
        <div className="mt-6 mb-2" aria-label="Línea de tiempo del ciclo">
          <div className="flex items-center gap-0">
            <div className="flex-1">
              <div className="h-2.5 rounded-l-full bg-[#B51B4D]" title="Periodo" />
              <p className="text-[11.5px] font-semibold text-[#7A1032] mt-1.5">Periodo</p>
              <p className="text-[11.5px] text-[#715563]">{formatFriendlyDate(result.lastPeriodStart)}</p>
            </div>
            <div className="flex-[2]">
              <div className="h-2.5 bg-[#DBEFE4] border-x border-white" title="Ventana fértil" />
              <p className="text-[11.5px] font-semibold text-[#0E4A37] mt-1.5">Ventana fértil · {result.fertileDays?.length || 0} días</p>
              <p className="text-[11.5px] text-[#715563]">{formatFriendlyDate(result.fertileWindowStart)} — {formatFriendlyDate(result.fertileWindowEnd)}</p>
            </div>
            <div className="flex-1">
              <div className="h-2.5 rounded-r-full bg-[#E9B64C]" title="Próximo periodo" />
              <p className="text-[11.5px] font-semibold text-[#7A4A00] mt-1.5">Siguiente</p>
              <p className="text-[11.5px] text-[#715563]">{formatFriendlyDate(result.nextPeriodStart)}</p>
            </div>
          </div>
        </div>

        <p className="text-[13.5px] leading-relaxed text-[#2B1A22] bg-[#F6E9E1]/70 border border-[#EADDD3] rounded-xl px-4 py-3 mt-4">
          {phaseNote}
        </p>
      </div>

      <div className="border-t border-[#EADDD3] bg-[#FFFAF6] px-6 sm:px-7 py-5 grid gap-5 sm:grid-cols-2">
        <div>
          <h4 className="text-[13px] font-bold text-[#2B1A22] mb-2">Días de periodo <span className="font-medium text-[#9B8490]">({result.periodDays?.length || 0})</span></h4>
          <DayChips days={result.periodDays} cls="bg-[#FBE3EB] text-[#7A1032] border-[#B51B4D]/15" />
        </div>
        <div>
          <h4 className="text-[13px] font-bold text-[#2B1A22] mb-2">Días fértiles <span className="font-medium text-[#9B8490]">({result.fertileDays?.length || 0})</span></h4>
          <DayChips days={result.fertileDays} cls="bg-[#DBEFE4] text-[#0E4A37] border-[#17604A]/15" />
        </div>
        <div className="sm:col-span-2">
          <details className="group">
            <summary className="text-[13px] font-semibold text-[#715563] cursor-pointer list-none inline-flex items-center gap-1.5 hover:text-[#2B1A22]">
              <svg className="transition-transform group-open:rotate-90" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Ver días no fértiles ({result.nonFertileDays?.length || 0})
            </summary>
            <div className="mt-2.5"><DayChips days={result.nonFertileDays} cls="bg-white text-[#715563] border-[#EADDD3]" /></div>
          </details>
        </div>
      </div>
    </Card>
  );
}
