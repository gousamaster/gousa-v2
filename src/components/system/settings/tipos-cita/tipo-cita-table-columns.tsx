// src/components/system/settings/tipos-cita/tipo-cita-table-columns.tsx

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
import type { TipoCitaListItem } from "@/types/tipo-cita-types";

interface TipoCitaActionsProps {
  tipoCita: TipoCitaListItem;
  onEdit: (tipoCita: TipoCitaListItem) => void;
  onDelete: (tipoCita: TipoCitaListItem) => void;
  onToggle: (tipoCita: TipoCitaListItem) => void;
  onManagePrecios: (tipoCita: TipoCitaListItem) => void;
}

function TipoCitaActions({
  tipoCita,
  onEdit,
  onDelete,
  onToggle,
  onManagePrecios,
}: TipoCitaActionsProps) {
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
        <DropdownMenuItem onClick={() => onEdit(tipoCita)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onManagePrecios(tipoCita)}>
          <DollarSign className="mr-2 h-4 w-4" />
          Gestionar precios
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle(tipoCita)}>
          <Power className="mr-2 h-4 w-4" />
          {tipoCita.activo ? "Desactivar" : "Activar"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(tipoCita)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const createTipoCitaColumns = (
  onEdit: (tipoCita: TipoCitaListItem) => void,
  onDelete: (tipoCita: TipoCitaListItem) => void,
  onToggle: (tipoCita: TipoCitaListItem) => void,
  onManagePrecios: (tipoCita: TipoCitaListItem) => void,
): ColumnDef<TipoCitaListItem>[] => [
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
      <TipoCitaActions
        tipoCita={row.original}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        onManagePrecios={onManagePrecios}
      />
    ),
  },
];
