"use client";

import { FileUp, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Tipo="ITINERARIO_VUELO"|"RESERVA_HOSPEDAJE"|"SEGURO_VIAJE"|"CARTA_INVITACION"|"REGISTRO_EMPRESA_INVITANTE"|"CEDULA_REPRESENTANTE_LEGAL";
type Item={listo:boolean;origen:"PROPIO"|"GO_USA"|null};
type Data={checklist:Record<Tipo,Item>;respaldoSolicitado:boolean;esVisaM:boolean;requiereSeguro:boolean;edad:number|null;servicio:string;archivos:Array<{tipo:string;nombreArchivo:string}>};
const LABELS:Record<Tipo,string>={ITINERARIO_VUELO:"Itinerario de Vuelo",RESERVA_HOSPEDAJE:"Reserva de Hospedaje",SEGURO_VIAJE:"Seguro de Viaje",CARTA_INVITACION:"Carta de Invitación",REGISTRO_EMPRESA_INVITANTE:"Registro de Empresa Invitante",CEDULA_REPRESENTANTE_LEGAL:"Cédula de representante legal de empresa"};
const BASE:Tipo[]=["ITINERARIO_VUELO","RESERVA_HOSPEDAJE","SEGURO_VIAJE"];
const NEGOCIOS:Tipo[]=["CARTA_INVITACION","REGISTRO_EMPRESA_INVITANTE","CEDULA_REPRESENTANTE_LEGAL"];

export function ChinaDocumentosChecklist({tramiteId}:{tramiteId:string}){
 const[data,setData]=useState<Data|null>(null);const[loading,setLoading]=useState(true);const[saving,setSaving]=useState(false);const[uploading,setUploading]=useState<Tipo|null>(null);
 const cargar=useCallback(async()=>{setLoading(true);try{const r=await fetch(`/api/tramites/${tramiteId}/china/checklist`,{cache:"no-store"});const j=await r.json();if(!r.ok)throw new Error(j.error||"Error");setData(j);}catch(e){toast.error(e instanceof Error?e.message:"No se pudo cargar el checklist China");}finally{setLoading(false)}},[tramiteId]);
 useEffect(()=>{void cargar()},[cargar]);
 if(loading)return <div className="rounded-lg border bg-background p-3 text-sm text-muted-foreground">Cargando checklist de documentos China...</div>;
 if(!data)return null;
 const visible=[...BASE.filter(t=>t!=="SEGURO_VIAJE"||data.requiereSeguro),...(data.esVisaM?NEGOCIOS:[])];
 const setItem=(tipo:Tipo,patch:Partial<Item>)=>setData({...data,checklist:{...data.checklist,[tipo]:{...data.checklist[tipo],...patch}}});
 const guardar=async()=>{setSaving(true);try{const r=await fetch(`/api/tramites/${tramiteId}/china/checklist`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({checklist:data.checklist,respaldoSolicitado:data.respaldoSolicitado})});const j=await r.json();if(!r.ok)throw new Error(j.error||"Error");toast.success(j.documentosSubidos?"Checklist completo · documentos listos":"Checklist China actualizado");}catch(e){toast.error(e instanceof Error?e.message:"No se pudo guardar");}finally{setSaving(false)}};
 const subir=async(tipo:Tipo,file:File|null)=>{if(!file)return;setUploading(tipo);try{const f=new FormData();f.set("tipo",tipo);f.set("archivo",file);const r=await fetch(`/api/tramites/${tramiteId}/china/checklist`,{method:"POST",body:f});const j=await r.json();if(!r.ok)throw new Error(j.error||"Error");toast.success(`${LABELS[tipo]} cargado`);await cargar();}catch(e){toast.error(e instanceof Error?e.message:"No se pudo cargar el documento");}finally{setUploading(null)}};
 return <div className="rounded-lg border bg-background p-3 space-y-4">
   <div><p className="font-semibold text-sm">Checklist de Documentación · Visa China</p><p className="text-xs text-muted-foreground">Propio = lo facilita el cliente · Go USA = lo gestionamos nosotros.</p></div>
   {data.esVisaM&&<div className="rounded-md border px-3 py-2 text-xs"><b>Visa M / Negocios:</b> se habilitaron los documentos empresariales adicionales.</div>}
   {data.requiereSeguro&&<div className="rounded-md border px-3 py-2 text-xs"><b>Seguro de viaje requerido:</b> el solicitante tiene {data.edad} años.</div>}
   <div className="space-y-3">{visible.map(tipo=>{const item=data.checklist[tipo];const archivo=data.archivos.find(a=>a.tipo===tipo);const usaOrigen=BASE.includes(tipo);return <div key={tipo} className="rounded-md border p-3 space-y-2"><div className="flex flex-wrap items-center justify-between gap-2"><label className="flex items-center gap-2 text-sm font-medium"><Checkbox checked={item.listo} onCheckedChange={v=>setItem(tipo,{listo:v===true})}/>{LABELS[tipo]}</label>{usaOrigen&&<Select value={item.origen??""} onValueChange={v=>setItem(tipo,{origen:v as "PROPIO"|"GO_USA"})}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Origen"/></SelectTrigger><SelectContent><SelectItem value="PROPIO">Propio</SelectItem><SelectItem value="GO_USA">Go USA</SelectItem></SelectContent></Select>}</div><div className="flex flex-wrap items-center gap-2"><Input type="file" accept="application/pdf,image/jpeg,image/png" className="max-w-sm" disabled={uploading===tipo} onChange={e=>void subir(tipo,e.target.files?.[0]??null)}/>{archivo?<span className="text-xs text-muted-foreground">Archivo: {archivo.nombreArchivo}</span>:<span className="text-xs text-muted-foreground">Sin archivo cargado</span>}{uploading===tipo&&<FileUp className="h-4 w-4 animate-pulse"/>}</div></div>})}</div>
   <div className="rounded-md border p-3 space-y-2"><label className="flex items-start gap-2 text-sm"><Checkbox className="mt-0.5" checked={data.respaldoSolicitado} onCheckedChange={v=>setData({...data,respaldoSolicitado:v===true})}/><span><b>Solicitante notificado y documentos digitales solicitados.</b><br/><span className="text-xs text-muted-foreground">Informar que, para agilizar el proceso, podemos subir a plataforma respaldos como NIT, Certificado de Trabajo, Boletas de Pago, Extractos Bancarios y otros; solicitar copias digitales.</span></span></label></div>
   <Button type="button" size="sm" onClick={()=>void guardar()} disabled={saving}><Save className="mr-2 h-4 w-4"/>{saving?"Guardando...":"Guardar checklist"}</Button>
 </div>;
}
