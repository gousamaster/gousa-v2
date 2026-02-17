// src/components/system/clientes/datos-laborales-form.tsx
"use client";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
export function DatosLaboralesForm() {
  const { register } = useFormContext();
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Trabajo Actual</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Lugar de Trabajo</Label>
            <Input
              placeholder="Empresa"
              {...register("datosLaborales.lugarTrabajo")}
            />
          </div>
          <div className="space-y-2">
            <Label>Cargo</Label>
            <Input
              placeholder="Gerente, Analista"
              {...register("datosLaborales.cargoTrabajo")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Descripción</Label>
          <Textarea
            placeholder="Responsabilidades..."
            {...register("datosLaborales.descripcionTrabajo")}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Dirección</Label>
          <Input
            placeholder="Av. Principal #456"
            {...register("datosLaborales.direccionTrabajo")}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input
              placeholder="+591 2123456"
              {...register("datosLaborales.telefonoTrabajo")}
            />
          </div>
          <div className="space-y-2">
            <Label>Fecha Contratación</Label>
            <Input
              type="date"
              {...register("datosLaborales.fechaContratacion")}
            />
          </div>
          <div className="space-y-2">
            <Label>Salario (Bs)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("datosLaborales.percepcionSalarial", {
                valueAsNumber: true,
              })}
            />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Trabajo Anterior</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Empresa</Label>
            <Input
              placeholder="Anterior"
              {...register("datosLaborales.nombreTrabajoAnterior")}
            />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input
              placeholder="+591 2123456"
              {...register("datosLaborales.telefonoTrabajoAnterior")}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Dirección</Label>
          <Input
            placeholder="Dirección anterior"
            {...register("datosLaborales.direccionTrabajoAnterior")}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fecha Inicio</Label>
            <Input
              type="date"
              {...register("datosLaborales.fechaInicioTrabajoAnterior")}
            />
          </div>
          <div className="space-y-2">
            <Label>Referencia</Label>
            <Input
              placeholder="Nombre"
              {...register("datosLaborales.referenciaTrabajoAnterior")}
            />
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Campos opcionales</p>
    </div>
  );
}
