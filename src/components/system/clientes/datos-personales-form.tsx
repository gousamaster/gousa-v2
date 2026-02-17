// src/components/system/clientes/datos-personales-form.tsx

"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DatosPersonalesForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Datos de Pasaporte</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pasaporteFechaEmision">Fecha de Emisión</Label>
            <Input
              id="pasaporteFechaEmision"
              type="date"
              {...register("datosPersonales.pasaporteFechaEmision")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pasaporteFechaExpiracion">
              Fecha de Expiración
            </Label>
            <Input
              id="pasaporteFechaExpiracion"
              type="date"
              {...register("datosPersonales.pasaporteFechaExpiracion")}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Redes Sociales</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              placeholder="https://facebook.com/usuario"
              {...register("datosPersonales.facebook")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              placeholder="@usuario"
              {...register("datosPersonales.instagram")}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="direccionDomicilio">Dirección de Domicilio</Label>
        <Textarea
          id="direccionDomicilio"
          placeholder="Calle Principal #123, Zona Centro"
          {...register("datosPersonales.direccionDomicilio")}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estadoCivil">Estado Civil</Label>
          <Input
            id="estadoCivil"
            placeholder="Soltero/a, Casado/a, etc."
            {...register("datosPersonales.estadoCivil")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profesion">Profesión</Label>
          <Input
            id="profesion"
            placeholder="Ingeniero, Médico, etc."
            {...register("datosPersonales.profesion")}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Datos de los Padres</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombrePadre">Nombre del Padre</Label>
            <Input
              id="nombrePadre"
              placeholder="Nombre completo"
              {...register("datosPersonales.nombrePadre")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaNacimientoPadre">Fecha de Nacimiento</Label>
            <Input
              id="fechaNacimientoPadre"
              type="date"
              {...register("datosPersonales.fechaNacimientoPadre")}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombreMadre">Nombre de la Madre</Label>
            <Input
              id="nombreMadre"
              placeholder="Nombre completo"
              {...register("datosPersonales.nombreMadre")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaNacimientoMadre">Fecha de Nacimiento</Label>
            <Input
              id="fechaNacimientoMadre"
              type="date"
              {...register("datosPersonales.fechaNacimientoMadre")}
            />
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Todos los campos en esta sección son opcionales
      </p>
    </div>
  );
}
