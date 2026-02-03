// src/types/cliente-types.ts

import type { TipoCliente } from "@prisma/client";

export interface Cliente {
  id: string;
  nombres: string;
  apellidos: string;
  tipoCliente: TipoCliente;
  fechaNacimiento: Date | null;
  lugarNacimiento: string | null;
  nacionalidad: string | null;
  numeroCi: string | null;
  numeroPasaporte: string | null;
  email: string | null;
  telefonoCelular: string | null;
  regionId: string;
  registradoPorId: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ClienteDatosPersonales {
  id: string;
  clienteId: string;
  pasaporteFechaEmision: Date | null;
  pasaporteFechaExpiracion: Date | null;
  facebook: string | null;
  instagram: string | null;
  direccionDomicilio: string | null;
  estadoCivil: string | null;
  profesion: string | null;
  nombrePadre: string | null;
  fechaNacimientoPadre: Date | null;
  nombreMadre: string | null;
  fechaNacimientoMadre: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClienteDatosLaborales {
  id: string;
  clienteId: string;
  lugarTrabajo: string | null;
  cargoTrabajo: string | null;
  descripcionTrabajo: string | null;
  direccionTrabajo: string | null;
  telefonoTrabajo: string | null;
  fechaContratacion: Date | null;
  percepcionSalarial: number | null;
  nombreTrabajoAnterior: string | null;
  telefonoTrabajoAnterior: string | null;
  direccionTrabajoAnterior: string | null;
  fechaInicioTrabajoAnterior: Date | null;
  referenciaTrabajoAnterior: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClienteDatosAcademicos {
  id: string;
  clienteId: string;
  lugarEstudio: string | null;
  carreraEstudio: string | null;
  direccionEstudio: string | null;
  telefonoEstudio: string | null;
  fechaInicioEstudio: Date | null;
  fechaFinEstudio: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClienteDatosMatrimoniales {
  id: string;
  clienteId: string;
  conyugeNombreCompleto: string | null;
  conyugeFechaNacimiento: Date | null;
  conyugeLugarNacimiento: string | null;
  matrimonioFechaInicio: Date | null;
  matrimonioFechaFin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClienteDatosPatrocinador {
  id: string;
  clienteId: string;
  nombrePatrocinador: string | null;
  direccionPatrocinador: string | null;
  telefonoPatrocinador: string | null;
  emailPatrocinador: string | null;
  trabajoPatrocinador: string | null;
  fechaInicioTrabajoPatrocinador: Date | null;
  percepcionSalarialPatrocinador: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClienteCompleto extends Cliente {
  region: {
    id: string;
    nombre: string;
    codigo: string;
  };
  registradoPor: {
    id: string;
    name: string;
    email: string;
  };
  datosPersonales?: ClienteDatosPersonales;
  datosLaborales?: ClienteDatosLaborales;
  datosAcademicos?: ClienteDatosAcademicos;
  datosMatrimoniales?: ClienteDatosMatrimoniales;
  datosPatrocinador?: ClienteDatosPatrocinador;
}

export interface ClienteListItem {
  id: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  tipoCliente: TipoCliente;
  email: string | null;
  telefonoCelular: string | null;
  regionNombre: string;
  registradoPorNombre: string;
  activo: boolean;
  createdAt: Date;
}

export interface CreateClienteInput {
  nombres: string;
  apellidos: string;
  tipoCliente: TipoCliente;
  fechaNacimiento?: Date;
  lugarNacimiento?: string;
  nacionalidad?: string;
  numeroCi?: string;
  numeroPasaporte?: string;
  email?: string;
  telefonoCelular?: string;
  regionId: string;
  registradoPorId: string;
}

export interface UpdateClienteInput {
  nombres?: string;
  apellidos?: string;
  tipoCliente?: TipoCliente;
  fechaNacimiento?: Date | null;
  lugarNacimiento?: string | null;
  nacionalidad?: string | null;
  numeroCi?: string | null;
  numeroPasaporte?: string | null;
  email?: string | null;
  telefonoCelular?: string | null;
  regionId?: string;
  activo?: boolean;
}

export interface CreateClienteDatosPersonalesInput {
  pasaporteFechaEmision?: Date;
  pasaporteFechaExpiracion?: Date;
  facebook?: string;
  instagram?: string;
  direccionDomicilio?: string;
  estadoCivil?: string;
  profesion?: string;
  nombrePadre?: string;
  fechaNacimientoPadre?: Date;
  nombreMadre?: string;
  fechaNacimientoMadre?: Date;
}

export interface UpdateClienteDatosPersonalesInput {
  pasaporteFechaEmision?: Date | null;
  pasaporteFechaExpiracion?: Date | null;
  facebook?: string | null;
  instagram?: string | null;
  direccionDomicilio?: string | null;
  estadoCivil?: string | null;
  profesion?: string | null;
  nombrePadre?: string | null;
  fechaNacimientoPadre?: Date | null;
  nombreMadre?: string | null;
  fechaNacimientoMadre?: Date | null;
}

export interface CreateClienteDatosLaboralesInput {
  lugarTrabajo?: string;
  cargoTrabajo?: string;
  descripcionTrabajo?: string;
  direccionTrabajo?: string;
  telefonoTrabajo?: string;
  fechaContratacion?: Date;
  percepcionSalarial?: number;
  nombreTrabajoAnterior?: string;
  telefonoTrabajoAnterior?: string;
  direccionTrabajoAnterior?: string;
  fechaInicioTrabajoAnterior?: Date;
  referenciaTrabajoAnterior?: string;
}

export interface UpdateClienteDatosLaboralesInput {
  lugarTrabajo?: string | null;
  cargoTrabajo?: string | null;
  descripcionTrabajo?: string | null;
  direccionTrabajo?: string | null;
  telefonoTrabajo?: string | null;
  fechaContratacion?: Date | null;
  percepcionSalarial?: number | null;
  nombreTrabajoAnterior?: string | null;
  telefonoTrabajoAnterior?: string | null;
  direccionTrabajoAnterior?: string | null;
  fechaInicioTrabajoAnterior?: Date | null;
  referenciaTrabajoAnterior?: string | null;
}

export interface CreateClienteDatosAcademicosInput {
  lugarEstudio?: string;
  carreraEstudio?: string;
  direccionEstudio?: string;
  telefonoEstudio?: string;
  fechaInicioEstudio?: Date;
  fechaFinEstudio?: Date;
}

export interface UpdateClienteDatosAcademicosInput {
  lugarEstudio?: string | null;
  carreraEstudio?: string | null;
  direccionEstudio?: string | null;
  telefonoEstudio?: string | null;
  fechaInicioEstudio?: Date | null;
  fechaFinEstudio?: Date | null;
}

export interface CreateClienteDatosMatrimonialesInput {
  conyugeNombreCompleto?: string;
  conyugeFechaNacimiento?: Date;
  conyugeLugarNacimiento?: string;
  matrimonioFechaInicio?: Date;
  matrimonioFechaFin?: Date;
}

export interface UpdateClienteDatosMatrimonialesInput {
  conyugeNombreCompleto?: string | null;
  conyugeFechaNacimiento?: Date | null;
  conyugeLugarNacimiento?: string | null;
  matrimonioFechaInicio?: Date | null;
  matrimonioFechaFin?: Date | null;
}

export interface CreateClienteDatosPatrocinadorInput {
  nombrePatrocinador?: string;
  direccionPatrocinador?: string;
  telefonoPatrocinador?: string;
  emailPatrocinador?: string;
  trabajoPatrocinador?: string;
  fechaInicioTrabajoPatrocinador?: Date;
  percepcionSalarialPatrocinador?: number;
}

export interface UpdateClienteDatosPatrocinadorInput {
  nombrePatrocinador?: string | null;
  direccionPatrocinador?: string | null;
  telefonoPatrocinador?: string | null;
  emailPatrocinador?: string | null;
  trabajoPatrocinador?: string | null;
  fechaInicioTrabajoPatrocinador?: Date | null;
  percepcionSalarialPatrocinador?: number | null;
}

export interface CreateClienteCompletoInput {
  cliente: CreateClienteInput;
  datosPersonales?: CreateClienteDatosPersonalesInput;
  datosLaborales?: CreateClienteDatosLaboralesInput;
  datosAcademicos?: CreateClienteDatosAcademicosInput;
  datosMatrimoniales?: CreateClienteDatosMatrimonialesInput;
  datosPatrocinador?: CreateClienteDatosPatrocinadorInput;
}
