import { ArrowRight, BrainCircuit, Gauge, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardAccesosComerciales() {
  const accesos = [
    {
      titulo: "Prospectos",
      descripcion: "Registrar, calificar, dar seguimiento y convertir prospectos",
      href: "/prospectos",
      icono: UserPlus,
    },
    {
      titulo: "Evaluar Score NEXUS",
      descripcion: "Selecciona o registra un prospecto para medir su índice orientativo",
      href: "/prospectos",
      icono: Gauge,
    },
    {
      titulo: "GoUSA NEXUS",
      descripcion: "Selecciona un cliente y abre su análisis NEXUS",
      href: "/clients",
      icono: BrainCircuit,
    },
  ];

  return (
    <div className="px-8 pt-6">
      <div className="grid gap-4 md:grid-cols-3">
        {accesos.map(({ titulo, descripcion, href, icono: Icono }) => (
          <a key={titulo} href={href}>
            <Card className="h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
              <CardContent className="flex items-center justify-between gap-4 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Icono className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{titulo}</p>
                    <p className="text-sm text-muted-foreground">{descripcion}</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
