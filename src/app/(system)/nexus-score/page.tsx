import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Gauge, Search, UserPlus } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NexusScorePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const prospectos = await db.prospecto.findMany({
    where: { deletedAt: null, convertido: false, estado: { not: "PERDIDO" } },
    select: { id: true, nombres: true, apellidos: true, telefono: true, scorePreliminar: true },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });

  const sinEvaluar = prospectos.filter((p) => p.scorePreliminar == null).length;
  const calientes = prospectos.filter((p) => (p.scorePreliminar ?? -1) >= 70).length;

  return <div className="flex-1 space-y-6 p-8 pt-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div><div className="flex items-center gap-2"><Gauge className="h-7 w-7 text-blue-700"/><h1 className="text-3xl font-bold tracking-tight">NEXUS Score 2.0</h1></div><p className="mt-1 text-muted-foreground">Acceso directo a la evaluación comercial GO USA. El Score se conserva siempre vinculado a un prospecto.</p></div>
      <Button asChild><Link href="/prospectos"><UserPlus className="mr-2 h-4 w-4"/>Registrar prospecto</Link></Button>
    </div>

    <div className="grid gap-4 sm:grid-cols-3">
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Prospectos disponibles</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{prospectos.length}</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Sin evaluar</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{sinEvaluar}</div></CardContent></Card>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Alta oportunidad</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{calientes}</div><p className="text-xs text-muted-foreground">Score 70–100</p></CardContent></Card>
    </div>

    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-4 w-4"/>Elegir prospecto para evaluar</CardTitle><p className="text-sm text-muted-foreground">Selecciona una persona y entrarás directamente a las preguntas del Score 2.0. Si todavía no existe, regístrala primero para evitar evaluaciones sueltas o duplicadas.</p></CardHeader><CardContent>
      {prospectos.length===0?<div className="rounded-lg border border-dashed p-6 text-center"><p className="text-sm text-muted-foreground">No hay prospectos activos disponibles.</p><Button asChild className="mt-3"><Link href="/prospectos">Registrar primer prospecto</Link></Button></div>:<div className="space-y-2">{prospectos.map(p=><Link key={p.id} href={`/prospectos/${p.id}/score`} className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{p.nombres} {p.apellidos??""}</p><p className="text-xs text-muted-foreground">{p.telefono}</p></div><div className="flex items-center gap-2"><span className="rounded-full border px-2 py-1 text-xs">{p.scorePreliminar==null?"SIN EVALUAR":`Score ${p.scorePreliminar}`}</span><span className="text-sm font-medium text-blue-700">Evaluar →</span></div></Link>)}</div>}
    </CardContent></Card>

    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"><strong>Regla NEXUS:</strong> toda evaluación debe quedar asociada a una persona registrada. Esto mantiene historial, seguimiento comercial y evita Scores anónimos que después no podamos convertir en oportunidad.</div>
  </div>;
}
