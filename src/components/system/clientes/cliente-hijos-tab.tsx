"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { agregarHijoCliente, eliminarHijoCliente, obtenerHijosCliente, type HijoCliente } from "@/lib/actions/clientes/cliente-familia-china-actions";

export function ClienteHijosTab({ clienteId }: { clienteId: string }) {
  const [items, setItems] = useState<HijoCliente[]>([]);
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [ocupacion, setOcupacion] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  async function cargar() {
    setLoading(true);
    const result = await obtenerHijosCliente(clienteId);
    if (result.success) setItems(result.data);
    else toast.error(result.error);
    setLoading(false);
  }

  useEffect(() => { void cargar(); }, [clienteId]);

  function agregar() {
    startTransition(async () => {
      const result = await agregarHijoCliente(clienteId, { nombreCompleto, fechaNacimiento, ocupacion });
      if (!result.success) return toast.error(result.error);
      setNombreCompleto(""); setFechaNacimiento(""); setOcupacion("");
      toast.success("Hijo registrado");
      await cargar();
    });
  }

  function eliminar(id: string) {
    startTransition(async () => {
      const result = await eliminarHijoCliente(clienteId, id);
      if (!result.success) return toast.error(result.error);
      toast.success("Registro eliminado");
      await cargar();
    });
  }

  return <Card>
    <CardHeader>
      <CardTitle>Datos de los Hijos</CardTitle>
      <p className="text-sm text-muted-foreground">Información familiar del cliente. Para trámites donde no aplique, simplemente se deja sin llenar.</p>
    </CardHeader>
    <CardContent className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2"><Label>Nombre completo</Label><Input value={nombreCompleto} onChange={(e)=>setNombreCompleto(e.target.value)} placeholder="Nombre y apellidos" /></div>
        <div className="space-y-2"><Label>Fecha de nacimiento</Label><Input type="date" value={fechaNacimiento} onChange={(e)=>setFechaNacimiento(e.target.value)} /></div>
        <div className="space-y-2"><Label>¿A qué se dedica?</Label><Input value={ocupacion} onChange={(e)=>setOcupacion(e.target.value)} placeholder="Estudiante, profesión, ocupación..." /></div>
      </div>
      <Button type="button" onClick={agregar} disabled={pending || !nombreCompleto.trim()}><Plus className="mr-2 h-4 w-4" />Agregar hijo</Button>
      <div className="space-y-2">
        {loading ? <p className="text-sm text-muted-foreground">Cargando...</p> : items.length === 0 ? <p className="text-sm text-muted-foreground">No se registraron hijos.</p> : items.map((hijo, index)=><div key={hijo.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium">{index+1}. {hijo.nombreCompleto}</p><p className="text-sm text-muted-foreground">{hijo.fechaNacimiento || "Fecha no registrada"} · {hijo.ocupacion || "Ocupación no registrada"}</p></div><Button type="button" variant="ghost" size="icon" onClick={()=>eliminar(hijo.id)} disabled={pending}><Trash2 className="h-4 w-4" /></Button></div>)}
      </div>
    </CardContent>
  </Card>;
}
