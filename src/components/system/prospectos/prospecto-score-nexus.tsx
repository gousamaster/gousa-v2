"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ScoreOption = {
  value: string;
  label: string;
  factor: number;
};

type ScoreQuestion = {
  id: string;
  titulo: string;
  ayuda: string;
  peso: number;
  opciones: ScoreOption[];
};

type ScoreEvaluation = {
  id: string;
  score: number;
  clasificacion: string;
  modeloVersion: string;
  evaluadorNombre?: string | null;
  createdAt?: string;
};

type ScorePayload = {
  prospecto: {
    id: string;
    nombres: string;
    apellidos: string | null;
    scorePreliminar: number | null;
  };
  modelo: {
    version: string;
    preguntas: ScoreQuestion[];
    aviso: string;
  };
  ultimaEvaluacion: ScoreEvaluation | null;
  historial: ScoreEvaluation[];
};

function labelClasificacion(value: string) {
  const labels: Record<string, string> = {
    ALTO: "Perfil alto",
    MEDIO_ALTO: "Perfil medio-alto",
    MEDIO: "Perfil medio",
    BAJO: "Perfil bajo",
  };
  return labels[value] ?? value;
}

export function ProspectoScoreNexus({ prospectoId }: { prospectoId: string }) {
  const router = useRouter();
  const [data, setData] = useState<ScorePayload | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<ScoreEvaluation | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`/api/prospectos/${prospectoId}/score`, {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo cargar el Score NEXUS");
      setData(payload);
      setResultado(payload.ultimaEvaluacion);
      if (payload.ultimaEvaluacion?.respuestas) {
        setRespuestas(payload.ultimaEvaluacion.respuestas);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo cargar el Score NEXUS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [prospectoId]);

  const guardar = async () => {
    if (!data) return;
    const faltantes = data.modelo.preguntas.filter((pregunta) => !respuestas[pregunta.id]);
    if (faltantes.length > 0) {
      setError(`Faltan ${faltantes.length} respuesta(s) antes de calcular el Score.`);
      return;
    }

    try {
      setSaving(true);
      setError("");
      const response = await fetch(`/api/prospectos/${prospectoId}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respuestas }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo guardar la evaluación");
      setResultado(payload.evaluacion);
      await load();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo guardar la evaluación");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 pt-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Cargando Score NEXUS...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Button variant="outline" onClick={() => router.push(`/prospectos/${prospectoId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al prospecto
        </Button>
        <p className="text-sm text-destructive">{error || "No se pudo cargar la evaluación"}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Button variant="outline" className="mb-4" onClick={() => router.push(`/prospectos/${prospectoId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al prospecto
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Score NEXUS</h2>
          <p className="text-muted-foreground">
            {data.prospecto.nombres} {data.prospecto.apellidos ?? ""}
          </p>
        </div>

        {resultado && (
          <Card className="min-w-[220px]">
            <CardContent className="pt-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Último Score</p>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-4xl font-bold">{resultado.score}%</span>
                <span className="pb-1 text-sm text-muted-foreground">{labelClasificacion(resultado.clasificacion)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardContent className="flex gap-3 pt-5 text-sm">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium">Índice interno orientativo</p>
            <p className="text-muted-foreground">{data.modelo.aviso}</p>
            <p className="mt-1 text-xs text-muted-foreground">Modelo: {data.modelo.version}</p>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-4">
        {data.modelo.preguntas.map((pregunta, index) => (
          <Card key={pregunta.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {index + 1}. {pregunta.titulo}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{pregunta.ayuda}</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {pregunta.opciones.map((opcion) => {
                  const selected = respuestas[pregunta.id] === opcion.value;
                  return (
                    <button
                      type="button"
                      key={opcion.value}
                      onClick={() => setRespuestas((current) => ({ ...current, [pregunta.id]: opcion.value }))}
                      className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors ${selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                    >
                      <span>{opcion.label}</span>
                      {selected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
        <div>
          <p className="font-medium">Guardar evaluación</p>
          <p className="text-sm text-muted-foreground">Se conservarán las respuestas, la versión del modelo, fecha y evaluador.</p>
        </div>
        <Button onClick={guardar} disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : "Calcular y guardar Score"}
        </Button>
      </div>

      {data.historial.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Historial de evaluaciones</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.historial.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                <div>
                  <p className="font-medium">{item.score}% · {labelClasificacion(item.clasificacion)}</p>
                  <p className="text-xs text-muted-foreground">{item.evaluadorNombre || "Evaluador no disponible"} · {item.modeloVersion}</p>
                </div>
                {item.createdAt && <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("es-BO")}</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
