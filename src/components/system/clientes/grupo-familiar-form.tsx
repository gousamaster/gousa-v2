// src/components/system/clientes/grupo-familiar-form.tsx

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
import { Textarea } from "@/components/ui/textarea";
import {
  crearGrupoFamiliar,
  obtenerParentescos,
} from "@/lib/actions/clientes/grupos-familiares-actions";
import {
  type CreateGrupoFamiliarFormData,
  createGrupoFamiliarSchema,
} from "@/validations/grupo-familiar-validations";

interface GrupoFamiliarFormProps {
  clienteId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Formulario de creación de grupo familiar
 * El cliente actual se convierte en titular con el parentesco seleccionado
 */
export function GrupoFamiliarForm({
  clienteId,
  onSuccess,
  onCancel,
}: GrupoFamiliarFormProps) {
  const [parentescos, setParentescos] = useState<
    Array<{ id: string; nombre: string; codigo: string }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGrupoFamiliarFormData>({
    resolver: zodResolver(createGrupoFamiliarSchema),
  });

  useEffect(() => {
    obtenerParentescos().then((result) => {
      if (result.success && result.data) setParentescos(result.data);
    });
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    const result = await crearGrupoFamiliar(clienteId, data);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Grupo familiar creado correctamente");
      onSuccess();
    } else {
      toast.error(result.error ?? "Error al crear el grupo familiar");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="nombre">
          Nombre del grupo <span className="text-destructive">*</span>
        </Label>
        <Input
          id="nombre"
          placeholder="Ej: Familia Pérez"
          {...register("nombre")}
        />
        {errors.nombre && (
          <p className="text-sm text-destructive">{errors.nombre.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea
          id="descripcion"
          placeholder="Información adicional del grupo..."
          rows={3}
          {...register("descripcion")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentescoTitularId">
          Parentesco del titular <span className="text-destructive">*</span>
        </Label>
        <Controller
          control={control}
          name="parentescoTitularId"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona parentesco" />
              </SelectTrigger>
              <SelectContent>
                {parentescos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.parentescoTitularId && (
          <p className="text-sm text-destructive">
            {errors.parentescoTitularId.message}
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Crear Grupo
        </Button>
      </div>
    </form>
  );
}
