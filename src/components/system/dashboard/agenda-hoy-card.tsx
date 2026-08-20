"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, RefreshCcw, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ItemAgenda={
  id:string; fechaHora:string; lugar:string|null; tipoCita:string; cliente:string|null; grupoFamiliar:string|null; participantes:number;
};

export function AgendaHoyCard(){
  const[simulacros,setSimulacros]=useState<ItemAgenda[]>([]);
  const[asesorias,setAsesorias]=useState<ItemAgenda[]>([]);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState<string|null>(null);

  const cargar=useCallback(async()=>{
    setLoading(true);setError(null);
    try{
      const r=await fetch("/api/nexus/agenda-hoy",{cache:"no-store"});
      const j=await r.json();
      if(!r.ok)throw new Error(j.error??"No se pudo cargar la agenda de hoy");
      setSimulacros(j.simulacros??[]);setAsesorias(j.asesorias??[]);
    }catch(e){setError(e instanceof Error?e.message:"No se pudo cargar la agenda de hoy")}
    finally{setLoading(false)}
  },[]);

  useEffect(()=>{void cargar()},[cargar]);

  const lista=(items:ItemAgenda[],vacio:string)=>items.length===0?
    <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">{vacio}</div>:
    <div className="space-y-2">{items.map(i=>{
      const hora=new Date(i.fechaHora).toLocaleTimeString("es-BO",{hour:"2-digit",minute:"2-digit"});
      const nombre=i.grupoFamiliar??i.cliente??"Sin cliente";
      return <div key={i.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{hora}</span><span className="truncate font-medium">{nombre}</span>{i.grupoFamiliar&&<Badge variant="secondary"><Users className="mr-1 h-3 w-3"/>{Math.max(i.participantes,1)} personas</Badge>}</div>
          <div className="mt-1 text-xs text-muted-foreground">{i.tipoCita}{i.lugar?` · ${i.lugar}`:""}</div>
        </div>
      </div>})}</div>;

  return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <Card className="shadow-sm">
      <CardHeader className="pb-3"><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-base"><CalendarClock className="h-5 w-5"/>Simulacros · Hoy</CardTitle><Button variant="outline" size="sm" onClick={()=>void cargar()} disabled={loading}><RefreshCcw className="mr-2 h-4 w-4"/>Actualizar</Button></div></CardHeader>
      <CardContent>{error?<div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>:loading?<p className="text-sm text-muted-foreground">Cargando simulacros...</p>:lista(simulacros,"No hay simulacros programados para hoy.")}</CardContent>
    </Card>
    <Card className="shadow-sm">
      <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><CalendarClock className="h-5 w-5"/>Asesorías programadas · Hoy</CardTitle></CardHeader>
      <CardContent>{error?<div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>:loading?<p className="text-sm text-muted-foreground">Cargando asesorías...</p>:lista(asesorias,"No hay asesorías programadas para hoy.")}</CardContent>
    </Card>
  </div>;
}
