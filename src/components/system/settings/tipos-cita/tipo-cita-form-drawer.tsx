// src/components/system/settings/tipos-cita/tipo-cita-form-drawer.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  actualizarTipoCita,
  crearTipoCita,
} from "@/lib/actions/catalogos/tipos-cita-actions";
import type { TipoCitaListItem } from "@/types/tipo-cita-types";
import {
  type CreateTipoCitaFormData,
  createTipoCitaSchema,
} from "@/validations/tipo-cita-validations";

interface TipoCitaFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoCita?: TipoCitaListItem | null;
  onSuccess: () => void;
}

export function TipoCitaFormDrawer({
  open,
  onOpenChange,
  tipoCita,
  onSuccess,
}: TipoCitaFormDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!tipoCita;

  const form = useForm<CreateTipoCitaFormData>({
    resolver: zodResolver(createTipoCitaSchema),
    defaultValues: {
      nombre: "",
      codigo: "",
      descripcion: "",
      orden: 0,
      activo: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (tipoCita) {
        form.reset({
          nombre: tipoCita.nombre,
          codigo: tipoCita.codigo,
          descripcion: "",
          orden: tipoCita.orden,
          activo: tipoCita.activo,
        });
      } else {
        form.reset({
          nombre: "",
          codigo: "",
          descripcion: "",
          orden: 0,
          activo: true,
        });
      }
    }
  }, [tipoCita, form, open]);

  async function onSubmit(values: CreateTipoCitaFormData) {
    setIsLoading(true);

    try {
      if (isEdit && tipoCita) {
        const result = await actualizarTipoCita(tipoCita.id, values);

        if (result.success) {
          toast.success("Tipo de cita actualizado correctamente");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Error al actualizar tipo de cita");
        }
      } else {
        const result = await crearTipoCita(values);

        if (result.success) {
          toast.success(
            "Tipo de cita creado correctamente. Ahora puedes configurar los precios por región.",
          );
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Error al crear tipo de cita");
        }
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Editar tipo de cita" : "Crear nuevo tipo de cita"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifica los datos del tipo de cita"
              : "Completa los datos para crear un nuevo tipo de cita"}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-6"
          >
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Cita Individual" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="CITA_INDIVIDUAL"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Código único del tipo de cita (se convertirá a mayúsculas)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción del tipo de cita..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Opcional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orden"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Orden de visualización en listas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Estado</FormLabel>
                    <FormDescription>
                      El tipo de cita estará{" "}
                      {field.value ? "activo" : "inactivo"}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
