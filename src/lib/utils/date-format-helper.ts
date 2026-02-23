// src/lib/utils/date-format-helper.ts

/**
 * Convierte una fecha a formato string YYYY-MM-DD para inputs de tipo date
 * Maneja Date objects, ISO strings y null/undefined
 */
export function formatDateForInput(
  date: Date | string | null | undefined,
): string | null {
  if (!date) return null;

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Verificar que sea una fecha válida
    if (Number.isNaN(dateObj.getTime())) {
      return null;
    }

    // Formatear como YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
}

/**
 * Convierte múltiples fechas en un objeto
 */
export function formatDatesForInput<T extends Record<string, unknown>>(
  obj: T,
  dateFields: Array<keyof T>,
): T {
  const result = { ...obj };

  for (const field of dateFields) {
    const value = obj[field];
    if (value instanceof Date || typeof value === "string") {
      // @ts-expect-error - Estamos convirtiendo fechas a strings
      result[field] = formatDateForInput(value);
    }
  }

  return result;
}
