import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const prospectos = await db.prospecto.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        creadoPor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        convertidoPor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        cliente: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
          },
        },
      },
    });

    return NextResponse.json({
      prospectos,
    });
  } catch (error) {
    console.error("Error al obtener prospectos:", error);

    return NextResponse.json(
      {
        error: "No se pudieron obtener los prospectos",
      },
      {
        status: 500,
      },
    );
  }
}
