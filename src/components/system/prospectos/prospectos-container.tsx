"use client";

import { useEffect, useState } from "react";
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

export function ProspectosContainer() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

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
            Registra, evalúa y da seguimiento a personas antes de convertirlas
            en clientes.
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
            <form
              onSubmit={handleSubmit}
              className="grid gap-4 md:grid-cols-2"
            >
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres *</Label>
                <Input
                  id="nombres"
                  name="nombres"
                  value={form.nombres}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  name="ciudad"
                  value={form.ciudad}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pais">País</Label>
                <Input
                  id="pais"
                  name="pais"
                  value={form.pais}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origen">Origen</Label>
                <Input
                  id="origen"
                  name="origen"
                  placeholder="WhatsApp, referido, Facebook..."
                  value={form.origen}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interes">Interés</Label>
                <Input
                  id="interes"
                  name="interes"
                  placeholder="Visa turista, estudiante..."
                  value={form.interes}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleChange}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive md:col-span-2">
                  {error}
                </p>
              )}

              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando..." : "Guardar prospecto"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Prospectos registrados</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">
              Cargando prospectos...
            </p>
          ) : prospectos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay prospectos registrados.
            </p>
          ) : (
            <div className="space-y-3">
              {prospectos.map((prospecto) => (
                <div
                  key={prospecto.id}
                  className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {prospecto.nombres} {prospecto.apellidos ?? ""}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {prospecto.telefono}
                      {prospecto.email ? ` · ${prospecto.email}` : ""}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Interés: {prospecto.interes || "Sin definir"}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Registrado por:{" "}
                      {prospecto.creadoPor?.name || "Sin identificar"}
                    </p>
                  </div>

                  <div className="text-sm">
                    <span className="rounded-full border px-3 py-1">
                      {prospecto.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
