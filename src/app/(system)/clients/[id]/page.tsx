// src/app/(system)/clients/[id]/page.tsx

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClienteCitasTab } from "@/components/system/citas/cliente-citas-tab";
import { ClienteDocumentosTab } from "@/components/system/clientes/cliente-documentos-tab";
import { DescargaFichaButton } from "@/components/system/clientes/descarga-ficha-button";
import { ClienteMigratorioTab } from "@/components/system/clientes/cliente-migratorio-tab";
import { ClienteServiciosTab } from "@/components/system/tramites/cliente-servicios-tab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { obtenerClientePorId } from "@/lib/actions/clientes/clientes-actions";
import { auth } from "@/lib/auth";

interface ClientePerfilPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientePerfilPage({params}:ClientePerfilPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");
  const { id } = await params;
  const result = await obtenerClientePorId(id);
  if (!result.success || !result.data) redirect("/clients");
  const cliente = result.data;
  const tieneGrupoFamiliar = cliente.gruposFamiliares && cliente.gruposFamiliares.length > 0;

  return <div className="flex-1 space-y-6 p-8 pt-6">
    <div className="flex items-center justify-between">
      <div><h2 className="text-3xl font-bold tracking-tight">{cliente.nombres} {cliente.apellidos}</h2><p className="text-muted-foreground">{cliente.region?.nombre} · {cliente.tipoCliente === "ADULTO" ? "Adulto" : "Infante"}</p></div>
      <div className="flex items-center gap-2"><Button asChild variant="outline" size="sm"><Link href={`/clientes/${cliente.id}/nexus`}>GO USA NEXUS</Link></Button><DescargaFichaButton clienteId={cliente.id} nombreCliente={`${cliente.nombres} ${cliente.apellidos}`} tieneGrupoFamiliar={tieneGrupoFamiliar}/></div>
    </div>
    <Tabs defaultValue="servicios">
      <TabsList className="flex h-auto flex-wrap"><TabsTrigger value="migratorio">Migratorio</TabsTrigger><TabsTrigger value="servicios">Servicios y Trámites</TabsTrigger><TabsTrigger value="citas">Citas</TabsTrigger><TabsTrigger value="documentos">Documentos</TabsTrigger></TabsList>
      <TabsContent value="servicios" className="mt-4"><ClienteServiciosTab cliente={cliente}/></TabsContent>
      <TabsContent value="citas" className="mt-4"><ClienteCitasTab clienteId={cliente.id}/></TabsContent>
      <TabsContent value="migratorio" className="mt-4"><ClienteMigratorioTab clienteId={cliente.id} datosMigratorios={cliente.datosMigratorios}/></TabsContent>
      <TabsContent value="documentos" className="mt-4"><ClienteDocumentosTab clienteId={cliente.id}/></TabsContent>
    </Tabs>
  </div>;
}
