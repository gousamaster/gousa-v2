"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Auditoria = {
  id: string;
  accion: string;
  detalle: Record<string, unknown> | null;
  usuarioNombre: string | null;
  createdAt: string;
};

function labelAccion(value: string) {
  return value.replaceAll("_", " ");
}

export function ProspectoAuditoria({ prospectoId }: { prospectoId: string }) {
  const [items, setItems] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/prospectos/${prospectoId}/auditoria`, { cache: "no-store" });
        const data = await response.json();
        if (response.ok) setItems(data.auditoria ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [prospectoId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Auditoría NEXUS</CardTitle>
        <p className="text-sm text-muted-foreground">Registro de acciones sensibles sobre este prospecto.</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando auditoría...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay eventos de auditoría registrados.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{labelAccion(item.accion)}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString("es-BO")}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Usuario: {item.usuarioNombre || "Sin identificar"}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
