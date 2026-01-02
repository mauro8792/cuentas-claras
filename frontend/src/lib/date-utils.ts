// Utilidades para manejo de fechas con timezone de Argentina (UTC-3)

const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';

/**
 * Obtiene la fecha actual en Argentina
 */
export function getNowInArgentina(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: ARGENTINA_TIMEZONE }));
}

/**
 * Formatea una fecha para mostrar en UI (ej: "2 ene 2026")
 */
export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: ARGENTINA_TIMEZONE,
  });
}

/**
 * Formatea una fecha completa (ej: "jueves 2 de enero de 2026")
 */
export function formatDateFull(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: ARGENTINA_TIMEZONE,
  });
}

/**
 * Formatea solo el día y mes (ej: "2 ene")
 */
export function formatDayMonth(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    timeZone: ARGENTINA_TIMEZONE,
  });
}

/**
 * Obtiene el nombre del mes (ej: "enero")
 */
export function getMonthName(month: number): string {
  const date = new Date(2024, month - 1, 1);
  return date.toLocaleDateString('es-AR', { month: 'long' });
}

/**
 * Obtiene el nombre del mes abreviado (ej: "ene")
 */
export function getMonthNameShort(month: number): string {
  const date = new Date(2024, month - 1, 1);
  return date.toLocaleDateString('es-AR', { month: 'short' });
}

/**
 * Obtiene el mes y año actuales en Argentina
 */
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = getNowInArgentina();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

/**
 * Convierte una fecha a formato ISO para el input type="date"
 */
export function toInputDateFormat(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Obtiene la fecha de hoy en formato ISO
 */
export function getTodayISO(): string {
  const now = getNowInArgentina();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: Date | string): boolean {
  const d = new Date(date);
  const now = getNowInArgentina();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

/**
 * Verifica si una fecha es ayer
 */
export function isYesterday(date: Date | string): boolean {
  const d = new Date(date);
  const yesterday = getNowInArgentina();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Formatea fecha relativa (ej: "Hoy", "Ayer", "2 ene")
 */
export function formatRelativeDate(date: Date | string): string {
  if (isToday(date)) return 'Hoy';
  if (isYesterday(date)) return 'Ayer';
  return formatDayMonth(date);
}

/**
 * Formatea moneda
 */
export function formatCurrency(amount: number, currency: string = 'ARS'): string {
  const symbols: Record<string, string> = {
    ARS: '$',
    USD: 'US$',
    EUR: '€',
    BRL: 'R$',
    UYU: '$U',
    CLP: 'CLP$',
  };
  
  const symbol = symbols[currency] || '$';
  
  // Formatear número con separadores de miles argentinos
  const formatted = amount.toLocaleString('es-AR', {
    minimumFractionDigits: currency === 'ARS' ? 0 : 2,
    maximumFractionDigits: 2,
  });
  
  return `${symbol}${formatted}`;
}

/**
 * Obtiene los meses del año para un selector
 */
export function getMonthsOptions(): { value: number; label: string }[] {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1).charAt(0).toUpperCase() + getMonthName(i + 1).slice(1),
  }));
}

/**
 * Obtiene años para un selector (últimos 5 años)
 */
export function getYearsOptions(): number[] {
  const currentYear = getNowInArgentina().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - i);
}

