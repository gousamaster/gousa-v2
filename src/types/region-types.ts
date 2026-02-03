// src/types/region-types.ts

export interface Region {
  id: string;
  nombre: string;
  codigo: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRegionInput {
  nombre: string;
  codigo: string;
  activo?: boolean;
}

export interface UpdateRegionInput {
  nombre?: string;
  codigo?: string;
  activo?: boolean;
}

export interface RegionListItem {
  id: string;
  nombre: string;
  codigo: string;
  activo: boolean;
  createdAt: Date;
}
