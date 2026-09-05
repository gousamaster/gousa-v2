"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BellRing, CheckCircle2, ExternalLink, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

type Entrevista = {
  id: string;
  fechaHora: string;
  clienteId?: string | null;
  cliente: string | null;
  grupoFamiliar: string | null;
  lugar: string | null;
  participantes: number;
  recordatorioEnviado: boolean;
};

async function jsonSeguro(r: Response) {
  const text = await r.text();
  try { return text ? JSON.parse(text) : {}; } catch { return { error: "Respuesta inesperada del servidor" }; }
}

function fechaHoraLabel(value: string) {
  return new Date(value).toLocaleString("es-BO", {
    timeZone: "America/La_Paz",
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function RecordatoriosEntrevistaTimeCard() {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/nexus/entrevistas-hoy", { cache: "no-store" });
      const j = await jsonSeguro(r);
      if (!r.ok) throw new Error(j.error ?? "No se pudieron cargar entrevistas");
      setEntrevistas(j.entrevistas ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los recordatorios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const pendientes = useMemo(() => {
    const ahora = Date.now();
    const limite = 24 * 60 * 60 * 1000;
    return entrevistas.filter((e) => {
      if (e.recordatorioEnviado) return false;
      const faltan = new Date(e.fechaHora).getTime() - ahora;
      return faltan > 0 && faltan <= limite;
    });
  }, [entrevistas]);

  async function marcarEnviado(id: string) {
    setSaving(id);
    setError(null);
    try {
      const r = await fetch(`/api/nexus/citas/${id}/recordatorio-entrevista`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enviado: true }),
      });
      const j = await jsonSeguro(r);
      if (!r.ok) throw new Error(j.error ?? "No se pudo marcar el recordatorio");
      setEntrevistas((prev) => prev.map((e) => e.id === id ? { ...e, recordatorioEnviado: true } : e));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el recordatorio");
    } finally {
      setSaving(null);
    }
  }

  if (!loading && pendientes.length === 0 && !error) return null;

  return (
    <Card className="border-amber-300 bg-amber-50/40 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <BellRing className="h-5 w-5 text-amber-700" />
              Recordatorios de entrevista · próximas 24 horas
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Aparecen automáticamente cuando faltan 24 horas o menos para la entrevista en Embajada.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void cargar()} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>}
        {loading && pendientes.length === 0 ? <p className="text-sm text-muted-foreground">Cargando recordatorios...</p> : pendientes.map((e) => (
          <div key={e.id} className="rounded-lg border border-amber-300 bg-background p-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-amber-600">RECORDATORIO</Badge>
                  <span className="font-semibold">{e.grupoFamiliar ?? e.cliente ?? "Cliente"}</span>
                </div>
                <p className="mt-1 text-sm">Entrevista: {fechaHoraLabel(e.fechaHora)} · {e.lugar ?? "Embajada Americana"}</p>
                {e.participantes > 1 && <p className="mt-1 text-xs text-muted-foreground">Participantes: {e.participantes}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {e.clienteId && <Button asChild variant="outline" size="sm"><Link href={`/clients/${e.clienteId}`}><ExternalLink className="mr-1.5 h-4 w-4" />Ver cliente</Link></Button>}
                <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium">
                  <Checkbox disabled={saving === e.id} onCheckedChange={(v) => { if (v === true) void marcarEnviado(e.id); }} />
                  <CheckCircle2 className="h-4 w-4" />
                  Recordatorio enviado
                </label>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
