"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, Clock3, RefreshCcw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

 type Entrevista = {
  id:string; fechaHora:string; lugar:string|null; tipoCita:string; cliente:string|null; grupoFamiliar:string|null;
  participantes:number; resultado:string|null; registradoAt:string|null; horasDesdeCita:number; estadoResultado:string;
};

const LABELS: Record<string,string> = { APROBADA:"Aprobada", NEGADA:"Negada", REPROGRAMADA:"Reprogramada", PENDIENTE:"Resultado pendiente", ATRASADO:"Resultado atrasado", PROXIMA:"Próxima" };

export function EntrevistasHoyCard(){
  const [entrevistas,setEntrevistas]=useState<Entrevista[]>([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState<string|null>(null);
  const [error,setError]=useState<string|null>(null);

  const cargar=useCallback(async()=>{
    setLoading(true);setError(null);
    try{const r=await fetch("/api/nexus/entrevistas-hoy",{cache:"no-store"});const j=await r.json();if(!r.ok)throw new Error(j.error??"No se pudieron cargar las entrevistas");setEntrevistas(j.entrevistas??[])}
    catch(e){setError(e instanceof Error?e.message:"No se pudieron cargar las entrevistas")}
    finally{setLoading(false)}
  },[]);
  useEffect(()=>{void cargar()},[cargar]);

  async function registrar(id:string,resultado:"APROBADA"|"NEGADA"|"REPROGRAMADA"){
    setSaving(id);setError(null);
    try{const r=await fetch(`/api/nexus/citas/${id}/resultado-consular`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({resultado})});const j=await r.json();if(!r.ok)throw new Error(j.error??"No se pudo guardar el resultado");await cargar()}
    catch(e){setError(e instanceof Error?e.message:"No se pudo guardar el resultado")}
    finally{setSaving(null)}
  }

  return <Card className="border-blue-200 shadow-sm">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between gap-3">
        <div><CardTitle className="flex items-center gap-2 text-base"><CalendarClock className="h-5 w-5"/>Entrevistas en Embajada · Hoy</CardTitle><p className="mt-1 text-xs text-muted-foreground">Registra el resultado máximo 6 horas después de cada entrevista.</p></div>
        <Button variant="outline" size="sm" onClick={()=>void cargar()} disabled={loading}><RefreshCcw className="mr-2 h-4 w-4"/>Actualizar</Button>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      {error&&<div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}
      {loading?<p className="text-sm text-muted-foreground">Cargando entrevistas...</p>:entrevistas.length===0?<div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">No hay entrevistas consulares registradas para hoy.</div>:entrevistas.map(e=>{
        const hora=new Date(e.fechaHora).toLocaleTimeString("es-BO",{hour:"2-digit",minute:"2-digit"});
        const nombre=e.grupoFamiliar??e.cliente??"Sin cliente";
        const atrasado=e.estadoResultado==="ATRASADO";
        const pendiente=e.estadoResultado==="PENDIENTE"||atrasado;
        return <div key={e.id} className={`rounded-lg border p-3 ${atrasado?"border-red-300 bg-red-50/60":""}`}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{hora}</span><span className="truncate font-medium">{nombre}</span>{e.grupoFamiliar&&<Badge variant="secondary">Grupo · {Math.max(e.participantes,1)} solicitantes</Badge>}<Badge variant={atrasado?"destructive":"outline"}>{LABELS[e.estadoResultado]??e.estadoResultado}</Badge></div><div className="mt-1 text-xs text-muted-foreground">{e.lugar??"Embajada Americana"}</div></div>
            <div className="flex flex-wrap gap-2">{pendiente&&<><Button size="sm" onClick={()=>void registrar(e.id,"APROBADA")} disabled={saving===e.id}><CheckCircle2 className="mr-1.5 h-4 w-4"/>Aprobada</Button><Button size="sm" variant="destructive" onClick={()=>void registrar(e.id,"NEGADA")} disabled={saving===e.id}><XCircle className="mr-1.5 h-4 w-4"/>Negada</Button><Button size="sm" variant="outline" onClick={()=>void registrar(e.id,"REPROGRAMADA")} disabled={saving===e.id}><Clock3 className="mr-1.5 h-4 w-4"/>Reprogramada</Button></>}{e.resultado&&<span className="inline-flex items-center gap-1 text-sm font-medium"><CheckCircle2 className="h-4 w-4"/>{LABELS[e.resultado]??e.resultado}</span>}{atrasado&&<AlertTriangle className="h-5 w-5 text-red-600"/>}</div>
          </div>
        </div>})}
    </CardContent>
  </Card>;
}
