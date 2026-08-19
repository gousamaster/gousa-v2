"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Prospecto = {
  id: string;
  nombres: string;
  apellidos: string | null;
  telefono: string;
  email: string | null;
  ciudad: string | null;
  pais: string | null;
  origen: string | null;
  interes: string | null;
  observaciones: string | null;
  estado: string;
  scorePreliminar: number | null;
  convertido: boolean;
  createdAt: string;
  creadoPor?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

const initialForm = {
  nombres: "",
  apellidos: "",
  telefono: "",
  email: "",
  ciudad: "",
  pais: "Bolivia",
  origen: "",
  interes: "",
  observaciones: "",
};

function prioridadScore(prospecto: Prospecto) {
  if (prospecto.convertido) return "CONVERTIDO";
  if (prospecto.scorePreliminar === null) return "SIN_EVALUAR";
  if (prospecto.scorePreliminar >= 75) return "ALTA";
  if (prospecto.scorePreliminar >= 50) return "MEDIA";
  return "BAJA";
}

function prioridadLabel(value: string) {
  const labels: Record<string, string> = {
    ALTA: "Prioridad alta",
    MEDIA: "Prioridad media",
    BAJA: "Prioridad baja",
    SIN_EVALUAR: "Sin evaluar",
    CONVERTIDO: "Convertido",
  };
  return labels[value] ?? value;
}

export function ProspectosContainer() {
  const router = useRouter();
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("TODOS");

  const loadProspectos = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/prospectos", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudieron cargar los prospectos");
      }

      setProspectos(data.prospectos ?? []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los prospectos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProspectos();
  }, []);

  const prospectosOrdenados = useMemo(() => {
    const activos = prospectos.filter((prospecto) => !prospecto.convertido);
    const convertidos = prospectos.filter((prospecto) => prospecto.convertido);

    const ordenar = (items: Prospecto[]) =>
      [...items].sort((a, b) => {
        const scoreA = a.scorePreliminar ?? -1;
        const scoreB = b.scorePreliminar ?? -1;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    const lista = [...ordenar(activos), ...ordenar(convertidos)];
    if (filtro === "TODOS") return lista;
    return lista.filter((prospecto) => prioridadScore(prospecto) === filtro);
  }, [prospectos, filtro]);

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.nombres.trim() || !form.telefono.trim()) {
      setError("Nombre y teléfono son obligatorios");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/prospectos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo crear el prospecto");
      }

      setForm(initialForm);
      setShowForm(false);
      await loadProspectos();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear el prospecto",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Prospectos</h2>
          <p className="text-muted-foreground">
            Registra, evalúa y prioriza personas antes de convertirlas en clientes.
          </p>
        </div>

        <Button onClick={() => setShowForm((value) => !value)}>
          {showForm ? "Cancelar" : "Nuevo prospecto"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo prospecto</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres *</Label>
                <Input id="nombres" name="nombres" value={form.nombres} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input id="apellidos" name="apellidos" value={form.apellidos} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input id="telefono" name="telefono" value={form.telefono} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input id="ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pais">País</Label>
                <Input id="pais" name="pais" value={form.pais} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origen">Origen</Label>
                <Input id="origen" name="origen" placeholder="WhatsApp, referido, Facebook..." value={form.origen} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interes">Interés</Label>
                <Input id="interes" name="interes" placeholder="Visa turista, estudiante..." value={form.interes} onChange={handleChange} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea id="observaciones" name="observaciones" value={form.observaciones} onChange={handleChange} />
              </div>
              {error && <p className="text-sm text-destructive md:col-span-2">{error}</p>}
              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar prospecto"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="gap-4">
          <div>
            <CardTitle>Prospectos registrados</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Los prospectos activos se ordenan por Score NEXUS para facilitar el seguimiento comercial.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["TODOS", "Todos"],
              ["ALTA", "Alta"],
              ["MEDIA", "Media"],
              ["BAJA", "Baja"],
              ["SIN_EVALUAR", "Sin evaluar"],
              ["CONVERTIDO", "Convertidos"],
            ].map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={filtro === value ? "default" : "outline"}
                onClick={() => setFiltro(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando prospectos...</p>
          ) : prospectosOrdenados.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {prospectos.length === 0 ? "Todavía no hay prospectos registrados." : "No hay prospectos en este filtro."}
            </p>
          ) : (
            <div className="space-y-3">
              {prospectosOrdenados.map((prospecto) => {
                const prioridad = prioridadScore(prospecto);
                return (
                  <div
                    key={prospecto.id}
                    onClick={() => router.push(`/prospectos/${prospecto.id}`)}
                    className="flex cursor-pointer flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium">{prospecto.nombres} {prospecto.apellidos ?? ""}</p>
                      <p className="text-sm text-muted-foreground">
                        {prospecto.telefono}{prospecto.email ? ` · ${prospecto.email}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">Interés: {prospecto.interes || "Sin definir"}</p>
                      <p className="text-xs text-muted-foreground">Registrado por: {prospecto.creadoPor?.name || "Sin identificar"}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm md:justify-end">
                      {prospecto.scorePreliminar !== null ? (
                        <span className="rounded-full border px-3 py-1 font-medium">Score {prospecto.scorePreliminar}%</span>
                      ) : (
                        <span className="rounded-full border border-dashed px-3 py-1 text-muted-foreground">Score pendiente</span>
                      )}
                      <span className="rounded-full border px-3 py-1">{prioridadLabel(prioridad)}</span>
                      <span className="rounded-full border px-3 py-1">{prospecto.estado}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
