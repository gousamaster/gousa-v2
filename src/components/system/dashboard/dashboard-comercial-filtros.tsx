"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ORIGENES_PROSPECTO } from "@/lib/prospectos/origenes";

type Responsable = { id: string; name: string };

export function DashboardComercialFiltros({ responsables }: { responsables: Responsable[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [desde, setDesde] = useState(searchParams.get("desde") ?? "");
  const [hasta, setHasta] = useState(searchParams.get("hasta") ?? "");
  const [responsable, setResponsable] = useState(searchParams.get("responsable") ?? "TODOS");
  const [fuente, setFuente] = useState(searchParams.get("fuente") ?? "TODAS");

  const aplicar = () => {
    const params = new URLSearchParams();
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);
    if (responsable !== "TODOS") params.set("responsable", responsable);
    if (fuente !== "TODAS") params.set("fuente", fuente);
    const query = params.toString();
    router.push(query ? `/dashboard-comercial?${query}` : "/dashboard-comercial");
  };

  const limpiar = () => {
    setDesde("");
    setHasta("");
    setResponsable("TODOS");
    setFuente("TODAS");
    router.push("/dashboard-comercial");
  };

  return (
    <div className="px-8 pt-6">
      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2 xl:grid-cols-6">
          <div className="space-y-1.5">
            <Label htmlFor="comercialDesde">Desde</Label>
            <input id="comercialDesde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="comercialHasta">Hasta</Label>
            <input id="comercialHasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
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
            <Button type="button" variant="outline" onClick={limpiar}>Limpiar filtros</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
