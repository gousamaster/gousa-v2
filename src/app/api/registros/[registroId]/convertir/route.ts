import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(_request: Request, { params }: { params: Promise<{ registroId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { registroId } = await params;
  const registro = await db.registroCaptacion.findUnique({ where: { id: registroId } });
  if (!registro) return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
  if (registro.estado === "CONVERTIDO") return NextResponse.json({ error: "El registro ya fue convertido" }, { status: 409 });

  const existente = await db.prospecto.findFirst({ where: { telefono: registro.telefono, deletedAt: null } });
  if (existente) return NextResponse.json({ error: "Ya existe un prospecto con este WhatsApp", prospectoId: existente.id }, { status: 409 });

  const prospecto = await db.$transaction(async (tx) => {
    const creado = await tx.prospecto.create({ data: {
      nombres: registro.nombres, apellidos: registro.apellidos, telefono: registro.telefono,
      origen: registro.origen, interes: registro.interes, observaciones: registro.observaciones,
      estado: "NUEVO", creadoPorId: session.user.id,
    }});
    await tx.registroCaptacion.update({ where: { id: registro.id }, data: { estado: "CONVERTIDO", prospectoId: creado.id } });
    return creado;
  });
  return NextResponse.json({ prospecto });
}