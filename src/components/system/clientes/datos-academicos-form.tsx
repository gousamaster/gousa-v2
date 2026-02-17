// src/components/system/clientes/datos-academicos-form.tsx
"use client";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function DatosAcademicosForm() {
  const { register } = useFormContext();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Lugar de Estudio</Label>
          <Input
            placeholder="Universidad, Instituto"
            {...register("datosAcademicos.lugarEstudio")}
          />
        </div>
        <div className="space-y-2">
          <Label>Carrera</Label>
          <Input
            placeholder="Ingeniería, Medicina"
            {...register("datosAcademicos.carreraEstudio")}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Dirección</Label>
        <Input
          placeholder="Dirección del centro de estudios"
          {...register("datosAcademicos.direccionEstudio")}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Teléfono</Label>
          <Input
            placeholder="+591 2123456"
            {...register("datosAcademicos.telefonoEstudio")}
          />
        </div>
        <div className="space-y-2">
          <Label>Fecha Inicio</Label>
          <Input
            type="date"
            {...register("datosAcademicos.fechaInicioEstudio")}
          />
        </div>
        <div className="space-y-2">
          <Label>Fecha Fin</Label>
          <Input type="date" {...register("datosAcademicos.fechaFinEstudio")} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Campos opcionales</p>
    </div>
  );
}
