// src/validations/tipo-cita-validations.ts

import { z } from "zod";

export const createTipoCitaSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .trim(),
  descripcion: z.string().max(1000, "La descripción es muy larga").optional(),
  codigo: z
    .string()
    .min(2, "El código debe tener al menos 2 caracteres")
    .max(20, "El código no puede exceder 20 caracteres")
    .toUpperCase()
    .trim(),
  activo: z.boolean().optional().default(true),
  orden: z.number().int().min(0).optional().default(0),
});

export const updateTipoCitaSchema = z.object({
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
    .max(20, "El código no puede exceder 20 caracteres")
    .toUpperCase()
    .trim()
    .optional(),
  activo: z.boolean().optional(),
  orden: z.number().int().min(0).optional(),
});

export const citaPrecioSchema = z.object({
  regionId: z.string().min(1, "La región es requerida"),
  precio: z
    .number()
    .min(0, "El precio no puede ser negativo")
    .max(999999.99, "El precio es demasiado alto"),
});

export const citaPrecioInputSchema = z.object({
  tipoCitaId: z.string().min(1, "El tipo de cita es requerido"),
  regionId: z.string().min(1, "La región es requerida"),
  precio: z
    .number()
    .min(0, "El precio no puede ser negativo")
    .max(999999.99, "El precio es demasiado alto"),
});

export const updateCitaPrecioSchema = z.object({
  precio: z
    .number()
    .min(0, "El precio no puede ser negativo")
    .max(999999.99, "El precio es demasiado alto"),
  activo: z.boolean().optional(),
});

export const createTipoCitaConPreciosSchema = z.object({
  tipoCita: createTipoCitaSchema,
  precios: z
    .array(citaPrecioSchema)
    .min(1, "Debe agregar al menos un precio por región"),
});

export type CreateTipoCitaFormData = z.infer<typeof createTipoCitaSchema>;
export type UpdateTipoCitaFormData = z.infer<typeof updateTipoCitaSchema>;
export type CitaPrecioFormData = z.infer<typeof citaPrecioSchema>;
export type CitaPrecioInput = z.infer<typeof citaPrecioInputSchema>;
export type UpdateCitaPrecioFormData = z.infer<typeof updateCitaPrecioSchema>;
export type CreateTipoCitaConPreciosFormData = z.infer<
  typeof createTipoCitaConPreciosSchema
>;
