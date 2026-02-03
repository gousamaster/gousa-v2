// src/validations/estado-tramite-validations.ts

import { z } from "zod";

export const createEstadoTramiteSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .trim(),
  descripcion: z.string().max(1000, "La descripción es muy larga").optional(),
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(50, "El código no puede exceder 50 caracteres")
    .toUpperCase()
    .trim(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color hexadecimal inválido")
    .optional(),
  orden: z.number().int().min(0).optional().default(0),
  activo: z.boolean().optional().default(true),
});

export const updateEstadoTramiteSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .trim()
    .optional(),
  descripcion: z
    .string()
    .max(1000, "La descripción es muy larga")
    .optional()
    .nullable(),
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(50, "El código no puede exceder 50 caracteres")
    .toUpperCase()
    .trim()
    .optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color hexadecimal inválido")
    .optional()
    .nullable(),
  orden: z.number().int().min(0).optional(),
  activo: z.boolean().optional(),
});

export type CreateEstadoTramiteFormData = z.infer<
  typeof createEstadoTramiteSchema
>;
export type UpdateEstadoTramiteFormData = z.infer<
  typeof updateEstadoTramiteSchema
>;
