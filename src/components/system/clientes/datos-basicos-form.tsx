// src/components/system/clientes/datos-basicos-form.tsx

"use client";

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";
import type { CreateClienteCompletoFormData } from "@/validations/cliente-validations";

interface DatosBasicosFormProps {
  regiones: Array<{ id: string; nombre: string }>;
}

/**
 * Formulario de datos básicos del cliente
 * Captura información esencial como nombres, tipo de cliente y región
 */
export function DatosBasicosForm({ regiones }: DatosBasicosFormProps) {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<CreateClienteCompletoFormData>();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      setValue("cliente.registradoPorId", session.user.id);
    }
  }, [session, setValue]);

  const getErrorMessage = (error: unknown): string => {
    if (typeof error === "object" && error !== null && "message" in error) {
      return String(error.message);
    }
    return "";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombres">
            Nombres <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nombres"
            placeholder="Juan Carlos"
            {...register("cliente.nombres")}
          />
          {errors.cliente?.nombres && (
            <p className="text-sm text-destructive">
              {getErrorMessage(errors.cliente.nombres)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="apellidos">
            Apellidos <span className="text-destructive">*</span>
          </Label>
          <Input
            id="apellidos"
            placeholder="Pérez González"
            {...register("cliente.apellidos")}
          />
          {errors.cliente?.apellidos && (
            <p className="text-sm text-destructive">
              {getErrorMessage(errors.cliente.apellidos)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tipoCliente">
            Tipo de Cliente <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={control}
            name="cliente.tipoCliente"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADULTO">Adulto</SelectItem>
                  <SelectItem value="INFANTE">Infante</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.cliente?.tipoCliente && (
            <p className="text-sm text-destructive">
              {getErrorMessage(errors.cliente.tipoCliente)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="regionId">
            Región <span className="text-destructive">*</span>
          </Label>
          <Controller
            control={control}
            name="cliente.regionId"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona región" />
                </SelectTrigger>
                <SelectContent>
                  {regiones.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.cliente?.regionId && (
            <p className="text-sm text-destructive">
              {getErrorMessage(errors.cliente.regionId)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
          <Input
            id="fechaNacimiento"
            type="date"
            {...register("cliente.fechaNacimiento")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lugarNacimiento">Lugar de Nacimiento</Label>
          <Input
            id="lugarNacimiento"
            placeholder="La Paz, Bolivia"
            {...register("cliente.lugarNacimiento")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nacionalidad">Nacionalidad</Label>
          <Input
            id="nacionalidad"
            placeholder="Boliviana"
            {...register("cliente.nacionalidad")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numeroCi">Número de CI</Label>
          <Input
            id="numeroCi"
            placeholder="1234567 LP"
            {...register("cliente.numeroCi")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numeroPasaporte">Número de Pasaporte</Label>
          <Input
            id="numeroPasaporte"
            placeholder="A12345678"
            {...register("cliente.numeroPasaporte")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="cliente@example.com"
            {...register("cliente.email")}
          />
          {errors.cliente?.email && (
            <p className="text-sm text-destructive">
              {getErrorMessage(errors.cliente.email)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefonoCelular">Teléfono Celular</Label>
          <Input
            id="telefonoCelular"
            placeholder="+591 70123456"
            {...register("cliente.telefonoCelular")}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="text-destructive">*</span> Campos obligatorios
      </p>
    </div>
  );
}
