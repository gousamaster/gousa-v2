"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORIGENES_PROSPECTO, etiquetaOrigenProspecto, esOrigenProspecto } from "@/lib/prospectos/origenes";

type Prospecto = {
  id: string; nombres: string; apellidos: string | null; telefono: string; email: string | null;
  ciudad: string | null; pais: string | null; origen: string | null; origenDetalle?: string | null; interes: string | null;
  observaciones: string | null; estado: string; scorePreliminar: number | null; convertido: boolean;
  convertidoAt: string | null; createdAt: string; motivoPerdida?: string | null; perdidoAt?: string | null;
  primerContactoAt?: string | null;
  creadoPor?: { id: string; name: string; email: string } | null;
  convertidoPor?: { id: string; name: string; email: string } | null;
  cliente?: { id: string; nombres: string; apellidos: string } | null;
};
const estados = ["NUEVO", "CONTACTADO", "CALIFICADO", "SEGUIMIENTO", "PERDIDO"];

function formatDate(value?: string | null) {
  if (!value) return "Todavía no registrado";
  return new Date(value).toLocaleString("es-BO", { dateStyle: "medium", timeStyle: "short" });
}
function tiempoRespuesta(createdAt: string, primerContactoAt?: string | null) {
  if (!primerContactoAt) return "Pendiente";
  const minutos = Math.max(0, Math.round((new Date(primerContactoAt).getTime() - new Date(createdAt).getTime()) / 60000));
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.round((minutos / 60) * 10) / 10;
  if (horas < 24) return `${horas} h`;
  return `${Math.round((horas / 24) * 10) / 10} días`;
}

export function ProspectoDetalle({ prospectoId }: { prospectoId: string }) {
  const router = useRouter();
  const [prospecto, setProspecto] = useState<Prospecto | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [editing, setEditing] = useState(false); const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Prospecto | null>(null);

  useEffect(() => { (async () => {
    try { setLoading(true); setError("");
      const response = await fetch(`/api/prospectos/${prospectoId}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo cargar el prospecto");
      setProspecto(data.prospecto); setEditForm(data.prospecto);
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo cargar el prospecto"); } finally { setLoading(false); }
  })(); }, [prospectoId]);

  const updateField = (field: keyof Prospecto, value: string | number | null) => setEditForm(c => c ? { ...c, [field]: value } : c);
  const saveProspecto = async () => {
    if (!editForm) return;
    if (!editForm.nombres.trim() || !editForm.telefono.trim()) return setError("Nombre y teléfono son obligatorios");
    if (editForm.estado === "PERDIDO" && !editForm.motivoPerdida?.trim()) return setError("Indica el motivo de pérdida antes de guardar");
    try { setSaving(true); setError("");
      const response = await fetch(`/api/prospectos/${prospectoId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "No se pudo actualizar el prospecto");
      setProspecto(data.prospecto); setEditForm(data.prospecto); setEditing(false);
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo actualizar el prospecto"); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex-1 p-8 pt-6"><p className="text-sm text-muted-foreground">Cargando prospecto...</p></div>;
  if (error && !prospecto) return <div className="flex-1 space-y-4 p-8 pt-6"><Button variant="outline" onClick={() => router.push("/prospectos")}>Volver a prospectos</Button><p className="text-sm text-destructive">{error}</p></div>;
  if (!prospecto) return null;

  const origenLegacy = prospecto.origen && !esOrigenProspecto(prospecto.origen) ? prospecto.origen : null;

  return <div className="flex-1 space-y-6 p-8 pt-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><Button variant="outline" className="mb-4" onClick={() => router.push("/prospectos")}>Volver a prospectos</Button><h2 className="text-3xl font-bold tracking-tight">{prospecto.nombres} {prospecto.apellidos ?? ""}</h2><p className="text-muted-foreground">Perfil comercial del prospecto</p></div><div className="flex flex-wrap items-center gap-2">
      {!prospecto.convertido && !editing && prospecto.estado !== "PERDIDO" && <Button variant="outline" onClick={() => router.push(`/prospectos/${prospectoId}/convertir-cliente`)}>Convertir en cliente</Button>}
      {!prospecto.convertido && !editing && <Button onClick={() => { setEditForm(prospecto); setError(""); setEditing(true); }}>Editar prospecto</Button>}
      {prospecto.convertido && prospecto.cliente && <Button onClick={() => router.push(`/clients/${prospecto.cliente?.id}`)}>Abrir cliente</Button>}
      {editing && <><Button variant="outline" onClick={() => { setEditForm(prospecto); setError(""); setEditing(false); }} disabled={saving}>Cancelar</Button><Button onClick={saveProspecto} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button></>}
      <span className="rounded-full border px-3 py-1 text-sm">{prospecto.estado}</span>{prospecto.convertido && <span className="rounded-full border px-3 py-1 text-sm">CONVERTIDO</span>}
    </div></div>
    {error && <p className="text-sm text-destructive">{error}</p>}

    {!prospecto.convertido && prospecto.estado !== "PERDIDO" && !editing && <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Al convertir, NEXUS abrirá la ficha completa de Cliente con estos datos precargados. El prospecto solo cambiará a CONVERTIDO después de guardar correctamente el alta completa.</p></CardContent></Card>}

    {editing && editForm ? <Card><CardHeader><CardTitle>Editar prospecto</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2"><Label>Nombres *</Label><Input value={editForm.nombres} onChange={e => updateField("nombres", e.target.value)} /></div><div className="space-y-2"><Label>Apellidos</Label><Input value={editForm.apellidos ?? ""} onChange={e => updateField("apellidos", e.target.value)} /></div>
      <div className="space-y-2"><Label>Teléfono *</Label><Input value={editForm.telefono} onChange={e => updateField("telefono", e.target.value)} /></div><div className="space-y-2"><Label>Email</Label><Input value={editForm.email ?? ""} onChange={e => updateField("email", e.target.value)} /></div>
      <div className="space-y-2"><Label>Ciudad</Label><Input value={editForm.ciudad ?? ""} onChange={e => updateField("ciudad", e.target.value)} /></div><div className="space-y-2"><Label>País</Label><Input value={editForm.pais ?? ""} onChange={e => updateField("pais", e.target.value)} /></div>
      <div className="space-y-2"><Label>Fuente / origen</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.origen ?? ""} onChange={e => updateField("origen", e.target.value)}><option value="">Sin definir</option>{origenLegacy && <option value={origenLegacy}>{origenLegacy} (dato anterior)</option>}{ORIGENES_PROSPECTO.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
      <div className="space-y-2"><Label>Detalle de fuente</Label><Input value={editForm.origenDetalle ?? ""} onChange={e => updateField("origenDetalle", e.target.value)} placeholder="Referido, campaña o anuncio específico" /></div>
      <div className="space-y-2"><Label>Interés</Label><Input value={editForm.interes ?? ""} onChange={e => updateField("interes", e.target.value)} /></div>
      <div className="space-y-2"><Label>Etapa comercial</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.estado} onChange={e => updateField("estado", e.target.value)}>{estados.map(e => <option key={e}>{e}</option>)}</select></div><div className="space-y-2"><Label>Score preliminar (0-100)</Label><Input type="number" min={0} max={100} value={editForm.scorePreliminar ?? ""} onChange={e => updateField("scorePreliminar", e.target.value === "" ? null : Number(e.target.value))} /></div>
      {editForm.estado === "PERDIDO" && <div className="space-y-2 md:col-span-2"><Label>Motivo de pérdida *</Label><Textarea value={editForm.motivoPerdida ?? ""} onChange={e => updateField("motivoPerdida", e.target.value)} placeholder="Ej. No responde, precio, decidió no viajar, eligió otra agencia..." /><p className="text-xs text-muted-foreground">Obligatorio para cerrar un prospecto como perdido. Puede reabrirse cambiando nuevamente la etapa.</p></div>}
      <div className="space-y-2 md:col-span-2"><Label>Observaciones</Label><Textarea value={editForm.observaciones ?? ""} onChange={e => updateField("observaciones", e.target.value)} /></div>
    </CardContent></Card> : <div className="grid gap-6 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Datos de contacto</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><p className="text-muted-foreground">Teléfono</p><p className="font-medium">{prospecto.telefono}</p></div><div><p className="text-muted-foreground">Email</p><p className="font-medium">{prospecto.email || "Sin registrar"}</p></div><div><p className="text-muted-foreground">Ciudad</p><p className="font-medium">{prospecto.ciudad || "Sin registrar"}</p></div><div><p className="text-muted-foreground">País</p><p className="font-medium">{prospecto.pais || "Sin registrar"}</p></div></CardContent></Card>
      <Card><CardHeader><CardTitle>Información comercial</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><p className="text-muted-foreground">Fuente</p><p className="font-medium">{etiquetaOrigenProspecto(prospecto.origen)}</p>{prospecto.origenDetalle && <p className="text-xs text-muted-foreground">{prospecto.origenDetalle}</p>}</div><div><p className="text-muted-foreground">Interés</p><p className="font-medium">{prospecto.interes || "Sin definir"}</p></div><div><p className="text-muted-foreground">Score preliminar</p><p className="font-medium">{prospecto.scorePreliminar !== null ? `${prospecto.scorePreliminar}%` : "Todavía no evaluado"}</p></div><div><p className="text-muted-foreground">Etapa comercial</p><p className="font-medium">{prospecto.estado}</p></div>{prospecto.estado === "PERDIDO" && <div><p className="text-muted-foreground">Motivo de pérdida</p><p className="font-medium">{prospecto.motivoPerdida}</p></div>}</CardContent></Card>
      <Card><CardHeader><CardTitle>Velocidad de atención</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><p className="text-muted-foreground">Registrado</p><p className="font-medium">{formatDate(prospecto.createdAt)}</p></div><div><p className="text-muted-foreground">Primer contacto efectivo</p><p className="font-medium">{formatDate(prospecto.primerContactoAt)}</p></div><div><p className="text-muted-foreground">Tiempo al primer contacto</p><p className="font-medium">{tiempoRespuesta(prospecto.createdAt, prospecto.primerContactoAt)}</p></div></CardContent></Card>
      <Card><CardHeader><CardTitle>Trazabilidad</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><p className="text-muted-foreground">Prospecto registrado por</p><p className="font-medium">{prospecto.creadoPor?.name || "Sin identificar"}</p></div><div><p className="text-muted-foreground">Convertido por</p><p className="font-medium">{prospecto.convertidoPor?.name || "Todavía no convertido"}</p></div><div><p className="text-muted-foreground">Fecha de conversión</p><p className="font-medium">{formatDate(prospecto.convertidoAt)}</p></div></CardContent></Card>
    </div>}
  </div>;
}
