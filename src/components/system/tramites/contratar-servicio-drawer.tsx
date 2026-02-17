// src/components/system/tramites/contratar-servicio-drawer.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  crearClienteServicio,
  obtenerCatalogosServicioConPrecio,
  obtenerEstadosPago,
  type ServicioCatalogo,
} from "@/lib/actions/tramites/servicios-actions";
import {
  type CreateClienteServicioFormData,
  createClienteServicioSchema,
} from "@/validations/tramite-validations";

interface ContratarServicioDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string;
  regionId: string;
  onSuccess: (servicioId: string, requiereTramite: boolean) => void;
}

/**
 * Drawer para contratar un servicio a un cliente
 * Carga automáticamente el precio según la región del cliente
 */
export function ContratarServicioDrawer({
  open,
  onOpenChange,
  clienteId,
  regionId,
  onSuccess,
}: ContratarServicioDrawerProps) {
  const [servicios, setServicios] = useState<ServicioCatalogo[]>([]);
  const [estadosPago, setEstadosPago] = useState<
    Array<{ id: string; nombre: string; color: string | null }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateClienteServicioFormData>({
    resolver: zodResolver(createClienteServicioSchema),
    defaultValues: {
      clienteId,
      precioAcordado: 0,
      precioFinal: 0,
      descuentoAplicado: null,
    },
  });

  const servicioId = watch("servicioId");
  const precioAcordado = watch("precioAcordado");
  const descuento = watch("descuentoAplicado");

  useEffect(() => {
    if (!open) return;
    Promise.all([
      obtenerCatalogosServicioConPrecio(regionId),
      obtenerEstadosPago(),
    ]).then(([sResult, eResult]) => {
      if (sResult.success && sResult.data) setServicios(sResult.data);
      if (eResult.success && eResult.data) setEstadosPago(eResult.data);
    });
  }, [open, regionId]);

  useEffect(() => {
    const servicio = servicios.find((s) => s.id === servicioId);
    if (servicio?.precioRegion != null) {
      setValue("precioAcordado", servicio.precioRegion);
    }
  }, [servicioId, servicios, setValue]);

  useEffect(() => {
    const base = precioAcordado ?? 0;
    const desc = descuento ?? 0;
    setValue("precioFinal", Math.max(0, base - desc));
  }, [precioAcordado, descuento, setValue]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) reset();
    onOpenChange(isOpen);
  };

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    const result = await crearClienteServicio(data);
    setIsSubmitting(false);

    if (result.success && result.data) {
      toast.success("Servicio contratado correctamente");
      handleOpenChange(false);
      onSuccess(result.data.id, result.data.requiereTramite);
    } else {
      toast.error(result.error ?? "Error al contratar el servicio");
    }
  });

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4">
        <SheetHeader>
          <SheetTitle>Contratar Servicio</SheetTitle>
        </SheetHeader>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label>
              Servicio <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="servicioId"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicios.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nombre}
                        {s.precioRegion != null && (
                          <span className="ml-2 text-muted-foreground">
                            — {s.precioRegion.toLocaleString("es-BO")} Bs.
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.servicioId && (
              <p className="text-sm text-destructive">
                {errors.servicioId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>
                Precio acordado <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                {...register("precioAcordado", { valueAsNumber: true })}
              />
              {errors.precioAcordado && (
                <p className="text-sm text-destructive">
                  {errors.precioAcordado.message}
                </p>
              )}
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

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              rows={3}
              placeholder="Observaciones sobre el servicio..."
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
              Contratar
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
