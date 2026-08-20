// src/lib/utils/date-timezone.ts

/** TIMEZONE DE BOLIVIA: UTC-4. Todas las citas se interpretan en hora de La Paz. */
const BOLIVIA_OFFSET_HOURS = -4;
const BOLIVIA_OFFSET_MS = BOLIVIA_OFFSET_HOURS * 60 * 60 * 1000;

/**
 * Convierte datetime-local (sin zona) al instante UTC equivalente en Bolivia.
 * Ejemplo: 2026-08-20T20:00 Bolivia = 2026-08-21T00:00:00.000Z.
 */
export function parseLocalDateTime(dateTimeString: string): Date {
  const [datePart, timePart] = dateTimeString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hours, minutes, 0, 0);
  return new Date(wallClockAsUtc - BOLIVIA_OFFSET_MS);
}

/** Convierte Date de BD a datetime-local usando siempre America/La_Paz. */
export function formatForDateTimeLocal(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/La_Paz", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Compatibilidad con componentes que esperan un Date ajustado para display. */
export function adjustDateForDisplay(date: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/La_Paz", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return new Date(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
}
