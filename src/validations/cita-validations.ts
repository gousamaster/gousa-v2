// src/validations/cita-validations.ts

import { z } from "zod";

export const createCitaSchema = z
  .object({
    tramiteId: z.string().optional().nullable(),
    grupoFamiliarId: z.string().optional().nullable(),
    tipoCitaId: z.string().min(1, "El tipo de cita es requerido"),
    fechaHora: z.string().min(1, "La fecha y hora son requeridas"),
    lugar: z.string().max(500).trim().optional().nullable(),
    precioAcordado: z
      .number({ invalid_type_error: "El precio debe ser un número" })
      .min(0),
    descuentoAplicado: z.number().min(0).optional().nullable(),
    precioFinal: z.number().min(0),
    estadoPagoId: z.string().min(1, "El estado de pago es requerido"),
    notas: z.string().max(2000).trim().optional().nullable(),
    participanteTramiteIds: z.array(z.string()).optional(),
  })
  .refine((data) => data.tramiteId || data.grupoFamiliarId, {
    message: "Debe asociarse a un trámite o grupo familiar",
  });

export const updateCitaSchema = z.object({
  fechaHora: z.string().optional(),
  lugar: z.string().max(500).trim().optional().nullable(),
  precioAcordado: z.number().min(0).optional(),
  descuentoAplicado: z.number().min(0).optional().nullable(),
  precioFinal: z.number().min(0).optional(),
  estadoPagoId: z.string().optional(),
  estado: z
    .enum(["PROGRAMADA", "COMPLETADA", "CANCELADA", "REPROGRAMADA"])
    .optional(),
  notas: z.string().max(2000).trim().optional().nullable(),
});

export const registrarAsistenciaSchema = z.object({
  tramiteId: z.string(),
  asistio: z.boolean(),
  notas: z.string().max(1000).trim().optional().nullable(),
});

export type CreateCitaFormData = z.infer<typeof createCitaSchema>;
export type UpdateCitaFormData = z.infer<typeof updateCitaSchema>;
export type RegistrarAsistenciaFormData = z.infer<
  typeof registrarAsistenciaSchema
>;
