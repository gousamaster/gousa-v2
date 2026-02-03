// src/validations/cliente-validations.ts

import { TipoCliente } from "@prisma/client";
import { z } from "zod";

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
  fechaNacimiento: z.coerce.date().optional(),
  lugarNacimiento: z.string().max(255).trim().optional(),
  nacionalidad: z.string().max(100).trim().optional(),
  numeroCi: z.string().max(50).trim().optional(),
  numeroPasaporte: z.string().max(50).trim().optional(),
  email: z.string().email("Email inválido").max(255).trim().optional(),
  telefonoCelular: z.string().max(50).trim().optional(),
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
  fechaNacimiento: z.coerce.date().optional().nullable(),
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
    .nullable(),
  telefonoCelular: z.string().max(50).trim().optional().nullable(),
  regionId: z.string().optional(),
  activo: z.boolean().optional(),
});

export const createClienteDatosPersonalesSchema = z.object({
  pasaporteFechaEmision: z.coerce.date().optional(),
  pasaporteFechaExpiracion: z.coerce.date().optional(),
  facebook: z.string().max(255).trim().optional(),
  instagram: z.string().max(255).trim().optional(),
  direccionDomicilio: z.string().max(1000).trim().optional(),
  estadoCivil: z.string().max(50).trim().optional(),
  profesion: z.string().max(255).trim().optional(),
  nombrePadre: z.string().max(255).trim().optional(),
  fechaNacimientoPadre: z.coerce.date().optional(),
  nombreMadre: z.string().max(255).trim().optional(),
  fechaNacimientoMadre: z.coerce.date().optional(),
});

export const updateClienteDatosPersonalesSchema = z.object({
  pasaporteFechaEmision: z.coerce.date().optional().nullable(),
  pasaporteFechaExpiracion: z.coerce.date().optional().nullable(),
  facebook: z.string().max(255).trim().optional().nullable(),
  instagram: z.string().max(255).trim().optional().nullable(),
  direccionDomicilio: z.string().max(1000).trim().optional().nullable(),
  estadoCivil: z.string().max(50).trim().optional().nullable(),
  profesion: z.string().max(255).trim().optional().nullable(),
  nombrePadre: z.string().max(255).trim().optional().nullable(),
  fechaNacimientoPadre: z.coerce.date().optional().nullable(),
  nombreMadre: z.string().max(255).trim().optional().nullable(),
  fechaNacimientoMadre: z.coerce.date().optional().nullable(),
});

export const createClienteDatosLaboralesSchema = z.object({
  lugarTrabajo: z.string().max(255).trim().optional(),
  cargoTrabajo: z.string().max(255).trim().optional(),
  descripcionTrabajo: z.string().max(1000).trim().optional(),
  direccionTrabajo: z.string().max(1000).trim().optional(),
  telefonoTrabajo: z.string().max(50).trim().optional(),
  fechaContratacion: z.coerce.date().optional(),
  percepcionSalarial: z.number().positive().max(9999999.99).optional(),
  nombreTrabajoAnterior: z.string().max(255).trim().optional(),
  telefonoTrabajoAnterior: z.string().max(50).trim().optional(),
  direccionTrabajoAnterior: z.string().max(1000).trim().optional(),
  fechaInicioTrabajoAnterior: z.coerce.date().optional(),
  referenciaTrabajoAnterior: z.string().max(1000).trim().optional(),
});

export const updateClienteDatosLaboralesSchema = z.object({
  lugarTrabajo: z.string().max(255).trim().optional().nullable(),
  cargoTrabajo: z.string().max(255).trim().optional().nullable(),
  descripcionTrabajo: z.string().max(1000).trim().optional().nullable(),
  direccionTrabajo: z.string().max(1000).trim().optional().nullable(),
  telefonoTrabajo: z.string().max(50).trim().optional().nullable(),
  fechaContratacion: z.coerce.date().optional().nullable(),
  percepcionSalarial: z
    .number()
    .positive()
    .max(9999999.99)
    .optional()
    .nullable(),
  nombreTrabajoAnterior: z.string().max(255).trim().optional().nullable(),
  telefonoTrabajoAnterior: z.string().max(50).trim().optional().nullable(),
  direccionTrabajoAnterior: z.string().max(1000).trim().optional().nullable(),
  fechaInicioTrabajoAnterior: z.coerce.date().optional().nullable(),
  referenciaTrabajoAnterior: z.string().max(1000).trim().optional().nullable(),
});

export const createClienteDatosAcademicosSchema = z.object({
  lugarEstudio: z.string().max(255).trim().optional(),
  carreraEstudio: z.string().max(255).trim().optional(),
  direccionEstudio: z.string().max(1000).trim().optional(),
  telefonoEstudio: z.string().max(50).trim().optional(),
  fechaInicioEstudio: z.coerce.date().optional(),
  fechaFinEstudio: z.coerce.date().optional(),
});

export const updateClienteDatosAcademicosSchema = z.object({
  lugarEstudio: z.string().max(255).trim().optional().nullable(),
  carreraEstudio: z.string().max(255).trim().optional().nullable(),
  direccionEstudio: z.string().max(1000).trim().optional().nullable(),
  telefonoEstudio: z.string().max(50).trim().optional().nullable(),
  fechaInicioEstudio: z.coerce.date().optional().nullable(),
  fechaFinEstudio: z.coerce.date().optional().nullable(),
});

export const createClienteDatosMatrimonialesSchema = z.object({
  conyugeNombreCompleto: z.string().max(255).trim().optional(),
  conyugeFechaNacimiento: z.coerce.date().optional(),
  conyugeLugarNacimiento: z.string().max(255).trim().optional(),
  matrimonioFechaInicio: z.coerce.date().optional(),
  matrimonioFechaFin: z.coerce.date().optional(),
});

export const updateClienteDatosMatrimonialesSchema = z.object({
  conyugeNombreCompleto: z.string().max(255).trim().optional().nullable(),
  conyugeFechaNacimiento: z.coerce.date().optional().nullable(),
  conyugeLugarNacimiento: z.string().max(255).trim().optional().nullable(),
  matrimonioFechaInicio: z.coerce.date().optional().nullable(),
  matrimonioFechaFin: z.coerce.date().optional().nullable(),
});

export const createClienteDatosPatrocinadorSchema = z.object({
  nombrePatrocinador: z.string().max(255).trim().optional(),
  direccionPatrocinador: z.string().max(1000).trim().optional(),
  telefonoPatrocinador: z.string().max(50).trim().optional(),
  emailPatrocinador: z
    .string()
    .email("Email inválido")
    .max(255)
    .trim()
    .optional(),
  trabajoPatrocinador: z.string().max(255).trim().optional(),
  fechaInicioTrabajoPatrocinador: z.coerce.date().optional(),
  percepcionSalarialPatrocinador: z
    .number()
    .positive()
    .max(9999999.99)
    .optional(),
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
    .nullable(),
  trabajoPatrocinador: z.string().max(255).trim().optional().nullable(),
  fechaInicioTrabajoPatrocinador: z.coerce.date().optional().nullable(),
  percepcionSalarialPatrocinador: z
    .number()
    .positive()
    .max(9999999.99)
    .optional()
    .nullable(),
});

export const createClienteCompletoSchema = z.object({
  cliente: createClienteSchema,
  datosPersonales: createClienteDatosPersonalesSchema.optional(),
  datosLaborales: createClienteDatosLaboralesSchema.optional(),
  datosAcademicos: createClienteDatosAcademicosSchema.optional(),
  datosMatrimoniales: createClienteDatosMatrimonialesSchema.optional(),
  datosPatrocinador: createClienteDatosPatrocinadorSchema.optional(),
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
export type CreateClienteCompletoFormData = z.infer<
  typeof createClienteCompletoSchema
>;
