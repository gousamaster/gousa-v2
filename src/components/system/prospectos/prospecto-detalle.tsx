"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  convertidoAt: string | null;
  createdAt: string;
  creadoPor?: { id: string; name: string; email: string } | null;
  convertidoPor?: { id: string; name: string; email: string } | null;
  cliente?: { id: string; nombres: string; apellidos: string } | null;
};

type Region = {
  id: string;
  nombre: string;
  codigo: string;
};

const estados = ["NUEVO", "CONTACTADO", "CALIFICADO", "SEGUIMIENTO", "DESCARTADO"];

export function ProspectoDetalle({ prospectoId }: { prospectoId: string }) {
  const router = useRouter();
  const [prospecto, setProspecto] = useState<Prospecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Prospecto | null>(null);
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [showConvert, setShowConvert] = useState(false);
  const [regionId, setRegionId] = useState("");
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        const [prospectoResponse, regionesResponse] = await Promise.all([
          fetch(`/api/prospectos/${prospectoId}`, { cache: "no-store" }),
          fetch("/api/regiones", { cache: "no-store" }),
        ]);
        const prospectoData = await prospectoResponse.json();
        const regionesData = await regionesResponse.json();
        if (!prospectoResponse.ok) throw new Error(prospectoData.error || "No se pudo cargar el prospecto");
        if (!regionesResponse.ok) throw new Error(regionesData.error || "No se pudieron cargar las regiones");
        setProspecto(prospectoData.prospecto);
        setEditForm(prospectoData.prospecto);
        setRegiones(regionesData.regiones ?? []);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "No se pudo cargar el prospecto");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [prospectoId]);

  const startEditing = () => {
    setEditForm(prospecto);
    setShowConvert(false);
    setError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditForm(prospecto);
    setError("");
    setEditing(false);
  };

  const updateField = (field: keyof Prospecto, value: string | number | null) => {
    setEditForm((current) => current ? { ...current, [field]: value } : current);
  };

  const saveProspecto = async () => {
    if (!editForm) return;
    if (!editForm.nombres.trim() || !editForm.telefono.trim()) {
      setError("Nombre y teléfono son obligatorios");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const response = await fetch(`/api/prospectos/${prospectoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres: editForm.nombres,
          apellidos: editForm.apellidos ?? "",
          telefono: editForm.telefono,
          email: editForm.email ?? "",
          ciudad: editForm.ciudad ?? "",
          pais: editForm.pais ?? "",
          origen: editForm.origen ?? "",
          interes: editForm.interes ?? "",
          observaciones: editForm.observaciones ?? "",
          estado: editForm.estado,
          scorePreliminar: editForm.scorePreliminar,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo actualizar el prospecto");
      setProspecto(data.prospecto);
      setEditForm(data.prospecto);
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo actualizar el prospecto");
    } finally {
      setSaving(false);
    }
  };

  const convertProspecto = async () => {
    if (!regionId) {
      setError("Selecciona la región del cliente antes de convertirlo");
      return;
    }
    try {
      setConverting(true);
      setError("");
      const response = await fetch(`/api/prospectos/${prospectoId}/convertir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regionId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo convertir el prospecto");
      setProspecto(data.prospecto);
      setEditForm(data.prospecto);
      setShowConvert(false);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo convertir el prospecto");
    } finally {
      setConverting(false);
    }
  };

  if (loading) return <div className="flex-1 p-8 pt-6"><p className="text-sm text-muted-foreground">Cargando prospecto...</p></div>;

  if (error && !prospecto) {
    return <div className="flex-1 space-y-4 p-8 pt-6"><Button variant="outline" onClick={() => router.push("/prospectos")}>Volver a prospectos</Button><p className="text-sm text-destructive">{error}</p></div>;
  }

  if (!prospecto) return null;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button variant="outline" className="mb-4" onClick={() => router.push("/prospectos")}>Volver a prospectos</Button>
          <h2 className="text-3xl font-bold tracking-tight">{prospecto.nombres} {prospecto.apellidos ?? ""}</h2>
          <p className="text-muted-foreground">Perfil comercial del prospecto</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!prospecto.convertido && !editing && <Button variant="outline" onClick={() => { setShowConvert((value) => !value); setError(""); }}>Convertir en cliente</Button>}
          {!prospecto.convertido && !editing && <Button onClick={startEditing}>Editar prospecto</Button>}
          {prospecto.convertido && prospecto.cliente && <Button onClick={() => router.push(`/clientes/${prospecto.cliente?.id}`)}>Abrir cliente</Button>}
          {editing && <><Button variant="outline" onClick={cancelEditing} disabled={saving}>Cancelar</Button><Button onClick={saveProspecto} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</Button></>}
          <span className="rounded-full border px-3 py-1 text-sm">{prospecto.estado}</span>
          {prospecto.convertido && <span className="rounded-full border px-3 py-1 text-sm">CONVERTIDO</span>}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showConvert && !prospecto.convertido && (
        <Card>
          <CardHeader><CardTitle>Convertir prospecto en cliente</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">NEXUS copiará nombre, teléfono, email y país al nuevo cliente. La persona que realice esta acción quedará registrada como responsable de la conversión.</p>
            <div className="max-w-md space-y-2">
              <Label>Región del cliente *</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={regionId} onChange={(e) => setRegionId(e.target.value)}>
                <option value="">Selecciona una región</option>
                {regiones.map((region) => <option key={region.id} value={region.id}>{region.nombre}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowConvert(false)} disabled={converting}>Cancelar</Button>
              <Button onClick={convertProspecto} disabled={converting || !regionId}>{converting ? "Convirtiendo..." : "Confirmar conversión"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {editing && editForm ? (
        <Card>
          <CardHeader><CardTitle>Editar prospecto</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Nombres *</Label><Input value={editForm.nombres} onChange={(e) => updateField("nombres", e.target.value)} /></div>
            <div className="space-y-2"><Label>Apellidos</Label><Input value={editForm.apellidos ?? ""} onChange={(e) => updateField("apellidos", e.target.value)} /></div>
            <div className="space-y-2"><Label>Teléfono *</Label><Input value={editForm.telefono} onChange={(e) => updateField("telefono", e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={editForm.email ?? ""} onChange={(e) => updateField("email", e.target.value)} /></div>
            <div className="space-y-2"><Label>Ciudad</Label><Input value={editForm.ciudad ?? ""} onChange={(e) => updateField("ciudad", e.target.value)} /></div>
            <div className="space-y-2"><Label>País</Label><Input value={editForm.pais ?? ""} onChange={(e) => updateField("pais", e.target.value)} /></div>
            <div className="space-y-2"><Label>Origen</Label><Input value={editForm.origen ?? ""} onChange={(e) => updateField("origen", e.target.value)} /></div>
            <div className="space-y-2"><Label>Interés</Label><Input value={editForm.interes ?? ""} onChange={(e) => updateField("interes", e.target.value)} /></div>
            <div className="space-y-2"><Label>Estado</Label><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.estado} onChange={(e) => updateField("estado", e.target.value)}>{estados.map((estado) => <option key={estado} value={estado}>{estado}</option>)}</select></div>
            <div className="space-y-2"><Label>Score preliminar (0-100)</Label><Input type="number" min={0} max={100} value={editForm.scorePreliminar ?? ""} onChange={(e) => updateField("scorePreliminar", e.target.value === "" ? null : Number(e.target.value))} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Observaciones</Label><Textarea value={editForm.observaciones ?? ""} onChange={(e) => updateField("observaciones", e.target.value)} /></div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>Datos de contacto</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><p className="text-muted-foreground">Teléfono</p><p className="font-medium">{prospecto.telefono}</p></div><div><p className="text-muted-foreground">Email</p><p className="font-medium">{prospecto.email || "Sin registrar"}</p></div><div><p className="text-muted-foreground">Ciudad</p><p className="font-medium">{prospecto.ciudad || "Sin registrar"}</p></div><div><p className="text-muted-foreground">País</p><p className="font-medium">{prospecto.pais || "Sin registrar"}</p></div></CardContent></Card>
          <Card><CardHeader><CardTitle>Información comercial</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><p className="text-muted-foreground">Origen</p><p className="font-medium">{prospecto.origen || "Sin definir"}</p></div><div><p className="text-muted-foreground">Interés</p><p className="font-medium">{prospecto.interes || "Sin definir"}</p></div><div><p className="text-muted-foreground">Score preliminar</p><p className="font-medium">{prospecto.scorePreliminar !== null ? `${prospecto.scorePreliminar}%` : "Todavía no evaluado"}</p></div><div><p className="text-muted-foreground">Estado</p><p className="font-medium">{prospecto.estado}</p></div></CardContent></Card>
          <Card><CardHeader><CardTitle>Trazabilidad</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div><p className="text-muted-foreground">Prospecto registrado por</p><p className="font-medium">{prospecto.creadoPor?.name || "Sin identificar"}</p></div><div><p className="text-muted-foreground">Convertido por</p><p className="font-medium">{prospecto.convertidoPor?.name || "Todavía no convertido"}</p></div><div><p className="text-muted-foreground">Cliente vinculado</p><p className="font-medium">{prospecto.cliente ? `${prospecto.cliente.nombres} ${prospecto.cliente.apellidos}` : "Todavía no existe cliente"}</p></div></CardContent></Card>
          <Card><CardHeader><CardTitle>Observaciones</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap text-sm">{prospecto.observaciones || "No hay observaciones registradas."}</p></CardContent></Card>
        </div>
      )}
    </div>
  );
}
