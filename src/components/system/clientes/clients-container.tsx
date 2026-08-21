"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { obtenerTodasLasRegiones } from "@/lib/actions/catalogos/regiones-actions";
import {
  obtenerClientesParaGestionComercial,
  type ClienteGestionComercial,
} from "@/lib/actions/prospectos/prospecto-cliente-actions";
import { ClientList } from "./client-list";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-4 h-10 w-full" />
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

export function ClientsContainer() {
  const [isLoading, setIsLoading] = useState(true);
  const [clientes, setClientes] = useState<ClienteGestionComercial[]>([]);
  const [regiones, setRegiones] = useState<Array<{ id: string; nombre: string }>>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [clientesResult, regionesResult] = await Promise.all([
        obtenerClientesParaGestionComercial(),
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

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
            <p className="text-muted-foreground">Gestiona los clientes y sus datos</p>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
          <p className="text-muted-foreground">Gestiona clientes y detecta registros que todavía no contrataron un servicio.</p>
        </div>
      </div>
      <ClientList initialClientes={clientes} regiones={regiones} onRefresh={loadData} />
    </div>
  );
}
