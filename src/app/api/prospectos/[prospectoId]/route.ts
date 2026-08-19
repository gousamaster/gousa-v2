import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ prospectoId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 },
      );
    }

    const { prospectoId } = await params;
    const body = await request.json();

    const prospectoActual = await db.prospecto.findFirst({
      where: {
        id: prospectoId,
        deletedAt: null,
      },
    });

    if (!prospectoActual) {
      return NextResponse.json(
        { error: "Prospecto no encontrado" },
        { status: 404 },
      );
    }

    const prospecto = await db.prospecto.update({
      where: {
        id: prospectoId,
      },
      data: {
        nombres:
          typeof body.nombres === "string"
            ? body.nombres.trim()
            : undefined,
        apellidos:
          typeof body.apellidos === "string"
            ? body.apellidos.trim() || null
            : undefined,
        telefono:
          typeof body.telefono === "string"
            ? body.telefono.trim()
            : undefined,
        email:
          typeof body.email === "string"
            ? body.email.trim() || null
            : undefined,
        ciudad:
          typeof body.ciudad === "string"
            ? body.ciudad.trim() || null
            : undefined,
        pais:
          typeof body.pais === "string"
            ? body.pais.trim() || null
            : undefined,
        origen:
          typeof body.origen === "string"
            ? body.origen.trim() || null
            : undefined,
        interes:
          typeof body.interes === "string"
            ? body.interes.trim() || null
            : undefined,
        observaciones:
          typeof body.observaciones === "string"
            ? body.observaciones.trim() || null
            : undefined,
        estado:
          typeof body.estado === "string"
            ? body.estado
            : undefined,
        scorePreliminar:
          typeof body.scorePreliminar === "number"
            ? Math.max(0, Math.min(100, body.scorePreliminar))
            : body.scorePreliminar === null
              ? null
              : undefined,
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
      prospecto,
    });
  } catch (error) {
    console.error("Error al actualizar prospecto:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar el prospecto" },
      { status: 500 },
    );
  }
}
