// src/types/tipo-cita-types.ts

export interface CatalogoTipoCita {
  id: string;
  nombre: string;
  descripcion: string | null;
  codigo: string;
  activo: boolean;
  orden: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CitaPrecioPorRegion {
  id: string;
  tipoCitaId: string;
  regionId: string;
  precio: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TipoCitaConPrecios extends CatalogoTipoCita {
  preciosPorRegion: CitaPrecioPorRegion[];
}

export interface TipoCitaListItem {
  id: string;
  nombre: string;
  codigo: string;
  activo: boolean;
  orden: number;
  totalPrecios: number;
}

export interface CreateTipoCitaInput {
  nombre: string;
  descripcion?: string;
  codigo: string;
  activo?: boolean;
  orden?: number;
}

export interface UpdateTipoCitaInput {
  nombre?: string;
  descripcion?: string;
  codigo?: string;
  activo?: boolean;
  orden?: number;
}

export interface CitaPrecioInput {
  regionId: string;
  precio: number;
}

export interface UpdateCitaPrecioInput {
  precio: number;
  activo?: boolean;
}

export interface CitaPrecioDetalle {
  id: string;
  regionId: string;
  regionNombre: string;
  regionCodigo: string;
  precio: number;
  activo: boolean;
}
