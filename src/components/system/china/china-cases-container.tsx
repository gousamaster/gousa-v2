"use client";

import { Building2, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChinaOperativoCard } from "@/components/system/tramites/china-operativo-card";
import { obtenerCasosVisaChina, type ChinaCaseItem } from "@/lib/actions/china/china-list-actions";

export function ChinaCasesContainer(){
  const [items,setItems]=useState<ChinaCaseItem[]>([]);
  const [loading,setLoading]=useState(true);
  const [open,setOpen]=useState<string|null>(null);
  useEffect(()=>{void (async()=>{const r=await obtenerCasosVisaChina();if(r.success&&r.data)setItems(r.data);setLoading(false)})()},[]);
  return <section className="px-8 py-6 space-y-5">
    <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 via-background to-background p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white"><Building2 className="h-6 w-6"/></div><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-bold">NEXUS · Visa China</h1><Badge variant="secondary">Flujo independiente</Badge></div><p className="text-sm text-muted-foreground mt-1">Misma base de clientes de NEXUS, con proceso consular China separado del flujo USA.</p></div></div>
    </div>
    <Card><CardHeader><CardTitle className="text-base">Casos Visa China</CardTitle></CardHeader><CardContent className="space-y-3">{loading?<p className="text-sm text-muted-foreground">Cargando casos...</p>:items.length===0?<div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">Todavía no hay trámites activos de Visa China. Cuando contrates un servicio que contenga “Visa China” y se inicie el trámite, aparecerá aquí automáticamente.</div>:items.map(item=><div key={item.tramiteId} className="rounded-lg border p-3 space-y-3"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="font-semibold">{item.cliente}</p><p className="text-xs text-muted-foreground">{item.servicio} · {item.region}</p></div><Button size="sm" variant="outline" onClick={()=>setOpen(open===item.tramiteId?null:item.tramiteId)}>{open===item.tramiteId?<>Ocultar <ChevronUp className="ml-1 h-4 w-4"/></>:<>Gestionar <ChevronDown className="ml-1 h-4 w-4"/></>}</Button></div>{open===item.tramiteId&&<ChinaOperativoCard tramiteId={item.tramiteId}/>}</div>)}</CardContent></Card>
  </section>
}
