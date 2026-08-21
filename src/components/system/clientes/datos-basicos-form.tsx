// src/components/system/clientes/datos-basicos-form.tsx

"use client";

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";
import type { CreateClienteCompletoFormData } from "@/validations/cliente-validations";

interface DatosBasicosFormProps { regiones:Array<{id:string;nombre:string}> }

export function DatosBasicosForm({ regiones }: DatosBasicosFormProps) {
  const {register,setValue,control,watch,formState:{errors}}=useFormContext<CreateClienteCompletoFormData>();
  const {data:session}=useSession();
  const mismoCorreo=watch("centroVisas.mismoCorreo")!==false;
  const emailCliente=watch("cliente.email")??"";

  useEffect(()=>{if(session?.user?.id)setValue("cliente.registradoPorId",session.user.id)},[session,setValue]);
  useEffect(()=>{if(mismoCorreo)setValue("centroVisas.email",emailCliente||"")},[mismoCorreo,emailCliente,setValue]);

  const getErrorMessage=(error:unknown):string=>typeof error==="object"&&error!==null&&"message" in error?String(error.message):"";

  return <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2"><Label htmlFor="nombres">Nombres <span className="text-destructive">*</span></Label><Input id="nombres" placeholder="Juan Carlos" {...register("cliente.nombres")}/>{errors.cliente?.nombres&&<p className="text-sm text-destructive">{getErrorMessage(errors.cliente.nombres)}</p>}</div>
      <div className="space-y-2"><Label htmlFor="apellidos">Apellidos <span className="text-destructive">*</span></Label><Input id="apellidos" placeholder="Pérez González" {...register("cliente.apellidos")}/>{errors.cliente?.apellidos&&<p className="text-sm text-destructive">{getErrorMessage(errors.cliente.apellidos)}</p>}</div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2"><Label>Tipo de Cliente <span className="text-destructive">*</span></Label><Controller control={control} name="cliente.tipoCliente" render={({field})=><Select value={field.value??""} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Selecciona tipo"/></SelectTrigger><SelectContent><SelectItem value="ADULTO">Adulto</SelectItem><SelectItem value="INFANTE">Infante</SelectItem></SelectContent></Select>}/></div>
      <div className="space-y-2"><Label>Región <span className="text-destructive">*</span></Label><Controller control={control} name="cliente.regionId" render={({field})=><Select value={field.value??""} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Selecciona región"/></SelectTrigger><SelectContent>{regiones.map(r=><SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>)}</SelectContent></Select>}/></div>
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2"><Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label><Input id="fechaNacimiento" type="date" {...register("cliente.fechaNacimiento")}/></div>
      <div className="space-y-2"><Label htmlFor="lugarNacimiento">Lugar de Nacimiento</Label><Input id="lugarNacimiento" placeholder="La Paz, Bolivia" {...register("cliente.lugarNacimiento")}/></div>
      <div className="space-y-2"><Label htmlFor="nacionalidad">Nacionalidad</Label><Input id="nacionalidad" placeholder="Boliviana" {...register("cliente.nacionalidad")}/></div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2"><Label htmlFor="numeroCi">Número de CI</Label><Input id="numeroCi" placeholder="1234567 LP" {...register("cliente.numeroCi")}/></div>
      <div className="space-y-2"><Label htmlFor="numeroPasaporte">Número de Pasaporte</Label><Input id="numeroPasaporte" placeholder="A12345678" {...register("cliente.numeroPasaporte")}/></div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="cliente@example.com" {...register("cliente.email")}/>{errors.cliente?.email&&<p className="text-sm text-destructive">{getErrorMessage(errors.cliente.email)}</p>}</div>
      <div className="space-y-2"><Label htmlFor="telefonoCelular">Teléfono Celular</Label><Input id="telefonoCelular" placeholder="+591 70123456" {...register("cliente.telefonoCelular")}/></div>
    </div>

    <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
      <div><h4 className="font-semibold">Acceso Centro de Visas USA</h4><p className="text-xs text-muted-foreground">Credenciales utilizadas para la cuenta del cliente en ais.usvisa-info.com.</p></div>
      <Controller control={control} name="centroVisas.mismoCorreo" render={({field})=><label className="flex items-center gap-2 text-sm font-medium"><Checkbox checked={field.value!==false} onCheckedChange={v=>field.onChange(v===true)}/><span>Mismo correo para Centro de Visas</span></label>}/>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="centroVisaEmail">Correo Centro de Visas</Label><Input id="centroVisaEmail" type="email" disabled={mismoCorreo} placeholder="correo usado en Centro de Visas" {...register("centroVisas.email")}/>{errors.centroVisas?.email&&<p className="text-sm text-destructive">{getErrorMessage(errors.centroVisas.email)}</p>}</div>
        <div className="space-y-2"><Label htmlFor="centroVisaPassword">Contraseña Centro de Visas</Label><Input id="centroVisaPassword" type="password" autoComplete="new-password" placeholder="Contraseña de la cuenta" {...register("centroVisas.password")}/><p className="text-xs text-muted-foreground">En edición, déjala vacía para conservar la contraseña guardada.</p></div>
      </div>
    </div>

    <p className="text-sm text-muted-foreground"><span className="text-destructive">*</span> Campos obligatorios</p>
  </div>;
}
