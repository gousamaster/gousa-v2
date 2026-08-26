"use client";

import { useCallback, useEffect, useState } from "react";
import { Gift, MessageCircle, Phone, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { obtenerCumpleanosHoy, type CumpleanosHoy } from "@/lib/actions/dashboard/cumpleanos-actions";

function whatsappUrl(telefono:string){
  const limpio=telefono.replace(/\D/g,"");
  const numero=limpio.startsWith("591")?limpio:`591${limpio}`;
  return `https://wa.me/${numero}`;
}

export function CumpleanosTimeCard(){
  const [cumpleanos,setCumpleanos]=useState<CumpleanosHoy[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);

  const cargar=useCallback(async()=>{
    setLoading(true);
    try{
      const r=await obtenerCumpleanosHoy();
      if(!r.success) throw new Error(r.error??"No se pudieron cargar los cumpleaños");
      setCumpleanos(r.data??[]);
      setError(null);
    }catch(e){
      setError(e instanceof Error?e.message:"No se pudieron cargar los cumpleaños");
    }finally{
      setLoading(false);
    }
  },[]);

  useEffect(()=>{void cargar()},[cargar]);

  return <Card className="border-violet-200 shadow-sm">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base"><Gift className="h-5 w-5"/>Cumpleañeros · Hoy</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Recordatorio de fidelización: nombre y teléfono listos para felicitar al cliente.</p>
        </div>
        <Button variant="outline" size="sm" onClick={()=>void cargar()} disabled={loading}><RefreshCcw className="mr-2 h-4 w-4"/>Actualizar</Button>
      </div>
    </CardHeader>
    <CardContent>
      {error&&<div className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}
      {loading&&cumpleanos.length===0?<p className="text-sm text-muted-foreground">Cargando cumpleaños...</p>:cumpleanos.length===0?<div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">No hay cumpleaños registrados para hoy.</div>:<div className="space-y-2">{cumpleanos.map(c=><div key={c.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-medium">{c.nombreCompleto}</div><div className="text-xs text-muted-foreground">Cumple {c.edad} años</div>{c.telefono?<div className="mt-1 flex items-center gap-1 text-sm font-medium"><Phone className="h-3.5 w-3.5"/>{c.telefono}</div>:<div className="mt-1 text-xs text-amber-700">Sin teléfono registrado</div>}</div><div className="flex items-center gap-2">{c.telefono&&<Button asChild size="sm" variant="outline"><a href={whatsappUrl(c.telefono)} target="_blank" rel="noreferrer"><MessageCircle className="mr-1.5 h-4 w-4"/>WhatsApp</a></Button>}<div className="text-xs text-muted-foreground">Cliente activo · Fidelización</div></div></div>)}</div>}
    </CardContent>
  </Card>;
}
