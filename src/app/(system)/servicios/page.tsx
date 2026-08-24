import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { BedDouble, Car, Plane, Ticket, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const servicios = [
  { titulo: "Vuelos", descripcion: "Cotizaciones, PAX, despacho y conversión de cotización a emisión.", href: "/servicios/vuelos", icon: Plane },
  { titulo: "Hospedaje", descripcion: "Cotizaciones por destino, fechas, habitaciones, ocupación y despacho.", href: "/servicios/hospedaje", icon: BedDouble },
  { titulo: "Rent a Car", descripcion: "Cotizaciones por recogida/entrega, vehículo, seguro, fechas y despacho.", href: "/servicios/rentacar", icon: Car },
  { titulo: "Atracciones", descripcion: "Cotizaciones de parques y atracciones, pasajeros, fechas y despacho.", href: "/servicios/atracciones", icon: Ticket },
] as const;

export default async function ServiciosPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Centro de Servicios NEXUS</h1>
        <p className="mt-1 text-sm text-muted-foreground">Un solo punto de entrada para cotizar, consultar y dar seguimiento a los servicios complementarios de GO USA.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {servicios.map(({ titulo, descripcion, href, icon: Icon }) => (
          <Card key={href} className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg border bg-muted/40"><Icon className="h-5 w-5" /></div>
              <CardTitle>{titulo}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-5">
              <p className="text-sm text-muted-foreground">{descripcion}</p>
              <Button asChild className="w-full"><Link href={href}>Abrir módulo <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        Cada módulo conserva sus órdenes, permite buscar y filtrar registros, generar la orden/PDF y controlar su estado sin mezclar información entre servicios.
      </div>
    </div>
  );
}
