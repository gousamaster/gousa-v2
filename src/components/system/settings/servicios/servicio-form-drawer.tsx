// src/components/system/settings/servicios/servicio-form-drawer.tsx

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
  actualizarServicio,
  crearServicio,
} from "@/lib/actions/catalogos/servicios-actions";
import type { ServicioListItem } from "@/types/servicio-types";
import {
  type CreateServicioFormData,
  createServicioSchema,
} from "@/validations/servicio-validations";

interface ServicioFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicio?: ServicioListItem | null;
  onSuccess: () => void;
}

export function ServicioFormDrawer({
  open,
  onOpenChange,
  servicio,
  onSuccess,
}: ServicioFormDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!servicio;

  const form = useForm<CreateServicioFormData>({
    resolver: zodResolver(createServicioSchema),
    defaultValues: {
      nombre: "",
      codigo: "",
      descripcion: "",
      requiereTramite: true,
      orden: 0,
      activo: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (servicio) {
        form.reset({
          nombre: servicio.nombre,
          codigo: servicio.codigo,
          descripcion: "",
          requiereTramite: servicio.requiereTramite,
          orden: servicio.orden,
          activo: servicio.activo,
        });
      } else {
        form.reset({
          nombre: "",
          codigo: "",
          descripcion: "",
          requiereTramite: true,
          orden: 0,
          activo: true,
        });
      }
    }
  }, [servicio, form, open]);

  async function onSubmit(values: CreateServicioFormData) {
    setIsLoading(true);

    try {
      if (isEdit && servicio) {
        const result = await actualizarServicio(servicio.id, values);

        if (result.success) {
          toast.success("Servicio actualizado correctamente");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Error al actualizar servicio");
        }
      } else {
        const result = await crearServicio(values);

        if (result.success) {
          toast.success(
            "Servicio creado correctamente. Ahora puedes configurar los precios por región.",
          );
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Error al crear servicio");
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
            {isEdit ? "Editar servicio" : "Crear nuevo servicio"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifica los datos del servicio"
              : "Completa los datos para crear un nuevo servicio"}
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
                    <Input placeholder="Visa Turista" {...field} />
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
                      placeholder="VISA_TURISTA"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Código único del servicio (se convertirá a mayúsculas)
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
                      placeholder="Descripción del servicio..."
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
              name="requiereTramite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Requiere trámite
                    </FormLabel>
                    <FormDescription>
                      El servicio {field.value ? "requiere" : "no requiere"} un
                      trámite asociado
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
                      El servicio estará {field.value ? "activo" : "inactivo"}
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
