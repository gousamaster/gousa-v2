import { CheckCircle2, CircleDot, Target, UsersRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

export async function DashboardProspectosMetricas() {
  const base = { deletedAt: null } as const;

  const [total, nuevos, seguimiento, convertidos] = await Promise.all([
    db.prospecto.count({ where: base }),
    db.prospecto.count({ where: { ...base, estado: "NUEVO", convertido: false } }),
    db.prospecto.count({
      where: {
        ...base,
        convertido: false,
        estado: { in: ["CONTACTADO", "CALIFICADO", "SEGUIMIENTO"] },
      },
    }),
    db.prospecto.count({ where: { ...base, convertido: true } }),
  ]);

  const tasaConversion = total > 0 ? Math.round((convertidos / total) * 100) : 0;

  const metricas = [
    { titulo: "Prospectos totales", valor: total, detalle: "Registrados en el CRM", icono: UsersRound },
    { titulo: "Nuevos", valor: nuevos, detalle: "Pendientes de primer contacto", icono: CircleDot },
    { titulo: "En gestión", valor: seguimiento, detalle: "Contactados, calificados o en seguimiento", icono: Target },
    { titulo: "Convertidos", valor: convertidos, detalle: `${tasaConversion}% de conversión acumulada`, icono: CheckCircle2 },
  ];

  return (
    <section className="px-8 pt-6">
      <div className="mb-3">
        <h2 className="text-lg font-semibold">Pulso comercial de prospectos</h2>
        <p className="text-sm text-muted-foreground">Estado actual del embudo antes de convertirse en clientes.</p>
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
