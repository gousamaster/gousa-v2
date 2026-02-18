// src/lib/utils/date-timezone.ts

/**
 * TIMEZONE DE BOLIVIA: UTC-4
 * Todas las citas son en hora de La Paz
 */
const BOLIVIA_OFFSET_HOURS = -4;
const BOLIVIA_OFFSET_MS = BOLIVIA_OFFSET_HOURS * 60 * 60 * 1000;

/**
 * Convierte datetime-local a Date para guardar en BD
 * Compensa el offset de Bolivia para que PostgreSQL guarde la hora correcta
 *
 * @example
 * Input: "2024-02-18T08:00" (usuario quiere 8 AM Bolivia)
 * Output: Date que PG guardará como "2024-02-18 08:00:00" efectivo
 */
export function parseLocalDateTime(dateTimeString: string): Date {
  const [datePart, timePart] = dateTimeString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  // Crear en UTC con la hora deseada
  const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));

  // Compensar: PG sumará 4h al convertir a UTC, nosotros restamos 4h antes
  return new Date(date.getTime() + BOLIVIA_OFFSET_MS);
}

/**
 * Convierte Date de la BD a string para input datetime-local
 *
 * @param date - Date object de la BD
 * @returns String formato "YYYY-MM-DDTHH:mm"
 */
export function formatForDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Ajusta Date de la BD para display correcto en componentes
 * Compensa la conversión automática de timezone del browser
 *
 * @example
 * BD tiene: "2024-02-18T12:00:00.000Z" (UTC)
 * JS muestra: 08:00 (Bolivia local)
 * Queremos: 12:00 (la hora original)
 *
 * @param date - Date object de la BD
 * @returns Date ajustado para mostrar hora correcta
 */
export function adjustDateForDisplay(date: Date): Date {
  // Obtener el offset del browser en milisegundos
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;

  // Sumar el offset para cancelar la conversión automática
  // Esto hace que la "hora UTC" se muestre como "hora local"
  return new Date(date.getTime() + offsetMs);
}
