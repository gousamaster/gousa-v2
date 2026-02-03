// src/components/system/settings/estados-pago/estado-pago-form-drawer.tsx

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
  actualizarEstadoPago,
  crearEstadoPago,
} from "@/lib/actions/catalogos/estados-pago-actions";
import type { EstadoPagoListItem } from "@/types/estado-pago-types";
import {
  type CreateEstadoPagoFormData,
  createEstadoPagoSchema,
} from "@/validations/estado-pago-validations";

interface EstadoPagoFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estado?: EstadoPagoListItem | null;
  onSuccess: () => void;
}

export function EstadoPagoFormDrawer({
  open,
  onOpenChange,
  estado,
  onSuccess,
}: EstadoPagoFormDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!estado;

  const form = useForm<CreateEstadoPagoFormData>({
    resolver: zodResolver(createEstadoPagoSchema),
    defaultValues: {
      nombre: "",
      codigo: "",
      descripcion: "",
      color: "",
      orden: 0,
      activo: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (estado) {
        form.reset({
          nombre: estado.nombre,
          codigo: estado.codigo,
          descripcion: "",
          color: estado.color || "",
          orden: estado.orden,
          activo: estado.activo,
        });
      } else {
        form.reset({
          nombre: "",
          codigo: "",
          descripcion: "",
          color: "",
          orden: 0,
          activo: true,
        });
      }
    }
  }, [estado, form, open]);

  async function onSubmit(values: CreateEstadoPagoFormData) {
    setIsLoading(true);

    try {
      if (isEdit && estado) {
        const result = await actualizarEstadoPago(estado.id, values);

        if (result.success) {
          toast.success("Estado de pago actualizado correctamente");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Error al actualizar estado de pago");
        }
      } else {
        const result = await crearEstadoPago(values);

        if (result.success) {
          toast.success("Estado de pago creado correctamente");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Error al crear estado de pago");
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
            {isEdit ? "Editar estado de pago" : "Crear nuevo estado"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifica los datos del estado de pago"
              : "Completa los datos para crear un nuevo estado de pago"}
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
                    <Input placeholder="Pagado" {...field} />
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
                      placeholder="PAGADO"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Código único del estado (se convertirá a mayúsculas)
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
                      placeholder="Descripción del estado..."
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
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color (hex)</FormLabel>
                  <FormControl>
                    <Input placeholder="#10B981" {...field} />
                  </FormControl>
                  <FormDescription>
                    Color hexadecimal para badges (ej: #10B981)
                  </FormDescription>
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
                      El estado estará {field.value ? "activo" : "inactivo"}
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
