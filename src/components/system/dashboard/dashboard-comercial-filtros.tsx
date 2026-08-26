"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ORIGENES_PROSPECTO } from "@/lib/prospectos/origenes";

type Responsable = { id: string; name: string };
type Periodo = "MES_ACTUAL" | "MES_ANTERIOR" | "TRIMESTRE_ACTUAL" | "TRIMESTRE_ANTERIOR";

export function DashboardComercialFiltros({ responsables }: { responsables: Responsable[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [periodo, setPeriodo] = useState<Periodo>((searchParams.get("periodo") as Periodo) || "MES_ACTUAL");
  const [responsable, setResponsable] = useState(searchParams.get("responsable") ?? "TODOS");
  const [fuente, setFuente] = useState(searchParams.get("fuente") ?? "TODAS");

  const aplicar = () => {
    const params = new URLSearchParams();
    params.set("periodo", periodo);
    if (responsable !== "TODOS") params.set("responsable", responsable);
    if (fuente !== "TODAS") params.set("fuente", fuente);
    router.push(`/dashboard-comercial?${params.toString()}`);
  };

  const limpiar = () => {
    setPeriodo("MES_ACTUAL");
    setResponsable("TODOS");
    setFuente("TODAS");
    router.push("/dashboard-comercial?periodo=MES_ACTUAL");
  };

  return (
    <div className="px-8 pt-6">
      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2 xl:grid-cols-6">
          <div className="space-y-1.5 xl:col-span-2">
            <Label htmlFor="comercialPeriodo">Período visible</Label>
            <select id="comercialPeriodo" value={periodo} onChange={(e) => setPeriodo(e.target.value as Periodo)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="MES_ACTUAL">Mes actual</option>
              <option value="MES_ANTERIOR">Mes anterior</option>
              <option value="TRIMESTRE_ACTUAL">Trimestre actual</option>
              <option value="TRIMESTRE_ANTERIOR">Trimestre anterior</option>
            </select>
            <p className="text-xs text-muted-foreground">NEXUS muestra como máximo un trimestre; el histórico permanece guardado.</p>
          </div>
          <div className="space-y-1.5 xl:col-span-2">
            <Label htmlFor="comercialResponsable">Responsable Comercial</Label>
            <select id="comercialResponsable" value={responsable} onChange={(e) => setResponsable(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="TODOS">Todos los responsables</option>
              <option value="SIN_ASIGNAR">Sin responsable</option>
              {responsables.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 xl:col-span-2">
            <Label htmlFor="comercialFuente">Fuente / origen</Label>
            <select id="comercialFuente" value={fuente} onChange={(e) => setFuente(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="TODAS">Todas las fuentes</option>
              <option value="SIN_DEFINIR">Sin definir</option>
              {ORIGENES_PROSPECTO.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 md:col-span-2 xl:col-span-6">
            <Button type="button" onClick={aplicar}>Aplicar filtros</Button>
            <Button type="button" variant="outline" onClick={limpiar}>Volver a mes actual</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
