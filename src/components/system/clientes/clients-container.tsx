"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { obtenerTodasLasRegiones } from "@/lib/actions/catalogos/regiones-actions";
import {
  obtenerClientesParaGestionComercial,
  type ClienteGestionComercial,
} from "@/lib/actions/prospectos/prospecto-cliente-actions";
import { obtenerClientesConServicioHistoricoConfirmado } from "@/lib/actions/clientes/saneamiento-clientes-actions";
import { ClientList } from "./client-list";
import { AfiliadosPanel } from "./afiliados-panel";

function LoadingSkeleton() {
  return <div className="space-y-6"><Card><CardHeader className="pb-2"><Skeleton className="h-6 w-48" /></CardHeader><CardContent><Skeleton className="mb-4 h-10 w-full" /><div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={`skeleton-${i}`} className="h-16 w-full" />)}</div></CardContent></Card></div>;
}

export function ClientsContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const seccion = searchParams.get("seccion");
  const mostrandoAfiliados = seccion === "afiliados";
  const [isLoading, setIsLoading] = useState(true);
  const [clientes, setClientes] = useState<ClienteGestionComercial[]>([]);
  const [regiones, setRegiones] = useState<Array<{ id: string; nombre: string }>>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [clientesResult, regionesResult, historicosResult] = await Promise.all([
        obtenerClientesParaGestionComercial(),
        obtenerTodasLasRegiones(),
        obtenerClientesConServicioHistoricoConfirmado(),
      ]);
      const historicos = new Set(historicosResult.success && historicosResult.data ? historicosResult.data : []);
      setClientes(clientesResult.success && clientesResult.data ? clientesResult.data.map((c) => ({ ...c, servicioHistoricoConfirmado: historicos.has(c.id), sinServicio: c.sinServicio && !historicos.has(c.id) })) : []);
      setRegiones(regionesResult.success && regionesResult.data ? regionesResult.data : []);
    } catch (error) {
      console.error("Error loading clients data:", error);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { void loadData(); }, []);

  if (isLoading) return <div className="flex-1 space-y-6 p-8 pt-6"><div><h2 className="text-3xl font-bold tracking-tight">Clientes</h2><p className="text-muted-foreground">Gestiona los clientes y sus datos</p></div><LoadingSkeleton /></div>;

  if (mostrandoAfiliados) {
    return <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-3xl font-bold tracking-tight">Clientes Afiliados</h2><p className="text-muted-foreground">Separa claramente los clientes plenamente afiliados de quienes todavía están pendientes de afiliación.</p></div><Button variant="outline" onClick={()=>router.push("/clients")}><ArrowLeft className="mr-2 h-4 w-4"/>Volver a Clientes</Button></div>
      <AfiliadosPanel clientes={clientes} />
    </div>;
  }

  return <div className="flex-1 space-y-6 p-8 pt-6"><div><h2 className="text-3xl font-bold tracking-tight">Clientes</h2><p className="text-muted-foreground">Gestiona clientes, históricos e inactivos. Los afiliados se consultan desde su acceso específico.</p></div><ClientList initialClientes={clientes} regiones={regiones} onRefresh={loadData} /></div>;
}
