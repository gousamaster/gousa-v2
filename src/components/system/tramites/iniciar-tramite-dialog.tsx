// src/components/system/tramites/iniciar-tramite-dialog.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  crearTramite,
  obtenerEstadosTramite,
  obtenerUsuariosAsignables,
} from "@/lib/actions/tramites/tramites-actions";
import { useSession } from "@/lib/auth-client";
import {
  type CreateTramiteFormData,
  createTramiteSchema,
} from "@/validations/tramite-validations";

interface IniciarTramiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId: string;
  clienteServicioId: string;
  onSuccess: (tramiteId: string) => void;
}

/**
 * Dialog para iniciar un trámite a partir de un servicio contratado
 */
export function IniciarTramiteDialog({
  open,
  onOpenChange,
  clienteId,
  clienteServicioId,
  onSuccess,
}: IniciarTramiteDialogProps) {
  const { data: session } = useSession();
  const [estados, setEstados] = useState<
    Array<{ id: string; nombre: string; color: string | null; orden: number }>
  >([]);
  const [usuarios, setUsuarios] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTramiteFormData>({
    resolver: zodResolver(createTramiteSchema),
    defaultValues: { clienteId, clienteServicioId },
  });

  useEffect(() => {
    if (!open) return;
    Promise.all([obtenerEstadosTramite(), obtenerUsuariosAsignables()]).then(
      ([eResult, uResult]) => {
        if (eResult.success && eResult.data) setEstados(eResult.data);
        if (uResult.success && uResult.data) setUsuarios(uResult.data);
      },
    );
  }, [open]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) reset();
    onOpenChange(isOpen);
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!session?.user?.id) return;
    setIsSubmitting(true);
    const result = await crearTramite(data, session.user.id);
    setIsSubmitting(false);

    if (result.success && result.data) {
      toast.success("Trámite iniciado correctamente");
      handleOpenChange(false);
      onSuccess(result.data.id);
    } else {
      toast.error(result.error ?? "Error al iniciar el trámite");
    }
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar Trámite</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>
              Estado inicial <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="estadoActualId"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona estado inicial" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.estadoActualId && (
              <p className="text-sm text-destructive">
                {errors.estadoActualId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Asignar a usuario</Label>
            <Controller
              control={control}
              name="usuarioAsignadoId"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(v || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Notas iniciales</Label>
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
              Iniciar Trámite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
