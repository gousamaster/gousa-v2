import {
  CheckCircle2,
  CircleDot,
  Gauge,
  ScanSearch,
  Target,
  UsersRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

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
  ]);

  const tasaConversion = total > 0 ? Math.round((convertidos / total) * 100) : 0;
  const scorePromedio = Math.round(scoreAggregate._avg.scorePreliminar ?? 0);

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

  return (
    <section className="px-8 pt-6">
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
    </section>
  );
}
