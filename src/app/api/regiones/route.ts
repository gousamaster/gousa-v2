import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const regiones = await db.region.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      select: {
        id: true,
        nombre: true,
        codigo: true,
      },
    });

    return NextResponse.json({ regiones });
  } catch (error) {
    console.error("Error al obtener regiones:", error);
    return NextResponse.json(
      { error: "No se pudieron obtener las regiones" },
      { status: 500 },
    );
  }
}
