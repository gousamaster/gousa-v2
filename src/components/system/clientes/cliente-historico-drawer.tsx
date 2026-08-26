"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { registrarClienteHistorico } from "@/lib/actions/clientes/cliente-historico-actions";

const SERVICIOS = [
  ["SOLICITUD_B1_B2", "Solicitud de Visa B1/B2"],
  ["RENOVACION_B1_B2", "Renovación de Visa B1/B2"],
  ["SOLICITUD_F1", "Solicitud de Visa F1"],
  ["SOLICITUD_J1", "Solicitud de Visa J1"],
  ["SOLICITUD_H", "Solicitud de Visa H"],
  ["ASESORIA_MIGRATORIA", "Asesoría Migratoria"],
  ["VISA_INMIGRANTE", "Solicitud de Visa Inmigrante"],
  ["COMPRA_SERVICIO", "Compra de Servicio"],
  ["OTRO", "Otro"],
] as const;

export function ClienteHistoricoDrawer({ open, onOpenChange, regiones, onSuccess }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regiones: Array<{ id: string; nombre: string }>;
  onSuccess: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombres: "", apellidos: "", fechaNacimiento: "", telefonoCelular: "", email: "", numeroPasaporte: "", regionId: "", servicioTomado: "", servicioOtro: "", fechaAprobacion: "", fechaVencimiento: "", aplicacion: "" });
  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const guardar = async () => {
    if (!form.nombres || !form.apellidos || !form.fechaNacimiento || !form.telefonoCelular || !form.regionId || !form.servicioTomado || !form.aplicacion) {
      toast.error("Completa los campos obligatorios"); return;
    }
    setSaving(true);
    const result = await registrarClienteHistorico({ ...form, aplicacion: form.aplicacion as "INDIVIDUAL" | "FAMILIAR" | "GRUPAL" });
    setSaving(false);
    if (!result.success) { toast.error(result.error || "No se pudo registrar"); return; }
    toast.success("Cliente histórico registrado correctamente");
    setForm({ nombres: "", apellidos: "", fechaNacimiento: "", telefonoCelular: "", email: "", numeroPasaporte: "", regionId: "", servicioTomado: "", servicioOtro: "", fechaAprobacion: "", fechaVencimiento: "", aplicacion: "" });
    onOpenChange(false); onSuccess();
  };

  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
      <SheetHeader><SheetTitle>Registrar Cliente Histórico</SheetTitle><SheetDescription>Cliente atendido antes de la puesta en marcha oficial de NEXUS. Se registra directamente como cliente, sin pasar por Prospectos.</SheetDescription></SheetHeader>
      <div className="grid gap-4 py-6 sm:grid-cols-2">
        <Field label="Nombre *"><Input value={form.nombres} onChange={(e)=>set("nombres",e.target.value)} /></Field>
        <Field label="Apellidos *"><Input value={form.apellidos} onChange={(e)=>set("apellidos",e.target.value)} /></Field>
        <Field label="Fecha de nacimiento *"><Input type="date" value={form.fechaNacimiento} onChange={(e)=>set("fechaNacimiento",e.target.value)} /></Field>
        <Field label="Número telefónico *"><Input value={form.telefonoCelular} onChange={(e)=>set("telefonoCelular",e.target.value)} /></Field>
        <Field label="Correo"><Input type="email" value={form.email} onChange={(e)=>set("email",e.target.value)} /></Field>
        <Field label="Número de pasaporte"><Input value={form.numeroPasaporte} onChange={(e)=>set("numeroPasaporte",e.target.value)} /></Field>
        <Field label="Región *"><Select value={form.regionId} onValueChange={(v)=>set("regionId",v)}><SelectTrigger><SelectValue placeholder="Seleccionar región" /></SelectTrigger><SelectContent>{regiones.map(r=><SelectItem key={r.id} value={r.id}>{r.nombre}</SelectItem>)}</SelectContent></Select></Field>
        <Field label="Servicio que tomó *"><Select value={form.servicioTomado} onValueChange={(v)=>set("servicioTomado",v)}><SelectTrigger><SelectValue placeholder="Seleccionar servicio" /></SelectTrigger><SelectContent>{SERVICIOS.map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></Field>
        {form.servicioTomado === "OTRO" && <div className="sm:col-span-2"><Field label="Detallar otro servicio *"><Input value={form.servicioOtro} onChange={(e)=>set("servicioOtro",e.target.value)} /></Field></div>}
        <Field label="Fecha de aprobación"><Input type="date" value={form.fechaAprobacion} onChange={(e)=>set("fechaAprobacion",e.target.value)} /></Field>
        <Field label="Fecha de vencimiento"><Input type="date" value={form.fechaVencimiento} onChange={(e)=>set("fechaVencimiento",e.target.value)} /></Field>
        <div className="sm:col-span-2"><Field label="Aplicación *"><Select value={form.aplicacion} onValueChange={(v)=>set("aplicacion",v)}><SelectTrigger><SelectValue placeholder="Individual, Familiar o Grupal" /></SelectTrigger><SelectContent><SelectItem value="INDIVIDUAL">Individual</SelectItem><SelectItem value="FAMILIAR">Familiar</SelectItem><SelectItem value="GRUPAL">Grupal</SelectItem></SelectContent></Select></Field></div>
      </div>
      <div className="mb-5 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">La región se solicita porque NEXUS la necesita para servicios y tarifas futuras. Este registro no reconstruye pagos, DS-160 ni citas antiguas.</div>
      <SheetFooter><Button variant="outline" onClick={()=>onOpenChange(false)}>Cancelar</Button><Button onClick={guardar} disabled={saving}>{saving ? "Registrando..." : "Registrar cliente histórico"}</Button></SheetFooter>
    </SheetContent>
  </Sheet>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-2"><Label>{label}</Label>{children}</div>; }
