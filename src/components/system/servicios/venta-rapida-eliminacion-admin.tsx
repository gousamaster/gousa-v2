"use client";

import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { eliminarVentaRapidaNexus, obtenerPermisoEliminacionNexus } from "@/lib/actions/servicios/eliminacion-control-actions";
import { obtenerVentasRapidas, type VentaRapidaNexus } from "@/lib/actions/servicios/venta-rapida-actions";
import { toast } from "sonner";

export function VentaRapidaEliminacionAdmin() {
  const [permitido, setPermitido] = useState(false);
  const [items, setItems] = useState<VentaRapidaNexus[]>([]);
  const [loading, setLoading] = useState(true);
  const [eliminando, setEliminando] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const permiso = await obtenerPermisoEliminacionNexus();
      if (!permiso.success || !permiso.data?.puedeEliminar) {
        setLoading(false);
        return;
      }
      setPermitido(true);
      const ventas = await obtenerVentasRapidas();
      if (ventas.success && ventas.data) setItems(ventas.data.items);
      setLoading(false);
    })();
  }, []);

  if (loading) return null;
  if (!permitido) return null;

  async function eliminar(item: VentaRapidaNexus) {
    if (!window.confirm(`¿Eliminar la venta de ${item.nombrePersona} · ${item.servicioNombre}?`)) return;
    const motivo = window.prompt("Motivo de eliminación (opcional):", "Registro de prueba / error operativo") ?? undefined;
    setEliminando(item.id);
    const r = await eliminarVentaRapidaNexus(item.id, motivo);
    setEliminando(null);
    if (!r.success) return toast.error(r.error);
    toast.success("Venta eliminada. Se conservó registro de auditoría.");
    window.location.reload();
  }

  return (
    <Card className="border-red-100">
      <CardHeader>
        <CardTitle className="text-base">Control gerencial · eliminar ventas erróneas</CardTitle>
        <p className="text-sm text-muted-foreground">Visible únicamente para Manager y Super Admin. Úsalo para pruebas o registros creados por error.</p>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? <p className="text-sm text-muted-foreground">No hay ventas registradas.</p> : <div className="space-y-2">
          {items.slice(0, 50).map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm">
              <div>
                <div className="flex flex-wrap items-center gap-2"><span className="font-medium">{item.nombrePersona} · {item.servicioNombre}</span><Badge variant="outline">{item.estadoPago}</Badge></div>
                <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("es-BO")} · {item.montoServicio.toLocaleString("es-BO")} Bs.</p>
              </div>
              <Button size="sm" variant="destructive" disabled={eliminando === item.id} onClick={() => void eliminar(item)}>
                {eliminando === item.id ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin"/> : <Trash2 className="mr-1.5 h-4 w-4"/>}Eliminar
              </Button>
            </div>
          ))}
        </div>}
      </CardContent>
    </Card>
  );
}
