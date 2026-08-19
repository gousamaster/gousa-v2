"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { Plane, FileDown, CheckCircle2, RefreshCcw, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AirportPicker } from "@/components/system/servicios/vuelos/airport-picker";

type Prospecto = {
  id: string;
  nombres: string;
  apellidos?: string | null;
  telefono: string;
};

type OrdenVuelo = {
  id: string;
  numeroOrden: string;
  prospectoId: string;
  prospectoNombre: string;
  prospectoTelefono: string;
  origen: string;
  destino: string;
  fechaIda: string;
  fechaRetorno: string;
  flexibilidad: boolean;
  equipaje: boolean;
  observaciones: string | null;
  estado: "PENDIENTE" | "DESPACHADA";
  creadoPorId: string;
  creadoPorNombre: string;
  createdAt: string;
  despachadoAt: string | null;
};

type EstadoFiltro = "TODAS" | "PENDIENTE" | "DESPACHADA";

const initialForm = {
  prospectoId: "",
  origen: "",
  destino: "",
  fechaIda: "",
  fechaRetorno: "",
  flexibilidad: false,
  equipaje: false,
  observaciones: "",
};

function formatoFecha(value: string) {
  if (!value) return "—";
  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatoFechaHora(value: string) {
  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleString("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function VuelosContainer() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenVuelo[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<EstadoFiltro>("PENDIENTE");
  const [busqueda, setBusqueda] = useState("");

  async function cargarDatos() {
    setLoading(true);
    setError(null);

    try {
      const [prospectosRes, ordenesRes] = await Promise.all([
        fetch("/api/prospectos", { cache: "no-store" }),
        fetch("/api/servicios/vuelos", { cache: "no-store" }),
      ]);

      const prospectosJson = await prospectosRes.json();
      const ordenesJson = await ordenesRes.json();

      if (!prospectosRes.ok) {
        throw new Error(prospectosJson.error ?? "No se pudieron cargar prospectos");
      }

      if (!ordenesRes.ok) {
        throw new Error(ordenesJson.error ?? "No se pudieron cargar las órdenes");
      }

      setProspectos(prospectosJson.prospectos ?? []);
      setOrdenes(ordenesJson.ordenes ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el módulo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void cargarDatos();
  }, []);

  const ordenesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return ordenes.filter((orden) => {
      const coincideEstado = filtro === "TODAS" || orden.estado === filtro;
      const coincideBusqueda =
        !q ||
        orden.numeroOrden.toLowerCase().includes(q) ||
        orden.prospectoNombre.toLowerCase().includes(q) ||
        `${orden.origen}-${orden.destino}`.toLowerCase().includes(q);
      return coincideEstado && coincideBusqueda;
    });
  }, [ordenes, filtro, busqueda]);

  async function crearOrden(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/servicios/vuelos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "No se pudo generar la orden");
      }

      setForm(initialForm);
      setSuccess(`Orden ${json.orden.numeroOrden} generada correctamente`);
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar la orden");
    } finally {
      setSaving(false);
    }
  }

  async function cambiarEstado(orden: OrdenVuelo) {
    const nuevoEstado = orden.estado === "PENDIENTE" ? "DESPACHADA" : "PENDIENTE";
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/servicios/vuelos/${orden.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "No se pudo actualizar la orden");
      }

      setSuccess(
        nuevoEstado === "DESPACHADA"
          ? `${orden.numeroOrden} marcada como despachada`
          : `${orden.numeroOrden} volvió a pendiente`,
      );
      await cargarDatos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la orden");
    }
  }

  function descargarPdf(orden: OrdenVuelo) {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("GO USA NEXUS 2.0", 20, 22);

    doc.setFontSize(14);
    doc.text("ORDEN DE COTIZACIÓN - VUELOS", 20, 34);

    doc.setFontSize(12);
    doc.text(`N.º ${orden.numeroOrden}`, 20, 46);

    doc.setDrawColor(180);
    doc.line(20, 52, 190, 52);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const filas = [
      ["Prospecto", orden.prospectoNombre],
      ["Teléfono", orden.prospectoTelefono || "—"],
      ["Ruta", `${orden.origen} → ${orden.destino}`],
      ["Ida", formatoFecha(orden.fechaIda)],
      ["Retorno", formatoFecha(orden.fechaRetorno)],
      ["Flexibilidad ±2 días", orden.flexibilidad ? "SÍ" : "NO"],
      ["Equipaje", orden.equipaje ? "SÍ" : "NO"],
      ["Observaciones", orden.observaciones || "—"],
      ["Solicitado por", orden.creadoPorNombre || "—"],
      ["Fecha de solicitud", formatoFechaHora(orden.createdAt)],
      ["Estado", orden.estado],
    ];

    let y = 64;
    for (const [label, value] of filas) {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 20, y);
      doc.setFont("helvetica", "normal");
      const lineas = doc.splitTextToSize(String(value), 118);
      doc.text(lineas, 68, y);
      y += Math.max(8, lineas.length * 6);
    }

    doc.setFontSize(9);
    doc.text("Documento generado por GO USA NEXUS 2.0", 20, 282);
    doc.save(`${orden.numeroOrden}.pdf`);
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6" />
            <h1 className="text-2xl font-bold tracking-tight">Servicios · Vuelos</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Genera órdenes claras para cotización y controla cuáles ya fueron despachadas.
          </p>
        </div>

        <Button variant="outline" onClick={() => void cargarDatos()} disabled={loading}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          {success}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" />
              Nueva cotización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={crearOrden}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="prospectoId">
                  Prospecto
                </label>
                <select
                  id="prospectoId"
                  value={form.prospectoId}
                  onChange={(e) => setForm((prev) => ({ ...prev, prospectoId: e.target.value }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  required
                >
                  <option value="">Seleccionar prospecto registrado</option>
                  {prospectos.map((prospecto) => (
                    <option key={prospecto.id} value={prospecto.id}>
                      {prospecto.nombres} {prospecto.apellidos ?? ""} · {prospecto.telefono}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  ¿No aparece?{" "}
                  <Link href="/prospectos" className="font-medium underline underline-offset-2">
                    Registrar prospecto primero
                  </Link>
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <AirportPicker
                  id="origen"
                  label="Origen"
                  value={form.origen}
                  onChange={(iata) => setForm((prev) => ({ ...prev, origen: iata }))}
                  placeholder="La Paz o LPB"
                  excludeIata={form.destino}
                  required
                />
                <AirportPicker
                  id="destino"
                  label="Destino"
                  value={form.destino}
                  onChange={(iata) => setForm((prev) => ({ ...prev, destino: iata }))}
                  placeholder="Miami o MIA"
                  excludeIata={form.origen}
                  required
                />
              </div>

              <p className="-mt-1 text-xs text-muted-foreground">
                Busca por ciudad, nombre del aeropuerto o código IATA y selecciona una opción.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="fechaIda">Ida</label>
                  <Input
                    id="fechaIda"
                    type="date"
                    value={form.fechaIda}
                    onChange={(e) => setForm((prev) => ({ ...prev, fechaIda: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="fechaRetorno">Retorno</label>
                  <Input
                    id="fechaRetorno"
                    type="date"
                    value={form.fechaRetorno}
                    onChange={(e) => setForm((prev) => ({ ...prev, fechaRetorno: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm">
                  <span>
                    <span className="block font-medium">Flexibilidad</span>
                    <span className="text-xs text-muted-foreground">±2 días</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={form.flexibilidad}
                    onChange={(e) => setForm((prev) => ({ ...prev, flexibilidad: e.target.checked }))}
                    className="h-4 w-4"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm">
                  <span>
                    <span className="block font-medium">Equipaje</span>
                    <span className="text-xs text-muted-foreground">Sí / No</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={form.equipaje}
                    onChange={(e) => setForm((prev) => ({ ...prev, equipaje: e.target.checked }))}
                    className="h-4 w-4"
                  />
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="observaciones">Observaciones</label>
                <textarea
                  id="observaciones"
                  value={form.observaciones}
                  onChange={(e) => setForm((prev) => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Opcional"
                  rows={3}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <Button type="submit" className="w-full" disabled={saving || !form.origen || !form.destino}>
                {saving ? "Generando…" : "Generar orden de cotización"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-lg">Órdenes de cotización</CardTitle>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar orden, prospecto o ruta"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["PENDIENTE", "DESPACHADA", "TODAS"] as EstadoFiltro[]).map((estado) => (
                <Button
                  key={estado}
                  type="button"
                  size="sm"
                  variant={filtro === estado ? "default" : "outline"}
                  onClick={() => setFiltro(estado)}
                >
                  {estado === "PENDIENTE" ? "Pendientes" : estado === "DESPACHADA" ? "Despachadas" : "Todas"}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Cargando órdenes…</div>
            ) : ordenesFiltradas.length === 0 ? (
              <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
                No hay órdenes en esta vista.
              </div>
            ) : (
              <div className="space-y-3">
                {ordenesFiltradas.map((orden) => (
                  <div key={orden.id} className="rounded-xl border p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{orden.numeroOrden}</span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              orden.estado === "PENDIENTE"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            }`}
                          >
                            {orden.estado}
                          </span>
                        </div>

                        <div>
                          <p className="font-medium">{orden.prospectoNombre}</p>
                          <p className="text-xs text-muted-foreground">{orden.prospectoTelefono}</p>
                        </div>

                        <div className="grid gap-1 text-sm sm:grid-cols-2 xl:grid-cols-3">
                          <p><span className="text-muted-foreground">Ruta:</span> <strong>{orden.origen} → {orden.destino}</strong></p>
                          <p><span className="text-muted-foreground">Ida:</span> {formatoFecha(orden.fechaIda)}</p>
                          <p><span className="text-muted-foreground">Retorno:</span> {formatoFecha(orden.fechaRetorno)}</p>
                          <p><span className="text-muted-foreground">Flexibilidad:</span> {orden.flexibilidad ? "Sí" : "No"}</p>
                          <p><span className="text-muted-foreground">Equipaje:</span> {orden.equipaje ? "Sí" : "No"}</p>
                          <p><span className="text-muted-foreground">Solicitado:</span> {formatoFechaHora(orden.createdAt)}</p>
                        </div>

                        {orden.observaciones && (
                          <p className="text-sm"><span className="text-muted-foreground">Obs.:</span> {orden.observaciones}</p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => descargarPdf(orden)}>
                          <FileDown className="mr-2 h-4 w-4" />
                          PDF
                        </Button>
                        <Button
                          size="sm"
                          variant={orden.estado === "PENDIENTE" ? "default" : "outline"}
                          onClick={() => void cambiarEstado(orden)}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {orden.estado === "PENDIENTE" ? "Marcar despachada" : "Volver a pendiente"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
