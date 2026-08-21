import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const [prospectos, clientes] = await Promise.all([
      db.prospecto.findMany({
        where: { deletedAt: null },
        select: { id: true, nombres: true, apellidos: true, telefono: true },
        orderBy: { createdAt: "desc" },
      }),
      db.cliente.findMany({
        where: { deletedAt: null, activo: true },
        select: { id: true, nombres: true, apellidos: true, telefonoCelular: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ prospectos, clientes });
  } catch (error) {
    console.error("Error al cargar personas para vuelos:", error);
    return NextResponse.json({ error: "No se pudieron cargar prospectos y clientes" }, { status: 500 });
  }
}
