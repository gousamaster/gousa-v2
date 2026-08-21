import { Prisma } from "@prisma/client";
import { AlertTriangle, CheckCircle2, Gauge, Target, UsersRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { etiquetaOrigenProspecto } from "@/lib/prospectos/origenes";

type Filtros = { desde?: string; hasta?: string; responsable?: string; fuente?: string };
type ResumenRow = { total: bigint; activos: bigint; convertidos: bigint; perdidos: bigint; altaPrioridad: bigint; scorePromedio: number | null };
type EstadoRow = { estado: string; total: bigint };
type FuenteRow = { origen: string; total: bigint; convertidos: bigint };
type EquipoRow = { id: string; nombre: string; total: bigint; activos: bigint; convertidos: bigint; perdidos: bigint };

function n(value: bigint | number | null | undefined) { return Number(value ?? 0); }
function pct(parte: number, total: number) { return total > 0 ? Math.round((parte / total) * 100) : 0; }
function fechaValida(value?: string) { if (!value) return null; const date = new Date(`${value}T00:00:00`); return Number.isNaN(date.getTime()) ? null : date; }

export async function DashboardComercialVistaFiltrada({ filtros }: { filtros: Filtros }) {
  const condiciones: Prisma.Sql[] = [Prisma.sql`p."deletedAt" IS NULL`];
  const desde = fechaValida(filtros.desde);
  const hastaBase = fechaValida(filtros.hasta);
  if (desde) condiciones.push(Prisma.sql`p."createdAt" >= ${desde}`);
  if (hastaBase) { const hasta = new Date(hastaBase); hasta.setDate(hasta.getDate() + 1); condiciones.push(Prisma.sql`p."createdAt" < ${hasta}`); }
  if (filtros.responsable === "SIN_ASIGNAR") condiciones.push(Prisma.sql`p."responsable_comercial_id" IS NULL`);
  else if (filtros.responsable) condiciones.push(Prisma.sql`p."responsable_comercial_id" = ${filtros.responsable}`);
  if (filtros.fuente === "SIN_DEFINIR") condiciones.push(Prisma.sql`(p."origen" IS NULL OR TRIM(p."origen")='')`);
  else if (filtros.fuente === "META") condiciones.push(Prisma.sql`UPPER(TRIM(COALESCE(p."origen",''))) IN ('META','FACEBOOK','INSTAGRAM')`);
  else if (filtros.fuente) condiciones.push(Prisma.sql`UPPER(TRIM(COALESCE(p."origen",''))) = ${filtros.fuente.toUpperCase()}`);
  const where = Prisma.sql`${Prisma.join(condiciones, " AND ")}`;

  const [resumenRows, estados, fuentes, equipo] = await Promise.all([
    db.$queryRaw<ResumenRow[]>(Prisma.sql`SELECT COUNT(*) AS "total", COUNT(*) FILTER (WHERE p."convertido"=false AND p."estado"<>'PERDIDO') AS "activos", COUNT(*) FILTER (WHERE p."convertido"=true) AS "convertidos", COUNT(*) FILTER (WHERE p."convertido"=false AND p."estado"='PERDIDO') AS "perdidos", COUNT(*) FILTER (WHERE p."convertido"=false AND p."estado"<>'PERDIDO' AND p."scorePreliminar">=75) AS "altaPrioridad", AVG(p."scorePreliminar") FILTER (WHERE p."convertido"=false AND p."estado"<>'PERDIDO' AND p."scorePreliminar" IS NOT NULL)::float8 AS "scorePromedio" FROM "prospecto" p WHERE ${where}`),
    db.$queryRaw<EstadoRow[]>(Prisma.sql`SELECT CASE WHEN p."convertido"=true THEN 'CONVERTIDO' ELSE p."estado" END AS "estado", COUNT(*) AS "total" FROM "prospecto" p WHERE ${where} GROUP BY 1 ORDER BY "total" DESC`),
    db.$queryRaw<FuenteRow[]>(Prisma.sql`SELECT CASE WHEN UPPER(TRIM(COALESCE(p."origen",''))) IN ('META','FACEBOOK','INSTAGRAM') THEN 'META' WHEN TRIM(COALESCE(p."origen",''))='' THEN 'SIN_DEFINIR' ELSE UPPER(TRIM(p."origen")) END AS "origen", COUNT(*) AS "total", COUNT(*) FILTER (WHERE p."convertido"=true) AS "convertidos" FROM "prospecto" p WHERE ${where} GROUP BY 1 ORDER BY "total" DESC, "origen" ASC LIMIT 10`),
    db.$queryRaw<EquipoRow[]>(Prisma.sql`SELECT COALESCE(u."id",'SIN_ASIGNAR') AS "id", COALESCE(u."name",'Sin responsable') AS "nombre", COUNT(*) AS "total", COUNT(*) FILTER (WHERE p."convertido"=false AND p."estado"<>'PERDIDO') AS "activos", COUNT(*) FILTER (WHERE p."convertido"=true) AS "convertidos", COUNT(*) FILTER (WHERE p."convertido"=false AND p."estado"='PERDIDO') AS "perdidos" FROM "prospecto" p LEFT JOIN "user" u ON u."id"=p."responsable_comercial_id" WHERE ${where} GROUP BY u."id",u."name" ORDER BY "convertidos" DESC,"total" DESC,"nombre" ASC LIMIT 15`),
  ]);

  const r=resumenRows[0], total=n(r?.total), convertidos=n(r?.convertidos), perdidos=n(r?.perdidos), scorePromedio=r?.scorePromedio==null?null:Math.round(r.scorePromedio);
  const metricas=[["Prospectos",total,"Resultado del filtro aplicado",UsersRound],["Convertidos",convertidos,`${pct(convertidos,total)}% de conversión`,CheckCircle2],["Prioridad alta",n(r?.altaPrioridad),"Activos con Score NEXUS ≥75",Target],["Perdidos",perdidos,`${pct(perdidos,total)}% del universo filtrado`,AlertTriangle],["Score promedio",scorePromedio==null?"—":`${scorePromedio}%`,"Solo prospectos activos evaluados",Gauge]] as const;

  return <section className="space-y-6 px-8 pt-6"><div><h2 className="text-lg font-semibold">Vista gerencial filtrada</h2><p className="text-sm text-muted-foreground">Todos los indicadores de esta sección respetan simultáneamente período, responsable y fuente.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{metricas.map(([titulo,valor,detalle,Icono])=><Card key={titulo}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{titulo}</CardTitle><Icono className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{valor}</div><p className="mt-1 text-xs text-muted-foreground">{detalle}</p></CardContent></Card>)}</div><div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle className="text-base">Embudo filtrado</CardTitle></CardHeader><CardContent className="space-y-2">{estados.length===0?<p className="text-sm text-muted-foreground">Sin resultados.</p>:estados.map(item=><div key={item.estado} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"><span>{item.estado}</span><span className="font-semibold">{n(item.total)} · {pct(n(item.total),total)}%</span></div>)}</CardContent></Card><Card><CardHeader><CardTitle className="text-base">Fuentes filtradas</CardTitle></CardHeader><CardContent className="space-y-2">{fuentes.length===0?<p className="text-sm text-muted-foreground">Sin resultados.</p>:fuentes.map(item=>{const t=n(item.total),c=n(item.convertidos);return <div key={item.origen} className="flex flex-col gap-1 rounded-md border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"><span>{item.origen==="SIN_DEFINIR"?"Sin definir":etiquetaOrigenProspecto(item.origen)}</span><span className="text-muted-foreground">{t} prospectos · {c} convertidos · {pct(c,t)}%</span></div>})}</CardContent></Card></div><Card><CardHeader><CardTitle className="text-base">Resultados por Responsable Comercial</CardTitle><p className="text-sm text-muted-foreground">La atribución utiliza el responsable formal actual del prospecto.</p></CardHeader><CardContent>{equipo.length===0?<p className="text-sm text-muted-foreground">Sin resultados.</p>:<div className="overflow-x-auto"><table className="w-full min-w-[650px] text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="pb-3 font-medium">Responsable</th><th className="pb-3 text-right font-medium">Prospectos</th><th className="pb-3 text-right font-medium">Activos</th><th className="pb-3 text-right font-medium">Convertidos</th><th className="pb-3 text-right font-medium">Conversión</th><th className="pb-3 text-right font-medium">Perdidos</th></tr></thead><tbody>{equipo.map(item=>{const t=n(item.total),c=n(item.convertidos);return <tr key={item.id} className="border-b last:border-0"><td className="py-3 font-medium">{item.nombre}</td><td className="py-3 text-right">{t}</td><td className="py-3 text-right">{n(item.activos)}</td><td className="py-3 text-right font-semibold">{c}</td><td className="py-3 text-right">{pct(c,t)}%</td><td className="py-3 text-right">{n(item.perdidos)}</td></tr>})}</tbody></table></div>}</CardContent></Card></section>;
}
