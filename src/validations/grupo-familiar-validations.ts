// src/validations/grupo-familiar-validations.ts

import { z } from "zod";

export const createGrupoFamiliarSchema = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres")
    .trim(),
  descripcion: z.string().max(1000, "La descripción es muy larga").optional(),
  activo: z.boolean().optional().default(true),
});

export const updateGrupoFamiliarSchema = z.object({
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
  activo: z.boolean().optional(),
});

export const addMiembroGrupoFamiliarSchema = z.object({
  grupoFamiliarId: z.string().min(1, "El grupo familiar es requerido"),
  clienteId: z.string().min(1, "El cliente es requerido"),
  parentescoId: z.string().min(1, "El parentesco es requerido"),
  esTitular: z.boolean().optional().default(false),
});

export const updateMiembroGrupoFamiliarSchema = z.object({
  parentescoId: z.string().min(1, "El parentesco es requerido").optional(),
  esTitular: z.boolean().optional(),
});

export const miembroGrupoFamiliarSchema = z.object({
  clienteId: z.string().min(1, "El cliente es requerido"),
  parentescoId: z.string().min(1, "El parentesco es requerido"),
  esTitular: z.boolean().optional().default(false),
});

export const createGrupoFamiliarConMiembrosSchema = z.object({
  grupoFamiliar: createGrupoFamiliarSchema,
  miembros: z
    .array(miembroGrupoFamiliarSchema)
    .min(1, "Debe agregar al menos un miembro al grupo familiar")
    .refine(
      (miembros) => {
        const titulares = miembros.filter((m) => m.esTitular);
        return titulares.length === 1;
      },
      {
        message: "Debe haber exactamente un titular en el grupo familiar",
      },
    ),
});

export type CreateGrupoFamiliarFormData = z.infer<
  typeof createGrupoFamiliarSchema
>;
export type UpdateGrupoFamiliarFormData = z.infer<
  typeof updateGrupoFamiliarSchema
>;
export type AddMiembroGrupoFamiliarFormData = z.infer<
  typeof addMiembroGrupoFamiliarSchema
>;
export type UpdateMiembroGrupoFamiliarFormData = z.infer<
  typeof updateMiembroGrupoFamiliarSchema
>;
export type CreateGrupoFamiliarConMiembrosFormData = z.infer<
  typeof createGrupoFamiliarConMiembrosSchema
>;
