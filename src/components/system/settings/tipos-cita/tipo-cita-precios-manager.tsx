// src/components/system/settings/tipos-cita/tipo-cita-precios-manager.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Power, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  agregarPrecioATipoCita,
  eliminarPrecioTipoCita,
  obtenerPreciosPorTipoCita,
  togglePrecioTipoCitaActivo,
} from "@/lib/actions/catalogos/tipos-cita-actions";
import type { RegionListItem } from "@/types/region-types";
import type {
  CitaPrecioDetalle,
  TipoCitaListItem,
} from "@/types/tipo-cita-types";

const precioFormSchema = z.object({
  regionId: z.string().min(1, "La región es requerida"),
  precio: z.number().min(0, "El precio no puede ser negativo").max(999999.99),
});

type PrecioFormValues = z.infer<typeof precioFormSchema>;

interface TipoCitaPreciosManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoCita: TipoCitaListItem;
  regiones: RegionListItem[];
  onSuccess: () => void;
}

export function TipoCitaPreciosManager({
  open,
  onOpenChange,
  tipoCita,
  regiones,
  onSuccess,
}: TipoCitaPreciosManagerProps) {
  const [precios, setPrecios] = useState<CitaPrecioDetalle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [precioToDelete, setPrecioToDelete] =
    useState<CitaPrecioDetalle | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<PrecioFormValues>({
    resolver: zodResolver(precioFormSchema),
    defaultValues: {
      regionId: "",
      precio: 0,
    },
  });

  const loadPrecios = async () => {
    setIsLoading(true);
    try {
      const result = await obtenerPreciosPorTipoCita(tipoCita.id);
      if (result.success && result.data) {
        setPrecios(result.data);
      }
    } catch (error) {
      console.error("Error loading precios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadPrecios();
      setShowAddForm(false);
      form.reset();
    }
  }, [open, tipoCita.id]);

  const regionesDisponibles = regiones.filter(
    (region) => !precios.some((precio) => precio.regionId === region.id),
  );

  async function onSubmit(values: PrecioFormValues) {
    setIsSubmitting(true);
    try {
      const result = await agregarPrecioATipoCita({
        tipoCitaId: tipoCita.id,
        regionId: values.regionId,
        precio: values.precio,
      });

      if (result.success) {
        toast.success("Precio agregado correctamente");
        await loadPrecios();
        setShowAddForm(false);
        form.reset();
        onSuccess();
      } else {
        toast.error(result.error || "Error al agregar precio");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleTogglePrecio = async (precio: CitaPrecioDetalle) => {
    const result = await togglePrecioTipoCitaActivo(precio.id);
    if (result.success) {
      toast.success(
        `Precio ${precio.activo ? "desactivado" : "activado"} correctamente`,
      );
      await loadPrecios();
      onSuccess();
    } else {
      toast.error(result.error || "Error al cambiar estado del precio");
    }
  };

  const handleDeletePrecio = (precio: CitaPrecioDetalle) => {
    setPrecioToDelete(precio);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!precioToDelete) return;

    const result = await eliminarPrecioTipoCita(precioToDelete.id);
    if (result.success) {
      toast.success("Precio eliminado correctamente");
      await loadPrecios();
      onSuccess();
    } else {
      toast.error(result.error || "Error al eliminar precio");
    }

    setIsDeleteDialogOpen(false);
    setPrecioToDelete(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionar Precios - {tipoCita.nombre}</DialogTitle>
            <DialogDescription>
              Configura los precios del tipo de cita por región
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!showAddForm && regionesDisponibles.length > 0 && (
              <Button onClick={() => setShowAddForm(true)} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Agregar precio
              </Button>
            )}

            {showAddForm && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">Nuevo precio</h3>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="regionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Región</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una región" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {regionesDisponibles.map((region) => (
                                <SelectItem key={region.id} value={region.id}>
                                  {region.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="precio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio (Bs)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddForm(false);
                          form.reset();
                        }}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Agregar
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando precios...
              </div>
            ) : precios.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay precios configurados para este tipo de cita
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Región</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {precios.map((precio) => (
                      <TableRow key={precio.id}>
                        <TableCell className="font-medium">
                          {precio.regionNombre}
                        </TableCell>
                        <TableCell>Bs {precio.precio.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={precio.activo ? "default" : "secondary"}
                          >
                            {precio.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePrecio(precio)}
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePrecio(precio)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="¿Eliminar precio?"
        description={`¿Estás seguro de que deseas eliminar el precio de ${precioToDelete?.regionNombre}?`}
        confirmText="Eliminar"
        variant="destructive"
      />
    </>
  );
}
