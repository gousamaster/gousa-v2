// src/validations/servicio-validations.ts

import { z } from "zod";

export const createServicioSchema = z.object({
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
  requiereTramite: z.boolean().optional().default(true),
  activo: z.boolean().optional().default(true),
  orden: z.number().int().min(0).optional().default(0),
});

export const updateServicioSchema = z.object({
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
  requiereTramite: z.boolean().optional(),
  activo: z.boolean().optional(),
  orden: z.number().int().min(0).optional(),
});

export const servicioPrecioSchema = z.object({
  regionId: z.string().min(1, "La región es requerida"),
  precio: z
    .number()
    .min(0, "El precio no puede ser negativo")
    .max(999999.99, "El precio es demasiado alto"),
});

export const servicioPrecioInputSchema = z.object({
  servicioId: z.string().min(1, "El servicio es requerido"),
  regionId: z.string().min(1, "La región es requerida"),
  precio: z
    .number()
    .min(0, "El precio no puede ser negativo")
    .max(999999.99, "El precio es demasiado alto"),
});

export const updateServicioPrecioSchema = z.object({
  precio: z
    .number()
    .min(0, "El precio no puede ser negativo")
    .max(999999.99, "El precio es demasiado alto"),
  activo: z.boolean().optional(),
});

export const createServicioConPreciosSchema = z.object({
  servicio: createServicioSchema,
  precios: z
    .array(servicioPrecioSchema)
    .min(1, "Debe agregar al menos un precio por región"),
});

export type CreateServicioFormData = z.infer<typeof createServicioSchema>;
export type UpdateServicioFormData = z.infer<typeof updateServicioSchema>;
export type ServicioPrecioFormData = z.infer<typeof servicioPrecioSchema>;
export type ServicioPrecioInput = z.infer<typeof servicioPrecioInputSchema>;
export type UpdateServicioPrecioFormData = z.infer<
  typeof updateServicioPrecioSchema
>;
export type CreateServicioConPreciosFormData = z.infer<
  typeof createServicioConPreciosSchema
>;
