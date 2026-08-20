"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Responsable = { id: string; name: string; email: string };
type ResponsableActual = { responsableId: string | null; responsableNombre: string | null; responsableEmail: string | null };

export function ProspectoResponsableComercial({ prospectoId, convertido }: { prospectoId: string; convertido: boolean }) {
  const [actual, setActual] = useState<ResponsableActual | null>(null);
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [puedeReasignar, setPuedeReasignar] = useState(false);
  const [seleccionado, setSeleccionado] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      setLoading(true); setError("");
      const response = await fetch(`/api/prospectos/${prospectoId}/responsable`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo cargar el responsable comercial");
      setActual(data.responsable ?? null);
      setResponsables(data.responsables ?? []);
      setPuedeReasignar(Boolean(data.puedeReasignar));
      setSeleccionado(data.responsable?.responsableId ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el responsable comercial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [prospectoId]);

  const guardar = async () => {
    if (!seleccionado || seleccionado === actual?.responsableId) return;
    try {
      setSaving(true); setError("");
      const response = await fetch(`/api/prospectos/${prospectoId}/responsable`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responsableId: seleccionado }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo reasignar el prospecto");
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo reasignar el prospecto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Responsable Comercial</CardTitle>
        <p className="text-sm text-muted-foreground">Propietario actual de la gestión comercial del prospecto.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? <p className="text-sm text-muted-foreground">Cargando responsable...</p> : (
          <>
            <div>
              <p className="text-sm text-muted-foreground">Responsable actual</p>
              <p className="font-medium">{actual?.responsableNombre || "Sin responsable formal"}</p>
              {actual?.responsableEmail && <p className="text-xs text-muted-foreground">{actual.responsableEmail}</p>}
            </div>
            {puedeReasignar && !convertido && (
              <div className="max-w-md space-y-2">
                <Label>Reasignar responsable</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={seleccionado} onChange={e => setSeleccionado(e.target.value)}>
                  <option value="">Selecciona un usuario</option>
                  {responsables.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <Button onClick={guardar} disabled={saving || !seleccionado || seleccionado === actual?.responsableId}>
                  {saving ? "Guardando..." : "Guardar responsable"}
                </Button>
              </div>
            )}
          </>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
