// src/validations/parentesco-validations.ts

import { z } from "zod";

export const createParentescoSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim(),
  descripcion: z.string().max(500, "La descripción es muy larga").optional(),
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(50, "El código no puede exceder 50 caracteres")
    .toUpperCase()
    .trim(),
  activo: z.boolean().optional().default(true),
  orden: z.number().int().min(0).optional().default(0),
});

export const updateParentescoSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .trim()
    .optional(),
  descripcion: z
    .string()
    .max(500, "La descripción es muy larga")
    .optional()
    .nullable(),
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(50, "El código no puede exceder 50 caracteres")
    .toUpperCase()
    .trim()
    .optional(),
  activo: z.boolean().optional(),
  orden: z.number().int().min(0).optional(),
});

export type CreateParentescoFormData = z.infer<typeof createParentescoSchema>;
export type UpdateParentescoFormData = z.infer<typeof updateParentescoSchema>;
