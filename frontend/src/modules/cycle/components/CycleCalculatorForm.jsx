import React, { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { DEFAULT_CYCLE_REQUEST, CYCLE_CONSTRAINTS, validateCycleRequest } from '../models/cycleModel';

const labelCls = 'block text-[13.5px] font-semibold text-[#2B1A22] mb-1.5';

// Fecha de hoy en hora local (toISOString usa UTC y se desfasa según la zona horaria).
function todayLocalISO() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}
const TODAY_ISO = todayLocalISO();

function Stepper({ id, value, min, max, unit, onChange, onDecrease, onIncrease }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <button
        type="button"
        onClick={onDecrease}
        aria-label={`Reducir ${id}`}
        className="shrink-0 w-11 h-[48px] rounded-xl border border-white/15 bg-white/10 text-lg font-bold text-white hover:border-[#E9B64C]/60 hover:text-[#E9B64C] active:scale-95 transition"
      >
        −
      </button>
      <div className="flex-1 min-w-0 relative">
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          className="w-full min-w-0 rounded-xl border border-transparent bg-white px-3 py-3 text-center font-semibold text-[17px] text-[#2B1A22] outline-none focus:border-[#E9B64C] focus:ring-[3px] focus:ring-[#E9B64C]/25 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={value}
          onChange={onChange}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#9B8490] pointer-events-none">{unit}</span>
      </div>
      <button
        type="button"
        onClick={onIncrease}
        aria-label={`Aumentar ${id}`}
        className="shrink-0 w-11 h-[48px] rounded-xl border border-white/15 bg-white/10 text-lg font-bold text-white hover:border-[#E9B64C]/60 hover:text-[#E9B64C] active:scale-95 transition"
      >
        +
      </button>
    </div>
  );
}

/**
 * Formulario de cálculo con steppers táctiles.
 */
export function CycleCalculatorForm({ initialUserId = null, loading = false, onSubmit }) {
  const [form, setForm] = useState({ ...DEFAULT_CYCLE_REQUEST, userId: initialUserId });
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setForm((f) => ({ ...f, userId: initialUserId }));
  }, [initialUserId]);

  const set = (key) => (e) => {
    const v = e.target.value;
    setForm((f) => ({
      ...f,
      [key]: key === 'cycleLength' || key === 'periodLength' ? (v === '' ? '' : Number(v)) : v,
    }));
  };

  const step = (key, delta, min, max) => () => {
    setForm((f) => {
      const cur = Number(f[key]) || min;
      const next = Math.min(max, Math.max(min, cur + delta));
      return { ...f, [key]: next };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { isValid, errors } = validateCycleRequest(form);
    setErrors(errors);
    if (!isValid) return;
    onSubmit({
      lastPeriodDate: form.lastPeriodDate,
      cycleLength: Number(form.cycleLength),
      periodLength: Number(form.periodLength),
      ...(form.userId ? { userId: form.userId } : {}),
    });
  };

  return (
    <Card tone="ink" className="relative overflow-hidden" >
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#B51B4D]/30 blur-[80px] pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-28 -left-20 w-72 h-72 rounded-full bg-[#E9B64C]/15 blur-[80px] pointer-events-none" aria-hidden="true" />

      <div className="relative" id="calcular">
        <p className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#E9B64C] bg-white/10 border border-white/10 rounded-full px-3 py-1 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E9B64C]" aria-hidden="true" />
          Método estándar · ovulación = próximo periodo − 14 días
        </p>
        <h3 className="font-display text-[26px] sm:text-[30px] font-semibold tracking-tight leading-[1.05]">Calcula tu ventana fértil</h3>
        <p className="text-[14px] text-white/65 mt-2 leading-relaxed max-w-[52ch]">
          Tres datos bastan. El resultado se guarda en tu historial y puedes consultarlo cuando quieras.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-5 mt-6" noValidate>
          <div>
            <label className="block text-[13.5px] font-semibold text-white/90 mb-1.5" htmlFor="lastPeriodDate">
              Primer día del último periodo
            </label>
            <input
              id="lastPeriodDate"
              type="date"
              className="w-full rounded-xl border border-white/15 bg-white text-[#2B1A22] px-4 py-3 text-[15px] outline-none focus:border-[#E9B64C] focus:ring-[3px] focus:ring-[#E9B64C]/25 transition [color-scheme:light]"
              value={form.lastPeriodDate}
              max={TODAY_ISO}
              onChange={set('lastPeriodDate')}
            />
            {errors.lastPeriodDate
              ? <p className="text-[12.5px] text-[#FFB3C1] font-medium mt-1.5">{errors.lastPeriodDate}</p>
              : <p className="text-[12.5px] text-white/50 mt-1.5">No puede ser una fecha futura.</p>}
          </div>

          <div className="grid gap-5">
            <div>
              <label className={labelCls + ' !text-white/90'} htmlFor="cycleLength">Tu ciclo dura</label>
              <Stepper id="cycleLength" value={form.cycleLength} min={CYCLE_CONSTRAINTS.MIN_CYCLE_LENGTH} max={CYCLE_CONSTRAINTS.MAX_CYCLE_LENGTH} unit="días" onChange={set('cycleLength')} onDecrease={step('cycleLength', -1, CYCLE_CONSTRAINTS.MIN_CYCLE_LENGTH, CYCLE_CONSTRAINTS.MAX_CYCLE_LENGTH)} onIncrease={step('cycleLength', 1, CYCLE_CONSTRAINTS.MIN_CYCLE_LENGTH, CYCLE_CONSTRAINTS.MAX_CYCLE_LENGTH)} />
              {errors.cycleLength && <p className="text-[12.5px] text-[#FFB3C1] font-medium mt-1.5">{errors.cycleLength}</p>}
            </div>
            <div>
              <label className={labelCls + ' !text-white/90'} htmlFor="periodLength">El sangrado dura</label>
              <Stepper id="periodLength" value={form.periodLength} min={CYCLE_CONSTRAINTS.MIN_PERIOD_LENGTH} max={CYCLE_CONSTRAINTS.MAX_PERIOD_LENGTH} unit="días" onChange={set('periodLength')} onDecrease={step('periodLength', -1, CYCLE_CONSTRAINTS.MIN_PERIOD_LENGTH, CYCLE_CONSTRAINTS.MAX_PERIOD_LENGTH)} onIncrease={step('periodLength', 1, CYCLE_CONSTRAINTS.MIN_PERIOD_LENGTH, CYCLE_CONSTRAINTS.MAX_PERIOD_LENGTH)} />
              {errors.periodLength && <p className="text-[12.5px] text-[#FFB3C1] font-medium mt-1.5">{errors.periodLength}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#FFFAF6] text-[#2B1A22] font-semibold text-[15px] py-3.5 px-6 hover:bg-white disabled:opacity-60 disabled:cursor-wait transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" /><path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Calculando…
                </>
              ) : (
                <>
                  Calcular días fértiles
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Card>
  );
}
