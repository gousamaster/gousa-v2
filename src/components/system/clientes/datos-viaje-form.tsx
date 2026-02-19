// src/components/system/clientes/datos-viaje-form.tsx

"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Formulario de datos de viaje del cliente
 * Información sobre el destino, motivo y contactos en el lugar de destino
 */
export function DatosViajeForm() {
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="motivo">Motivo del Viaje</Label>
          <Input
            id="motivo"
            placeholder="Turismo, Estudios, Trabajo, etc."
            {...register("datosViaje.motivo")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lugar">Lugar de Destino</Label>
          <Input
            id="lugar"
            placeholder="Ciudad, Estado"
            {...register("datosViaje.lugar")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fechaTentativa">Fecha Tentativa de Viaje</Label>
          <Input
            id="fechaTentativa"
            type="date"
            {...register("datosViaje.fechaTentativa")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tiempoEstadia">Tiempo de Estadía</Label>
          <Input
            id="tiempoEstadia"
            placeholder="2 semanas, 3 meses, etc."
            {...register("datosViaje.tiempoEstadia")}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Contacto en Destino</h3>

        <div className="space-y-2">
          <Label htmlFor="contactoDestino">Nombre del Contacto</Label>
          <Input
            id="contactoDestino"
            placeholder="Nombre completo"
            {...register("datosViaje.contactoDestino")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="direccionContacto">Dirección del Contacto</Label>
          <Input
            id="direccionContacto"
            placeholder="Dirección completa"
            {...register("datosViaje.direccionContacto")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefonoContacto">Teléfono del Contacto</Label>
          <Input
            id="telefonoContacto"
            placeholder="+1 555-0000"
            {...register("datosViaje.telefonoContacto")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paisesVisitados">Países Visitados Previamente</Label>
        <Textarea
          id="paisesVisitados"
          placeholder="Lista de países que ha visitado anteriormente..."
          {...register("datosViaje.paisesVisitados")}
          rows={3}
        />
      </div>

      <p className="text-sm text-muted-foreground">Campos opcionales</p>
    </div>
  );
}
