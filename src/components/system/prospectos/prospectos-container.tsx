"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ORIGENES_PROSPECTO, etiquetaOrigenProspecto } from "@/lib/prospectos/origenes";

type Responsable = { id: string; name: string; email: string };
type Prospecto = {
  id: string; nombres: string; apellidos: string | null; telefono: string; email: string | null;
  ciudad: string | null; pais: string | null; origen: string | null; interes: string | null;
  observaciones: string | null; estado: string; scorePreliminar: number | null; convertido: boolean;
  createdAt: string; creadoPor?: { id: string; name: string; email: string } | null;
  responsableActual?: { id: string | null; name: string | null; programadoAt: string } | null;
};

type Duplicado = {
  id: string;
  nombre: string;
  coincidencia: "TELEFONO" | "EMAIL" | "TELEFONO_EMAIL";
  convertido: boolean;
};

const initialForm = {
  nombres: "", apellidos: "", telefono: "", email: "", ciudad: "", pais: "Bolivia",
  origen: "", origenDetalle: "", interes: "", observaciones: "",
};

const ESTADOS = ["NUEVO", "CONTACTADO", "CALIFICADO", "SEGUIMIENTO", "CONVERTIDO", "PERDIDO"];

function prioridadScore(prospecto: Prospecto) {
  if (prospecto.convertido) return "CONVERTIDO";
  if (prospecto.scorePreliminar === null) return "SIN_EVALUAR";
  if (prospecto.scorePreliminar >= 75) return "ALTA";
  if (prospecto.scorePreliminar >= 50) return "MEDIA";
  return "BAJA";
}

function prioridadLabel(value: string) {
  const labels: Record<string, string> = {
    ALTA: "Prioridad alta", MEDIA: "Prioridad media", BAJA: "Prioridad baja",
    SIN_EVALUAR: "Sin evaluar", CONVERTIDO: "Convertido",
  };
  return labels[value] ?? value;
}

function normalizarBusqueda(value: string) {
  return value.trim().toLocaleLowerCase("es");
}

export function ProspectosContainer() {
  const router = useRouter();
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [duplicado, setDuplicado] = useState<Duplicado | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroPrioridad, setFiltroPrioridad] = useState("TODOS");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [filtroOrigen, setFiltroOrigen] = useState("TODOS");
  const [filtroResponsable, setFiltroResponsable] = useState("TODOS");

  const loadProspectos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/prospectos", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudieron cargar los prospectos");
      setProspectos(data.prospectos ?? []);
      setResponsables(data.responsables ?? []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los prospectos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProspectos(); }, []);

  const prospectosFiltrados = useMemo(() => {
    const termino = normalizarBusqueda(busqueda);
    const lista = prospectos.filter((prospecto) => {
      if (filtroPrioridad !== "TODOS" && prioridadScore(prospecto) !== filtroPrioridad) return false;
      if (filtroEstado !== "TODOS" && prospecto.estado !== filtroEstado) return false;
      if (filtroOrigen !== "TODOS" && (prospecto.origen ?? "SIN_ORIGEN") !== filtroOrigen) return false;
      if (filtroResponsable === "SIN_ASIGNAR" && prospecto.responsableActual?.id) return false;
      if (filtroResponsable !== "TODOS" && filtroResponsable !== "SIN_ASIGNAR" && prospecto.responsableActual?.id !== filtroResponsable) return false;

      if (!termino) return true;
      const texto = [
        prospecto.nombres,
        prospecto.apellidos,
        prospecto.telefono,
        prospecto.email,
        prospecto.ciudad,
        prospecto.interes,
        prospecto.creadoPor?.name,
        prospecto.responsableActual?.name,
      ].filter(Boolean).join(" ").toLocaleLowerCase("es");
      return texto.includes(termino);
    });

    const activos = lista.filter((p) => !p.convertido);
    const convertidos = lista.filter((p) => p.convertido);
    const ordenar = (items: Prospecto[]) => [...items].sort((a, b) => {
      const sa = a.scorePreliminar ?? -1;
      const sb = b.scorePreliminar ?? -1;
      if (sa !== sb) return sb - sa;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return [...ordenar(activos), ...ordenar(convertidos)];
  }, [prospectos, busqueda, filtroPrioridad, filtroEstado, filtroOrigen, filtroResponsable]);

  const hayFiltros = Boolean(
    busqueda || filtroPrioridad !== "TODOS" || filtroEstado !== "TODOS" ||
    filtroOrigen !== "TODOS" || filtroResponsable !== "TODOS",
  );

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroPrioridad("TODOS");
    setFiltroEstado("TODOS");
    setFiltroOrigen("TODOS");
    setFiltroResponsable("TODOS");
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setDuplicado(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setDuplicado(null);
    if (!form.nombres.trim() || !form.telefono.trim()) return setError("Nombre y teléfono son obligatorios");

    try {
      setSaving(true);
      const response = await fetch("/api/prospectos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409 && data.code === "PROSPECTO_DUPLICADO" && data.duplicado) {
          setDuplicado(data.duplicado);
          setError(data.error || "Ya existe un prospecto con esos datos.");
          return;
        }
        throw new Error(data.error || "No se pudo crear el prospecto");
      }
      setForm(initialForm);
      setShowForm(false);
      await loadProspectos();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo crear el prospecto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Prospectos</h2>
          <p className="text-muted-foreground">Registra, evalúa, filtra y prioriza oportunidades comerciales antes de convertirlas en clientes.</p>
        </div>
        <Button onClick={() => { setShowForm((v) => !v); setDuplicado(null); setError(""); }}>
          {showForm ? "Cancelar" : "Nuevo prospecto"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nuevo prospecto</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="nombres">Nombres *</Label><Input id="nombres" name="nombres" value={form.nombres} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="apellidos">Apellidos</Label><Input id="apellidos" name="apellidos" value={form.apellidos} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="telefono">Teléfono *</Label><Input id="telefono" name="telefono" value={form.telefono} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={form.email} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="ciudad">Ciudad</Label><Input id="ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="pais">País</Label><Input id="pais" name="pais" value={form.pais} onChange={handleChange} /></div>
              <div className="space-y-2">
                <Label htmlFor="origen">Fuente / origen</Label>
                <select id="origen" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.origen} onChange={(e) => { setForm((c) => ({ ...c, origen: e.target.value })); setDuplicado(null); }}>
                  <option value="">Selecciona una fuente</option>
                  {ORIGENES_PROSPECTO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label htmlFor="origenDetalle">Detalle de fuente</Label><Input id="origenDetalle" name="origenDetalle" placeholder="Ej. referido por Ana, campaña Agosto, anuncio Meta..." value={form.origenDetalle} onChange={handleChange} /></div>
              <div className="space-y-2"><Label htmlFor="interes">Interés</Label><Input id="interes" name="interes" placeholder="Visa turista, estudiante..." value={form.interes} onChange={handleChange} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="observaciones">Observaciones</Label><Textarea id="observaciones" name="observaciones" value={form.observaciones} onChange={handleChange} /></div>
              {error && (
                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm text-destructive">{error}</p>
                  {duplicado && (
                    <div className="rounded-lg border p-3 text-sm">
                      <p className="font-medium">Posible duplicado detectado: {duplicado.nombre}</p>
                      <p className="mt-1 text-muted-foreground">Coincidencia por {duplicado.coincidencia === "TELEFONO_EMAIL" ? "teléfono y email" : duplicado.coincidencia === "TELEFONO" ? "teléfono" : "email"}{duplicado.convertido ? ". Este registro ya fue convertido en cliente." : "."}</p>
                      <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => router.push(`/prospectos/${duplicado.id}`)}>Abrir prospecto existente</Button>
                    </div>
                  )}
                </div>
              )}
              <div className="md:col-span-2"><Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar prospecto"}</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="gap-4">
          <div>
            <CardTitle>Bandeja comercial</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Busca por nombre, teléfono, email, ciudad o interés y combina filtros para encontrar rápidamente qué prospectos requieren atención.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-1.5 xl:col-span-2">
              <Label htmlFor="buscarProspecto">Buscar</Label>
              <Input id="buscarProspecto" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre, teléfono, email, ciudad, interés..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filtroEstado">Etapa</Label>
              <select id="filtroEstado" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="TODOS">Todas</option>
                {ESTADOS.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filtroOrigen">Fuente</Label>
              <select id="filtroOrigen" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={filtroOrigen} onChange={(e) => setFiltroOrigen(e.target.value)}>
                <option value="TODOS">Todas</option>
                <option value="SIN_ORIGEN">Sin fuente</option>
                {ORIGENES_PROSPECTO.map((origen) => <option key={origen.value} value={origen.value}>{origen.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filtroResponsable">Responsable</Label>
              <select id="filtroResponsable" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={filtroResponsable} onChange={(e) => setFiltroResponsable(e.target.value)}>
                <option value="TODOS">Todos</option>
                <option value="SIN_ASIGNAR">Sin seguimiento asignado</option>
                {responsables.map((responsable) => <option key={responsable.id} value={responsable.id}>{responsable.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[["TODOS", "Todos"], ["ALTA", "Alta"], ["MEDIA", "Media"], ["BAJA", "Baja"], ["SIN_EVALUAR", "Sin evaluar"], ["CONVERTIDO", "Convertidos"]].map(([value, label]) => (
              <Button key={value} type="button" size="sm" variant={filtroPrioridad === value ? "default" : "outline"} onClick={() => setFiltroPrioridad(value)}>{label}</Button>
            ))}
            {hayFiltros && <Button type="button" size="sm" variant="ghost" onClick={limpiarFiltros}>Limpiar filtros</Button>}
            <span className="ml-auto text-sm text-muted-foreground">{prospectosFiltrados.length} de {prospectos.length} prospectos</span>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando prospectos...</p>
          ) : prospectosFiltrados.length === 0 ? (
            <p className="text-sm text-muted-foreground">{prospectos.length === 0 ? "Todavía no hay prospectos registrados." : "No hay prospectos que coincidan con los filtros seleccionados."}</p>
          ) : (
            <div className="space-y-3">
              {prospectosFiltrados.map((prospecto) => {
                const prioridad = prioridadScore(prospecto);
                return (
                  <div key={prospecto.id} onClick={() => router.push(`/prospectos/${prospecto.id}`)} className="flex cursor-pointer flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">{prospecto.nombres} {prospecto.apellidos ?? ""}</p>
                      <p className="text-sm text-muted-foreground">{prospecto.telefono}{prospecto.email ? ` · ${prospecto.email}` : ""}</p>
                      <p className="text-sm text-muted-foreground">Interés: {prospecto.interes || "Sin definir"} · Fuente: {etiquetaOrigenProspecto(prospecto.origen)}</p>
                      <p className="text-xs text-muted-foreground">Registrado por: {prospecto.creadoPor?.name || "Sin identificar"}</p>
                      <p className="text-xs text-muted-foreground">Responsable actual: {prospecto.responsableActual?.name || "Sin seguimiento asignado"}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm md:justify-end">
                      {prospecto.scorePreliminar !== null ? <span className="rounded-full border px-3 py-1 font-medium">Score {prospecto.scorePreliminar}%</span> : <span className="rounded-full border border-dashed px-3 py-1 text-muted-foreground">Score pendiente</span>}
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
