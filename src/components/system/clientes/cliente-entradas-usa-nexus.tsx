"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { obtenerEntradasUsaNexus, guardarEntradasUsaNexus } from "@/lib/actions/clientes/entradas-usa-nexus-actions";
import { toast } from "sonner";

type Row = { fechaIngreso: string; permanenciaDias: string };
const vacia = (): Row => ({ fechaIngreso: "", permanenciaDias: "" });

export function ClienteEntradasUsaNexus({ clienteId }: { clienteId: string }) {
  const [rows, setRows] = useState<Row[]>([vacia()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const r = await obtenerEntradasUsaNexus(clienteId);
      if (r.success && r.data?.length) setRows(r.data.map((e) => ({ fechaIngreso: e.fechaIngreso, permanenciaDias: e.permanenciaDias?.toString() ?? "" })));
      setLoading(false);
    })();
  }, [clienteId]);

  function change(i: number, key: keyof Row, value: string) {
    setRows((prev) => prev.map((r, n) => n === i ? { ...r, [key]: value } : r));
  }

  async function save() {
    setSaving(true);
    const r = await guardarEntradasUsaNexus(clienteId, rows.map((e) => ({
      fechaIngreso: e.fechaIngreso,
      permanenciaDias: e.permanenciaDias.trim() === "" ? null : Number(e.permanenciaDias),
    })));
    setSaving(false);
    r.success ? toast.success("Últimas entradas a EE.UU. guardadas") : toast.error(r.error ?? "No se pudo guardar");
  }

  if (loading) return <div className="py-4 text-sm text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin"/>Cargando entradas...</div>;

  return <section className="space-y-4 rounded-lg border p-5">
    <div>
      <h4 className="font-semibold">Últimas entradas a Estados Unidos</h4>
      <p className="mt-1 text-sm text-muted-foreground">Registra hasta las últimas 5 entradas, comenzando por la más reciente. Indica la fecha de ingreso y el tiempo real de permanencia.</p>
    </div>
    <div className="space-y-3">
      {rows.map((row, i) => <div key={i} className="grid items-end gap-3 rounded-md border p-3 md:grid-cols-[60px_1fr_1fr_auto]">
        <div className="text-sm font-medium text-muted-foreground">#{i + 1}</div>
        <div className="space-y-2"><Label>Fecha de ingreso</Label><Input type="date" value={row.fechaIngreso} onChange={(e) => change(i, "fechaIngreso", e.target.value)}/></div>
        <div className="space-y-2"><Label>Tiempo de permanencia (días)</Label><Input type="number" min="0" value={row.permanenciaDias} onChange={(e) => change(i, "permanenciaDias", e.target.value)} placeholder="Ej. 15"/></div>
        <Button type="button" variant="ghost" size="icon" disabled={rows.length === 1} onClick={() => setRows((p) => p.filter((_, n) => n !== i))} aria-label="Eliminar entrada"><Trash2 className="h-4 w-4"/></Button>
      </div>)}
    </div>
    <div className="flex flex-wrap justify-between gap-3">
      <Button type="button" variant="outline" disabled={rows.length >= 5} onClick={() => setRows((p) => [...p, vacia()])}><Plus className="mr-2 h-4 w-4"/>Agregar entrada {rows.length}/5</Button>
      <Button type="button" disabled={saving} onClick={() => void save()}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}Guardar entradas</Button>
    </div>
  </section>;
}
