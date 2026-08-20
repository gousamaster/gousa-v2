"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, RefreshCcw, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

type ItemAgenda={id:string;fechaHora:string;lugar:string|null;tipoCita:string;cliente:string|null;grupoFamiliar:string|null;participantes:number;instruccionEnviada?:boolean;instruccionEnviadaAt?:string|null;instruccionEnviadaPor?:string|null};

async function leerJsonSeguro(r:Response){
 const text=await r.text();
 if(!text)return {} as {error?:string;[key:string]:unknown};
 try{return JSON.parse(text) as {error?:string;[key:string]:unknown}}
 catch{return {error:r.ok?"Respuesta inesperada del servidor":"El servidor no pudo procesar la solicitud"}}
}

export function AgendaHoyCard(){
 const[simulacros,setSimulacros]=useState<ItemAgenda[]>([]),[asesorias,setAsesorias]=useState<ItemAgenda[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null),[guardando,setGuardando]=useState<string|null>(null);
 const cargar=useCallback(async()=>{setLoading(true);try{const r=await fetch("/api/nexus/agenda-hoy",{cache:"no-store"});const j=await leerJsonSeguro(r);if(!r.ok)throw new Error(j.error??"No se pudo cargar la agenda de hoy");setSimulacros((j.simulacros as ItemAgenda[]|undefined)??[]);setAsesorias((j.asesorias as ItemAgenda[]|undefined)??[]);setError(null)}catch(e){setError(e instanceof Error?e.message:"No se pudo cargar la agenda de hoy")}finally{setLoading(false)}},[]);
 useEffect(()=>{void cargar()},[cargar]);
 async function marcarInstruccion(id:string,enviada:boolean){setGuardando(id);setError(null);try{const r=await fetch(`/api/nexus/citas/${id}/instruccion-simulacro`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({enviada})});const j=await leerJsonSeguro(r);if(!r.ok)throw new Error(j.error??"No se pudo actualizar la instrucción");setSimulacros(actuales=>actuales.map(i=>i.id===id?{...i,instruccionEnviada:enviada}:i))}catch(e){setError(e instanceof Error?e.message:"No se pudo actualizar la instrucción")}finally{setGuardando(null)}}
 const lista=(items:ItemAgenda[],vacio:string,esSimulacro=false)=>items.length===0?<div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">{vacio}</div>:<div className="space-y-2">{items.map(i=>{const hora=new Date(i.fechaHora).toLocaleTimeString("es-BO",{timeZone:"America/La_Paz",hour:"2-digit",minute:"2-digit",hour12:false});const nombre=i.grupoFamiliar??i.cliente??"Sin cliente";return <div key={i.id} className="rounded-lg border p-3"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{hora}</span><span className="truncate font-medium">{nombre}</span>{i.grupoFamiliar&&<Badge variant="secondary"><Users className="mr-1 h-3 w-3"/>{Math.max(i.participantes,1)} personas</Badge>}{esSimulacro&&i.instruccionEnviada&&<Badge className="bg-emerald-600"><CheckCircle2 className="mr-1 h-3 w-3"/>Instrucción enviada</Badge>}</div><div className="mt-1 text-xs text-muted-foreground">{i.tipoCita}{i.lugar?` · ${i.lugar}`:""}</div></div></div>{esSimulacro&&<label className="mt-3 flex cursor-pointer items-center gap-2 border-t pt-3 text-sm"><Checkbox checked={Boolean(i.instruccionEnviada)} disabled={guardando===i.id} onCheckedChange={v=>void marcarInstruccion(i.id,v===true)}/><span>Mandar instrucción para simulacro a cliente</span>{guardando===i.id&&<span className="text-xs text-muted-foreground">Guardando...</span>}</label>}</div>})}</div>;
 return <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><Card className="shadow-sm"><CardHeader className="pb-3"><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2 text-base"><CalendarClock className="h-5 w-5"/>Simulacros · Hoy</CardTitle><Button variant="outline" size="sm" onClick={()=>void cargar()} disabled={loading}><RefreshCcw className="mr-2 h-4 w-4"/>Actualizar</Button></div></CardHeader><CardContent>{error&&<div className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}{loading&&simulacros.length===0?<p className="text-sm text-muted-foreground">Cargando simulacros...</p>:lista(simulacros,"No hay simulacros programados para hoy.",true)}</CardContent></Card><Card className="shadow-sm"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><CalendarClock className="h-5 w-5"/>Asesorías programadas · Hoy</CardTitle></CardHeader><CardContent>{loading&&asesorias.length===0?<p className="text-sm text-muted-foreground">Cargando asesorías...</p>:lista(asesorias,"No hay asesorías programadas para hoy.")}</CardContent></Card></div>;
}
