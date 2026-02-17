// src/components/system/tramites/tramite-table-columns.tsx

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TramiteListItem } from "@/lib/actions/tramites/tramites-actions";

/**
 * Factory function para columnas de la tabla global de trámites
 * Implementa patrón Factory Method
 */
export const createTramiteColumns = (
  onVerDetalle: (id: string) => void,
): ColumnDef<TramiteListItem>[] => [
  {
    accessorKey: "cliente",
    header: "Cliente",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-sm">
          {row.original.cliente.nombres} {row.original.cliente.apellidos}
        </p>
        <p className="text-xs text-muted-foreground">
          {row.original.cliente.regionNombre}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "servicio",
    header: "Servicio",
    cell: ({ row }) => (
      <div>
        <p className="text-sm">{row.original.servicio.nombre}</p>
        <p className="text-xs text-muted-foreground font-mono">
          {row.original.servicio.codigo}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "estadoActual",
    header: "Estado",
    cell: ({ row }) => {
      const { nombre, color } = row.original.estadoActual;
      return (
        <Badge
          style={color ? { backgroundColor: color, color: "#fff" } : undefined}
          variant={color ? undefined : "secondary"}
        >
          {nombre}
        </Badge>
      );
    },
  },
  {
    accessorKey: "usuarioAsignado",
    header: "Asignado a",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.usuarioAsignado?.name ?? "Sin asignar"}
      </span>
    ),
  },
  {
    accessorKey: "codigoConfirmacionDs160",
    header: "DS-160",
    cell: ({ row }) => (
      <span className="text-xs font-mono text-muted-foreground">
        {row.original.codigoConfirmacionDs160 ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Fecha",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {format(new Date(row.original.createdAt), "dd MMM yyyy", {
          locale: es,
        })}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onVerDetalle(row.original.id)}
      >
        <Eye className="h-4 w-4" />
      </Button>
    ),
  },
];
