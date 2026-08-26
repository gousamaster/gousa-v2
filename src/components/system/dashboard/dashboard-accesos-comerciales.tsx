import { ArrowRight, BrainCircuit, Gauge, ListChecks, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GESTIONES_NEXUS } from "@/lib/nexus/gestiones";

export function DashboardAccesosComerciales() {
  const accesos = [
    { titulo: "Prospectos", descripcion: "Registrar, calificar, dar seguimiento y convertir prospectos", href: "/prospectos", icono: UserPlus },
    { titulo: "Evaluar Score NEXUS", descripcion: "Selecciona o registra un prospecto para medir su índice orientativo", href: "/prospectos", icono: Gauge },
    { titulo: "GoUSA NEXUS", descripcion: "Selecciona un cliente y abre su análisis NEXUS", href: "/clients", icono: BrainCircuit },
  ];

  return (
    <div className="px-8 pt-6 space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {accesos.map(({ titulo, descripcion, href, icono: Icono }) => (
          <a key={titulo} href={href}>
            <Card className="h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
              <CardContent className="flex items-center justify-between gap-4 py-5">
                <div className="flex items-center gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10"><Icono className="h-5 w-5 text-primary" /></div><div><p className="font-semibold">{titulo}</p><p className="text-sm text-muted-foreground">{descripcion}</p></div></div><ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary"/><CardTitle className="text-base">Gestiones NEXUS</CardTitle><Badge variant="secondary">{GESTIONES_NEXUS.length}</Badge></div>
          <p className="text-sm text-muted-foreground">Selecciona una gestión, luego el cliente. NEXUS abrirá directamente Servicios y Trámites para registrar la contratación.</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {GESTIONES_NEXUS.map((gestion, index) => (
              <a key={gestion.id} href={`/clients?gestion=${gestion.id}`} className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 hover:border-primary/40">
                <span className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span><span className="text-sm font-medium leading-snug">{gestion.nombre}</span></span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
