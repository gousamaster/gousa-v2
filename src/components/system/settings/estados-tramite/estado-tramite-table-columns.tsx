// src/components/system/settings/estados-tramite/estado-tramite-table-columns.tsx

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Power, Trash2 } from "lucide-react";
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
import type { EstadoTramiteListItem } from "@/types/estado-tramite-types";

interface EstadoTramiteActionsProps {
  estado: EstadoTramiteListItem;
  onEdit: (estado: EstadoTramiteListItem) => void;
  onDelete: (estado: EstadoTramiteListItem) => void;
  onToggle: (estado: EstadoTramiteListItem) => void;
}

function EstadoTramiteActions({
  estado,
  onEdit,
  onDelete,
  onToggle,
}: EstadoTramiteActionsProps) {
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
        <DropdownMenuItem onClick={() => onEdit(estado)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle(estado)}>
          <Power className="mr-2 h-4 w-4" />
          {estado.activo ? "Desactivar" : "Activar"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(estado)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const createEstadoTramiteColumns = (
  onEdit: (estado: EstadoTramiteListItem) => void,
  onDelete: (estado: EstadoTramiteListItem) => void,
  onToggle: (estado: EstadoTramiteListItem) => void,
): ColumnDef<EstadoTramiteListItem>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => {
      const color = row.original.color;
      return (
        <div className="flex items-center gap-2">
          {color && (
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
          )}
          <span className="font-medium">{row.original.nombre}</span>
        </div>
      );
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
      <EstadoTramiteActions
        estado={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
      />
    ),
  },
];
