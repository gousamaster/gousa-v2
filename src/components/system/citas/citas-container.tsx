// src/components/system/citas/citas-container.tsx

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Eye, LayoutList, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type CitaListItem,
  obtenerTiposCita,
  obtenerTodasLasCitas,
} from "@/lib/actions/citas/citas-actions";
import { CitaDetalleDrawer } from "./cita-detalle-drawer";
import { CitasCalendario } from "./citas-calendario";

type Vista = "lista" | "calendario";

const ESTADO_COLORS: Record<string, string> = {
  PROGRAMADA: "bg-blue-100 text-blue-800",
  COMPLETADA: "bg-green-100 text-green-800",
  CANCELADA: "bg-red-100 text-red-800",
  REPROGRAMADA: "bg-yellow-100 text-yellow-800",
};

const ESTADO_LABELS: Record<string, string> = {
  PROGRAMADA: "Programada",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
  REPROGRAMADA: "Reprogramada",
};

const ESTADOS_OPCIONES = Object.entries(ESTADO_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  }),
);

/**
 * Contenedor principal de la vista global de citas
 * Implementa patrón Strategy para alternar entre vista lista y calendario
 */
export function CitasContainer() {
  const [citas, setCitas] = useState<CitaListItem[]>([]);
  const [tiposCita, setTiposCita] = useState<
    Array<{ id: string; nombre: string; precioRegion: number | null }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vista, setVista] = useState<Vista>("calendario");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroQuery, setFiltroQuery] = useState("");
  const [citaDetalleId, setCitaDetalleId] = useState<string | null>(null);

  const cargar = async () => {
    setIsLoading(true);
    const result = await obtenerTodasLasCitas({
      tipoCitaId: filtroTipo || undefined,
      estado: filtroEstado || undefined,
      query: filtroQuery || undefined,
    });
    if (result.success && result.data) setCitas(result.data);
    setIsLoading(false);
  };

  useEffect(() => {
    obtenerTiposCita().then((r) => {
      if (r.success && r.data) setTiposCita(r.data);
    });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(cargar, 300);
    return () => clearTimeout(timeout);
  }, [filtroEstado, filtroTipo, filtroQuery]);

  const columns: ColumnDef<CitaListItem>[] = [
    {
      accessorKey: "tipoCita",
      header: "Tipo de Cita",
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {row.original.tipoCita.nombre}
        </span>
      ),
    },
    {
      accessorKey: "fechaHora",
      header: "Fecha y Hora",
      cell: ({ row }) => (
        <div>
          <p className="text-sm">
            {format(new Date(row.original.fechaHora), "dd MMM yyyy", {
              locale: es,
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(row.original.fechaHora), "HH:mm", { locale: es })}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "cliente",
      header: "Cliente",
      cell: ({ row }) => {
        const { tramite, grupoFamiliar } = row.original;
        if (tramite) {
          return (
            <div>
              <p className="text-sm font-medium">
                {tramite.cliente.nombres} {tramite.cliente.apellidos}
              </p>
              <p className="text-xs text-muted-foreground">
                {tramite.servicio.nombre}
              </p>
            </div>
          );
        }
        if (grupoFamiliar) {
          return (
            <div>
              <p className="text-sm font-medium">{grupoFamiliar.nombre}</p>
              <p className="text-xs text-muted-foreground">Grupo familiar</p>
            </div>
          );
        }
        return <span className="text-muted-foreground text-sm">—</span>;
      },
    },
    {
      accessorKey: "lugar",
      header: "Lugar",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.lugar ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "precioFinal",
      header: "Precio",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {row.original.precioFinal.toLocaleString("es-BO")} Bs.
          </span>
          <Badge
            style={
              row.original.estadoPago.color
                ? {
                    backgroundColor: row.original.estadoPago.color,
                    color: "#fff",
                  }
                : undefined
            }
            variant={row.original.estadoPago.color ? undefined : "secondary"}
            className="text-xs"
          >
            {row.original.estadoPago.nombre}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "participantes",
      header: "Participantes",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original._count.participantes}
        </span>
      ),
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => (
        <Badge className={ESTADO_COLORS[row.original.estado] ?? ""}>
          {ESTADO_LABELS[row.original.estado] ?? row.original.estado}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCitaDetalleId(row.original.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Citas</h2>
            <p className="text-muted-foreground">
              Gestiona todas las citas programadas
            </p>
          </div>

          <div className="flex items-center border rounded-lg p-1 gap-1">
            <Button
              variant={vista === "calendario" ? "default" : "ghost"}
              size="sm"
              onClick={() => setVista("calendario")}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Calendario
            </Button>
            <Button
              variant={vista === "lista" ? "default" : "ghost"}
              size="sm"
              onClick={() => setVista("lista")}
            >
              <LayoutList className="h-4 w-4 mr-2" />
              Lista
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente o grupo..."
                  value={filtroQuery}
                  onChange={(e) => setFiltroQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={filtroTipo || "todos"}
                onValueChange={(v) => setFiltroTipo(v === "todos" ? "" : v)}
              >
                <SelectTrigger className="w-full sm:w-52">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {tiposCita.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filtroEstado || "todos"}
                onValueChange={(v) => setFiltroEstado(v === "todos" ? "" : v)}
              >
                <SelectTrigger className="w-full sm:w-52">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  {ESTADOS_OPCIONES.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={`sk-${i}`} className="h-14 w-full" />
                ))}
              </div>
            ) : vista === "calendario" ? (
              <CitasCalendario citas={citas} onRefresh={cargar} />
            ) : (
              <DataTable columns={columns} data={citas} />
            )}
          </CardContent>
        </Card>
      </div>

      {citaDetalleId && (
        <CitaDetalleDrawer
          open={!!citaDetalleId}
          onOpenChange={(open) => {
            if (!open) setCitaDetalleId(null);
          }}
          citaId={citaDetalleId}
          onSuccess={cargar}
        />
      )}
    </>
  );
}
