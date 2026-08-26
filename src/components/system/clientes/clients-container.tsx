// src/components/system/clientes/clients-container.tsx

"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { obtenerTodasLasRegiones } from "@/lib/actions/catalogos/regiones-actions";
import { obtenerTodosLosClientes } from "@/lib/actions/clientes/clientes-actions";
import type { ClienteListItem } from "@/types/cliente-types";
import { ClientList } from "./client-list";
import { ClienteHistoricoDrawer } from "./cliente-historico-drawer";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={`skeleton-${i}`} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** Contenedor principal para el módulo de clientes. */
export function ClientsContainer() {
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoricoOpen, setIsHistoricoOpen] = useState(false);
  const [clientes, setClientes] = useState<ClienteListItem[]>([]);
  const [regiones, setRegiones] = useState<Array<{ id: string; nombre: string }>>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [clientesResult, regionesResult] = await Promise.all([
        obtenerTodosLosClientes(),
        obtenerTodasLasRegiones(),
      ]);
      setClientes(clientesResult.success && clientesResult.data ? clientesResult.data : []);
      setRegiones(regionesResult.success && regionesResult.data ? regionesResult.data : []);
    } catch (error) {
      console.error("Error loading clients data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-3xl font-bold tracking-tight">Clientes</h2><p className="text-muted-foreground">Gestiona los clientes y sus datos</p></div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground">Gestiona los clientes y sus datos</p>
        </div>
        <Button variant="outline" onClick={() => setIsHistoricoOpen(true)}>
          <History className="mr-2 h-4 w-4" /> Registrar Cliente Histórico
        </Button>
      </div>
      <ClientList initialClientes={clientes} regiones={regiones} onRefresh={loadData} />
      <ClienteHistoricoDrawer
        open={isHistoricoOpen}
        onOpenChange={setIsHistoricoOpen}
        regiones={regiones}
        onSuccess={loadData}
      />
    </div>
  );
}
