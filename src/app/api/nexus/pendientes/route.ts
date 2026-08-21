import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureNexusPendientesSchema } from "@/lib/nexus-pendientes-schema";

export async function GET() {
  try {
    await ensureNexusPendientesSchema();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const rows = await db.$queryRaw<Array<{
      id:string;titulo:string;detalle:string|null;categoria:string;fechaObjetivo:Date;completado:boolean;
      prospectoId:string|null;clienteId:string|null;asignadoAId:string|null;asignadoA:string|null;
      prospecto:string|null;cliente:string|null;
    }>>`
      SELECT p."id", p."titulo", p."detalle", p."categoria", p."fechaObjetivo", p."completado",
        p."prospectoId", p."clienteId", p."asignadoAId", u."name" AS "asignadoA",
        CASE WHEN pr."id" IS NOT NULL THEN TRIM(pr."nombres" || ' ' || COALESCE(pr."apellidos",'')) ELSE NULL END AS "prospecto",
        CASE WHEN cl."id" IS NOT NULL THEN TRIM(cl."nombres" || ' ' || cl."apellidos") ELSE NULL END AS "cliente"
      FROM "nexus_pendiente" p
      LEFT JOIN "user" u ON u."id" = p."asignadoAId"
      LEFT JOIN "prospecto" pr ON pr."id" = p."prospectoId"
      LEFT JOIN "cliente" cl ON cl."id" = p."clienteId"
      WHERE p."completado" = FALSE
        AND (p."fechaObjetivo" - INTERVAL '4 hours')::date <= ((NOW() AT TIME ZONE 'America/La_Paz')::date + 2)
      ORDER BY p."fechaObjetivo" ASC`;

    const hoy = new Date(new Date().toLocaleString("en-US", { timeZone: "America/La_Paz" }));
    const hoyBase = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
    const pendientes = rows.map(r=>{
      const local = new Date(new Date(r.fechaObjetivo).toLocaleString("en-US", { timeZone: "America/La_Paz" }));
      const base = new Date(local.getFullYear(),local.getMonth(),local.getDate()).getTime();
      const diaOffset = Math.round((base-hoyBase)/86400000);
      return {...r,diaOffset,atrasado:diaOffset<0};
    });

    const usuarios = await db.user.findMany({where:{status:"ACTIVE"},select:{id:true,name:true},orderBy:{name:"asc"}});
    return NextResponse.json({ pendientes, usuarios });
  } catch (error) {
    console.error("pendientes GET", error);
    return NextResponse.json({ error: "No se pudieron cargar los pendientes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureNexusPendientesSchema();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const body = await request.json();
    if (!body?.titulo || !body?.fechaObjetivo) return NextResponse.json({ error: "Título y fecha son obligatorios" }, { status: 400 });

    const id = randomUUID();
    const fecha = new Date(`${body.fechaObjetivo}T12:00:00-04:00`);
    await db.$executeRaw`
      INSERT INTO "nexus_pendiente" ("id","titulo","detalle","categoria","fechaObjetivo","prospectoId","clienteId","asignadoAId","creadoPorId")
      VALUES (${id},${String(body.titulo)},${body.detalle ? String(body.detalle) : null},${String(body.categoria ?? "OTRO")},${fecha},${body.prospectoId ?? null},${body.clienteId ?? null},${body.asignadoAId ?? null},${session.user.id})`;
    return NextResponse.json({ ok:true,id });
  } catch (error) {
    console.error("pendientes POST", error);
    return NextResponse.json({ error: "No se pudo crear el pendiente" }, { status: 500 });
  }
}
