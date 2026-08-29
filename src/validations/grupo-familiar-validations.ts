// src/validations/grupo-familiar-validations.ts

import { z } from "zod";

const grupoFamiliarBaseSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255)
    .trim(),
  descripcion: z.string().max(1000).trim().optional().nullable(),
});

export const createGrupoFamiliarSchema = grupoFamiliarBaseSchema;

export const updateGrupoFamiliarSchema = grupoFamiliarBaseSchema.partial();

export const addMiembroSchema = z.object({
  clienteId: z.string().min(1, "El cliente es requerido"),
  parentescoId: z.string().min(1, "El tipo de parentesco es requerido"),
  esTitular: z.boolean().optional(),
});

export const createGrupoFamiliarConMiembrosSchema = z.object({
  grupoFamiliar: createGrupoFamiliarSchema,
  miembros: z
    .array(addMiembroSchema)
    .min(1, "Debe seleccionar al menos un miembro"),
});

export type CreateGrupoFamiliarFormData = z.infer<
  typeof createGrupoFamiliarSchema
>;
export type UpdateGrupoFamiliarFormData = z.infer<
  typeof updateGrupoFamiliarSchema
>;
export type AddMiembroFormData = z.infer<typeof addMiembroSchema>;
export type CreateGrupoFamiliarConMiembrosFormData = z.infer<
  typeof createGrupoFamiliarConMiembrosSchema
>;
