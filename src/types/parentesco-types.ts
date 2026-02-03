// src/types/parentesco-types.ts

export interface CatalogoParentesco {
  id: string;
  nombre: string;
  descripcion: string | null;
  codigo: string;
  activo: boolean;
  orden: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParentescoListItem {
  id: string;
  nombre: string;
  codigo: string;
  activo: boolean;
  orden: number;
}

export interface CreateParentescoInput {
  nombre: string;
  descripcion?: string;
  codigo: string;
  activo?: boolean;
  orden?: number;
}

export interface UpdateParentescoInput {
  nombre?: string;
  descripcion?: string;
  codigo?: string;
  activo?: boolean;
  orden?: number;
}
