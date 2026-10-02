import React, { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { formatFriendlyDate } from '../../../shared/utils/dateUtils';

function SkeletonRows() {
  return (
    <ul className="grid gap-2.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className="rounded-2xl border border-[#EADDD3]/70 px-4 py-3.5 animate-pulse">
          <div className="h-3.5 w-2/3 rounded-full bg-[#EADDD3]/60" />
          <div className="h-3 w-1/2 rounded-full bg-[#EADDD3]/40 mt-2" />
        </li>
      ))}
    </ul>
  );
}

/**
 * Historial de cálculos con borrado en línea.
 */
export function CycleHistoryList({
  history = [],
  users = [],
  loading = false,
  lastUpdated = null,
  error = null,
  onRefresh,
  onDelete,
  onSelect,
}) {
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const count = history.length;

  const userNameOf = (h) =>
    h.userName || users.find((u) => u.id === h.userId)?.name || null;

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await onDelete?.(id);
      setConfirmId(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card id="historial" className="scroll-mt-6">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h3 className="font-display text-[19px] font-semibold tracking-tight text-[#2B1A22]">Historial</h3>
          <p className="text-[13px] text-[#715563] mt-1">
            {count === 0
              ? 'Sin registros todavía'
              : `${count} ${count === 1 ? 'registro' : 'registros'}`}
            {lastUpdated ? ` · actualizado ${lastUpdated}` : ''}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="shrink-0 inline-flex items-center gap-2 text-[13px] font-semibold px-3.5 py-2 rounded-full border border-[#EADDD3] text-[#2B1A22] hover:border-[#2B1A22]/30 disabled:opacity-50 disabled:cursor-wait transition"
        >
          {loading && (
            <svg className="animate-spin" width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" />
              <path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
          {loading ? 'Cargando…' : 'Actualizar'}
        </button>
      </div>

      {loading && count === 0 && !error && (
        <div className="mt-4"><SkeletonRows /></div>
      )}

      {!loading && error && count === 0 && (
        <div className="mt-4 rounded-2xl border border-[#B51B4D]/20 bg-[#FBE3EB]/50 px-4 py-4">
          <p className="text-[13.5px] font-semibold text-[#7A1032]">No se pudo cargar el historial</p>
          <p className="text-[13px] text-[#715563] mt-1 leading-relaxed">
            Comprueba que el backend esté en marcha en http://localhost:8080 e inténtalo de nuevo.
          </p>
          <button
            onClick={onRefresh}
            className="mt-3 text-[13px] font-semibold px-4 py-2 rounded-full bg-[#B51B4D] text-white hover:bg-[#7A1032] transition"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && count === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-[#EADDD3] bg-white/60 px-4 py-6 text-center">
          <p className="font-display text-[17px] font-semibold text-[#2B1A22]">Aún no hay cálculos</p>
          <p className="text-[13px] text-[#715563] mt-1">Cuando calcules tu ventana fértil, aparecerá aquí.</p>
          <a
            href="#calcular"
            className="inline-flex items-center gap-2 mt-4 rounded-full bg-[#2B1A22] text-white text-[13.5px] font-semibold px-5 py-2.5 hover:bg-[#B51B4D] transition"
          >
            Calcular ahora
          </a>
        </div>
      )}

      {count > 0 && (
        <ul className={`grid gap-2.5 mt-4 max-h-96 overflow-y-auto pr-1 nice-scroll ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
          {history.map((h) => {
            const name = userNameOf(h);
            const confirming = confirmId === h.id;
            const deleting = deletingId === h.id;
            return (
              <li
                key={h.id}
                className={`rounded-2xl border px-4 py-3 transition ${confirming ? 'border-[#B51B4D]/40 bg-[#FBE3EB]/40' : 'border-[#EADDD3]/80 bg-white hover:border-[#B51B4D]/30'}`}
              >
                {!confirming ? (
                  <>
                    <p className="text-[13.5px] font-semibold text-[#2B1A22]">Cálculo #{h.id}</p>
                    <p className="text-[12.5px] text-[#715563] mt-0.5">
                      Último {formatFriendlyDate(h.lastPeriodStart)} → Próx {formatFriendlyDate(h.nextPeriodStart)}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Badge variant="green">Fértil {formatFriendlyDate(h.fertileWindowStart)}</Badge>
                      {name && <Badge variant="ghost">{name}</Badge>}
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-2.5">
                      <button
                        onClick={() => onSelect?.(h)}
                        className="text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full border border-[#EADDD3] text-[#2B1A22] hover:border-[#2B1A22]/30 transition"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => setConfirmId(h.id)}
                        className="text-[12.5px] font-medium px-3 py-1.5 rounded-full text-[#9B8490] hover:text-[#B51B4D] hover:bg-[#FBE3EB] transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[12.5px] text-[#7A1032] font-medium basis-full sm:basis-auto sm:flex-1">
                      ¿Borrar el cálculo #{h.id}?
                    </p>
                    <span className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleDelete(h.id)}
                        disabled={deleting}
                        className="flex-1 sm:flex-none text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full bg-[#B51B4D] text-white hover:bg-[#7A1032] disabled:opacity-50 disabled:cursor-wait transition text-center"
                      >
                        {deleting ? 'Borrando…' : 'Sí, borrar'}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        disabled={deleting}
                        className="flex-1 sm:flex-none text-[12.5px] font-medium px-3 py-1.5 rounded-full border border-[#EADDD3] bg-white hover:border-[#2B1A22]/30 disabled:opacity-50 transition text-center"
                      >
                        Conservar
                      </button>
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
