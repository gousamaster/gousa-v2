import { AlertTriangle, CheckCircle2, Clock3, Target, UserRoundCheck, UsersRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

type EquipoRow = {
  id: string;
  nombre: string;
  prospectos: bigint;
  convertidos: bigint;
  activos: bigint;
  altaPrioridad: bigint;
  pendientes: bigint;
  vencidos: bigint;
  completados: bigint;
};

type TotalesRow = {
  gestionados: bigint;
  convertidos: bigint;
  seguimientos: bigint;
  completados: bigint;
  vencidos: bigint;
};

function numero(value: bigint | number | null | undefined) {
  return Number(value ?? 0);
}

function porcentaje(parte: number, total: number) {
  return total > 0 ? Math.round((parte / total) * 100) : 0;
}

export async function DashboardProspectosEquipo() {
  const [equipo, totalesRows] = await Promise.all([
    db.$queryRaw<EquipoRow[]>`
      SELECT
        u."id",
        u."name" AS "nombre",
        COUNT(DISTINCT p."id") AS "prospectos",
        COUNT(DISTINCT p."id") FILTER (WHERE p."convertido"=true) AS "convertidos",
        COUNT(DISTINCT p."id") FILTER (WHERE p."convertido"=false AND p."estado"<>'PERDIDO') AS "activos",
        COUNT(DISTINCT p."id") FILTER (WHERE p."convertido"=false AND p."scorePreliminar">=75) AS "altaPrioridad",
        COUNT(DISTINCT s."id") FILTER (WHERE s."estado"='PENDIENTE') AS "pendientes",
        COUNT(DISTINCT s."id") FILTER (WHERE s."estado"='PENDIENTE' AND s."programado_at"<CURRENT_TIMESTAMP) AS "vencidos",
        COUNT(DISTINCT s."id") FILTER (WHERE s."estado"='COMPLETADO') AS "completados"
      FROM "user" u
      LEFT JOIN "prospecto" p
        ON COALESCE(p."responsable_comercial_id", p."creadoPorId")=u."id" AND p."deletedAt" IS NULL
      LEFT JOIN "prospecto_seguimiento" s
        ON s."responsable_id"=u."id"
      WHERE u."status"='ACTIVE'
        AND (p."id" IS NOT NULL OR s."id" IS NOT NULL)
      GROUP BY u."id",u."name"
      ORDER BY "convertidos" DESC,"prospectos" DESC,"nombre" ASC
      LIMIT 12
    `,
    db.$queryRaw<TotalesRow[]>`
      SELECT
        (SELECT COUNT(*) FROM "prospecto" p WHERE p."deletedAt" IS NULL) AS "gestionados",
        (SELECT COUNT(*) FROM "prospecto" p WHERE p."deletedAt" IS NULL AND p."convertido"=true) AS "convertidos",
        (SELECT COUNT(*) FROM "prospecto_seguimiento" s INNER JOIN "prospecto" p ON p."id"=s."prospecto_id" WHERE p."deletedAt" IS NULL) AS "seguimientos",
        (SELECT COUNT(*) FROM "prospecto_seguimiento" s INNER JOIN "prospecto" p ON p."id"=s."prospecto_id" WHERE p."deletedAt" IS NULL AND s."estado"='COMPLETADO') AS "completados",
        (SELECT COUNT(*) FROM "prospecto_seguimiento" s INNER JOIN "prospecto" p ON p."id"=s."prospecto_id" WHERE p."deletedAt" IS NULL AND s."estado"='PENDIENTE' AND s."programado_at"<CURRENT_TIMESTAMP) AS "vencidos"
    `,
  ]);

  const totales = totalesRows[0];
  const gestionados = numero(totales?.gestionados);
  const convertidos = numero(totales?.convertidos);
  const seguimientos = numero(totales?.seguimientos);
  const completados = numero(totales?.completados);
  const vencidos = numero(totales?.vencidos);
  const tasaConversion = porcentaje(convertidos, gestionados);
  const cumplimiento = porcentaje(completados, seguimientos);

  const resumen = [
    ["Prospectos gestionados", gestionados, "Cartera comercial acumulada", UsersRound],
    ["Conversiones", convertidos, `${tasaConversion}% de conversión`, Target],
    ["Seguimientos completados", completados, `${cumplimiento}% del total registrado`, CheckCircle2],
    ["Seguimientos vencidos", vencidos, vencidos > 0 ? "Requieren acción del equipo" : "Equipo al día", AlertTriangle],
  ] as const;

  return (
    <section className="space-y-4 px-8 pt-6">
      <div>
        <h2 className="text-lg font-semibold">Gestión comercial por responsable</h2>
        <p className="text-sm text-muted-foreground">
          Conversión, cartera y disciplina de seguimiento para dirección.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {resumen.map(([titulo, valor, detalle, Icono]) => (
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
        <CardHeader>
          <CardTitle className="text-base">Productividad comercial del equipo</CardTitle>
          <p className="text-sm text-muted-foreground">
            La cartera se atribuye al Responsable Comercial formal; los seguimientos, al usuario asignado a cada acción.
          </p>
        </CardHeader>
        <CardContent>
          {equipo.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay actividad comercial atribuible al equipo.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-3 font-medium">Responsable</th>
                    <th className="pb-3 text-right font-medium">Cartera</th>
                    <th className="pb-3 text-right font-medium">Activos</th>
                    <th className="pb-3 text-right font-medium">Alta prioridad</th>
                    <th className="pb-3 text-right font-medium">Convertidos</th>
                    <th className="pb-3 text-right font-medium">Conversión</th>
                    <th className="pb-3 text-right font-medium">Pendientes</th>
                    <th className="pb-3 text-right font-medium">Vencidos</th>
                    <th className="pb-3 text-right font-medium">Completados</th>
                  </tr>
                </thead>
                <tbody>
                  {equipo.map((item) => {
                    const cartera = numero(item.prospectos);
                    const conversiones = numero(item.convertidos);
                    const itemVencidos = numero(item.vencidos);
                    return (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-3 font-medium"><span className="inline-flex items-center gap-2"><UserRoundCheck className="h-4 w-4 text-muted-foreground" />{item.nombre}</span></td>
                        <td className="py-3 text-right">{cartera}</td>
                        <td className="py-3 text-right">{numero(item.activos)}</td>
                        <td className="py-3 text-right">{numero(item.altaPrioridad)}</td>
                        <td className="py-3 text-right font-semibold">{conversiones}</td>
                        <td className="py-3 text-right">{porcentaje(conversiones, cartera)}%</td>
                        <td className="py-3 text-right">{numero(item.pendientes)}</td>
                        <td className={`py-3 text-right font-medium ${itemVencidos > 0 ? "text-destructive" : ""}`}>{itemVencidos}</td>
                        <td className="py-3 text-right">{numero(item.completados)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            Los vencidos se calculan en tiempo real contra la próxima acción pendiente registrada.
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
