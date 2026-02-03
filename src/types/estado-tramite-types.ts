// src/types/estado-tramite-types.ts

export interface CatalogoEstadoTramite {
  id: string;
  nombre: string;
  descripcion: string | null;
  codigo: string;
  color: string | null;
  orden: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EstadoTramiteListItem {
  id: string;
  nombre: string;
  codigo: string;
  color: string | null;
  orden: number;
  activo: boolean;
}

export interface CreateEstadoTramiteInput {
  nombre: string;
  descripcion?: string;
  codigo: string;
  color?: string;
  orden?: number;
  activo?: boolean;
}

export interface UpdateEstadoTramiteInput {
  nombre?: string;
  descripcion?: string;
  codigo?: string;
  color?: string;
  orden?: number;
  activo?: boolean;
}
