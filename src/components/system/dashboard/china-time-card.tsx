"use client";

import { AlertTriangle, Building2, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { obtenerChinaDashboardTime, type ChinaTimeItem } from "@/lib/actions/china/china-actions";

export function ChinaTimeCard(){
  const [items,setItems]=useState<ChinaTimeItem[]>([]);const[loading,setLoading]=useState(true);
  const cargar=async()=>{setLoading(true);const r=await obtenerChinaDashboardTime();if(r.success&&r.data)setItems(r.data);setLoading(false)};
  useEffect(()=>{void cargar()},[]);
  const notificados=items.filter(i=>i.estado==="NOTIFICADO");
  const recojos=items.filter(i=>i.estado!=="NOTIFICADO");
  return <Card className="border-red-200">
    <CardHeader className="pb-3"><div className="flex items-center justify-between"><div><CardTitle className="text-base flex items-center gap-2"><Building2 className="h-5 w-5"/>Visa China · Operación</CardTitle><p className="text-xs text-muted-foreground mt-1">Notificados para presentarse y pasaportes pendientes de recojo.</p></div><Button size="sm" variant="ghost" onClick={()=>void cargar()} disabled={loading}>{loading?<Loader2 className="h-4 w-4 animate-spin"/>:<RefreshCw className="h-4 w-4"/>}</Button></div></CardHeader>
    <CardContent className="space-y-4">{loading&&items.length===0?<p className="text-sm text-muted-foreground">Cargando...</p>:<><div><div className="flex items-center justify-between mb-2"><p className="text-sm font-semibold">Clientes notificados para presentarse</p><Badge variant="secondary">{notificados.length}</Badge></div>{notificados.length===0?<p className="text-xs text-muted-foreground">Sin clientes pendientes de presentación.</p>:<div className="space-y-2">{notificados.map(i=><Item key={i.tramiteId} item={i}/>)}</div>}</div><div className="border-t pt-4"><div className="flex items-center justify-between mb-2"><p className="text-sm font-semibold">Pasaportes por recoger</p><Badge variant="secondary">{recojos.length}</Badge></div>{recojos.length===0?<p className="text-xs text-muted-foreground">Sin pasaportes pendientes de recojo.</p>:<div className="space-y-2">{recojos.map(i=><Item key={i.tramiteId} item={i}/>)}</div>}</div></>}</CardContent>
  </Card>
}

function Item({item}:{item:ChinaTimeItem}){const vencido=item.estado==="RECOJO_VENCIDO";return <div className="rounded-lg border p-3 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2"><div><p className="font-medium">{item.cliente}</p><p className="text-xs text-muted-foreground">{item.servicio} · {item.sede==="LA_PAZ"?"La Paz":item.sede==="SANTA_CRUZ"?"Santa Cruz":"Sede pendiente"}</p></div><div className="flex items-center gap-2">{item.estado==="NOTIFICADO"?<Badge>Notificado</Badge>:<Badge variant={vencido?"destructive":"secondary"}>{vencido&&<AlertTriangle className="mr-1 h-3 w-3"/>}{vencido?"Recojo vencido":`Recojo ${item.fechaRecojo??"pendiente"}`}</Badge>}</div></div>}
