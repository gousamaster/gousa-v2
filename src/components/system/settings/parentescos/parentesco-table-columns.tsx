// src/components/system/settings/parentescos/parentesco-table-columns.tsx

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
import type { ParentescoListItem } from "@/types/parentesco-types";

interface ParentescoActionsProps {
  parentesco: ParentescoListItem;
  onEdit: (parentesco: ParentescoListItem) => void;
  onDelete: (parentesco: ParentescoListItem) => void;
  onToggle: (parentesco: ParentescoListItem) => void;
}

function ParentescoActions({
  parentesco,
  onEdit,
  onDelete,
  onToggle,
}: ParentescoActionsProps) {
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
        <DropdownMenuItem onClick={() => onEdit(parentesco)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle(parentesco)}>
          <Power className="mr-2 h-4 w-4" />
          {parentesco.activo ? "Desactivar" : "Activar"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(parentesco)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const createParentescoColumns = (
  onEdit: (parentesco: ParentescoListItem) => void,
  onDelete: (parentesco: ParentescoListItem) => void,
  onToggle: (parentesco: ParentescoListItem) => void,
): ColumnDef<ParentescoListItem>[] => [
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
      <ParentescoActions
        parentesco={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
      />
    ),
  },
];
