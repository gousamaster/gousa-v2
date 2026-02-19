// src/components/system/clientes/client-table-columns.tsx

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { obtenerDatosClienteParaPdf } from "@/lib/actions/clientes/descarga-pdf-actions";
import { descargarFichaClientePdf } from "@/lib/pdf/ficha-cliente-pdf";
import type { ClienteListItem } from "@/types/cliente-types";

interface ClientActionsProps {
  cliente: ClienteListItem;
  onView: (cliente: ClienteListItem) => void;
  onEdit: (cliente: ClienteListItem) => void;
  onDelete: (cliente: ClienteListItem) => void;
  onToggle: (cliente: ClienteListItem) => void;
  onGrupoFamiliar: (cliente: ClienteListItem) => void;
}

/**
 * Componente de acciones para cada fila de la tabla de clientes
 * Implementa patrón Command para encapsular las operaciones disponibles
 */
function ClientActions({
  cliente,
  onView,
  onEdit,
  onDelete,
  onToggle,
  onGrupoFamiliar,
}: ClientActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDescargarFicha = async () => {
    setIsDownloading(true);
    try {
      const result = await obtenerDatosClienteParaPdf(cliente.id);
      if (!result.success || !result.data) {
        toast.error("No se pudo obtener los datos del cliente");
        return;
      }
      await descargarFichaClientePdf(result.data);
      toast.success("Ficha descargada correctamente");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      toast.error("Error al generar el PDF");
    } finally {
      setIsDownloading(false);
    }
  };

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
        <DropdownMenuItem onClick={() => onView(cliente)}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(cliente)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onGrupoFamiliar(cliente)}>
          <Users className="mr-2 h-4 w-4" />
          Grupo familiar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDescargarFicha}
          disabled={isDownloading}
        >
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? "Generando PDF..." : "Descargar ficha"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggle(cliente)}>
          <Power className="mr-2 h-4 w-4" />
          {cliente.activo ? "Desactivar" : "Activar"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(cliente)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Factory function para crear las columnas de la tabla de clientes
 * Implementa patrón Factory Method para generar configuración de columnas
 */
export const createClientColumns = (
  onView: (cliente: ClienteListItem) => void,
  onEdit: (cliente: ClienteListItem) => void,
  onDelete: (cliente: ClienteListItem) => void,
  onToggle: (cliente: ClienteListItem) => void,
  onGrupoFamiliar: (cliente: ClienteListItem) => void,
): ColumnDef<ClienteListItem>[] => [
  {
    accessorKey: "nombreCompleto",
    header: "Nombre Completo",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.nombreCompleto}</span>
    ),
  },
  {
    accessorKey: "tipoCliente",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.original.tipoCliente;
      return (
        <Badge variant={tipo === "ADULTO" ? "default" : "secondary"}>
          {tipo === "ADULTO" ? "Adulto" : "Infante"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.email || "-"}
      </span>
    ),
  },
  {
    accessorKey: "telefonoCelular",
    header: "Teléfono",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.telefonoCelular || "-"}
      </span>
    ),
  },
  {
    accessorKey: "regionNombre",
    header: "Región",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.regionNombre}</span>
    ),
  },
  {
    accessorKey: "registradoPorNombre",
    header: "Registrado por",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.registradoPorNombre}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Fecha de registro",
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
      <ClientActions
        cliente={row.original}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        onGrupoFamiliar={onGrupoFamiliar}
      />
    ),
  },
];
