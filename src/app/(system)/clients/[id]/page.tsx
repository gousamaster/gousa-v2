// src/app/(system)/clients/[id]/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClienteCitasTab } from "@/components/system/citas/cliente-citas-tab";
import { ClienteDocumentosTab } from "@/components/system/clientes/cliente-documentos-tab";
import { ClienteCentroVisasTab } from "@/components/system/clientes/cliente-centro-visas-tab";
import { ClienteBitacoraTab } from "@/components/system/clientes/cliente-bitacora-tab";
import { ClienteEntradasUsaNexus } from "@/components/system/clientes/cliente-entradas-usa-nexus";
import { ClienteVisasChinaPrevias } from "@/components/system/clientes/cliente-visas-china-previas";
import { DescargaFichaButton } from "@/components/system/clientes/descarga-ficha-button";
import { ClienteMigratorioTab } from "@/components/system/clientes/cliente-migratorio-tab";
import { ClienteServiciosTab } from "@/components/system/tramites/cliente-servicios-tab";
import { ClienteVentaServicioPanel } from "@/components/system/tramites/cliente-venta-servicio-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { obtenerClientePorId } from "@/lib/actions/clientes/clientes-actions";
import { isActivacionVentas } from "@/lib/access-control";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { etiquetaOrigenProspecto } from "@/lib/prospectos/origenes";

interface ClientePerfilPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gestion?: string; tab?: string }>;
}

type OrigenComercialRow = {
  prospectoId: string;
  origen: string | null;
  score: number | null;
  interes: string | null;
  responsableNombre: string | null;
  creadoPorNombre: string | null;
  convertidoPorNombre: string | null;
  convertidoAt: Date | null;
};

export default async function ClientePerfilPage({ params, searchParams }: ClientePerfilPageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const [{ id }, { gestion, tab }, currentUser] = await Promise.all([
    params,
    searchParams,
    db.user.findUnique({ where: { id: session.user.id }, select: { role: true } }),
  ]);

  const [result, origenRows] = await Promise.all([
    obtenerClientePorId(id),
    db.$queryRaw<OrigenComercialRow[]>`
      SELECT p."id" AS "prospectoId", p."origen", p."scorePreliminar" AS "score", p."interes",
        responsable."name" AS "responsableNombre", creador."name" AS "creadoPorNombre",
        convertidor."name" AS "convertidoPorNombre", p."convertidoAt" AS "convertidoAt"
      FROM "prospecto" p
      LEFT JOIN "user" responsable ON responsable."id" = p."responsable_comercial_id"
      LEFT JOIN "user" creador ON creador."id" = p."creadoPorId"
      LEFT JOIN "user" convertidor ON convertidor."id" = p."convertidoPorId"
      WHERE p."clienteId" = ${id} AND p."deletedAt" IS NULL
      LIMIT 1
    `,
  ]);

  if (!result.success || !result.data) redirect("/clients");
  const cliente = result.data;
  const origenComercial = origenRows[0] ?? null;

  if (isActivacionVentas(currentUser?.role)) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div>
          <Button asChild variant="outline" className="mb-4">
            <Link href={origenComercial ? `/prospectos/${origenComercial.prospectoId}` : "/prospectos"}>
              Volver a Prospectos
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{cliente.nombres} {cliente.apellidos}</h2>
          <p className="text-muted-foreground">Alta comercial · acceso limitado de Activación / Ventas</p>
        </div>
        <ClienteVentaServicioPanel clienteId={cliente.id} regionId={cliente.regionId} />
      </div>
    );
  }

  const tieneGrupoFamiliar = cliente.gruposFamiliares && cliente.gruposFamiliares.length > 0;
  const tabsValidos = new Set(["migratorio", "servicios", "citas", "documentos", "centro-visas", "bitacora"]);
  const tabInicial = tab && tabsValidos.has(tab) ? tab : "servicios";

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{cliente.nombres} {cliente.apellidos}</h2>
          <p className="text-muted-foreground">{cliente.region?.nombre} · {cliente.tipoCliente === "ADULTO" ? "Adulto" : "Infante"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm"><Link href={`/clientes/${cliente.id}/nexus`}>GO USA NEXUS</Link></Button>
          <DescargaFichaButton clienteId={cliente.id} nombreCliente={`${cliente.nombres} ${cliente.apellidos}`} tieneGrupoFamiliar={tieneGrupoFamiliar} />
        </div>
      </div>

      {origenComercial && (
        <Card>
          <CardHeader><CardTitle className="text-base">Origen comercial NEXUS</CardTitle><p className="text-sm text-muted-foreground">Trazabilidad conservada desde el prospecto que originó este cliente.</p></CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-muted-foreground">Fuente</p><p className="font-medium">{etiquetaOrigenProspecto(origenComercial.origen)}</p></div>
            <div><p className="text-muted-foreground">Score NEXUS</p><p className="font-medium">{origenComercial.score == null ? "Sin evaluar" : `${origenComercial.score}%`}</p></div>
            <div><p className="text-muted-foreground">Responsable Comercial</p><p className="font-medium">{origenComercial.responsableNombre || "Sin responsable"}</p></div>
            <div><p className="text-muted-foreground">Interés inicial</p><p className="font-medium">{origenComercial.interes || "Sin definir"}</p></div>
            <div><p className="text-muted-foreground">Prospecto registrado por</p><p className="font-medium">{origenComercial.creadoPorNombre || "Sin identificar"}</p></div>
            <div><p className="text-muted-foreground">Conversión realizada por</p><p className="font-medium">{origenComercial.convertidoPorNombre || "Sin identificar"}</p></div>
            <div><p className="text-muted-foreground">Fecha de conversión</p><p className="font-medium">{origenComercial.convertidoAt ? origenComercial.convertidoAt.toLocaleString("es-BO", { dateStyle: "medium", timeStyle: "short" }) : "Sin registrar"}</p></div>
            <div><p className="text-muted-foreground">Prospecto origen</p><Button asChild variant="outline" size="sm" className="mt-1"><Link href={`/prospectos/${origenComercial.prospectoId}`}>Abrir prospecto</Link></Button></div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={tabInicial}>
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="migratorio">Migratorio</TabsTrigger><TabsTrigger value="servicios">Servicios y Trámites</TabsTrigger><TabsTrigger value="citas">Citas</TabsTrigger><TabsTrigger value="documentos">Documentos</TabsTrigger><TabsTrigger value="centro-visas">Centro de Visas</TabsTrigger><TabsTrigger value="bitacora">Bitácora</TabsTrigger>
        </TabsList>
        <TabsContent value="servicios" className="mt-4"><ClienteServiciosTab cliente={cliente} gestionId={gestion} /></TabsContent>
        <TabsContent value="citas" className="mt-4"><ClienteCitasTab clienteId={cliente.id} /></TabsContent>
        <TabsContent value="migratorio" className="mt-4"><div className="space-y-6"><ClienteMigratorioTab clienteId={cliente.id} datosMigratorios={cliente.datosMigratorios} /><ClienteVisasChinaPrevias clienteId={cliente.id} /><ClienteEntradasUsaNexus clienteId={cliente.id} /></div></TabsContent>
        <TabsContent value="documentos" className="mt-4"><ClienteDocumentosTab clienteId={cliente.id} /></TabsContent>
        <TabsContent value="centro-visas" className="mt-4"><ClienteCentroVisasTab clienteId={cliente.id} emailCliente={cliente.email} /></TabsContent>
        <TabsContent value="bitacora" className="mt-4"><ClienteBitacoraTab clienteId={cliente.id} /></TabsContent>
      </Tabs>
    </div>
  );
}
