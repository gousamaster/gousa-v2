"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { agregarVisaChinaAnterior, eliminarVisaChinaAnterior, obtenerVisasChinaAnteriores, type VisaChinaAnterior } from "@/lib/actions/clientes/cliente-familia-china-actions";

export function ClienteVisasChinaPrevias({ clienteId }: { clienteId: string }) {
  const [items, setItems] = useState<VisaChinaAnterior[]>([]);
  const [numeroVisa, setNumeroVisa] = useState("");
  const [tipoVisa, setTipoVisa] = useState("");
  const [fechaEmision, setFechaEmision] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  async function cargar() {
    setLoading(true);
    const result = await obtenerVisasChinaAnteriores(clienteId);
    if (result.success) setItems(result.data); else toast.error(result.error);
    setLoading(false);
  }
  useEffect(()=>{ void cargar(); }, [clienteId]);

  function agregar() {
    startTransition(async()=>{
      const result = await agregarVisaChinaAnterior(clienteId,{ numeroVisa, tipoVisa, fechaEmision, fechaVencimiento });
      if (!result.success) return toast.error(result.error);
      setNumeroVisa(""); setTipoVisa(""); setFechaEmision(""); setFechaVencimiento("");
      toast.success("Visa China anterior registrada");
      await cargar();
    });
  }

  function eliminar(id:string) {
    startTransition(async()=>{
      const result=await eliminarVisaChinaAnterior(clienteId,id);
      if(!result.success)return toast.error(result.error);
      toast.success("Antecedente eliminado");
      await cargar();
    });
  }

  return <Card>
    <CardHeader>
      <CardTitle>Antecedentes de Visa China</CardTitle>
      <p className="text-sm text-muted-foreground">Registra visas chinas anteriores del cliente. Puede existir más de una.</p>
    </CardHeader>
    <CardContent className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2"><Label>Número de visa</Label><Input value={numeroVisa} onChange={(e)=>setNumeroVisa(e.target.value)} /></div>
        <div className="space-y-2"><Label>Tipo</Label><Input value={tipoVisa} onChange={(e)=>setTipoVisa(e.target.value)} placeholder="L, M, etc." /></div>
        <div className="space-y-2"><Label>Fecha de emisión</Label><Input type="date" value={fechaEmision} onChange={(e)=>setFechaEmision(e.target.value)} /></div>
        <div className="space-y-2"><Label>Fecha de vencimiento</Label><Input type="date" value={fechaVencimiento} onChange={(e)=>setFechaVencimiento(e.target.value)} /></div>
      </div>
      <Button type="button" onClick={agregar} disabled={pending}><Plus className="mr-2 h-4 w-4" />Agregar visa anterior</Button>
      <div className="space-y-2">
        {loading?<p className="text-sm text-muted-foreground">Cargando...</p>:items.length===0?<p className="text-sm text-muted-foreground">Sin visas China anteriores registradas.</p>:items.map((visa,index)=><div key={visa.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{index+1}. {visa.tipoVisa || "Tipo no registrado"} {visa.numeroVisa ? `· ${visa.numeroVisa}` : ""}</p><p className="text-sm text-muted-foreground">Emisión: {visa.fechaEmision || "—"} · Vencimiento: {visa.fechaVencimiento || "—"}</p></div><Button type="button" variant="ghost" size="icon" onClick={()=>eliminar(visa.id)} disabled={pending}><Trash2 className="h-4 w-4" /></Button></div>)}
      </div>
    </CardContent>
  </Card>;
}
