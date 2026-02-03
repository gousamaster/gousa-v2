// src/components/system/settings/regiones/region-table-columns.tsx

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
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
import type { RegionListItem } from "@/types/region-types";

interface RegionActionsProps {
  region: RegionListItem;
  onEdit: (region: RegionListItem) => void;
  onDelete: (region: RegionListItem) => void;
  onToggle: (region: RegionListItem) => void;
}

function RegionActions({
  region,
  onEdit,
  onDelete,
  onToggle,
}: RegionActionsProps) {
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
        <DropdownMenuItem onClick={() => onEdit(region)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle(region)}>
          <Power className="mr-2 h-4 w-4" />
          {region.activo ? "Desactivar" : "Activar"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(region)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const createRegionColumns = (
  onEdit: (region: RegionListItem) => void,
  onDelete: (region: RegionListItem) => void,
  onToggle: (region: RegionListItem) => void,
): ColumnDef<RegionListItem>[] => [
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
    accessorKey: "createdAt",
    header: "Fecha de creación",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      if (!date)
        return <span className="text-sm text-muted-foreground">-</span>;

      try {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return (
          <span className="text-sm text-muted-foreground">
            {format(dateObj, "dd MMM yyyy", { locale: es })}
          </span>
        );
      } catch {
        return <span className="text-sm text-muted-foreground">-</span>;
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <RegionActions
        region={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
      />
    ),
  },
];
