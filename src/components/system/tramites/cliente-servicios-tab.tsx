// src/components/system/tramites/cliente-servicios-tab.tsx

"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FileText, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  type ClienteServicioItem,
  obtenerServiciosDeCliente,
} from "@/lib/actions/tramites/servicios-actions";
import type { ClienteCompleto } from "@/types/cliente-types";
import { ContratarServicioDrawer } from "./contratar-servicio-drawer";
import { IniciarTramiteDialog } from "./iniciar-tramite-dialog";
import { TramiteDetalleDrawer } from "./tramite-detalle-drawer";

interface ClienteServiciosTabProps {
  cliente: ClienteCompleto;
}

/**
 * Tab de servicios y trámites dentro del perfil del cliente
 * Implementa patrón Facade orquestando la contratación y gestión de trámites
 */
export function ClienteServiciosTab({ cliente }: ClienteServiciosTabProps) {
  const [servicios, setServicios] = useState<ClienteServicioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isContratarOpen, setIsContratarOpen] = useState(false);
  const [tramiteDialogData, setTramiteDialogData] = useState<{
    servicioId: string;
  } | null>(null);
  const [tramiteDetalleId, setTramiteDetalleId] = useState<string | null>(null);

  const cargar = async () => {
    setIsLoading(true);
    const result = await obtenerServiciosDeCliente(cliente.id);
    if (result.success && result.data) setServicios(result.data);
    setIsLoading(false);
  };

  useEffect(() => {
    cargar();
  }, [cliente.id]);

  const handleServicioCreado = (
    servicioId: string,
    requiereTramite: boolean,
  ) => {
    cargar();
    if (requiereTramite) {
      setTramiteDialogData({ servicioId });
    } else {
      toast.info(
        "Servicio contratado. Puedes iniciar un trámite manualmente cuando lo necesites.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setIsContratarOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Contratar Servicio
        </Button>
      </div>

      {servicios.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Este cliente no tiene servicios contratados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {servicios.map((servicio) => (
            <ServicioCard
              key={servicio.id}
              servicio={servicio}
              clienteId={cliente.id}
              onIniciarTramite={() =>
                setTramiteDialogData({ servicioId: servicio.id })
              }
              onVerTramite={(id) => setTramiteDetalleId(id)}
            />
          ))}
        </div>
      )}

      <ContratarServicioDrawer
        open={isContratarOpen}
        onOpenChange={setIsContratarOpen}
        clienteId={cliente.id}
        regionId={cliente.regionId}
        onSuccess={handleServicioCreado}
      />

      {tramiteDialogData && (
        <IniciarTramiteDialog
          open={!!tramiteDialogData}
          onOpenChange={(open) => {
            if (!open) setTramiteDialogData(null);
          }}
          clienteId={cliente.id}
          clienteServicioId={tramiteDialogData.servicioId}
          onSuccess={(tramiteId) => {
            setTramiteDialogData(null);
            cargar();
            setTramiteDetalleId(tramiteId);
          }}
        />
      )}

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
    </div>
  );
}

// ─── Card de cada servicio ────────────────────────────────────────────────────

interface ServicioCardProps {
  servicio: ClienteServicioItem;
  clienteId: string;
  onIniciarTramite: () => void;
  onVerTramite: (id: string) => void;
}

function ServicioCard({
  servicio,
  onIniciarTramite,
  onVerTramite,
}: ServicioCardProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium">{servicio.servicio.nombre}</p>
              <Badge variant="outline" className="text-xs">
                {servicio.servicio.codigo}
              </Badge>
              <Badge
                style={
                  servicio.estadoPago.color
                    ? {
                        backgroundColor: servicio.estadoPago.color,
                        color: "#fff",
                      }
                    : undefined
                }
                variant={servicio.estadoPago.color ? undefined : "secondary"}
                className="text-xs"
              >
                {servicio.estadoPago.nombre}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Precio:{" "}
                <strong className="text-foreground">
                  {servicio.precioFinal.toLocaleString("es-BO")} Bs.
                </strong>
              </span>
              {servicio.descuentoAplicado && servicio.descuentoAplicado > 0 && (
                <span className="text-green-600">
                  Descuento: -
                  {servicio.descuentoAplicado.toLocaleString("es-BO")} Bs.
                </span>
              )}
              <span>
                {format(new Date(servicio.createdAt), "dd MMM yyyy", {
                  locale: es,
                })}
              </span>
            </div>

            {servicio.tramite && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">Trámite:</span>
                <Badge
                  style={
                    servicio.tramite.estadoActual.color
                      ? {
                          backgroundColor: servicio.tramite.estadoActual.color,
                          color: "#fff",
                        }
                      : undefined
                  }
                  variant={
                    servicio.tramite.estadoActual.color
                      ? undefined
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {servicio.tramite.estadoActual.nombre}
                </Badge>
              </div>
            )}

            {servicio.notas && (
              <p className="text-xs text-muted-foreground mt-1">
                {servicio.notas}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {servicio.tramite ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVerTramite(servicio.tramite!.id)}
              >
                Ver Trámite
              </Button>
            ) : servicio.servicio.requiereTramite ? (
              <Button size="sm" onClick={onIniciarTramite}>
                Iniciar Trámite
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
