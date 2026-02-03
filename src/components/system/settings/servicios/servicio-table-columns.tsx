// src/components/system/settings/servicios/servicio-table-columns.tsx

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  DollarSign,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ServicioListItem } from "@/types/servicio-types";

interface ServicioActionsProps {
  servicio: ServicioListItem;
  onEdit: (servicio: ServicioListItem) => void;
  onDelete: (servicio: ServicioListItem) => void;
  onToggle: (servicio: ServicioListItem) => void;
  onManagePrecios: (servicio: ServicioListItem) => void;
}

function ServicioActions({
  servicio,
  onEdit,
  onDelete,
  onToggle,
  onManagePrecios,
}: ServicioActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(servicio)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onManagePrecios(servicio)}>
          <DollarSign className="mr-2 h-4 w-4" />
          Gestionar precios
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle(servicio)}>
          <Power className="mr-2 h-4 w-4" />
          {servicio.activo ? "Desactivar" : "Activar"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(servicio)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const createServicioColumns = (
  onEdit: (servicio: ServicioListItem) => void,
  onDelete: (servicio: ServicioListItem) => void,
  onToggle: (servicio: ServicioListItem) => void,
  onManagePrecios: (servicio: ServicioListItem) => void,
): ColumnDef<ServicioListItem>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => {
      return <span className="font-medium">{row.original.nombre}</span>;
    },
  },
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="font-mono">
          {row.original.codigo}
        </Badge>
      );
    },
  },
  {
    accessorKey: "requiereTramite",
    header: "Trámite",
    cell: ({ row }) => {
      const requiere = row.original.requiereTramite;
      return (
        <Badge variant={requiere ? "default" : "secondary"}>
          {requiere ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "orden",
    header: "Orden",
    cell: ({ row }) => {
      return (
        <span className="text-sm text-muted-foreground">
          {row.original.orden}
        </span>
      );
    },
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) => {
      const activo = row.original.activo;
      return (
        <Badge variant={activo ? "default" : "secondary"}>
          {activo ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ServicioActions
        servicio={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        onManagePrecios={onManagePrecios}
      />
    ),
  },
];
