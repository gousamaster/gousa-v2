"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { Plane, FileDown, CheckCircle2, RefreshCcw, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AirportPicker } from "@/components/system/servicios/vuelos/airport-picker";

type TipoViaje = "SOLO_IDA" | "IDA_VUELTA" | "MULTIPLE";
type TipoPersona = "PROSPECTO" | "CLIENTE";
type Tramo = { origen: string; destino: string; fecha: string };
type Persona = { id: string; nombres: string; apellidos?: string | null; telefono?: string | null; telefonoCelular?: string | null };
type OrdenVuelo = {
  id: string; numeroOrden: string; prospectoId: string | null; clienteId: string | null; tipoPersona: TipoPersona;
  personaNombre: string; personaTelefono: string; tipoViaje: TipoViaje; origen: string; destino: string;
  fechaIda: string; fechaRetorno: string | null; tramos: Tramo[] | null; flexibilidad: boolean; equipaje: boolean;
  observaciones: string | null; estado: "PENDIENTE" | "DESPACHADA"; creadoPorId: string; creadoPorNombre: string;
  createdAt: string; despachadoAt: string | null;
};
type EstadoFiltro = "TODAS" | "PENDIENTE" | "DESPACHADA";

const nuevoTramo = (): Tramo => ({ origen: "", destino: "", fecha: "" });
const initialForm = {
  tipoPersona: "PROSPECTO" as TipoPersona, personaId: "", tipoViaje: "IDA_VUELTA" as TipoViaje,
  origen: "", destino: "", fechaIda: "", fechaRetorno: "", tramos: [nuevoTramo(), nuevoTramo()],
  flexibilidad: false, equipaje: false, observaciones: "",
};

function formatoFecha(value?: string | null) {
  if (!value) return "—";
  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}
function formatoFechaHora(value: string) {
  const fecha = new Date(value);
  return Number.isNaN(fecha.getTime()) ? "—" : fecha.toLocaleString("es-BO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function nombreTipo(tipo: TipoViaje) {
  if (tipo === "SOLO_IDA") return "Solo ida";
  if (tipo === "MULTIPLE") return "Múltiples destinos";
  return "Ida y vuelta";
}

export function VuelosContainer() {
  const [prospectos, setProspectos] = useState<Persona[]>([]);
  const [clientes, setClientes] = useState<Persona[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenVuelo[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<EstadoFiltro>("PENDIENTE");
  const [busqueda, setBusqueda] = useState("");

  async function cargarDatos() {
    setLoading(true); setError(null);
    try {
      const [personasRes, ordenesRes] = await Promise.all([
        fetch("/api/servicios/vuelos/personas", { cache: "no-store" }),
        fetch("/api/servicios/vuelos", { cache: "no-store" }),
      ]);
      const personasJson = await personasRes.json(); const ordenesJson = await ordenesRes.json();
      if (!personasRes.ok) throw new Error(personasJson.error ?? "No se pudieron cargar prospectos y clientes");
      if (!ordenesRes.ok) throw new Error(ordenesJson.error ?? "No se pudieron cargar las órdenes");
      setProspectos(personasJson.prospectos ?? []); setClientes(personasJson.clientes ?? []); setOrdenes(ordenesJson.ordenes ?? []);
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo cargar el módulo"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void cargarDatos(); }, []);

  const personas = form.tipoPersona === "CLIENTE" ? clientes : prospectos;
  const ordenesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return ordenes.filter((orden) => (filtro === "TODAS" || orden.estado === filtro) && (!q || orden.numeroOrden.toLowerCase().includes(q) || orden.personaNombre.toLowerCase().includes(q) || `${orden.origen}-${orden.destino}`.toLowerCase().includes(q)));
  }, [ordenes, filtro, busqueda]);

  function cambiarTipoPersona(tipoPersona: TipoPersona) {
    setForm((prev) => ({ ...prev, tipoPersona, personaId: "" }));
  }
  function cambiarTipoViaje(tipoViaje: TipoViaje) {
    setForm((prev) => ({ ...prev, tipoViaje, origen: "", destino: "", fechaIda: "", fechaRetorno: "", tramos: [nuevoTramo(), nuevoTramo()] }));
  }
  function actualizarTramo(index: number, patch: Partial<Tramo>) {
    setForm((prev) => ({ ...prev, tramos: prev.tramos.map((tramo, i) => i === index ? { ...tramo, ...patch } : tramo) }));
  }

  async function crearOrden(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(null); setSuccess(null);
    try {
      const response = await fetch("/api/servicios/vuelos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await response.json(); if (!response.ok) throw new Error(json.error ?? "No se pudo generar la orden");
      setForm({ ...initialForm, tramos: [nuevoTramo(), nuevoTramo()] });
      setSuccess(`Orden ${json.orden.numeroOrden} generada correctamente`); await cargarDatos();
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo generar la orden"); }
    finally { setSaving(false); }
  }

  async function cambiarEstado(orden: OrdenVuelo) {
    const nuevoEstado = orden.estado === "PENDIENTE" ? "DESPACHADA" : "PENDIENTE";
    setError(null); setSuccess(null);
    try {
      const response = await fetch(`/api/servicios/vuelos/${orden.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado: nuevoEstado }) });
      const json = await response.json(); if (!response.ok) throw new Error(json.error ?? "No se pudo actualizar la orden");
      setSuccess(nuevoEstado === "DESPACHADA" ? `${orden.numeroOrden} marcada como despachada` : `${orden.numeroOrden} volvió a pendiente`); await cargarDatos();
    } catch (err) { setError(err instanceof Error ? err.message : "No se pudo actualizar la orden"); }
  }

  function descargarPdf(orden: OrdenVuelo) {
    const doc = new jsPDF(); doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.text("GO USA NEXUS 2.0", 20, 22);
    doc.setFontSize(14); doc.text("ORDEN DE COTIZACIÓN - VUELOS", 20, 34); doc.setFontSize(12); doc.text(`N.º ${orden.numeroOrden}`, 20, 46); doc.line(20, 52, 190, 52);
    const filas: Array<[string, string]> = [[orden.tipoPersona === "CLIENTE" ? "Cliente" : "Prospecto", orden.personaNombre], ["Teléfono", orden.personaTelefono || "—"], ["Tipo de viaje", nombreTipo(orden.tipoViaje)]];
    if (orden.tipoViaje === "MULTIPLE" && orden.tramos?.length) orden.tramos.forEach((t, i) => filas.push([`Tramo ${i + 1}`, `${t.origen} → ${t.destino} | ${formatoFecha(t.fecha)}`]));
    else { filas.push(["Ruta", `${orden.origen} → ${orden.destino}`], ["Ida", formatoFecha(orden.fechaIda)]); if (orden.tipoViaje === "IDA_VUELTA") filas.push(["Retorno", formatoFecha(orden.fechaRetorno)]); }
    filas.push(["Flexibilidad ±2 días", orden.flexibilidad ? "SÍ" : "NO"], ["Equipaje", orden.equipaje ? "SÍ" : "NO"], ["Observaciones", orden.observaciones || "—"], ["Solicitado por", orden.creadoPorNombre || "—"], ["Fecha de solicitud", formatoFechaHora(orden.createdAt)], ["Estado", orden.estado]);
    let y = 64; doc.setFontSize(11);
    for (const [label, value] of filas) { doc.setFont("helvetica", "bold"); doc.text(`${label}:`, 20, y); doc.setFont("helvetica", "normal"); const lineas = doc.splitTextToSize(value, 118); doc.text(lineas, 68, y); y += Math.max(8, lineas.length * 6); }
    doc.setFontSize(9); doc.text("Documento generado por GO USA NEXUS 2.0", 20, 282); doc.save(`${orden.numeroOrden}.pdf`);
  }

  return <div className="space-y-6 p-4 md:p-6">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><div className="flex items-center gap-2"><Plane className="h-6 w-6"/><h1 className="text-2xl font-bold tracking-tight">Servicios · Vuelos</h1></div><p className="mt-1 text-sm text-muted-foreground">Genera órdenes claras para cotización y controla cuáles ya fueron despachadas.</p></div><Button variant="outline" onClick={() => void cargarDatos()} disabled={loading}><RefreshCcw className="mr-2 h-4 w-4"/>Actualizar</Button></div>
    {error && <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
    {success && <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-700">{success}</div>}

    <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
      <Card className="h-fit"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Plus className="h-5 w-5"/>Nueva cotización</CardTitle></CardHeader><CardContent><form className="space-y-4" onSubmit={crearOrden}>
        <div className="space-y-2"><label className="text-sm font-medium">Cotizar para</label><div className="grid grid-cols-2 gap-2"><Button type="button" variant={form.tipoPersona === "PROSPECTO" ? "default" : "outline"} onClick={() => cambiarTipoPersona("PROSPECTO")}>Prospecto</Button><Button type="button" variant={form.tipoPersona === "CLIENTE" ? "default" : "outline"} onClick={() => cambiarTipoPersona("CLIENTE")}>Cliente</Button></div></div>
        <div className="space-y-1.5"><label className="text-sm font-medium" htmlFor="personaId">{form.tipoPersona === "CLIENTE" ? "Cliente" : "Prospecto"}</label><select id="personaId" value={form.personaId} onChange={(e) => setForm((p) => ({ ...p, personaId: e.target.value }))} className="h-10 w-full rounded-md border bg-background px-3 text-sm" required><option value="">Seleccionar {form.tipoPersona === "CLIENTE" ? "cliente" : "prospecto"}</option>{personas.map((p) => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos ?? ""} · {(form.tipoPersona === "CLIENTE" ? p.telefonoCelular : p.telefono) ?? "Sin teléfono"}</option>)}</select>{form.tipoPersona === "PROSPECTO" && <p className="text-xs text-muted-foreground">¿No aparece? <Link href="/prospectos" className="font-medium underline underline-offset-2">Registrar prospecto primero</Link></p>}</div>

        <div className="space-y-2"><label className="text-sm font-medium">Tipo de viaje</label><div className="grid grid-cols-3 gap-2">{(["SOLO_IDA", "IDA_VUELTA", "MULTIPLE"] as TipoViaje[]).map((tipo) => <Button key={tipo} type="button" variant={form.tipoViaje === tipo ? "default" : "outline"} className="h-auto min-h-10 whitespace-normal px-2 text-xs" onClick={() => cambiarTipoViaje(tipo)}>{nombreTipo(tipo)}</Button>)}</div></div>

        {form.tipoViaje !== "MULTIPLE" ? <>
          <div className="grid grid-cols-2 gap-3"><AirportPicker id="origen" label="Origen" value={form.origen} onChange={(origen) => setForm((p) => ({ ...p, origen }))} placeholder="La Paz o LPB" excludeIata={form.destino} required/><AirportPicker id="destino" label="Destino" value={form.destino} onChange={(destino) => setForm((p) => ({ ...p, destino }))} placeholder="Miami o MIA" excludeIata={form.origen} required/></div>
          <div className={`grid gap-3 ${form.tipoViaje === "IDA_VUELTA" ? "grid-cols-2" : "grid-cols-1"}`}><div className="space-y-1.5"><label className="text-sm font-medium" htmlFor="fechaIda">Ida</label><Input id="fechaIda" type="date" value={form.fechaIda} onChange={(e) => setForm((p) => ({ ...p, fechaIda: e.target.value }))} required/></div>{form.tipoViaje === "IDA_VUELTA" && <div className="space-y-1.5"><label className="text-sm font-medium" htmlFor="fechaRetorno">Retorno</label><Input id="fechaRetorno" type="date" min={form.fechaIda || undefined} value={form.fechaRetorno} onChange={(e) => setForm((p) => ({ ...p, fechaRetorno: e.target.value }))} required/></div>}</div>
        </> : <div className="space-y-3">{form.tramos.map((tramo, index) => <div key={`tramo-${index}`} className="rounded-lg border p-3"><div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold">Tramo {index + 1}</span>{form.tramos.length > 2 && <Button type="button" variant="ghost" size="sm" onClick={() => setForm((p) => ({ ...p, tramos: p.tramos.filter((_, i) => i !== index) }))}><Trash2 className="h-4 w-4"/></Button>}</div><div className="grid grid-cols-2 gap-3"><AirportPicker id={`origen-${index}`} label="Origen" value={tramo.origen} onChange={(origen) => actualizarTramo(index, { origen })} placeholder="Ciudad o IATA" excludeIata={tramo.destino} required/><AirportPicker id={`destino-${index}`} label="Destino" value={tramo.destino} onChange={(destino) => actualizarTramo(index, { destino })} placeholder="Ciudad o IATA" excludeIata={tramo.origen} required/></div><div className="mt-3 space-y-1.5"><label className="text-sm font-medium" htmlFor={`fecha-${index}`}>Fecha</label><Input id={`fecha-${index}`} type="date" min={index > 0 ? form.tramos[index - 1].fecha || undefined : undefined} value={tramo.fecha} onChange={(e) => actualizarTramo(index, { fecha: e.target.value })} required/></div></div>)}<Button type="button" variant="outline" className="w-full" onClick={() => setForm((p) => ({ ...p, tramos: [...p.tramos, nuevoTramo()] }))}><Plus className="mr-2 h-4 w-4"/>Agregar tramo</Button></div>}

        <div className="grid grid-cols-2 gap-3"><label className="flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm"><span><span className="block font-medium">Flexibilidad</span><span className="text-xs text-muted-foreground">±2 días</span></span><input type="checkbox" checked={form.flexibilidad} onChange={(e) => setForm((p) => ({ ...p, flexibilidad: e.target.checked }))} className="h-4 w-4"/></label><label className="flex cursor-pointer items-center justify-between rounded-lg border p-3 text-sm"><span><span className="block font-medium">Equipaje</span><span className="text-xs text-muted-foreground">Sí / No</span></span><input type="checkbox" checked={form.equipaje} onChange={(e) => setForm((p) => ({ ...p, equipaje: e.target.checked }))} className="h-4 w-4"/></label></div>
        <div className="space-y-1.5"><label className="text-sm font-medium" htmlFor="observaciones">Observaciones</label><textarea id="observaciones" value={form.observaciones} onChange={(e) => setForm((p) => ({ ...p, observaciones: e.target.value }))} placeholder="Opcional" rows={3} className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"/></div>
        <Button type="submit" className="w-full" disabled={saving}>{saving ? "Generando…" : "Generar orden de cotización"}</Button>
      </form></CardContent></Card>

      <Card><CardHeader className="space-y-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><CardTitle className="text-lg">Órdenes de cotización</CardTitle><div className="relative w-full md:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar orden, persona o ruta" className="pl-9"/></div></div><div className="flex flex-wrap gap-2">{(["PENDIENTE", "DESPACHADA", "TODAS"] as EstadoFiltro[]).map((estado) => <Button key={estado} type="button" size="sm" variant={filtro === estado ? "default" : "outline"} onClick={() => setFiltro(estado)}>{estado === "PENDIENTE" ? "Pendientes" : estado === "DESPACHADA" ? "Despachadas" : "Todas"}</Button>)}</div></CardHeader><CardContent>
        {loading ? <div className="py-12 text-center text-sm text-muted-foreground">Cargando órdenes…</div> : ordenesFiltradas.length === 0 ? <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">No hay órdenes en esta vista.</div> : <div className="space-y-3">{ordenesFiltradas.map((orden) => <div key={orden.id} className="rounded-xl border p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0 space-y-2"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{orden.numeroOrden}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${orden.estado === "PENDIENTE" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{orden.estado}</span><span className="rounded-full bg-muted px-2.5 py-1 text-xs">{orden.tipoPersona === "CLIENTE" ? "Cliente" : "Prospecto"}</span><span className="rounded-full bg-muted px-2.5 py-1 text-xs">{nombreTipo(orden.tipoViaje)}</span></div><div><p className="font-medium">{orden.personaNombre}</p><p className="text-xs text-muted-foreground">{orden.personaTelefono}</p></div>{orden.tipoViaje === "MULTIPLE" && orden.tramos?.length ? <div className="space-y-1 text-sm">{orden.tramos.map((t, i) => <p key={`${orden.id}-${i}`}><span className="text-muted-foreground">Tramo {i + 1}:</span> <strong>{t.origen} → {t.destino}</strong> · {formatoFecha(t.fecha)}</p>)}</div> : <div className="grid gap-1 text-sm sm:grid-cols-2 xl:grid-cols-3"><p><span className="text-muted-foreground">Ruta:</span> <strong>{orden.origen} → {orden.destino}</strong></p><p><span className="text-muted-foreground">Ida:</span> {formatoFecha(orden.fechaIda)}</p>{orden.tipoViaje === "IDA_VUELTA" && <p><span className="text-muted-foreground">Retorno:</span> {formatoFecha(orden.fechaRetorno)}</p>}</div>}<div className="grid gap-1 text-sm sm:grid-cols-2 xl:grid-cols-3"><p><span className="text-muted-foreground">Flexibilidad:</span> {orden.flexibilidad ? "Sí" : "No"}</p><p><span className="text-muted-foreground">Equipaje:</span> {orden.equipaje ? "Sí" : "No"}</p><p><span className="text-muted-foreground">Solicitado:</span> {formatoFechaHora(orden.createdAt)}</p></div>{orden.observaciones && <p className="text-sm"><span className="text-muted-foreground">Obs.:</span> {orden.observaciones}</p>}</div><div className="flex shrink-0 flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => descargarPdf(orden)}><FileDown className="mr-2 h-4 w-4"/>PDF</Button><Button size="sm" variant={orden.estado === "PENDIENTE" ? "default" : "outline"} onClick={() => void cambiarEstado(orden)}><CheckCircle2 className="mr-2 h-4 w-4"/>{orden.estado === "PENDIENTE" ? "Marcar despachada" : "Volver a pendiente"}</Button></div></div></div>)}</div>}
      </CardContent></Card>
    </div>
  </div>;
}
