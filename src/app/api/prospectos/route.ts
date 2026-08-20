import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { esOrigenProspecto } from "@/lib/prospectos/origenes";

export async function GET() {
  try {
    const prospectos = await db.prospecto.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        creadoPor: { select: { id: true, name: true, email: true } },
        convertidoPor: { select: { id: true, name: true, email: true } },
        cliente: { select: { id: true, nombres: true, apellidos: true } },
      },
    });
    return NextResponse.json({ prospectos });
  } catch (error) {
    console.error("Error al obtener prospectos:", error);
    return NextResponse.json({ error: "No se pudieron obtener los prospectos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const nombres = typeof body.nombres === "string" ? body.nombres.trim() : "";
    const apellidos = typeof body.apellidos === "string" ? body.apellidos.trim() : null;
    const telefono = typeof body.telefono === "string" ? body.telefono.trim() : "";
    const email = typeof body.email === "string" && body.email.trim() ? body.email.trim() : null;
    const origen = typeof body.origen === "string" ? body.origen.trim().toUpperCase() : "";
    const origenDetalle = typeof body.origenDetalle === "string" ? body.origenDetalle.trim() || null : null;

    if (!nombres || !telefono) {
      return NextResponse.json({ error: "Nombre y teléfono son obligatorios" }, { status: 400 });
    }
    if (origen && !esOrigenProspecto(origen)) {
      return NextResponse.json({ error: "Origen del prospecto no válido" }, { status: 400 });
    }

    const prospecto = await db.$transaction(async (tx) => {
      const creado = await tx.prospecto.create({
        data: {
          nombres,
          apellidos,
          telefono,
          email,
          ciudad: typeof body.ciudad === "string" ? body.ciudad.trim() || null : null,
          pais: typeof body.pais === "string" ? body.pais.trim() || "Bolivia" : "Bolivia",
          origen: origen || null,
          interes: typeof body.interes === "string" ? body.interes.trim() || null : null,
          observaciones: typeof body.observaciones === "string" ? body.observaciones.trim() || null : null,
          estado: "NUEVO",
          creadoPorId: session.user.id,
        },
        include: { creadoPor: { select: { id: true, name: true, email: true } } },
      });

      await tx.$executeRaw`
        UPDATE "prospecto"
        SET "origen_detalle" = ${origenDetalle}
        WHERE "id" = ${creado.id}
      `;
      return creado;
    });

    return NextResponse.json({ prospecto }, { status: 201 });
  } catch (error) {
    console.error("Error al crear prospecto:", error);
    return NextResponse.json({ error: "No se pudo crear el prospecto" }, { status: 500 });
  }
}
