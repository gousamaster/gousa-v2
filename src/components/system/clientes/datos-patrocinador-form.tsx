// src/components/system/clientes/datos-patrocinador-form.tsx
"use client";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function DatosPatrocinadorForm() {
  const { register } = useFormContext();
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Información del Patrocinador</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nombre Completo</Label>
            <Input
              placeholder="Nombre del patrocinador"
              {...register("datosPatrocinador.nombrePatrocinador")}
            />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input
              placeholder="+591 70123456"
              {...register("datosPatrocinador.telefonoPatrocinador")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="patrocinador@example.com"
            {...register("datosPatrocinador.emailPatrocinador")}
          />
        </div>
        <div className="space-y-2">
          <Label>Dirección</Label>
          <Input
            placeholder="Dirección completa"
            {...register("datosPatrocinador.direccionPatrocinador")}
          />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-medium">
          Información Laboral del Patrocinador
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Lugar de Trabajo</Label>
            <Input
              placeholder="Empresa"
              {...register("datosPatrocinador.trabajoPatrocinador")}
            />
          </div>
          <div className="space-y-2">
            <Label>Fecha de Inicio</Label>
            <Input
              type="date"
              {...register("datosPatrocinador.fechaInicioTrabajoPatrocinador")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Salario (Bs)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register("datosPatrocinador.percepcionSalarialPatrocinador", {
              valueAsNumber: true,
            })}
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Campos opcionales</p>
    </div>
  );
}
