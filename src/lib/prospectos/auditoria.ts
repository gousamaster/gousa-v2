import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";

export async function registrarAuditoriaProspecto(
  tx: Prisma.TransactionClient,
  params: {
    prospectoId: string;
    usuarioId: string | null;
    accion: string;
    detalle?: unknown;
  },
) {
  const detalleJson = JSON.stringify(params.detalle ?? {});
  await tx.$executeRaw`
    INSERT INTO "prospecto_auditoria"
      ("id", "prospecto_id", "usuario_id", "accion", "detalle", "created_at")
    VALUES
      (${randomUUID()}, ${params.prospectoId}, ${params.usuarioId}, ${params.accion}, CAST(${detalleJson} AS jsonb), CURRENT_TIMESTAMP)
  `;
}
