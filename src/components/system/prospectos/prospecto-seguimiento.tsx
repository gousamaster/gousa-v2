"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Responsable = {
  id: string;
  name: string;
  email: string;
};

type Seguimiento = {
  id: string;
  prospectoId: string;
  responsableId: string | null;
  responsableNombre: string | null;
  creadoPorNombre: string | null;
  tipo: string;
  accion: string;
  programadoAt: string;
  estado: string;
  notas: string | null;
  completadoAt: string | null;
  createdAt: string;
};

const TIPOS = ["LLAMADA", "WHATSAPP", "EMAIL", "REUNION", "OTRO"];

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function minFechaSeguimiento() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function ProspectoSeguimiento({
  prospectoId,
  convertido,
}: {
  prospectoId: string;
  convertido: boolean;
}) {
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [tipo, setTipo] = useState("LLAMADA");
  const [accion, setAccion] = useState("");
  const [programadoAt, setProgramadoAt] = useState("");
  const [responsableId, setResponsableId] = useState("");
  const [notas, setNotas] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`/api/prospectos/${prospectoId}/seguimiento`, {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "No se pudo cargar el seguimiento");
      }
      setSeguimientos(payload.seguimientos ?? []);
      setResponsables(payload.responsables ?? []);
      setResponsableId((current) => current || payload.responsables?.[0]?.id || "");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo cargar el seguimiento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [prospectoId]);

  const pendientes = useMemo(
    () => seguimientos.filter((item) => item.estado === "PENDIENTE"),
    [seguimientos],
  );

  const proximo = pendientes[0] ?? null;
  const vencidos = pendientes.filter(
    (item) => new Date(item.programadoAt).getTime() < Date.now(),
  ).length;

  const guardar = async () => {
    if (!accion.trim() || !programadoAt) {
      setError("Define la próxima acción y su fecha/hora");
      return;
    }

    const fechaSeleccionada = new Date(programadoAt);
    if (fechaSeleccionada.getTime() <= Date.now()) {
      setError("La fecha y hora del seguimiento deben ser posteriores al momento actual");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const response = await fetch(`/api/prospectos/${prospectoId}/seguimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          accion,
          programadoAt: fechaSeleccionada.toISOString(),
          responsableId: responsableId || undefined,
          notas,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "No se pudo programar el seguimiento");
      }

      setAccion("");
      setProgramadoAt("");
      setNotas("");
      setShowForm(false);
      await load();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo programar el seguimiento");
    } finally {
      setSaving(false);
    }
  };

  const cerrar = async (seguimientoId: string, estado: "COMPLETADO" | "CANCELADO") => {
    try {
      setClosingId(seguimientoId);
      setError("");
      const response = await fetch(`/api/prospectos/${prospectoId}/seguimiento`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seguimientoId, estado }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "No se pudo actualizar el seguimiento");
      }
      await load();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo actualizar el seguimiento");
    } finally {
      setClosingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" /> Seguimiento comercial
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Programa la siguiente acción, responsable y fecha para que el prospecto no se pierda en el embudo.
          </p>
        </div>
        {!convertido && (
          <Button variant={showForm ? "outline" : "default"} onClick={() => setShowForm((value) => !value)}>
            {showForm ? "Cerrar" : "Programar seguimiento"}
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-5">
        {error && <p className="text-sm text-destructive">{error}</p>}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Cargando seguimiento...
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Próxima acción</p>
                <p className="mt-1 font-medium">{proximo?.accion || "Sin seguimiento pendiente"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Fecha</p>
                <p className="mt-1 font-medium">{proximo ? formatDate(proximo.programadoAt) : "—"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Vencidos</p>
                <p className="mt-1 font-medium">{vencidos}</p>
              </div>
            </div>

            {showForm && !convertido && (
              <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Canal *</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={tipo}
                    onChange={(event) => setTipo(event.target.value)}
                  >
                    {TIPOS.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Responsable *</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={responsableId}
                    onChange={(event) => setResponsableId(event.target.value)}
                  >
                    {responsables.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Próxima acción *</Label>
                  <Input
                    value={accion}
                    onChange={(event) => setAccion(event.target.value)}
                    placeholder="Ej. Llamar para confirmar documentos y fecha tentativa"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fecha y hora *</Label>
                  <Input
                    type="datetime-local"
                    min={minFechaSeguimiento()}
                    value={programadoAt}
                    onChange={(event) => setProgramadoAt(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Solo se permiten fechas y horas futuras.</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Notas</Label>
                  <Textarea
                    value={notas}
                    onChange={(event) => setNotas(event.target.value)}
                    placeholder="Contexto útil para el próximo contacto"
                  />
                </div>

                <div className="md:col-span-2">
                  <Button onClick={guardar} disabled={saving || !responsableId}>
                    {saving ? "Guardando..." : "Guardar seguimiento"}
                  </Button>
                </div>
              </div>
            )}

            {seguimientos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay acciones de seguimiento registradas.</p>
            ) : (
              <div className="space-y-2">
                {seguimientos.map((item) => {
                  const overdue =
                    item.estado === "PENDIENTE" &&
                    new Date(item.programadoAt).getTime() < Date.now();

                  return (
                    <div key={item.id} className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{item.accion}</p>
                          <span className="rounded-full border px-2 py-0.5 text-xs">{item.tipo}</span>
                          <span className="rounded-full border px-2 py-0.5 text-xs">{item.estado}</span>
                          {overdue && <span className="text-xs font-medium text-destructive">VENCIDO</span>}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatDate(item.programadoAt)} · Responsable: {item.responsableNombre || "Sin identificar"}
                        </p>
                        {item.notas && <p className="mt-1 text-sm">{item.notas}</p>}
                      </div>

                      {item.estado === "PENDIENTE" && !convertido && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={closingId === item.id}
                            onClick={() => cerrar(item.id, "CANCELADO")}
                          >
                            <XCircle className="mr-1 h-4 w-4" /> Cancelar
                          </Button>
                          <Button
                            size="sm"
                            disabled={closingId === item.id}
                            onClick={() => cerrar(item.id, "COMPLETADO")}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" /> Completar
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
