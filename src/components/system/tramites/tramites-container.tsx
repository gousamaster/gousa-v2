// src/components/system/tramites/tramites-container.tsx

"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  obtenerEstadosTramite,
  obtenerTodosTramites,
  type TramiteListItem,
} from "@/lib/actions/tramites/tramites-actions";
import { TramiteDetalleDrawer } from "./tramite-detalle-drawer";
import { createTramiteColumns } from "./tramite-table-columns";

/**
 * Contenedor principal de la vista global de trámites
 * Implementa patrón Facade para coordinar filtros, tabla y drawer de detalle
 */
export function TramitesContainer() {
  const [tramites, setTramites] = useState<TramiteListItem[]>([]);
  const [estados, setEstados] = useState<
    Array<{ id: string; nombre: string; color: string | null; orden: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [filtroQuery, setFiltroQuery] = useState<string>("");
  const [tramiteDetalleId, setTramiteDetalleId] = useState<string | null>(null);

  const cargar = async () => {
    setIsLoading(true);
    const result = await obtenerTodosTramites({
      estadoId: filtroEstado || undefined,
      query: filtroQuery || undefined,
    });
    if (result.success && result.data) setTramites(result.data);
    setIsLoading(false);
  };

  useEffect(() => {
    obtenerEstadosTramite().then((r) => {
      if (r.success && r.data) setEstados(r.data);
    });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(cargar, 300);
    return () => clearTimeout(timeout);
  }, [filtroEstado, filtroQuery]);

  const columns = createTramiteColumns((id) => setTramiteDetalleId(id));

  return (
    <>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Trámites</h2>
          <p className="text-muted-foreground">
            Gestiona todos los trámites activos
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente o CI..."
                  value={filtroQuery}
                  onChange={(e) => setFiltroQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filtroEstado || "todos"}
                onValueChange={(v) => setFiltroEstado(v === "todos" ? "" : v)}
              >
                <SelectTrigger className="w-full sm:w-52">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  {estados.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nombre}
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
            ) : (
              <DataTable columns={columns} data={tramites} />
            )}
          </CardContent>
        </Card>
      </div>

      {tramiteDetalleId && (
        <TramiteDetalleDrawer
          open={!!tramiteDetalleId}
          onOpenChange={(open) => {
            if (!open) setTramiteDetalleId(null);
          }}
          tramiteId={tramiteDetalleId}
          onSuccess={cargar}
        />
      )}
    </>
  );
}
