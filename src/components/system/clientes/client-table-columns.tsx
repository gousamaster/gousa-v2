"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowRightLeft,
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
import { Checkbox } from "@/components/ui/checkbox";
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

type ClienteComercial = ClienteListItem & {
  sinServicio?: boolean;
  serviciosContratados?: number;
  tramitesTotal?: number;
};

interface ClientActionsProps {
  cliente: ClienteComercial;
  onView: (cliente: ClienteListItem) => void;
  onEdit: (cliente: ClienteListItem) => void;
  onDelete: (cliente: ClienteListItem) => void;
  onToggle: (cliente: ClienteListItem) => void;
  onGrupoFamiliar: (cliente: ClienteListItem) => void;
  onSendProspecto: (cliente: ClienteComercial) => void;
}

function ClientActions({
  cliente,
  onView,
  onEdit,
  onDelete,
  onToggle,
  onGrupoFamiliar,
  onSendProspecto,
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
        <Button variant="outline" size="sm" className="h-8 gap-1 px-2">
          <MoreHorizontal className="h-4 w-4" />
          <span className="hidden xl:inline">Acciones</span>
          <span className="sr-only">Abrir acciones del cliente</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuLabel>Acciones del cliente</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onView(cliente)}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalle
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(cliente)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onGrupoFamiliar(cliente)}>
          <Users className="mr-2 h-4 w-4" />
          Grupo familiar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDescargarFicha} disabled={isDownloading}>
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? "Generando PDF..." : "Descargar ficha"}
        </DropdownMenuItem>
        {cliente.sinServicio && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onSendProspecto(cliente)}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Devolver a Prospectos
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={() => onToggle(cliente)}>
          <Power className="mr-2 h-4 w-4" />
          {cliente.activo ? "Desactivar" : "Activar"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(cliente)} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const createClientColumns = (
  onView: (cliente: ClienteListItem) => void,
  onEdit: (cliente: ClienteListItem) => void,
  onDelete: (cliente: ClienteListItem) => void,
  onToggle: (cliente: ClienteListItem) => void,
  onGrupoFamiliar: (cliente: ClienteListItem) => void,
  onSendProspecto: (cliente: ClienteComercial) => void,
): ColumnDef<ClienteComercial>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <ClientActions
        cliente={row.original}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggle={onToggle}
        onGrupoFamiliar={onGrupoFamiliar}
        onSendProspecto={onSendProspecto}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "nombreCompleto",
    header: "Nombre Completo",
    cell: ({ row }) => <span className="font-medium">{row.original.nombreCompleto}</span>,
  },
  {
    accessorKey: "tipoCliente",
    header: "Tipo",
    cell: ({ row }) => {
      const tipo = row.original.tipoCliente;
      return <Badge variant={tipo === "ADULTO" ? "default" : "secondary"}>{tipo === "ADULTO" ? "Adulto" : "Infante"}</Badge>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.email || "-"}</span>,
  },
  {
    accessorKey: "telefonoCelular",
    header: "Teléfono",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.telefonoCelular || "-"}</span>,
  },
  {
    accessorKey: "regionNombre",
    header: "Región",
    cell: ({ row }) => <span className="text-sm">{row.original.regionNombre}</span>,
  },
  {
    accessorKey: "registradoPorNombre",
    header: "Registrado por",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.registradoPorNombre}</span>,
  },
  {
    id: "situacionComercial",
    header: "Situación comercial",
    cell: ({ row }) => row.original.sinServicio
      ? <Badge variant="outline">Sin servicio</Badge>
      : <Badge variant="secondary">Con servicio</Badge>,
  },
  {
    accessorKey: "createdAt",
    header: "Fecha de registro",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      if (!date) return <span className="text-sm text-muted-foreground">-</span>;
      try {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return <span className="text-sm text-muted-foreground">{format(dateObj, "dd MMM yyyy", { locale: es })}</span>;
      } catch {
        return <span className="text-sm text-muted-foreground">-</span>;
      }
    },
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) => <Badge variant={row.original.activo ? "default" : "secondary"}>{row.original.activo ? "Activo" : "Inactivo"}</Badge>,
  },
];
