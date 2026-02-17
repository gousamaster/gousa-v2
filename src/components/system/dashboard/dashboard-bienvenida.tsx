// src/components/system/dashboard/dashboard-bienvenida.tsx

import { BookOpen, CalendarCheck, FileText, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ACCESOS_POR_ROL: Record<
  string,
  Array<{
    icono: React.ElementType;
    titulo: string;
    descripcion: string;
    href: string;
  }>
> = {
  USER: [
    {
      icono: Users,
      titulo: "Clientes",
      descripcion: "Gestiona y registra clientes",
      href: "/clients",
    },
    {
      icono: FileText,
      titulo: "Trámites",
      descripcion: "Sigue el estado de los trámites",
      href: "/tramites",
    },
    {
      icono: CalendarCheck,
      titulo: "Citas",
      descripcion: "Consulta y gestiona citas",
      href: "/citas",
    },
  ],
  SUPERVISOR: [
    {
      icono: Users,
      titulo: "Clientes",
      descripcion: "Gestiona y supervisa clientes",
      href: "/clients",
    },
    {
      icono: FileText,
      titulo: "Trámites",
      descripcion: "Supervisa trámites activos",
      href: "/tramites",
    },
    {
      icono: CalendarCheck,
      titulo: "Citas",
      descripcion: "Vista de agenda del equipo",
      href: "/citas",
    },
    {
      icono: BookOpen,
      titulo: "Catálogos",
      descripcion: "Configuración de catálogos",
      href: "/catalogos",
    },
  ],
};

const SALUDO_POR_HORA = (): string => {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
};

const ETIQUETA_ROL: Record<string, string> = {
  USER: "Asesor",
  SUPERVISOR: "Supervisor",
};

interface DashboardBienvenidaProps {
  nombre: string;
  rol: string;
}

/**
 * Vista de bienvenida para roles sin acceso al panel analítico
 * Muestra accesos directos según el rol del usuario
 */
export function DashboardBienvenida({ nombre, rol }: DashboardBienvenidaProps) {
  const accesos = ACCESOS_POR_ROL[rol] ?? ACCESOS_POR_ROL.USER;
  const etiqueta = ETIQUETA_ROL[rol] ?? rol;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[80vh]">
      <div className="max-w-2xl w-full space-y-10 text-center">
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">
            {etiqueta}
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            {SALUDO_POR_HORA()}, {nombre.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground text-lg">
            ¿Qué necesitas hacer hoy?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accesos.map(({ icono: Icono, titulo, descripcion, href }) => (
            <a key={titulo} href={href}>
              <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full">
                <CardContent className="pt-6 pb-6 flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icono className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{titulo}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {descripcion}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
