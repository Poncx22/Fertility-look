/**
 * Date formatting and calculation utilities in Spanish.
 */

/**
 * Formats a YYYY-MM-DD string into a friendly localized date format (e.g. "14 Oct, 2026")
 * @param {string} dateStr
 * @returns {string}
 */
export function formatFriendlyDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats a date with weekday (e.g. "Miércoles, 14 de Octubre")
 * @param {string} dateStr
 * @returns {string}
 */
export function formatFullDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

/**
 * Calculates days remaining from today until a target date
 * @param {string} dateStr
 * @returns {number}
 */
export function daysUntil(dateStr) {
  if (!dateStr) return 0;
  const [year, month, day] = dateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
