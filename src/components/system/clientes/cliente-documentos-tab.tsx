"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, FileUp, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TIPOS = [
  ["PASAPORTE","Pasaporte"],
  ["CEDULA_IDENTIDAD","Cédula de identidad"],
  ["CONFIRMACION_CITA","Confirmación de cita"],
  ["FORMULARIO_LLENADO","Formulario llenado"],
  ["CONFIRMACION_FORMULARIO","Confirmación de formulario"],
] as const;

type Documento={id:string;tipo:string;nombreArchivo:string;mimeType:string;tamanoBytes:number;updatedAt:string;subidoPorNombre:string};

function tamano(bytes:number){if(bytes<1024)return `${bytes} B`;if(bytes<1024*1024)return `${(bytes/1024).toFixed(0)} KB`;return `${(bytes/1024/1024).toFixed(1)} MB`;}

export function ClienteDocumentosTab({clienteId}:{clienteId:string}){
  const[documentos,setDocumentos]=useState<Documento[]>([]),[loading,setLoading]=useState(true),[uploading,setUploading]=useState<string|null>(null),[error,setError]=useState<string|null>(null),[success,setSuccess]=useState<string|null>(null);
  async function cargar(){setLoading(true);setError(null);try{const r=await fetch(`/api/clientes/${clienteId}/documentos`,{cache:"no-store"});const j=await r.json();if(!r.ok)throw new Error(j.error??"No se pudieron cargar los documentos");setDocumentos(j.documentos??[])}catch(e){setError(e instanceof Error?e.message:"No se pudieron cargar los documentos")}finally{setLoading(false)}}
  useEffect(()=>{void cargar()},[clienteId]);
  const mapa=useMemo(()=>new Map(documentos.map(d=>[d.tipo,d])),[documentos]);
  async function subir(tipo:string,file:File|null){if(!file)return;setUploading(tipo);setError(null);setSuccess(null);try{const fd=new FormData();fd.append("tipo",tipo);fd.append("archivo",file);const r=await fetch(`/api/clientes/${clienteId}/documentos`,{method:"POST",body:fd});const j=await r.json();if(!r.ok)throw new Error(j.error??"No se pudo guardar el documento");setSuccess("Documento guardado correctamente");await cargar()}catch(e){setError(e instanceof Error?e.message:"No se pudo guardar el documento")}finally{setUploading(null)}}
  return <div className="space-y-4"><div className="flex items-center justify-between"><div><h3 className="text-lg font-semibold">Documentos esenciales</h3><p className="text-sm text-muted-foreground">Archivos de consulta rápida del cliente. Formatos: PDF, JPG o PNG · máximo 3 MB.</p></div><Button variant="outline" size="sm" onClick={()=>void cargar()} disabled={loading}><RefreshCcw className="mr-2 h-4 w-4"/>Actualizar</Button></div>{error&&<div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}{success&&<div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-700">{success}</div>}<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{TIPOS.map(([tipo,label])=>{const d=mapa.get(tipo);return <Card key={tipo} className={d?"border-emerald-200":""}><CardHeader className="pb-2"><CardTitle className="flex items-center justify-between gap-2 text-base"><span>{label}</span>{d?<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5"/>Cargado</span>:<span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">Pendiente</span>}</CardTitle></CardHeader><CardContent className="space-y-3">{d?<div className="text-xs text-muted-foreground"><div className="truncate font-medium text-foreground">{d.nombreArchivo}</div><div>{tamano(d.tamanoBytes)} · {new Date(d.updatedAt).toLocaleString("es-BO")}</div><div>Subido por: {d.subidoPorNombre}</div></div>:<p className="text-xs text-muted-foreground">Aún no se cargó este documento.</p>}<div className="flex flex-wrap gap-2">{d&&<Button asChild size="sm" variant="outline"><a href={`/api/clientes/${clienteId}/documentos/${tipo}`} target="_blank" rel="noreferrer"><Eye className="mr-2 h-4 w-4"/>Ver</a></Button>}<label className="inline-flex"><input type="file" className="hidden" accept="application/pdf,image/jpeg,image/png" disabled={uploading===tipo} onChange={e=>void subir(tipo,e.target.files?.[0]??null)}/><span className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"><FileUp className="mr-2 h-4 w-4"/>{uploading===tipo?"Subiendo...":d?"Reemplazar":"Subir"}</span></label></div></CardContent></Card>})}</div></div>;
}
