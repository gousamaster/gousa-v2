import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ prospectoId: string }> },
) {
  try {
    const { prospectoId } = await params;

    const prospecto = await db.prospecto.findFirst({
      where: {
        id: prospectoId,
        deletedAt: null,
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

    if (!prospecto) {
      return NextResponse.json(
        {
          error: "Prospecto no encontrado",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      prospecto,
    });
  } catch (error) {
    console.error("Error al obtener prospecto:", error);

    return NextResponse.json(
      {
        error: "No se pudo obtener el prospecto",
      },
      {
        status: 500,
      },
    );
  }
}
