import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardAccesosComerciales } from "@/components/system/dashboard/dashboard-accesos-comerciales";
import { DashboardComercialFiltros } from "@/components/system/dashboard/dashboard-comercial-filtros";
import { DashboardComercialPersonal } from "@/components/system/dashboard/dashboard-comercial-personal";
import { DashboardComercialVistaFiltrada } from "@/components/system/dashboard/dashboard-comercial-vista-filtrada";
import { DashboardProspectosEquipo } from "@/components/system/dashboard/dashboard-prospectos-equipo";
import { DashboardProspectosMetricas } from "@/components/system/dashboard/dashboard-prospectos-metricas";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const ROLES_GLOBALES = new Set(["SUPER_ADMIN", "MANAGER"]);

type SearchParams = Record<string, string | string[] | undefined>;

function valor(params: SearchParams, key: string) {
  const item = params[key];
  return typeof item === "string" ? item.trim() : "";
}

export default async function DashboardComercialPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) redirect("/sign-in");

  const rol = session.user.role ?? "USER";
  const accesoGlobal = ROLES_GLOBALES.has(rol);
  const params = (await searchParams) ?? {};

  if (!accesoGlobal) {
    return (
      <div className="flex-1">
        <div className="px-8 pt-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Comercial</h1>
          <p className="text-muted-foreground">Tu gestión comercial NEXUS: cartera, cierres, clientes, ventas y seguimientos personales.</p>
        </div>
        <DashboardComercialPersonal userId={session.user.id} nombre={session.user.name} />
      </div>
    );
  }

  const responsables = await db.user.findMany({
    where: { status: "ACTIVE", banned: { not: true } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const filtros = {
    desde: valor(params, "desde") || undefined,
    hasta: valor(params, "hasta") || undefined,
    responsable: valor(params, "responsable") || undefined,
    fuente: valor(params, "fuente") || undefined,
  };
  const hayFiltros = Boolean(filtros.desde || filtros.hasta || filtros.responsable || filtros.fuente);

  return (
    <div className="flex-1">
      <div className="px-8 pt-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Comercial</h1>
        <p className="text-muted-foreground">Dirección comercial NEXUS: prospectos, embudo, conversión, fuentes, seguimiento y desempeño del equipo.</p>
      </div>

      <DashboardComercialFiltros responsables={responsables} />

      {hayFiltros ? (
        <DashboardComercialVistaFiltrada filtros={filtros} />
      ) : (
        <>
          <DashboardAccesosComerciales />
          <DashboardProspectosMetricas />
          <DashboardProspectosEquipo />
        </>
      )}
    </div>
  );
}
