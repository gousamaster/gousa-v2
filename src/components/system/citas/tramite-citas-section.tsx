// src/components/system/citas/tramite-citas-section.tsx

"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarPlus, FileX, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type CitaListItem,
  obtenerCitasPorTramite,
} from "@/lib/actions/citas/citas-actions";
import { adjustDateForDisplay } from "@/lib/utils/date-timezone";
import { CitaDetalleDrawer } from "./cita-detalle-drawer";
import { ProgramarCitaDrawer } from "./programar-cita-drawer";

interface TramiteCitasSectionProps {
  tramiteId: string;
  regionId: string;
}

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

/**
 * Sección de citas dentro del drawer de detalle de trámite
 * Implementa patrón Observer: refresca la lista al crear o modificar una cita
 */
export function TramiteCitasSection({
  tramiteId,
  regionId,
}: TramiteCitasSectionProps) {
  const [citas, setCitas] = useState<CitaListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProgramarOpen, setIsProgramarOpen] = useState(false);
  const [citaDetalleId, setCitaDetalleId] = useState<string | null>(null);

  const cargar = async () => {
    setIsLoading(true);
    const result = await obtenerCitasPorTramite(tramiteId);
    if (result.success && result.data) setCitas(result.data);
    setIsLoading(false);
  };

  useEffect(() => {
    cargar();
  }, [tramiteId]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-medium text-sm">Citas</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsProgramarOpen(true)}
        >
          <CalendarPlus className="h-4 w-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : citas.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <FileX className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Sin citas programadas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {citas.map((cita) => {
            const fechaAjustada = adjustDateForDisplay(
              new Date(cita.fechaHora),
            );

            return (
              <button
                key={cita.id}
                type="button"
                onClick={() => setCitaDetalleId(cita.id)}
                className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {cita.tipoCita.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(fechaAjustada, "dd MMM yyyy — HH:mm", {
                        locale: es,
                      })}
                      {cita.lugar && ` · ${cita.lugar}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {cita._count.participantes > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {cita._count.participantes} participantes
                      </Badge>
                    )}
                    <Badge className={ESTADO_COLORS[cita.estado] ?? ""}>
                      {ESTADO_LABELS[cita.estado] ?? cita.estado}
                    </Badge>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <ProgramarCitaDrawer
        open={isProgramarOpen}
        onOpenChange={setIsProgramarOpen}
        tramiteId={tramiteId}
        regionId={regionId}
        onSuccess={() => {
          setIsProgramarOpen(false);
          cargar();
        }}
      />

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
    </div>
  );
}
