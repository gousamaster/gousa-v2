"use client";

import { ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ETAPAS_CHINA, guardarChinaOperativo, obtenerChinaOperativo, type ChinaOperativo, type EtapaChina, type SedeChina } from "@/lib/actions/china/china-actions";

const LABELS: Record<EtapaChina,string> = {
  RECOLECCION_DOCUMENTOS:"Recolección de documentos",
  EVALUACION:"Evaluación de Perfil",
  TOMA_DATOS:"Toma de Datos",
  LLENADO_FORMULARIO:"Llenado de Formulario",
  SUBIR_DOCUMENTOS:"Subida de Documentos",
  PRESENTACION_EMBAJADA:"Presentación en Embajada",
  RECOJO_DOCUMENTO:"Recojo de documentos",
  FINALIZADO:"Finalizado",
};

export function ChinaOperativoCard({tramiteId}:{tramiteId:string}){
  const [data,setData]=useState<ChinaOperativo|null>(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  useEffect(()=>{void (async()=>{setLoading(true);const r=await obtenerChinaOperativo(tramiteId);if(r.success&&r.data)setData(r.data);else toast.error(r.error);setLoading(false)})()},[tramiteId]);
  if(loading)return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Cargando flujo Visa China...</div>;
  if(!data)return <div className="rounded-lg border p-4 text-sm text-red-600">No se pudo cargar el flujo Visa China.</div>;
  const set=<K extends keyof ChinaOperativo>(k:K,v:ChinaOperativo[K])=>setData({...data,[k]:v});
  const save=async()=>{setSaving(true);const r=await guardarChinaOperativo(data);setSaving(false);r.success?toast.success("Flujo Visa China actualizado"):toast.error(r.error)};
  return <div className="rounded-xl border border-red-200 bg-red-50/40 p-4 space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="font-bold">Visa China · Operación</p><p className="text-xs text-muted-foreground">Flujo independiente de USA. No utiliza DS-160, arancel ni cita consular americana.</p></div>
      <Button asChild size="sm" variant="outline"><a href="https://consular.mfa.gov.cn/LOGIN/login?redirect=%2FVISA%2F" target="_blank" rel="noreferrer">Abrir formulario China <ExternalLink className="ml-2 h-4 w-4"/></a></Button>
    </div>
    <div className="rounded-lg border bg-background/80 p-3 space-y-2"><Label>Etapa actual Visa China</Label><Select value={data.etapa} onValueChange={v=>set("etapa",v as EtapaChina)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{ETAPAS_CHINA.map(e=><SelectItem key={e} value={e}>{LABELS[e]}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">Este estado pertenece únicamente al proceso China y no modifica las etapas de Visa USA.</p></div>
    <div className="space-y-3"><div className="flex items-center justify-between"><Label>Hijos (si aplica)</Label><Button type="button" size="sm" variant="outline" onClick={()=>set("hijos",[...data.hijos,""])}><Plus className="mr-1 h-4 w-4"/>Agregar hijo</Button></div>{data.hijos.length===0?<p className="text-xs text-muted-foreground">Sin hijos registrados.</p>:data.hijos.map((h,i)=><div key={i} className="flex gap-2"><Input value={h} onChange={e=>{const hs=[...data.hijos];hs[i]=e.target.value;set("hijos",hs)}} placeholder="Nombre y apellidos del hijo"/><Button type="button" variant="ghost" size="icon" onClick={()=>set("hijos",data.hijos.filter((_,x)=>x!==i))}><Trash2 className="h-4 w-4"/></Button></div>)}</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><label className="flex items-center gap-2 text-sm"><Checkbox checked={data.formularioIniciado} onCheckedChange={v=>set("formularioIniciado",v===true)}/>Formulario iniciado/completado</label><label className="flex items-center gap-2 text-sm"><Checkbox checked={data.documentosSubidos} onCheckedChange={v=>set("documentosSubidos",v===true)}/>Documentos subidos</label></div>
    <div className="rounded-lg border bg-background p-3 space-y-3"><p className="font-semibold text-sm">Presentación en Embajada</p><p className="text-xs text-muted-foreground">Presentación habilitada lunes, miércoles o jueves de 09:00 a 12:00, según corresponda.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><Label>Sede</Label><Select value={data.sedeEmbajada??""} onValueChange={v=>set("sedeEmbajada",v as SedeChina)}><SelectTrigger><SelectValue placeholder="Seleccionar sede"/></SelectTrigger><SelectContent><SelectItem value="LA_PAZ">La Paz</SelectItem><SelectItem value="SANTA_CRUZ">Santa Cruz</SelectItem></SelectContent></Select></div><div><Label>Fecha real de presentación</Label><Input type="date" value={data.fechaPresentacion??""} onChange={e=>set("fechaPresentacion",e.target.value||null)}/></div></div><label className="flex items-center gap-2 text-sm"><Checkbox checked={data.clienteNotificado} onCheckedChange={v=>set("clienteNotificado",v===true)}/>Cliente notificado para presentarse</label></div>
    <div className="rounded-lg border bg-background p-3 space-y-3"><p className="font-semibold text-sm">Guía y recojo de pasaporte</p><label className="flex items-center gap-2 text-sm"><Checkbox checked={data.guiaRecojoRecibida} onCheckedChange={v=>set("guiaRecojoRecibida",v===true)}/>Guía/papel de recojo recibido</label><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><Label>Referencia de guía (opcional)</Label><Input value={data.guiaRecojoReferencia??""} onChange={e=>set("guiaRecojoReferencia",e.target.value||null)} /></div><div><Label>Fecha indicada para recojo</Label><Input type="date" value={data.fechaRecojo??""} onChange={e=>set("fechaRecojo",e.target.value||null)}/></div></div><div><Label>Enlace/foto/PDF de guía (opcional)</Label><Input value={data.guiaRecojoUrl??""} onChange={e=>set("guiaRecojoUrl",e.target.value||null)} placeholder="URL del documento si fue cargado"/></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label className="flex items-center gap-2 text-sm mt-5"><Checkbox checked={data.pasaporteRecogido} onCheckedChange={v=>set("pasaporteRecogido",v===true)}/>Pasaporte recogido</label><div><Label>Fecha de recojo efectivo</Label><Input type="date" value={data.fechaPasaporteRecogido??""} onChange={e=>set("fechaPasaporteRecogido",e.target.value||null)}/></div></div></div>
    <div><Label>Observaciones China</Label><Textarea rows={3} value={data.observaciones??""} onChange={e=>set("observaciones",e.target.value||null)}/></div>
    <Button type="button" onClick={()=>void save()} disabled={saving}><Save className="mr-2 h-4 w-4"/>{saving?"Guardando...":"Guardar flujo China"}</Button>
  </div>
}
