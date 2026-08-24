import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, BedDouble, Car, Plane, Ticket } from "lucide-react";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const servicios = [
  { titulo: "Vuelos", etiqueta: "Aéreo", descripcion: "Cotizaciones, PAX, despacho y conversión de cotización a emisión.", href: "/servicios/vuelos", icon: Plane },
  { titulo: "Hospedaje", etiqueta: "Estadía", descripcion: "Cotizaciones por destino, fechas, habitaciones, ocupación y despacho.", href: "/servicios/hospedaje", icon: BedDouble },
  { titulo: "Rent a Car", etiqueta: "Movilidad", descripcion: "Cotizaciones por recogida/entrega, vehículo, seguro, fechas y despacho.", href: "/servicios/rentacar", icon: Car },
  { titulo: "Atracciones", etiqueta: "Experiencias", descripcion: "Cotizaciones de parques y atracciones, pasajeros, fechas y despacho.", href: "/servicios/atracciones", icon: Ticket },
] as const;

export default async function ServiciosPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/45 to-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-blue-100 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Servicios GO USA</span>
            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Centro de Servicios NEXUS</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Cotiza, consulta y da seguimiento a todos los servicios complementarios desde un mismo lugar, sin mezclar la información de cada módulo.</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">4 módulos disponibles</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {servicios.map(({ titulo, etiqueta, descripcion, href, icon: Icon }) => (
          <Link key={href} href={href} className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
            <Card className="h-full border-slate-200/80 bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-blue-200 group-hover:shadow-md">
              <CardHeader className="space-y-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-700 group-hover:text-white"><Icon className="h-5 w-5" /></div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">{etiqueta}</span>
                </div>
                <CardTitle className="text-lg text-slate-950">{titulo}</CardTitle>
              </CardHeader>
              <CardContent className="flex min-h-32 flex-col justify-between gap-5">
                <p className="text-sm leading-6 text-slate-600">{descripcion}</p>
                <div className="flex items-center text-sm font-semibold text-blue-700">Abrir módulo <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>Cada módulo conserva sus órdenes, búsquedas, PDFs y estados de forma independiente.</span>
        <span className="font-semibold text-slate-800">Centro operativo unificado</span>
      </div>
    </section>
  );
}
