// src/components/system/citas/programar-cita-drawer.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  crearCita,
  obtenerTiposCitaConPrecio,
} from "@/lib/actions/citas/citas-actions";
import { obtenerEstadosPago } from "@/lib/actions/tramites/servicios-actions";
import { useSession } from "@/lib/auth-client";
import {
  type CreateCitaFormData,
  createCitaSchema,
} from "@/validations/cita-validations";

type TramiteParticipante = {
  id: string;
  cliente: { nombres: string; apellidos: string };
  servicio: { nombre: string };
};

interface ProgramarCitaDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tramiteId?: string;
  grupoFamiliarId?: string;
  regionId: string;
  tramitesDisponibles?: TramiteParticipante[];
  onSuccess: (citaId: string) => void;
}

/**
 * Drawer para programar una cita individual o grupal
 * Si se pasan tramitesDisponibles, permite seleccionar participantes adicionales
 */
export function ProgramarCitaDrawer({
  open,
  onOpenChange,
  tramiteId,
  grupoFamiliarId,
  regionId,
  tramitesDisponibles = [],
  onSuccess,
}: ProgramarCitaDrawerProps) {
  const { data: session } = useSession();
  const [tiposCita, setTiposCita] = useState<
    Array<{ id: string; nombre: string; precioRegion: number | null }>
  >([]);
  const [estadosPago, setEstadosPago] = useState<
    Array<{ id: string; nombre: string; color: string | null }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otrosTramites = tramitesDisponibles.filter((t) => t.id !== tramiteId);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateCitaFormData>({
    resolver: zodResolver(createCitaSchema),
    defaultValues: {
      tramiteId: tramiteId ?? null,
      grupoFamiliarId: grupoFamiliarId ?? null,
      precioAcordado: 0,
      precioFinal: 0,
      descuentoAplicado: null,
      participanteTramiteIds: [],
    },
  });

  const tipoCitaId = watch("tipoCitaId");
  const precioAcordado = watch("precioAcordado");
  const descuento = watch("descuentoAplicado");
  const participantes = watch("participanteTramiteIds") ?? [];

  useEffect(() => {
    if (!open) return;
    Promise.all([
      obtenerTiposCitaConPrecio(regionId),
      obtenerEstadosPago(),
    ]).then(([tResult, eResult]) => {
      if (tResult.success && tResult.data) setTiposCita(tResult.data);
      if (eResult.success && eResult.data) setEstadosPago(eResult.data);
    });
  }, [open, regionId]);

  useEffect(() => {
    const tipo = tiposCita.find((t) => t.id === tipoCitaId);
    if (tipo?.precioRegion != null) {
      setValue("precioAcordado", tipo.precioRegion);
    }
  }, [tipoCitaId, tiposCita, setValue]);

  useEffect(() => {
    const base = precioAcordado ?? 0;
    const desc = descuento ?? 0;
    setValue("precioFinal", Math.max(0, base - desc));
  }, [precioAcordado, descuento, setValue]);

  const toggleParticipante = (id: string) => {
    const actuales = participantes;
    const nuevos = actuales.includes(id)
      ? actuales.filter((p) => p !== id)
      : [...actuales, id];
    setValue("participanteTramiteIds", nuevos);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) reset();
    onOpenChange(isOpen);
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!session?.user?.id) return;
    setIsSubmitting(true);
    const result = await crearCita(data, session.user.id);
    setIsSubmitting(false);
    if (result.success && result.data) {
      toast.success("Cita programada correctamente");
      handleOpenChange(false);
      onSuccess(result.data.id);
    } else {
      toast.error(result.error ?? "Error al programar la cita");
    }
  });

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4">
        <SheetHeader>
          <SheetTitle>
            {grupoFamiliarId ? "Programar Cita Grupal" : "Programar Cita"}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label>
              Tipo de cita <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="tipoCitaId"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo de cita" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposCita.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nombre}
                        {t.precioRegion != null && (
                          <span className="ml-2 text-muted-foreground">
                            — {t.precioRegion.toLocaleString("es-BO")} Bs.
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tipoCitaId && (
              <p className="text-sm text-destructive">
                {errors.tipoCitaId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Fecha y hora <span className="text-destructive">*</span>
              </Label>
              <Input type="datetime-local" {...register("fechaHora")} />
              {errors.fechaHora && (
                <p className="text-sm text-destructive">
                  {errors.fechaHora.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Lugar</Label>
              <Input
                placeholder="Embajada, consulado..."
                {...register("lugar")}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>
                Precio <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                {...register("precioAcordado", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descuento (Bs.)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                {...register("descuentoAplicado", {
                  valueAsNumber: true,
                  setValueAs: (v) => (v === "" || isNaN(v) ? null : Number(v)),
                })}
              />
            </div>

            <div className="space-y-2">
              <Label>Precio final</Label>
              <Input
                type="number"
                readOnly
                className="bg-muted"
                {...register("precioFinal", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Estado de pago <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="estadoPagoId"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona estado de pago" />
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
            {errors.estadoPagoId && (
              <p className="text-sm text-destructive">
                {errors.estadoPagoId.message}
              </p>
            )}
          </div>

          {otrosTramites.length > 0 && (
            <div className="space-y-3">
              <Label>Participantes adicionales del grupo</Label>
              <div className="space-y-2 border rounded-lg p-3">
                {otrosTramites.map((t) => (
                  <label
                    key={t.id}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Checkbox
                      checked={participantes.includes(t.id)}
                      onCheckedChange={() => toggleParticipante(t.id)}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {t.cliente.nombres} {t.cliente.apellidos}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.servicio.nombre}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              rows={3}
              placeholder="Observaciones..."
              {...register("notas")}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Programar Cita
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
