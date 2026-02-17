// src/components/system/citas/cita-detalle-drawer.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarCheck, Loader2, Save, UserCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  actualizarCita,
  type CitaDetalle,
  obtenerCitaPorId,
  registrarAsistencia,
} from "@/lib/actions/citas/citas-actions";
import { obtenerEstadosPago } from "@/lib/actions/tramites/servicios-actions";
import {
  type UpdateCitaFormData,
  updateCitaSchema,
} from "@/validations/cita-validations";

const ESTADOS_CITA = [
  { value: "PROGRAMADA", label: "Programada" },
  { value: "COMPLETADA", label: "Completada" },
  { value: "CANCELADA", label: "Cancelada" },
  { value: "REPROGRAMADA", label: "Reprogramada" },
] as const;

interface CitaDetalleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  citaId: string;
  onSuccess: () => void;
}

/**
 * Drawer de detalle de cita con edición y registro de asistencia
 */
export function CitaDetalleDrawer({
  open,
  onOpenChange,
  citaId,
  onSuccess,
}: CitaDetalleDrawerProps) {
  const [cita, setCita] = useState<CitaDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [estadosPago, setEstadosPago] = useState<
    Array<{ id: string; nombre: string; color: string | null }>
  >([]);

  const cargar = async () => {
    setIsLoading(true);
    const [cResult, eResult] = await Promise.all([
      obtenerCitaPorId(citaId),
      obtenerEstadosPago(),
    ]);
    if (cResult.success && cResult.data) setCita(cResult.data);
    if (eResult.success && eResult.data) setEstadosPago(eResult.data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (open) cargar();
  }, [open, citaId]);

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Detalle de Cita
          </SheetTitle>
        </SheetHeader>

        {isLoading || !cita ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <CitaInfoHeader cita={cita} />
            <Separator />
            <EditarCitaForm
              cita={cita}
              estadosPago={estadosPago}
              onSuccess={() => {
                cargar();
                onSuccess();
              }}
            />
            {cita.participantes.length > 0 && (
              <>
                <Separator />
                <AsistenciaParticipantes
                  cita={cita}
                  onSuccess={() => {
                    cargar();
                    onSuccess();
                  }}
                />
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Info header ──────────────────────────────────────────────────────────────

function CitaInfoHeader({ cita }: { cita: CitaDetalle }) {
  const estadoColors: Record<string, string> = {
    PROGRAMADA: "bg-blue-100 text-blue-800",
    COMPLETADA: "bg-green-100 text-green-800",
    CANCELADA: "bg-red-100 text-red-800",
    REPROGRAMADA: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-lg">{cita.tipoCita.nombre}</p>
          <p className="text-sm text-muted-foreground">
            {format(
              new Date(cita.fechaHora),
              "EEEE dd 'de' MMMM yyyy — HH:mm",
              {
                locale: es,
              },
            )}
          </p>
          {cita.lugar && (
            <p className="text-sm text-muted-foreground">{cita.lugar}</p>
          )}
        </div>
        <Badge className={estadoColors[cita.estado] ?? ""}>
          {ESTADOS_CITA.find((e) => e.value === cita.estado)?.label ??
            cita.estado}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span>
          Precio:{" "}
          <strong>{cita.precioFinal.toLocaleString("es-BO")} Bs.</strong>
        </span>
        <Badge
          style={
            cita.estadoPago.color
              ? { backgroundColor: cita.estadoPago.color, color: "#fff" }
              : undefined
          }
          variant={cita.estadoPago.color ? undefined : "secondary"}
          className="text-xs"
        >
          {cita.estadoPago.nombre}
        </Badge>
      </div>

      {cita.tramite && (
        <p className="text-sm text-muted-foreground">
          {cita.tramite.cliente.nombres} {cita.tramite.cliente.apellidos} —{" "}
          {cita.tramite.servicio.nombre}
        </p>
      )}
      {cita.grupoFamiliar && (
        <p className="text-sm text-muted-foreground">
          Grupo: {cita.grupoFamiliar.nombre}
        </p>
      )}
    </div>
  );
}

// ─── Editar cita ──────────────────────────────────────────────────────────────

function EditarCitaForm({
  cita,
  estadosPago,
  onSuccess,
}: {
  cita: CitaDetalle;
  estadosPago: Array<{ id: string; nombre: string; color: string | null }>;
  onSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit } = useForm<UpdateCitaFormData>({
    resolver: zodResolver(updateCitaSchema),
    defaultValues: {
      fechaHora: format(new Date(cita.fechaHora), "yyyy-MM-dd'T'HH:mm"),
      lugar: cita.lugar ?? "",
      precioAcordado: cita.precioFinal,
      precioFinal: cita.precioFinal,
      estadoPagoId: (cita as any).estadoPagoId,
      estado: cita.estado as any,
      notas: cita.notas ?? "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    const result = await actualizarCita(cita.id, data);
    setIsSubmitting(false);
    if (result.success) {
      toast.success("Cita actualizada");
      onSuccess();
    } else {
      toast.error(result.error ?? "Error al actualizar");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="font-medium text-sm">Editar Cita</p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Fecha y hora</Label>
          <Input type="datetime-local" {...register("fechaHora")} />
        </div>
        <div className="space-y-2">
          <Label>Lugar</Label>
          <Input {...register("lugar")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Estado</Label>
          <Controller
            control={control}
            name="estado"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_CITA.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Estado de pago</Label>
          <Controller
            control={control}
            name="estadoPagoId"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {estadosPago.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notas</Label>
        <Textarea rows={3} {...register("notas")} />
      </div>

      <Button type="submit" size="sm" variant="outline" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Guardar Cambios
      </Button>
    </form>
  );
}

// ─── Asistencia de participantes ──────────────────────────────────────────────

function AsistenciaParticipantes({
  cita,
  onSuccess,
}: {
  cita: CitaDetalle;
  onSuccess: () => void;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (tramiteId: string, asistio: boolean) => {
    setLoadingId(tramiteId);
    const result = await registrarAsistencia(cita.id, { tramiteId, asistio });
    setLoadingId(null);
    if (result.success) {
      toast.success(
        asistio ? "Asistencia registrada" : "Inasistencia registrada",
      );
      onSuccess();
    } else {
      toast.error(result.error ?? "Error al registrar asistencia");
    }
  };

  return (
    <div className="space-y-3">
      <p className="font-medium text-sm">Asistencia</p>
      <div className="space-y-2">
        {cita.participantes.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-3 rounded-lg border"
          >
            <div>
              <p className="text-sm font-medium">
                {p.tramite.cliente.nombres} {p.tramite.cliente.apellidos}
              </p>
              <p className="text-xs text-muted-foreground">
                {p.tramite.servicio.nombre}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {p.asistio ? (
                <Badge className="bg-green-100 text-green-800">Asistió</Badge>
              ) : (
                <Badge variant="secondary">Pendiente</Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                disabled={loadingId === p.tramite.id}
                onClick={() => handleToggle(p.tramite.id, !p.asistio)}
              >
                {loadingId === p.tramite.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : p.asistio ? (
                  <UserX className="h-4 w-4" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
