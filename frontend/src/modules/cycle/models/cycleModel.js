/**
 * Models and validation rules for Cycle module.
 * Mirrors CalculationRequestDTO and CycleResponseDTO from backend.
 */

export const DEFAULT_CYCLE_REQUEST = {
  lastPeriodDate: '',
  cycleLength: 28,
  periodLength: 5,
  userId: null,
};

export const CYCLE_CONSTRAINTS = {
  MIN_CYCLE_LENGTH: 21,
  MAX_CYCLE_LENGTH: 45,
  MIN_PERIOD_LENGTH: 2,
  MAX_PERIOD_LENGTH: 10,
};

/**
 * Validates calculation input fields before sending to API
 * @param {typeof DEFAULT_CYCLE_REQUEST} form
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateCycleRequest(form) {
  const errors = {};

  if (!form.lastPeriodDate) {
    errors.lastPeriodDate = 'La fecha de tu último periodo es requerida.';
  } else {
    const [y, m, d] = form.lastPeriodDate.split('-').map(Number);
    const selectedDate = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      errors.lastPeriodDate = 'La fecha no puede ser en el futuro.';
    }
  }

  const cycle = Number(form.cycleLength);
  if (isNaN(cycle) || cycle < CYCLE_CONSTRAINTS.MIN_CYCLE_LENGTH || cycle > CYCLE_CONSTRAINTS.MAX_CYCLE_LENGTH) {
    errors.cycleLength = `La duración del ciclo debe estar entre ${CYCLE_CONSTRAINTS.MIN_CYCLE_LENGTH} y ${CYCLE_CONSTRAINTS.MAX_CYCLE_LENGTH} días.`;
  }

  const period = Number(form.periodLength);
  if (isNaN(period) || period < CYCLE_CONSTRAINTS.MIN_PERIOD_LENGTH || period > CYCLE_CONSTRAINTS.MAX_PERIOD_LENGTH) {
    errors.periodLength = `La duración del sangrado debe estar entre ${CYCLE_CONSTRAINTS.MIN_PERIOD_LENGTH} y ${CYCLE_CONSTRAINTS.MAX_PERIOD_LENGTH} días.`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
