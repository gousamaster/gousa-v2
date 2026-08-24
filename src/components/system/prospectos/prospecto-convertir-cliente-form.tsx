"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { FormProvider, useForm, type FieldErrors } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatosAcademicosForm } from "@/components/system/clientes/datos-academicos-form";
import { DatosBasicosForm } from "@/components/system/clientes/datos-basicos-form";
import { DatosLaboralesForm } from "@/components/system/clientes/datos-laborales-form";
import { DatosMatrimonialesForm } from "@/components/system/clientes/datos-matrimoniales-form";
import { DatosPatrocinadorForm } from "@/components/system/clientes/datos-patrocinador-form";
import { DatosPersonalesForm } from "@/components/system/clientes/datos-personales-form";
import { DatosViajeForm } from "@/components/system/clientes/datos-viaje-form";
import { useSession } from "@/lib/auth-client";
import { convertirProspectoAClienteCompleto } from "@/lib/actions/prospectos/prospecto-cliente-actions";
import { createClienteCompletoSchema, type CreateClienteCompletoFormData } from "@/validations/cliente-validations";

type ProspectoBase = { id:string;nombres:string;apellidos:string|null;email:string|null;telefono:string;pais:string|null };

const TAB_POR_SECCION: Record<string,string> = {
  cliente:"basicos", datosPersonales:"personales", datosLaborales:"laborales", datosAcademicos:"academicos",
  datosMatrimoniales:"matrimoniales", datosPatrocinador:"patrocinador", datosViaje:"viaje",
};
const ETIQUETAS: Record<string,string> = {
  nombres:"Nombres", apellidos:"Apellidos", tipoCliente:"Tipo de Cliente", regionId:"Región", email:"Email",
  fechaNacimiento:"Fecha de Nacimiento", lugarNacimiento:"Lugar de Nacimiento", nacionalidad:"Nacionalidad",
  numeroCi:"Número de CI", numeroPasaporte:"Número de Pasaporte", telefonoCelular:"Teléfono Celular",
};

function extraerErrores(errors: FieldErrors<CreateClienteCompletoFormData>) {
  const items:Array<{seccion:string;campo:string;mensaje:string}> = [];
  const walk=(obj:unknown,seccion:string,path:string[])=>{
    if(!obj||typeof obj!=="object")return;
    const rec=obj as Record<string,unknown>;
    if(typeof rec.message==="string"){
      const campo=path[path.length-1]??"Campo";
      items.push({seccion,campo:ETIQUETAS[campo]??campo,mensaje:rec.message});
      return;
    }
    for(const [k,v] of Object.entries(rec)){
      if(k==="ref"||k==="type"||k==="types")continue;
      walk(v,seccion||k,[...path,k]);
    }
  };
  for(const [seccion,valor] of Object.entries(errors))walk(valor,seccion,[seccion]);
  return items;
}

export function ProspectoConvertirClienteForm({prospecto,regiones}:{prospecto:ProspectoBase;regiones:Array<{id:string;nombre:string}>}) {
  const router=useRouter();
  const {data:session}=useSession();
  const [activeTab,setActiveTab]=useState("basicos");
  const [isPending,startTransition]=useTransition();
  const [erroresVisibles,setErroresVisibles]=useState<Array<{seccion:string;campo:string;mensaje:string}>>([]);

  const methods=useForm<CreateClienteCompletoFormData>({
    resolver:zodResolver(createClienteCompletoSchema), mode:"onChange",
    defaultValues:{
      cliente:{nombres:prospecto.nombres,apellidos:prospecto.apellidos??"",tipoCliente:"ADULTO",fechaNacimiento:null,lugarNacimiento:null,nacionalidad:prospecto.pais||"Bolivia",numeroCi:null,numeroPasaporte:null,email:prospecto.email,telefonoCelular:prospecto.telefono,regionId:"",registradoPorId:""},
      datosPersonales:{},datosLaborales:{},datosAcademicos:{},datosMatrimoniales:{},datosPatrocinador:{},datosViaje:{},
    },
  });

  useEffect(()=>{if(session?.user?.id)methods.setValue("cliente.registradoPorId",session.user.id)},[session?.user?.id,methods]);

  const onSubmit=methods.handleSubmit((data)=>{
    setErroresVisibles([]);
    startTransition(async()=>{
      const result=await convertirProspectoAClienteCompleto(prospecto.id,data);
      if(!result.success||!result.data){toast.error(result.error||"No se pudo convertir el prospecto");return}
      toast.success("Prospecto convertido en cliente correctamente");router.push(`/clients/${result.data.id}`);router.refresh();
    });
  },(errors)=>{
    console.error("Errores al completar cliente desde prospecto:",errors);
    const items=extraerErrores(errors);
    setErroresVisibles(items);
    const primero=items[0];
    if(primero)setActiveTab(TAB_POR_SECCION[primero.seccion]??"basicos");
    toast.error(primero?`${primero.campo}: ${primero.mensaje}`:"Revisa los campos marcados antes de convertir");
  });

  return <div className="flex-1 space-y-6 p-8 pt-6">
    <div className="flex items-start justify-between gap-4"><div>
      <Button type="button" variant="outline" className="mb-4" onClick={()=>router.push(`/prospectos/${prospecto.id}`)}><ArrowLeft className="mr-2 h-4 w-4"/>Volver al prospecto</Button>
      <h1 className="text-3xl font-bold tracking-tight">Convertir en Cliente</h1>
      <p className="text-muted-foreground">Completa la ficha de {prospecto.nombres} {prospecto.apellidos??""}. El prospecto solo saldrá de la bandeja comercial cuando guardes esta ficha correctamente.</p>
    </div></div>

    <Card><CardHeader><CardTitle>Alta completa de Cliente</CardTitle></CardHeader><CardContent>
      <FormProvider {...methods}><form onSubmit={onSubmit}>
        {erroresVisibles.length>0&&<div className="mb-5 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <div className="mb-2 flex items-center gap-2 font-semibold text-destructive"><AlertCircle className="h-4 w-4"/>Revisa estos datos antes de continuar</div>
          <ul className="space-y-1">{erroresVisibles.slice(0,6).map((e,i)=><li key={`${e.seccion}-${e.campo}-${i}`}>• <b>{e.campo}:</b> {e.mensaje}</li>)}</ul>
        </div>}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-1 md:grid-cols-4 xl:grid-cols-7">
            <TabsTrigger value="basicos">Básicos</TabsTrigger><TabsTrigger value="personales">Personales</TabsTrigger><TabsTrigger value="laborales">Laborales</TabsTrigger><TabsTrigger value="academicos">Académicos</TabsTrigger><TabsTrigger value="matrimoniales">Matrimoniales</TabsTrigger><TabsTrigger value="patrocinador">Patrocinador</TabsTrigger><TabsTrigger value="viaje">Viaje</TabsTrigger>
          </TabsList>
          <TabsContent value="basicos" className="mt-6"><DatosBasicosForm regiones={regiones}/></TabsContent>
          <TabsContent value="personales" className="mt-6"><DatosPersonalesForm/></TabsContent>
          <TabsContent value="laborales" className="mt-6"><DatosLaboralesForm/></TabsContent>
          <TabsContent value="academicos" className="mt-6"><DatosAcademicosForm/></TabsContent>
          <TabsContent value="matrimoniales" className="mt-6"><DatosMatrimonialesForm/></TabsContent>
          <TabsContent value="patrocinador" className="mt-6"><DatosPatrocinadorForm/></TabsContent>
          <TabsContent value="viaje" className="mt-6"><DatosViajeForm/></TabsContent>
        </Tabs>
        <div className="mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={isPending} onClick={()=>router.push(`/prospectos/${prospecto.id}`)}>Cancelar</Button>
          <Button type="submit" disabled={isPending}>{isPending&&<Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Guardar y convertir en Cliente</Button>
        </div>
      </form></FormProvider>
    </CardContent></Card>
  </div>;
}
