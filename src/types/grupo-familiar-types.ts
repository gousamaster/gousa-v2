// src/types/grupo-familiar-types.ts

export interface GrupoFamiliar {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface GrupoFamiliarMiembro {
  id: string;
  grupoFamiliarId: string;
  clienteId: string;
  parentescoId: string;
  esTitular: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GrupoFamiliarMiembroDetalle extends GrupoFamiliarMiembro {
  cliente: {
    id: string;
    nombres: string;
    apellidos: string;
    nombreCompleto: string;
    tipoCliente: string;
    email: string | null;
    telefonoCelular: string | null;
  };
  parentesco: {
    id: string;
    nombre: string;
    codigo: string;
  };
}

export interface GrupoFamiliarCompleto extends GrupoFamiliar {
  miembros: GrupoFamiliarMiembroDetalle[];
  totalMiembros: number;
}

export interface GrupoFamiliarListItem {
  id: string;
  nombre: string;
  activo: boolean;
  totalMiembros: number;
  titular: {
    id: string;
    nombreCompleto: string;
  } | null;
  createdAt: Date;
}

export interface CreateGrupoFamiliarInput {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdateGrupoFamiliarInput {
  nombre?: string;
  descripcion?: string | null;
  activo?: boolean;
}

export interface AddMiembroGrupoFamiliarInput {
  grupoFamiliarId: string;
  clienteId: string;
  parentescoId: string;
  esTitular?: boolean;
}

export interface UpdateMiembroGrupoFamiliarInput {
  parentescoId?: string;
  esTitular?: boolean;
}

export interface CreateGrupoFamiliarConMiembrosInput {
  grupoFamiliar: CreateGrupoFamiliarInput;
  miembros: Array<{
    clienteId: string;
    parentescoId: string;
    esTitular?: boolean;
  }>;
}
