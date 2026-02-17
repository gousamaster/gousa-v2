// src/lib/validations/date-helpers.ts

import { z } from "zod";

/**
 * Helper para crear un schema de fecha opcional que maneje correctamente strings vacíos
 * Uso: optionalDateSchema en lugar de z.coerce.date().optional().nullable()
 */
export const optionalDateSchema = z
  .union([z.string(), z.date()])
  .optional()
  .nullable()
  .transform((val) => {
    if (!val || val === "") return null;
    if (val instanceof Date) return val;
    const date = new Date(val);
    return isNaN(date.getTime()) ? null : date;
  });

/**
 * Helper para crear un schema de fecha requerida con coerción
 */
export const requiredDateSchema = z.coerce.date();
