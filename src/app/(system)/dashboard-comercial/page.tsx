import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardAccesosComerciales } from "@/components/system/dashboard/dashboard-accesos-comerciales";
import { DashboardComercialFiltros } from "@/components/system/dashboard/dashboard-comercial-filtros";
import { DashboardComercialPersonal } from "@/components/system/dashboard/dashboard-comercial-personal";
import { DashboardComercialVistaFiltrada } from "@/components/system/dashboard/dashboard-comercial-vista-filtrada";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const ROLES_GLOBALES = new Set(["SUPER_ADMIN", "MANAGER"]);
const PERIODOS = new Set(["MES_ACTUAL", "MES_ANTERIOR", "TRIMESTRE_ACTUAL", "TRIMESTRE_ANTERIOR"]);

type SearchParams = Record<string, string | string[] | undefined>;

function valor(params: SearchParams, key: string) {
  const item = params[key];
  return typeof item === "string" ? item.trim() : "";
}

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function rangoPeriodo(periodo: string) {
  const hoy = new Date();
  hoy.setHours(12, 0, 0, 0);
  if (periodo === "MES_ANTERIOR") {
    const desde = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1, 12);
    const hasta = new Date(hoy.getFullYear(), hoy.getMonth(), 0, 12);
    return { desde: ymd(desde), hasta: ymd(hasta) };
  }
  if (periodo === "TRIMESTRE_ACTUAL") {
    const inicioMes = Math.floor(hoy.getMonth() / 3) * 3;
    return { desde: ymd(new Date(hoy.getFullYear(), inicioMes, 1, 12)), hasta: ymd(hoy) };
  }
  if (periodo === "TRIMESTRE_ANTERIOR") {
    const inicioMesActual = Math.floor(hoy.getMonth() / 3) * 3;
    const fin = new Date(hoy.getFullYear(), inicioMesActual, 0, 12);
    const inicio = new Date(fin.getFullYear(), fin.getMonth() - 2, 1, 12);
    return { desde: ymd(inicio), hasta: ymd(fin) };
  }
  return { desde: ymd(new Date(hoy.getFullYear(), hoy.getMonth(), 1, 12)), hasta: ymd(hoy) };
}

export default async function DashboardComercialPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/sign-in");

  const rol = session.user.role ?? "USER";
  const accesoGlobal = ROLES_GLOBALES.has(rol);
  const params = (await searchParams) ?? {};
  const periodoSolicitado = valor(params, "periodo");
  const periodo = PERIODOS.has(periodoSolicitado) ? periodoSolicitado : "MES_ACTUAL";
  const rango = rangoPeriodo(periodo);

  if (!accesoGlobal) {
    return (
      <div className="flex-1">
        <div className="px-8 pt-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Comercial</h1>
          <p className="text-muted-foreground">Tu gestión comercial NEXUS. Las métricas económicas se visualizan por período operativo, conservando todo el histórico.</p>
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
    desde: rango.desde,
    hasta: rango.hasta,
    responsable: valor(params, "responsable") || undefined,
    fuente: valor(params, "fuente") || undefined,
  };

  return (
    <div className="flex-1">
      <div className="px-8 pt-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Comercial</h1>
        <p className="text-muted-foreground">Dirección comercial NEXUS · vista operativa mensual o trimestral. El histórico anterior permanece conservado.</p>
      </div>
      <DashboardComercialFiltros responsables={responsables} />
      <DashboardAccesosComerciales />
      <DashboardComercialVistaFiltrada filtros={filtros} />
    </div>
  );
}
