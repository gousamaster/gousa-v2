// src/validations/cliente-validations.ts

import { TipoCliente } from "@prisma/client";
import { z } from "zod";
import { optionalDateSchema } from "@/lib/validations/date-helpers";

export const createClienteSchema = z.object({
  nombres: z
    .string()
    .min(2, "Los nombres deben tener al menos 2 caracteres")
    .max(255, "Los nombres no pueden exceder 255 caracteres")
    .trim(),
  apellidos: z
    .string()
    .min(2, "Los apellidos deben tener al menos 2 caracteres")
    .max(255, "Los apellidos no pueden exceder 255 caracteres")
    .trim(),
  tipoCliente: z.nativeEnum(TipoCliente),
  fechaNacimiento: optionalDateSchema,
  lugarNacimiento: z.string().max(255).trim().optional().nullable(),
  nacionalidad: z.string().max(100).trim().optional().nullable(),
  numeroCi: z.string().max(50).trim().optional().nullable(),
  numeroPasaporte: z.string().max(50).trim().optional().nullable(),
  email: z
    .string()
    .email("Email inválido")
    .max(255)
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  telefonoCelular: z.string().max(50).trim().optional().nullable(),
  regionId: z.string().min(1, "La región es requerida"),
  registradoPorId: z.string().min(1, "El usuario registrador es requerido"),
});

export const updateClienteSchema = z.object({
  nombres: z
    .string()
    .min(2, "Los nombres deben tener al menos 2 caracteres")
    .max(255, "Los nombres no pueden exceder 255 caracteres")
    .trim()
    .optional(),
  apellidos: z
    .string()
    .min(2, "Los apellidos deben tener al menos 2 caracteres")
    .max(255, "Los apellidos no pueden exceder 255 caracteres")
    .trim()
    .optional(),
  tipoCliente: z.nativeEnum(TipoCliente).optional(),
  fechaNacimiento: optionalDateSchema,
  lugarNacimiento: z.string().max(255).trim().optional().nullable(),
  nacionalidad: z.string().max(100).trim().optional().nullable(),
  numeroCi: z.string().max(50).trim().optional().nullable(),
  numeroPasaporte: z.string().max(50).trim().optional().nullable(),
  email: z
    .string()
    .email("Email inválido")
    .max(255)
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  telefonoCelular: z.string().max(50).trim().optional().nullable(),
  regionId: z.string().optional(),
  activo: z.boolean().optional(),
});

export const createClienteDatosPersonalesSchema = z.object({
  pasaporteFechaEmision: optionalDateSchema,
  pasaporteFechaExpiracion: optionalDateSchema,
  facebook: z.string().max(255).trim().optional().nullable(),
  instagram: z.string().max(255).trim().optional().nullable(),
  direccionDomicilio: z.string().max(1000).trim().optional().nullable(),
  estadoCivil: z.string().max(50).trim().optional().nullable(),
  profesion: z.string().max(255).trim().optional().nullable(),
  nombrePadre: z.string().max(255).trim().optional().nullable(),
  fechaNacimientoPadre: optionalDateSchema,
  nombreMadre: z.string().max(255).trim().optional().nullable(),
  fechaNacimientoMadre: optionalDateSchema,
});

export const updateClienteDatosPersonalesSchema = z.object({
  pasaporteFechaEmision: optionalDateSchema,
  pasaporteFechaExpiracion: optionalDateSchema,
  facebook: z.string().max(255).trim().optional().nullable(),
  instagram: z.string().max(255).trim().optional().nullable(),
  direccionDomicilio: z.string().max(1000).trim().optional().nullable(),
  estadoCivil: z.string().max(50).trim().optional().nullable(),
  profesion: z.string().max(255).trim().optional().nullable(),
  nombrePadre: z.string().max(255).trim().optional().nullable(),
  fechaNacimientoPadre: optionalDateSchema,
  nombreMadre: z.string().max(255).trim().optional().nullable(),
  fechaNacimientoMadre: optionalDateSchema,
});

export const createClienteDatosLaboralesSchema = z.object({
  lugarTrabajo: z.string().max(255).trim().optional().nullable(),
  cargoTrabajo: z.string().max(255).trim().optional().nullable(),
  descripcionTrabajo: z.string().max(1000).trim().optional().nullable(),
  direccionTrabajo: z.string().max(1000).trim().optional().nullable(),
  telefonoTrabajo: z.string().max(50).trim().optional().nullable(),
  fechaContratacion: optionalDateSchema,
  percepcionSalarial: z
    .number()
    .positive()
    .max(9999999.99)
    .optional()
    .nullable(),
  nombreTrabajoAnterior: z.string().max(255).trim().optional().nullable(),
  telefonoTrabajoAnterior: z.string().max(50).trim().optional().nullable(),
  direccionTrabajoAnterior: z.string().max(1000).trim().optional().nullable(),
  fechaInicioTrabajoAnterior: optionalDateSchema,
  referenciaTrabajoAnterior: z.string().max(1000).trim().optional().nullable(),
});

export const updateClienteDatosLaboralesSchema = z.object({
  lugarTrabajo: z.string().max(255).trim().optional().nullable(),
  cargoTrabajo: z.string().max(255).trim().optional().nullable(),
  descripcionTrabajo: z.string().max(1000).trim().optional().nullable(),
  direccionTrabajo: z.string().max(1000).trim().optional().nullable(),
  telefonoTrabajo: z.string().max(50).trim().optional().nullable(),
  fechaContratacion: optionalDateSchema,
  percepcionSalarial: z
    .number()
    .positive()
    .max(9999999.99)
    .optional()
    .nullable(),
  nombreTrabajoAnterior: z.string().max(255).trim().optional().nullable(),
  telefonoTrabajoAnterior: z.string().max(50).trim().optional().nullable(),
  direccionTrabajoAnterior: z.string().max(1000).trim().optional().nullable(),
  fechaInicioTrabajoAnterior: optionalDateSchema,
  referenciaTrabajoAnterior: z.string().max(1000).trim().optional().nullable(),
});

export const createClienteDatosAcademicosSchema = z.object({
  lugarEstudio: z.string().max(255).trim().optional().nullable(),
  carreraEstudio: z.string().max(255).trim().optional().nullable(),
  direccionEstudio: z.string().max(1000).trim().optional().nullable(),
  telefonoEstudio: z.string().max(50).trim().optional().nullable(),
  fechaInicioEstudio: optionalDateSchema,
  fechaFinEstudio: optionalDateSchema,
});

export const updateClienteDatosAcademicosSchema = z.object({
  lugarEstudio: z.string().max(255).trim().optional().nullable(),
  carreraEstudio: z.string().max(255).trim().optional().nullable(),
  direccionEstudio: z.string().max(1000).trim().optional().nullable(),
  telefonoEstudio: z.string().max(50).trim().optional().nullable(),
  fechaInicioEstudio: optionalDateSchema,
  fechaFinEstudio: optionalDateSchema,
});

export const createClienteDatosMatrimonialesSchema = z.object({
  conyugeNombreCompleto: z.string().max(255).trim().optional().nullable(),
  conyugeFechaNacimiento: optionalDateSchema,
  conyugeLugarNacimiento: z.string().max(255).trim().optional().nullable(),
  matrimonioFechaInicio: optionalDateSchema,
  matrimonioFechaFin: optionalDateSchema,
});

export const updateClienteDatosMatrimonialesSchema = z.object({
  conyugeNombreCompleto: z.string().max(255).trim().optional().nullable(),
  conyugeFechaNacimiento: optionalDateSchema,
  conyugeLugarNacimiento: z.string().max(255).trim().optional().nullable(),
  matrimonioFechaInicio: optionalDateSchema,
  matrimonioFechaFin: optionalDateSchema,
});

export const createClienteDatosPatrocinadorSchema = z.object({
  nombrePatrocinador: z.string().max(255).trim().optional().nullable(),
  direccionPatrocinador: z.string().max(1000).trim().optional().nullable(),
  telefonoPatrocinador: z.string().max(50).trim().optional().nullable(),
  emailPatrocinador: z
    .string()
    .email("Email inválido")
    .max(255)
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  trabajoPatrocinador: z.string().max(255).trim().optional().nullable(),
  fechaInicioTrabajoPatrocinador: optionalDateSchema,
  percepcionSalarialPatrocinador: z
    .number()
    .positive()
    .max(9999999.99)
    .optional()
    .nullable(),
});

export const updateClienteDatosPatrocinadorSchema = z.object({
  nombrePatrocinador: z.string().max(255).trim().optional().nullable(),
  direccionPatrocinador: z.string().max(1000).trim().optional().nullable(),
  telefonoPatrocinador: z.string().max(50).trim().optional().nullable(),
  emailPatrocinador: z
    .string()
    .email("Email inválido")
    .max(255)
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  trabajoPatrocinador: z.string().max(255).trim().optional().nullable(),
  fechaInicioTrabajoPatrocinador: optionalDateSchema,
  percepcionSalarialPatrocinador: z
    .number()
    .positive()
    .max(9999999.99)
    .optional()
    .nullable(),
});

export const createClienteDatosViajeSchema = z.object({
  motivo: z.string().max(500).trim().optional().nullable(),
  lugar: z.string().max(255).trim().optional().nullable(),
  fechaTentativa: optionalDateSchema,
  tiempoEstadia: z.string().max(255).trim().optional().nullable(),
  contactoDestino: z.string().max(255).trim().optional().nullable(),
  direccionContacto: z.string().max(500).trim().optional().nullable(),
  telefonoContacto: z.string().max(50).trim().optional().nullable(),
  paisesVisitados: z.string().max(2000).trim().optional().nullable(),
});

export const updateClienteDatosViajeSchema = z.object({
  motivo: z.string().max(500).trim().optional().nullable(),
  lugar: z.string().max(255).trim().optional().nullable(),
  fechaTentativa: optionalDateSchema,
  tiempoEstadia: z.string().max(255).trim().optional().nullable(),
  contactoDestino: z.string().max(255).trim().optional().nullable(),
  direccionContacto: z.string().max(500).trim().optional().nullable(),
  telefonoContacto: z.string().max(50).trim().optional().nullable(),
  paisesVisitados: z.string().max(2000).trim().optional().nullable(),
});

export const createClienteCompletoSchema = z.object({
  cliente: createClienteSchema,
  datosPersonales: createClienteDatosPersonalesSchema.optional(),
  datosLaborales: createClienteDatosLaboralesSchema.optional(),
  datosAcademicos: createClienteDatosAcademicosSchema.optional(),
  datosMatrimoniales: createClienteDatosMatrimonialesSchema.optional(),
  datosPatrocinador: createClienteDatosPatrocinadorSchema.optional(),
  datosViaje: createClienteDatosViajeSchema.optional(),
});

export type CreateClienteFormData = z.infer<typeof createClienteSchema>;
export type UpdateClienteFormData = z.infer<typeof updateClienteSchema>;
export type CreateClienteDatosPersonalesFormData = z.infer<
  typeof createClienteDatosPersonalesSchema
>;
export type UpdateClienteDatosPersonalesFormData = z.infer<
  typeof updateClienteDatosPersonalesSchema
>;
export type CreateClienteDatosLaboralesFormData = z.infer<
  typeof createClienteDatosLaboralesSchema
>;
export type UpdateClienteDatosLaboralesFormData = z.infer<
  typeof updateClienteDatosLaboralesSchema
>;
export type CreateClienteDatosAcademicosFormData = z.infer<
  typeof createClienteDatosAcademicosSchema
>;
export type UpdateClienteDatosAcademicosFormData = z.infer<
  typeof updateClienteDatosAcademicosSchema
>;
export type CreateClienteDatosMatrimonialesFormData = z.infer<
  typeof createClienteDatosMatrimonialesSchema
>;
export type UpdateClienteDatosMatrimonialesFormData = z.infer<
  typeof updateClienteDatosMatrimonialesSchema
>;
export type CreateClienteDatosPatrocinadorFormData = z.infer<
  typeof createClienteDatosPatrocinadorSchema
>;
export type UpdateClienteDatosPatrocinadorFormData = z.infer<
  typeof updateClienteDatosPatrocinadorSchema
>;
export type CreateClienteDatosViajeFormData = z.infer<
  typeof createClienteDatosViajeSchema
>;
export type UpdateClienteDatosViajeFormData = z.infer<
  typeof updateClienteDatosViajeSchema
>;
export type CreateClienteCompletoFormData = z.infer<
  typeof createClienteCompletoSchema
>;
