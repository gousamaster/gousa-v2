// src/components/system/settings/regiones/region-form-drawer.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
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
import {
  actualizarRegion,
  crearRegion,
} from "@/lib/actions/catalogos/regiones-actions";
import type { RegionListItem } from "@/types/region-types";
import { createRegionSchema } from "@/validations/region-validations";

type RegionFormValues = z.infer<typeof createRegionSchema>;

interface RegionFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region?: RegionListItem | null;
  onSuccess: () => void;
}

export function RegionFormDrawer({
  open,
  onOpenChange,
  region,
  onSuccess,
}: RegionFormDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = !!region;

  const form = useForm<RegionFormValues>({
    resolver: zodResolver(createRegionSchema),
    defaultValues: {
      nombre: "",
      codigo: "",
      activo: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (region) {
        form.reset({
          nombre: region.nombre,
          codigo: region.codigo,
          activo: region.activo,
        });
      } else {
        form.reset({
          nombre: "",
          codigo: "",
          activo: true,
        });
      }
    }
  }, [region, form, open]);

  async function onSubmit(values: RegionFormValues) {
    setIsLoading(true);

    try {
      if (isEdit && region) {
        const result = await actualizarRegion(region.id, values);

        if (result.success) {
          toast.success("Región actualizada correctamente");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Error al actualizar región");
        }
      } else {
        const result = await crearRegion(values);

        if (result.success) {
          toast.success("Región creada correctamente");
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(result.error || "Error al crear región");
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
            {isEdit ? "Editar región" : "Crear nueva región"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifica los datos de la región"
              : "Completa los datos para crear una nueva región"}
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
                    <Input placeholder="La Paz" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nombre del departamento de Bolivia
                  </FormDescription>
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
                      placeholder="LPZ"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Código único de la región (se convertirá a mayúsculas)
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
                      La región estará {field.value ? "activa" : "inactiva"}
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
