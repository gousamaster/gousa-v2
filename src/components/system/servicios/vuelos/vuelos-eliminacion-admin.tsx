"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Orden = {
  id: string;
  numeroOrden: string;
  personaNombre: string;
  origen: string;
  destino: string;
  estado: "PENDIENTE" | "DESPACHADA" | "EMITIDA";
  createdAt: string;
};

export function VuelosEliminacionAdmin() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/servicios/vuelos", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "No se pudieron cargar las cotizaciones");
      setCanManage(j.canManageSales === true);
      setOrdenes((j.ordenes ?? []).filter((o: Orden) => o.estado !== "EMITIDA"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las cotizaciones");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void cargar(); }, []);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return ordenes;
    return ordenes.filter(o =>
      o.numeroOrden.toLowerCase().includes(q) ||
      o.personaNombre.toLowerCase().includes(q) ||
      `${o.origen} ${o.destino}`.toLowerCase().includes(q)
    );
  }, [ordenes, busqueda]);

  async function eliminar(o: Orden) {
    const ok = window.confirm(`¿Eliminar definitivamente la cotización ${o.numeroOrden} de ${o.personaNombre}?\n\nEsta acción no se puede deshacer.`);
    if (!ok) return;
    setDeletingId(o.id);
    setMensaje(null);
    setError(null);
    try {
      const r = await fetch(`/api/servicios/vuelos/${o.id}`, { method: "DELETE" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "No se pudo eliminar la cotización");
      setOrdenes(prev => prev.filter(x => x.id !== o.id));
      setMensaje(`${o.numeroOrden} eliminada correctamente`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar la cotización");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return null;
  if (!canManage) return null;

  return (
    <div className="px-4 pb-6 md:px-6">
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trash2 className="h-5 w-5" />
                Administración de cotizaciones no tomadas
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Solo Manager o Super Admin. Las cotizaciones emitidas no pueden eliminarse.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void cargar()}>
              <RefreshCcw className="mr-2 h-4 w-4" />Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
          {mensaje && <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-700">{mensaje}</div>}
          <Input placeholder="Buscar orden, cliente/prospecto o ruta" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          {filtradas.length === 0 ? (
            <div className="rounded-md border border-dashed p-5 text-center text-sm text-muted-foreground">No hay cotizaciones eliminables.</div>
          ) : (
            <div className="space-y-2">
              {filtradas.map(o => (
                <div key={o.id} className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <b>{o.numeroOrden}</b>
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs">{o.estado}</span>
                    </div>
                    <div className="text-sm">{o.personaNombre}</div>
                    <div className="text-xs text-muted-foreground">{o.origen} → {o.destino}</div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingId === o.id}
                    onClick={() => void eliminar(o)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === o.id ? "Eliminando..." : "Eliminar cotización"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
