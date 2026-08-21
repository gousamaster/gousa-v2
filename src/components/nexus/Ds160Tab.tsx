"use client";
import { useEffect,useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Estado="INICIADO"|"EN_PROCESO"|"PARA_CERRAR"|"CERRADO";
const labels:Record<Estado,string>={INICIADO:"Iniciado",EN_PROCESO:"En proceso",PARA_CERRAR:"Para cerrar",CERRADO:"Cerrado"};
const vacio={applicationId:"",respuestaSeguridad:"",estado:"INICIADO" as Estado,motivoViaje:"",lugarViaje:"",tiempoEstadia:"",contactoUsa:"",ocupacionDetalleEs:"",ocupacionDetalleEn:"",negacionAnteriorEs:"",negacionAnteriorEn:"",revisadoDirector:false,tieneRespuestaSeguridad:false};

export default function Ds160Tab({clienteId}:{clienteId:string}){
 const[f,setF]=useState(vacio);const[loading,setLoading]=useState(true);const[saving,setSaving]=useState(false);
 useEffect(()=>{fetch(`/api/nexus/cliente/${clienteId}/ds160`,{cache:"no-store"}).then(r=>r.json()).then(j=>{if(j.ds160)setF(v=>({...v,...j.ds160,respuestaSeguridad:""}))}).catch(()=>toast.error("No se pudo cargar DS-160")).finally(()=>setLoading(false))},[clienteId]);
 const set=(k:string,v:unknown)=>setF(x=>({...x,[k]:v}));
 async function guardar(){setSaving(true);try{const r=await fetch(`/api/nexus/cliente/${clienteId}/ds160`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)});const j=await r.json();if(!r.ok)throw new Error(j.error??"No se pudo guardar");toast.success("DS-160 actualizado");setF(x=>({...x,tieneRespuestaSeguridad:true,respuestaSeguridad:""}))}catch(e){toast.error(e instanceof Error?e.message:"No se pudo guardar")}finally{setSaving(false)}}
 if(loading)return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Cargando control DS-160…</div>;
 return <div className="space-y-5">
  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Control operativo DS-160</h3><p className="text-sm text-muted-foreground">Cada solicitante registra su propio Application ID, seguridad y etapa de llenado.</p></div><Badge>{labels[f.estado]}</Badge></div></div>
  <div className="grid gap-4 md:grid-cols-2">
   <label className="space-y-1 text-sm"><span className="font-medium">Código Application ID</span><Input value={f.applicationId??""} onChange={e=>set("applicationId",e.target.value.toUpperCase())} placeholder="AA00......"/></label>
   <label className="space-y-1 text-sm"><span className="font-medium">Respuesta de seguridad {f.tieneRespuestaSeguridad&&"(guardada)"}</span><Input type="password" value={f.respuestaSeguridad} onChange={e=>set("respuestaSeguridad",e.target.value)} placeholder={f.tieneRespuestaSeguridad?"Dejar vacío para conservar":"Obligatoria"}/></label>
  </div>
  <div><div className="mb-2 text-sm font-medium">Etapa del formulario</div><div className="flex flex-wrap gap-2">{(Object.keys(labels) as Estado[]).map(e=><Button key={e} type="button" size="sm" variant={f.estado===e?"default":"outline"} onClick={()=>set("estado",e)}>{labels[e]}</Button>)}</div></div>
  <div className="rounded-xl border p-4"><h4 className="mb-3 font-semibold">Mesa de cierre</h4><div className="grid gap-3 md:grid-cols-2">
   <label className="space-y-1 text-sm"><span>Motivo de viaje</span><Textarea value={f.motivoViaje??""} onChange={e=>set("motivoViaje",e.target.value)}/></label>
   <label className="space-y-1 text-sm"><span>Lugar de viaje</span><Textarea value={f.lugarViaje??""} onChange={e=>set("lugarViaje",e.target.value)}/></label>
   <label className="space-y-1 text-sm"><span>Tiempo de estadía</span><Input value={f.tiempoEstadia??""} onChange={e=>set("tiempoEstadia",e.target.value)}/></label>
   <label className="space-y-1 text-sm"><span>Contacto en USA</span><Textarea value={f.contactoUsa??""} onChange={e=>set("contactoUsa",e.target.value)}/></label>
  </div></div>
  <div className="grid gap-4 md:grid-cols-2">
   <div className="space-y-2 rounded-xl border p-4"><h4 className="font-semibold">Ocupación / trabajo</h4><Textarea placeholder="Texto original en español" value={f.ocupacionDetalleEs??""} onChange={e=>set("ocupacionDetalleEs",e.target.value)}/><Textarea placeholder="English version" value={f.ocupacionDetalleEn??""} onChange={e=>set("ocupacionDetalleEn",e.target.value)}/></div>
   <div className="space-y-2 rounded-xl border p-4"><h4 className="font-semibold">Negación anterior</h4><Textarea placeholder="Texto original en español" value={f.negacionAnteriorEs??""} onChange={e=>set("negacionAnteriorEs",e.target.value)}/><Textarea placeholder="English version" value={f.negacionAnteriorEn??""} onChange={e=>set("negacionAnteriorEn",e.target.value)}/></div>
  </div>
  <label className="flex items-center gap-2 rounded-lg border p-3 text-sm"><input type="checkbox" checked={f.revisadoDirector} onChange={e=>set("revisadoDirector",e.target.checked)}/><span><strong>Revisión Director completada</strong> — confirma revisión de viaje, estadía, contacto USA y ocupación.</span></label>
  <div className="flex justify-end"><Button onClick={()=>void guardar()} disabled={saving}>{saving?"Guardando…":"Guardar control DS-160"}</Button></div>
 </div>;
}
