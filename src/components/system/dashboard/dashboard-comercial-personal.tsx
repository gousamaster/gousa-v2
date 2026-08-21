import { AlertTriangle, CheckCircle2, CircleDollarSign, Target, UserRoundCheck, UsersRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

type ProspectosRow = {
  total: bigint;
  activos: bigint;
  convertidos: bigint;
  altaPrioridad: bigint;
  perdidos: bigint;
};

type SeguimientosRow = {
  pendientes: bigint;
  vencidos: bigint;
  completados: bigint;
};

function numero(value: bigint | number | null | undefined) {
  return Number(value ?? 0);
}

function porcentaje(parte: number, total: number) {
  return total > 0 ? Math.round((parte / total) * 100) : 0;
}

export async function DashboardComercialPersonal({ userId, nombre }: { userId: string; nombre: string }) {
  const [prospectosRows, seguimientosRows, clientes, ingresosServicios, ingresosCitas] = await Promise.all([
    db.$queryRaw<ProspectosRow[]>`
      SELECT
        COUNT(*) AS "total",
        COUNT(*) FILTER (WHERE "convertido"=false AND "estado"<>'PERDIDO') AS "activos",
        COUNT(*) FILTER (WHERE "convertido"=true) AS "convertidos",
        COUNT(*) FILTER (WHERE "convertido"=false AND "estado"<>'PERDIDO' AND "scorePreliminar">=75) AS "altaPrioridad",
        COUNT(*) FILTER (WHERE "convertido"=false AND "estado"='PERDIDO') AS "perdidos"
      FROM "prospecto"
      WHERE "deletedAt" IS NULL
        AND ("responsable_comercial_id"=${userId} OR ("responsable_comercial_id" IS NULL AND "creadoPorId"=${userId}))
    `,
    db.$queryRaw<SeguimientosRow[]>`
      SELECT
        COUNT(*) FILTER (WHERE s."estado"='PENDIENTE' AND p."convertido"=false AND p."estado"<>'PERDIDO') AS "pendientes",
        COUNT(*) FILTER (WHERE s."estado"='PENDIENTE' AND s."programado_at"<CURRENT_TIMESTAMP AND p."convertido"=false AND p."estado"<>'PERDIDO') AS "vencidos",
        COUNT(*) FILTER (WHERE s."estado"='COMPLETADO') AS "completados"
      FROM "prospecto_seguimiento" s
      INNER JOIN "prospecto" p ON p."id"=s."prospecto_id"
      WHERE p."deletedAt" IS NULL AND s."responsable_id"=${userId}
    `,
    db.cliente.count({ where: { registradoPorId: userId, deletedAt: null } }),
    db.clienteServicio.aggregate({
      where: { deletedAt: null, cliente: { registradoPorId: userId } },
      _sum: { precioFinal: true },
    }),
    db.cita.aggregate({
      where: { creadaPorId: userId, deletedAt: null },
      _sum: { precioFinal: true },
    }),
  ]);

  const prospectos = prospectosRows[0];
  const seguimientos = seguimientosRows[0];
  const total = numero(prospectos?.total);
  const convertidos = numero(prospectos?.convertidos);
  const ingresos = Number(ingresosServicios._sum.precioFinal ?? 0) + Number(ingresosCitas._sum.precioFinal ?? 0);

  const metricas = [
    ["Mi cartera", total, "Prospectos bajo tu responsabilidad", UsersRound],
    ["Mis cierres", convertidos, `${porcentaje(convertidos, total)}% de conversión`, Target],
    ["Mis clientes", clientes, "Clientes registrados por ti", UserRoundCheck],
    ["Mis ventas", `${ingresos.toLocaleString("es-BO")} Bs.`, "Servicios y citas vinculados a tu gestión", CircleDollarSign],
    ["Activos", numero(prospectos?.activos), "Prospectos todavía en gestión", CheckCircle2],
    ["Prioridad alta", numero(prospectos?.altaPrioridad), "Activos con Score NEXUS de 75% o más", Target],
    ["Seguimientos pendientes", numero(seguimientos?.pendientes), "Acciones abiertas de prospectos activos", CheckCircle2],
    ["Vencidos", numero(seguimientos?.vencidos), "Acciones atrasadas de tu cartera activa", AlertTriangle],
  ] as const;

  return (
    <section className="space-y-6 px-8 pt-6">
      <div>
        <h2 className="text-lg font-semibold">Mi actividad comercial</h2>
        <p className="text-sm text-muted-foreground">
          {nombre}, aquí ves únicamente tus propios resultados. Los comparativos del equipo están restringidos a gerencia.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricas.map(([titulo, valor, detalle, Icono]) => (
          <Card key={titulo}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{titulo}</CardTitle>
              <Icono className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{valor}</div>
              <p className="mt-1 text-xs text-muted-foreground">{detalle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Mi seguimiento comercial</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Completados</p><p className="mt-1 text-2xl font-bold">{numero(seguimientos?.completados)}</p></div>
          <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Pendientes activos</p><p className="mt-1 text-2xl font-bold">{numero(seguimientos?.pendientes)}</p></div>
          <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Prospectos perdidos</p><p className="mt-1 text-2xl font-bold">{numero(prospectos?.perdidos)}</p></div>
        </CardContent>
      </Card>
    </section>
  );
}
