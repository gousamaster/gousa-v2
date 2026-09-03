"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type AuditoriaNexusItem = {
  id: string;
  accion: string;
  entidad: string;
  entidadId: string | null;
  clienteId: string | null;
  detalle: string | null;
  usuarioNombre: string | null;
  createdAt: Date;
};

export async function registrarAuditoriaNexus(input: {
  accion: string;
  entidad: string;
  entidadId?: string | null;
  clienteId?: string | null;
  detalle?: string | null;
  usuarioId?: string | null;
}) {
  try {
    let usuarioId = input.usuarioId ?? null;
    if (!usuarioId) {
      const session = await auth.api.getSession({ headers: await headers() });
      usuarioId = session?.user?.id ?? null;
    }

    await db.$executeRaw`
      INSERT INTO "auditoria_nexus"
        ("id", "accion", "entidad", "entidadId", "clienteId", "detalle", "usuarioId", "createdAt")
      VALUES
        (${crypto.randomUUID()}, ${input.accion}, ${input.entidad}, ${input.entidadId ?? null}, ${input.clienteId ?? null}, ${input.detalle ?? null}, ${usuarioId}, NOW())
    `;
  } catch (error) {
    console.error("auditoria nexus", error);
  }
}

export async function obtenerAuditoriaCliente(
  clienteId: string,
): Promise<AuditoriaNexusItem[]> {
  return db.$queryRaw<AuditoriaNexusItem[]>`
    SELECT
      a."id",
      a."accion",
      a."entidad",
      a."entidadId",
      a."clienteId",
      a."detalle",
      u."name" AS "usuarioNombre",
      a."createdAt"
    FROM "auditoria_nexus" a
    LEFT JOIN "user" u ON u."id" = a."usuarioId"
    WHERE a."clienteId" = ${clienteId}
    ORDER BY a."createdAt" DESC
    LIMIT 200
  `;
}
