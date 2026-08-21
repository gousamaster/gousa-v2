"use client";

import { useEffect,useMemo,useState } from "react";
import { CheckCircle2,Plus,Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";

type Documento={nombre:string;presente:boolean;extra?:boolean};
type Usuario={id:string;name:string};
type Registro={perfil:string|null;documentos:Documento[]|null;observaciones:string|null;realizado:boolean;realizadoAt:string|null;atendidoPorId:string|null;atendidoPor:string|null};

export function SimulacroOperativoPanel({citaId,onSaved}:{citaId:string;onSaved?:()=>void}){
 const[perfil,setPerfil]=useState("DEPENDIENTE"),[documentos,setDocumentos]=useState<Documento[]>([]),[plantillas,setPlantillas]=useState<Record<string,string[]>>({}),[usuarios,setUsuarios]=useState<Usuario[]>([]),[observaciones,setObservaciones]=useState(""),[atendidoPorId,setAtendidoPorId]=useState(""),[realizado,setRealizado]=useState(false),[extra,setExtra]=useState(""),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[msg,setMsg]=useState<string|null>(null),[error,setError]=useState<string|null>(null);
 useEffect(()=>{void(async()=>{setLoading(true);try{const r=await fetch(`/api/nexus/citas/${citaId}/simulacro-operativo`,{cache:"no-store"});const j=await r.json();if(!r.ok)throw new Error(j.error??"No se pudo cargar el simulacro");setPlantillas(j.plantillas??{});setUsuarios(j.usuarios??[]);const reg=j.registro as Registro|null;if(reg){setPerfil(reg.perfil??"DEPENDIENTE");setDocumentos(reg.documentos??[]);setObservaciones(reg.observaciones??"");setAtendidoPorId(reg.atendidoPorId??"");setRealizado(Boolean(reg.realizado));}else{setDocumentos((j.plantillas?.DEPENDIENTE??[]).map((nombre:string)=>({nombre,presente:false})));}}catch(e){setError(e instanceof Error?e.message:"Error al cargar")}finally{setLoading(false)}})()},[citaId]);
 const presentes=useMemo(()=>documentos.filter(d=>d.presente).length,[documentos]);
 function cambiarPerfil(v:string){setPerfil(v);const actual=new Map(documentos.map(d=>[d.nombre,d]));setDocumentos((plantillas[v]??[]).map(nombre=>actual.get(nombre)??{nombre,presente:false}).concat(documentos.filter(d=>d.extra)));}
 function agregarExtra(){const nombre=extra.trim();if(!nombre||documentos.some(d=>d.nombre.toLowerCase()===nombre.toLowerCase()))return;setDocumentos(d=>[...d,{nombre,presente:false,extra:true}]);setExtra("");}
 async function guardar(cerrar=false){setSaving(true);setMsg(null);setError(null);try{const nuevoRealizado=cerrar?true:realizado;const r=await fetch(`/api/nexus/citas/${citaId}/simulacro-operativo`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({perfil,documentos,observaciones,atendidoPorId:atendidoPorId||null,realizado:nuevoRealizado})});const j=await r.json();if(!r.ok)throw new Error(j.error??"No se pudo guardar");setRealizado(nuevoRealizado);setMsg(cerrar?"Simulacro cerrado como REALIZADO.":"Checklist guardado.");onSaved?.()}catch(e){setError(e instanceof Error?e.message:"No se pudo guardar")}finally{setSaving(false)}}
 if(loading)return <div className="mt-3 rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground">Cargando checklist...</div>;
 return <div className="mt-3 space-y-4 rounded-xl border bg-muted/20 p-4">
  <div className="flex flex-wrap items-center justify-between gap-2"><div><div className="font-semibold">Checklist de soporte del simulacro</div><div className="text-xs text-muted-foreground">Marca únicamente lo que el cliente llevó. No es obligatorio completar todo.</div></div><div className="flex gap-2"><Badge variant="secondary">{presentes}/{documentos.length} presentes</Badge>{realizado&&<Badge className="bg-emerald-600"><CheckCircle2 className="mr-1 h-3 w-3"/>Realizado</Badge>}</div></div>
  {error&&<div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}{msg&&<div className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-700">{msg}</div>}
  <div className="grid gap-3 md:grid-cols-2"><div><Label>Perfil</Label><Select value={perfil} onValueChange={cambiarPerfil} disabled={realizado}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="DEPENDIENTE">Dependiente</SelectItem><SelectItem value="INDEPENDIENTE">Independiente</SelectItem></SelectContent></Select></div><div><Label>Atendido por</Label><Select value={atendidoPorId||undefined} onValueChange={setAtendidoPorId} disabled={realizado}><SelectTrigger><SelectValue placeholder="Seleccionar usuario"/></SelectTrigger><SelectContent>{usuarios.map(u=><SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent></Select></div></div>
  <div className="grid gap-2 md:grid-cols-2">{documentos.map((d,idx)=><label key={`${d.nombre}-${idx}`} className="flex cursor-pointer items-start gap-2 rounded-md border bg-background p-2 text-sm"><Checkbox checked={d.presente} disabled={realizado} onCheckedChange={v=>setDocumentos(actual=>actual.map((x,i)=>i===idx?{...x,presente:v===true}:x))}/><span>{d.nombre}{d.extra&&<span className="ml-1 text-xs text-muted-foreground">(extra)</span>}</span></label>)}</div>
  {!realizado&&<div className="flex gap-2"><Input value={extra} onChange={e=>setExtra(e.target.value)} placeholder="Agregar documento extraordinario" onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();agregarExtra()}}}/><Button type="button" variant="outline" onClick={agregarExtra}><Plus className="mr-1 h-4 w-4"/>Agregar</Button></div>}
  <div><Label>Observaciones</Label><textarea className="mt-1 min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm" value={observaciones} disabled={realizado} onChange={e=>setObservaciones(e.target.value)} placeholder="Ej. faltó respaldo bancario, reforzar motivo de viaje..."/></div>
  {!realizado&&<div className="flex flex-wrap gap-2"><Button variant="outline" onClick={()=>void guardar(false)} disabled={saving}><Save className="mr-1.5 h-4 w-4"/>Guardar avance</Button><Button onClick={()=>void guardar(true)} disabled={saving||!atendidoPorId}><CheckCircle2 className="mr-1.5 h-4 w-4"/>Marcar simulacro realizado</Button></div>}
 </div>;
}
