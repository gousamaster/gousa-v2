// src/components/system/settings/settings-container.tsx

"use client";

import {
  Building2,
  CircleDollarSign,
  FileText,
  MapPin,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  obtenerTodasLasRegiones,
  obtenerTodosLosEstadosPago,
  obtenerTodosLosEstadosTramite,
  obtenerTodosLosParentescos,
  obtenerTodosLosServicios,
  obtenerTodosLosTiposCita,
} from "@/lib/actions/catalogos";
import type {
  EstadoPagoListItem,
  EstadoTramiteListItem,
  ParentescoListItem,
  RegionListItem,
  ServicioListItem,
  TipoCitaListItem,
} from "@/types/catalogo-types";
import { EstadoPagoList } from "./estados-pago/estado-pago-list";
import { EstadoTramiteList } from "./estados-tramite/estado-tramite-list";
import { ParentescoList } from "./parentescos/parentesco-list";
import { RegionList } from "./regiones/region-list";
import { ServicioList } from "./servicios/servicio-list";
import { TipoCitaList } from "./tipos-cita/tipo-cita-list";

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
            {[...Array(5)].map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: Static skeleton items
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SettingsContainer() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("regiones");
  const [regiones, setRegiones] = useState<RegionListItem[]>([]);
  const [servicios, setServicios] = useState<ServicioListItem[]>([]);
  const [tiposCita, setTiposCita] = useState<TipoCitaListItem[]>([]);
  const [estadosTramite, setEstadosTramite] = useState<EstadoTramiteListItem[]>(
    [],
  );
  const [estadosPago, setEstadosPago] = useState<EstadoPagoListItem[]>([]);
  const [parentescos, setParentescos] = useState<ParentescoListItem[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [
        regionesResult,
        serviciosResult,
        tiposCitaResult,
        estadosTramiteResult,
        estadosPagoResult,
        parentescosResult,
      ] = await Promise.all([
        obtenerTodasLasRegiones(),
        obtenerTodosLosServicios(),
        obtenerTodosLosTiposCita(),
        obtenerTodosLosEstadosTramite(),
        obtenerTodosLosEstadosPago(),
        obtenerTodosLosParentescos(),
      ]);

      setRegiones(
        regionesResult.success && regionesResult.data
          ? regionesResult.data
          : [],
      );
      setServicios(
        serviciosResult.success && serviciosResult.data
          ? serviciosResult.data
          : [],
      );
      setTiposCita(
        tiposCitaResult.success && tiposCitaResult.data
          ? tiposCitaResult.data
          : [],
      );
      setEstadosTramite(
        estadosTramiteResult.success && estadosTramiteResult.data
          ? estadosTramiteResult.data
          : [],
      );
      setEstadosPago(
        estadosPagoResult.success && estadosPagoResult.data
          ? estadosPagoResult.data
          : [],
      );
      setParentescos(
        parentescosResult.success && parentescosResult.data
          ? parentescosResult.data
          : [],
      );
    } catch (error) {
      console.error("Error loading catalog data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadData should only run on mount
  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Configuración del Sistema
            </h2>
            <p className="text-muted-foreground">
              Gestiona los catálogos y configuraciones base del sistema
            </p>
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
          <h2 className="text-3xl font-bold tracking-tight">
            Configuración del Sistema
          </h2>
          <p className="text-muted-foreground">
            Gestiona los catálogos y configuraciones base del sistema
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="regiones" className="gap-2">
            <MapPin className="h-4 w-4" />
            Regiones
          </TabsTrigger>
          <TabsTrigger value="servicios" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Servicios
          </TabsTrigger>
          <TabsTrigger value="tipos-cita" className="gap-2">
            <Building2 className="h-4 w-4" />
            Tipos de Cita
          </TabsTrigger>
          <TabsTrigger value="estados-tramite" className="gap-2">
            <FileText className="h-4 w-4" />
            Estados Trámite
          </TabsTrigger>
          <TabsTrigger value="estados-pago" className="gap-2">
            <CircleDollarSign className="h-4 w-4" />
            Estados Pago
          </TabsTrigger>
          <TabsTrigger value="parentescos" className="gap-2">
            <Users className="h-4 w-4" />
            Parentescos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regiones" className="space-y-6">
          <RegionList initialRegiones={regiones} onRefresh={loadData} />
        </TabsContent>

        <TabsContent value="servicios" className="space-y-6">
          <ServicioList
            initialServicios={servicios}
            regiones={regiones}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="tipos-cita" className="space-y-6">
          <TipoCitaList
            initialTiposCita={tiposCita}
            regiones={regiones}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="estados-tramite" className="space-y-6">
          <EstadoTramiteList
            initialEstadosTramite={estadosTramite}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="estados-pago" className="space-y-6">
          <EstadoPagoList
            initialEstadosPago={estadosPago}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="parentescos" className="space-y-6">
          <ParentescoList
            initialParentescos={parentescos}
            onRefresh={loadData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
