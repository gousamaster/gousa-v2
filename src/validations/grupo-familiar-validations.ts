// src/validations/grupo-familiar-validations.ts

import { z } from "zod";

export const createGrupoFamiliarSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(255)
    .trim(),
  descripcion: z.string().max(1000).trim().optional().nullable(),
  parentescoTitularId: z.string().min(1, "El tipo de parentesco es requerido"),
});

export const addMiembroSchema = z.object({
  clienteId: z.string().min(1, "El cliente es requerido"),
  parentescoId: z.string().min(1, "El tipo de parentesco es requerido"),
});

export type CreateGrupoFamiliarFormData = z.infer<
  typeof createGrupoFamiliarSchema
>;
export type AddMiembroFormData = z.infer<typeof addMiembroSchema>;
