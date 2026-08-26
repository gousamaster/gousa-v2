"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";

export type EntradaUsaNexus = {
  id: string;
  fechaIngreso: string;
  permanenciaDias: number | null;
  actualizadoPorNombre: string | null;
  updatedAt: string;
};

async function ensure() {
  await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "cliente_entradas_usa_nexus" (
    "id" TEXT PRIMARY KEY,
    "clienteId" TEXT NOT NULL REFERENCES "cliente"("id") ON DELETE CASCADE,
    "fechaIngreso" DATE NOT NULL,
    "permanenciaDias" INTEGER,
    "actualizadoPorId" TEXT REFERENCES "user"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "cliente_entradas_usa_nexus_cliente_fecha_idx" ON "cliente_entradas_usa_nexus" ("clienteId", "fechaIngreso" DESC)`);
}

export async function obtenerEntradasUsaNexus(clienteId: string): Promise<ActionResult<EntradaUsaNexus[]>> {
  try {
    await ensure();
    const rows = await db.$queryRaw<Array<any>>`
      SELECT e.*, u."name" AS "actualizadoPorNombre"
      FROM "cliente_entradas_usa_nexus" e
      LEFT JOIN "user" u ON u."id" = e."actualizadoPorId"
      WHERE e."clienteId" = ${clienteId}
      ORDER BY e."fechaIngreso" DESC, e."createdAt" DESC
      LIMIT 5`;
    return { success: true, data: rows.map((r) => ({
      id: r.id,
      fechaIngreso: r.fechaIngreso?.toISOString?.().slice(0, 10) ?? String(r.fechaIngreso).slice(0, 10),
      permanenciaDias: r.permanenciaDias,
      actualizadoPorNombre: r.actualizadoPorNombre,
      updatedAt: r.updatedAt?.toISOString?.() ?? String(r.updatedAt),
    })) };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Error al obtener entradas a Estados Unidos" };
  }
}

export async function guardarEntradasUsaNexus(
  clienteId: string,
  entradas: Array<{ fechaIngreso: string; permanenciaDias: number | null }>,
): Promise<ActionResult<void>> {
  try {
    await ensure();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "No autorizado" };
    const limpias = entradas
      .filter((e) => e.fechaIngreso)
      .slice(0, 5)
      .map((e) => ({ fechaIngreso: e.fechaIngreso, permanenciaDias: e.permanenciaDias == null ? null : Math.max(0, Math.trunc(e.permanenciaDias)) }));

    await db.$transaction(async (tx) => {
      await tx.$executeRaw`DELETE FROM "cliente_entradas_usa_nexus" WHERE "clienteId" = ${clienteId}`;
      for (const e of limpias) {
        const id = crypto.randomUUID();
        await tx.$executeRaw`INSERT INTO "cliente_entradas_usa_nexus" ("id","clienteId","fechaIngreso","permanenciaDias","actualizadoPorId","createdAt","updatedAt") VALUES (${id},${clienteId},${e.fechaIngreso}::date,${e.permanenciaDias},${session.user.id},NOW(),NOW())`;
      }
    });
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Error al guardar entradas a Estados Unidos" };
  }
}
