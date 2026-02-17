// src/components/system/clientes/datos-matrimoniales-form.tsx
"use client";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function DatosMatrimonialesForm() {
  const { register } = useFormContext();
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Datos del Cónyuge</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nombre Completo</Label>
            <Input
              placeholder="Nombre completo del cónyuge"
              {...register("datosMatrimoniales.conyugeNombreCompleto")}
            />
          </div>
          <div className="space-y-2">
            <Label>Fecha de Nacimiento</Label>
            <Input
              type="date"
              {...register("datosMatrimoniales.conyugeFechaNacimiento")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Lugar de Nacimiento</Label>
          <Input
            placeholder="Ciudad, País"
            {...register("datosMatrimoniales.conyugeLugarNacimiento")}
          />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Información del Matrimonio</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fecha de Inicio</Label>
            <Input
              type="date"
              {...register("datosMatrimoniales.matrimonioFechaInicio")}
            />
          </div>
          <div className="space-y-2">
            <Label>Fecha de Fin</Label>
            <Input
              type="date"
              {...register("datosMatrimoniales.matrimonioFechaFin")}
            />
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Campos opcionales</p>
    </div>
  );
}
