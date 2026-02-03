// src/validations/region-validations.ts

import { z } from "zod";

export const createRegionSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim(),
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(10, "El código no puede exceder 10 caracteres")
    .toUpperCase()
    .trim(),
  activo: z.boolean().optional().default(true),
});

export const updateRegionSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim()
    .optional(),
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(10, "El código no puede exceder 10 caracteres")
    .toUpperCase()
    .trim()
    .optional(),
  activo: z.boolean().optional(),
});

export type CreateRegionFormData = z.infer<typeof createRegionSchema>;
export type UpdateRegionFormData = z.infer<typeof updateRegionSchema>;
