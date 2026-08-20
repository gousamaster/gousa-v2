import Link from "next/link";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Clock3,
  Gauge,
  ScanSearch,
  Target,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

type SeguimientoMetricasRow = {
  pendientes: bigint;
  vencidos: bigint;
  proximas24h: bigint;
};

type AtencionRow = {
  id: string;
  nombres: string;
  apellidos: string | null;
  score: number | null;
  accion: string | null;
  programadoAt: Date | null;
  vencido: boolean;
};

function numero(value: bigint | number | null | undefined) {
  return Number(value ?? 0);
}

function formatDate(value: Date | null) {
  if (!value) return "Sin próxima acción";
  return new Date(value).toLocaleString("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function DashboardProspectosMetricas() {
  const base = { deletedAt: null } as const;
  const activos = { ...base, convertido: false } as const;

  const [
    total,
    nuevos,
    seguimiento,
    convertidos,
    evaluados,
    sinEvaluar,
    altaPrioridad,
    scoreAggregate,
    seguimientoRows,
    altaSinSeguimientoRows,
    atencion,
  ] = await Promise.all([
    db.prospecto.count({ where: base }),
    db.prospecto.count({ where: { ...activos, estado: "NUEVO" } }),
    db.prospecto.count({
      where: {
        ...activos,
        estado: { in: ["CONTACTADO", "CALIFICADO", "SEGUIMIENTO"] },
      },
    }),
    db.prospecto.count({ where: { ...base, convertido: true } }),
    db.prospecto.count({
      where: {
        ...activos,
        scorePreliminar: { not: null },
      },
    }),
    db.prospecto.count({
      where: {
        ...activos,
        scorePreliminar: null,
      },
    }),
    db.prospecto.count({
      where: {
        ...activos,
        scorePreliminar: { gte: 75 },
      },
    }),
    db.prospecto.aggregate({
      where: {
        ...activos,
        scorePreliminar: { not: null },
      },
      _avg: { scorePreliminar: true },
    }),
    db.$queryRaw<SeguimientoMetricasRow[]>`
      SELECT
        COUNT(*) FILTER (WHERE s."estado" = 'PENDIENTE') AS "pendientes",
        COUNT(*) FILTER (
          WHERE s."estado" = 'PENDIENTE'
            AND s."programado_at" < CURRENT_TIMESTAMP
        ) AS "vencidos",
        COUNT(*) FILTER (
          WHERE s."estado" = 'PENDIENTE'
            AND s."programado_at" >= CURRENT_TIMESTAMP
            AND s."programado_at" < CURRENT_TIMESTAMP + INTERVAL '24 hours'
        ) AS "proximas24h"
      FROM "prospecto_seguimiento" s
      INNER JOIN "prospecto" p ON p."id" = s."prospecto_id"
      WHERE p."deletedAt" IS NULL
        AND p."convertido" = false
    `,
    db.$queryRaw<{ total: bigint }[]>`
      SELECT COUNT(*) AS "total"
      FROM "prospecto" p
      WHERE p."deletedAt" IS NULL
        AND p."convertido" = false
        AND p."scorePreliminar" >= 75
        AND NOT EXISTS (
          SELECT 1
          FROM "prospecto_seguimiento" s
          WHERE s."prospecto_id" = p."id"
            AND s."estado" = 'PENDIENTE'
        )
    `,
    db.$queryRaw<AtencionRow[]>`
      SELECT
        p."id" AS "id",
        p."nombres" AS "nombres",
        p."apellidos" AS "apellidos",
        p."scorePreliminar" AS "score",
        prox."accion" AS "accion",
        prox."programadoAt" AS "programadoAt",
        CASE
          WHEN prox."programadoAt" IS NOT NULL
            AND prox."programadoAt" < CURRENT_TIMESTAMP
          THEN true
          ELSE false
        END AS "vencido"
      FROM "prospecto" p
      LEFT JOIN LATERAL (
        SELECT
          s."accion" AS "accion",
          s."programado_at" AS "programadoAt"
        FROM "prospecto_seguimiento" s
        WHERE s."prospecto_id" = p."id"
          AND s."estado" = 'PENDIENTE'
        ORDER BY s."programado_at" ASC
        LIMIT 1
      ) prox ON true
      WHERE p."deletedAt" IS NULL
        AND p."convertido" = false
        AND (
          (prox."programadoAt" IS NOT NULL AND prox."programadoAt" < CURRENT_TIMESTAMP)
          OR p."scorePreliminar" >= 75
        )
      ORDER BY
        CASE
          WHEN prox."programadoAt" IS NOT NULL AND prox."programadoAt" < CURRENT_TIMESTAMP
          THEN 0 ELSE 1
        END,
        p."scorePreliminar" DESC NULLS LAST,
        prox."programadoAt" ASC NULLS LAST
      LIMIT 6
    `,
  ]);

  const tasaConversion = total > 0 ? Math.round((convertidos / total) * 100) : 0;
  const scorePromedio = Math.round(scoreAggregate._avg.scorePreliminar ?? 0);
  const seguimientoMetricas = seguimientoRows[0];
  const pendientes = numero(seguimientoMetricas?.pendientes);
  const vencidos = numero(seguimientoMetricas?.vencidos);
  const proximas24h = numero(seguimientoMetricas?.proximas24h);
  const altaSinSeguimiento = numero(altaSinSeguimientoRows[0]?.total);

  const metricas = [
    {
      titulo: "Prospectos totales",
      valor: total,
      detalle: "Registrados en el CRM",
      icono: UsersRound,
    },
    {
      titulo: "Nuevos",
      valor: nuevos,
      detalle: "Pendientes de primer contacto",
      icono: CircleDot,
    },
    {
      titulo: "En gestión",
      valor: seguimiento,
      detalle: "Contactados, calificados o en seguimiento",
      icono: Target,
    },
    {
      titulo: "Convertidos",
      valor: convertidos,
      detalle: `${tasaConversion}% de conversión acumulada`,
      icono: CheckCircle2,
    },
    {
      titulo: "Score promedio",
      valor: evaluados > 0 ? `${scorePromedio}%` : "—",
      detalle: `${evaluados} prospecto${evaluados === 1 ? "" : "s"} evaluado${evaluados === 1 ? "" : "s"}`,
      icono: Gauge,
    },
    {
      titulo: "Prioridad alta",
      valor: altaPrioridad,
      detalle: "Score NEXUS de 75% o más",
      icono: Target,
    },
    {
      titulo: "Sin evaluar",
      valor: sinEvaluar,
      detalle: "Prospectos activos sin Score NEXUS",
      icono: ScanSearch,
    },
  ];

  const operativas = [
    {
      titulo: "Seguimientos pendientes",
      valor: pendientes,
      detalle: "Acciones abiertas en el embudo",
      icono: CalendarClock,
    },
    {
      titulo: "Seguimientos vencidos",
      valor: vencidos,
      detalle: vencidos > 0 ? "Requieren atención inmediata" : "Sin atrasos registrados",
      icono: AlertTriangle,
    },
    {
      titulo: "Próximas 24 horas",
      valor: proximas24h,
      detalle: "Contactos programados próximamente",
      icono: Clock3,
    },
    {
      titulo: "Alta sin seguimiento",
      valor: altaSinSeguimiento,
      detalle: "Score ≥75 sin próxima acción pendiente",
      icono: UserRoundCheck,
    },
  ];

  return (
    <section className="space-y-6 px-8 pt-6">
      <div>
        <div className="mb-3">
          <h2 className="text-lg font-semibold">Pulso comercial de prospectos</h2>
          <p className="text-sm text-muted-foreground">
            Estado del embudo, cobertura de evaluación y prioridad comercial NEXUS.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricas.map(({ titulo, valor, detalle, icono: Icono }) => (
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
      </div>

      <div>
        <div className="mb-3">
          <h2 className="text-lg font-semibold">Agenda comercial NEXUS</h2>
          <p className="text-sm text-muted-foreground">
            Lo que el equipo debe atender para que ningún prospecto se enfríe.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {operativas.map(({ titulo, valor, detalle, icono: Icono }) => (
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Atención prioritaria</CardTitle>
          <p className="text-sm text-muted-foreground">
            Primero vencidos; después prospectos de prioridad alta que requieren gestión.
          </p>
        </CardHeader>
        <CardContent>
          {atencion.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay prospectos urgentes en este momento.
            </p>
          ) : (
            <div className="space-y-2">
              {atencion.map((item) => (
                <Link
                  key={item.id}
                  href={`/prospectos/${item.id}`}
                  className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        {item.nombres} {item.apellidos ?? ""}
                      </p>
                      {item.score !== null && (
                        <span className="rounded-full border px-2 py-0.5 text-xs">
                          Score {item.score}%
                        </span>
                      )}
                      {item.vencido && (
                        <span className="text-xs font-medium text-destructive">VENCIDO</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.accion || "Prioridad alta sin seguimiento pendiente"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.programadoAt)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
