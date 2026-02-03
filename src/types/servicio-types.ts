// src/types/servicio-types.ts

export interface CatalogoServicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  codigo: string;
  requiereTramite: boolean;
  activo: boolean;
  orden: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServicioPrecioPorRegion {
  id: string;
  servicioId: string;
  regionId: string;
  precio: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServicioConPrecios extends CatalogoServicio {
  preciosPorRegion: ServicioPrecioPorRegion[];
}

export interface ServicioListItem {
  id: string;
  nombre: string;
  codigo: string;
  activo: boolean;
  requiereTramite: boolean;
  orden: number;
  totalPrecios: number;
}

export interface CreateServicioInput {
  nombre: string;
  descripcion?: string;
  codigo: string;
  requiereTramite?: boolean;
  activo?: boolean;
  orden?: number;
}

export interface UpdateServicioInput {
  nombre?: string;
  descripcion?: string;
  codigo?: string;
  requiereTramite?: boolean;
  activo?: boolean;
  orden?: number;
}

export interface ServicioPrecioInput {
  regionId: string;
  precio: number;
}

export interface UpdateServicioPrecioInput {
  precio: number;
  activo?: boolean;
}

export interface ServicioPrecioDetalle {
  id: string;
  regionId: string;
  regionNombre: string;
  regionCodigo: string;
  precio: number;
  activo: boolean;
}
