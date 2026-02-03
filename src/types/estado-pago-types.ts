// src/types/estado-pago-types.ts

export interface CatalogoEstadoPago {
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

export interface EstadoPagoListItem {
  id: string;
  nombre: string;
  codigo: string;
  color: string | null;
  orden: number;
  activo: boolean;
}

export interface CreateEstadoPagoInput {
  nombre: string;
  descripcion?: string;
  codigo: string;
  color?: string;
  orden?: number;
  activo?: boolean;
}

export interface UpdateEstadoPagoInput {
  nombre?: string;
  descripcion?: string;
  codigo?: string;
  color?: string;
  orden?: number;
  activo?: boolean;
}
