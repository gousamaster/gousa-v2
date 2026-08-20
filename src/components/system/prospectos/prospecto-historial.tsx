"use client";

import { useEffect, useState } from "react";
import { History, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Historial = {
  id: string;
  estadoAnterior: string | null;
  estadoNuevo: string;
  motivoPerdida: string | null;
  cambiadoPorNombre: string | null;
  createdAt: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ProspectoHistorial({ prospectoId }: { prospectoId: string }) {
  const [historial, setHistorial] = useState<Historial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`/api/prospectos/${prospectoId}/historial`, {
          cache: "no-store",
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "No se pudo cargar el historial");
        }
        setHistorial(payload.historial ?? []);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "No se pudo cargar el historial");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [prospectoId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" /> Historial del embudo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Registro auditable de cambios de etapa, pérdidas, reaperturas y conversión.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando historial...
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : historial.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay cambios de etapa registrados desde la activación del historial.
          </p>
        ) : (
          <div className="space-y-3">
            {historial.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border px-2 py-0.5 text-xs">
                    {item.estadoAnterior || "INICIO"}
                  </span>
                  <span className="text-sm text-muted-foreground">→</span>
                  <span className="rounded-full border px-2 py-0.5 text-xs font-medium">
                    {item.estadoNuevo}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatDate(item.createdAt)} · {item.cambiadoPorNombre || "Usuario no identificado"}
                </p>
                {item.motivoPerdida && (
                  <p className="mt-1 text-sm">
                    <span className="font-medium">Motivo de pérdida:</span> {item.motivoPerdida}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
