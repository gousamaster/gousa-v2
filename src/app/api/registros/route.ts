import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const registros = await db.registroCaptacion.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ registros });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const nombres = typeof body.nombres === "string" ? body.nombres.trim() : "";
  const telefono = typeof body.telefono === "string" ? body.telefono.trim() : "";
  if (!nombres || !telefono) return NextResponse.json({ error: "Nombre y WhatsApp son obligatorios" }, { status: 400 });

  const existente = await db.registroCaptacion.findFirst({ where: { telefono, estado: "REGISTRO" } });
  if (existente) return NextResponse.json({ error: "Este WhatsApp ya tiene un registro de captación.", registro: existente }, { status: 409 });

  const prospecto = await db.prospecto.findFirst({ where: { telefono, deletedAt: null } });
  if (prospecto) return NextResponse.json({ error: "Este WhatsApp ya existe como prospecto.", prospectoId: prospecto.id }, { status: 409 });

  const registro = await db.registroCaptacion.create({ data: {
    nombres,
    apellidos: typeof body.apellidos === "string" ? body.apellidos.trim() || null : null,
    telefono,
    origen: typeof body.origen === "string" ? body.origen.trim() || null : null,
    interes: typeof body.interes === "string" ? body.interes.trim() || null : null,
    observaciones: typeof body.observaciones === "string" ? body.observaciones.trim() || null : null,
    captador: typeof body.captador === "string" ? body.captador.trim() || null : null,
    consentimiento: body.consentimiento === true,
    creadoPorId: session.user.id,
  }});
  return NextResponse.json({ registro }, { status: 201 });
}