"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";

const ROLES_GERENCIALES = ["SUPER_ADMIN", "MANAGER"];

async function sesionGerencial() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id || !ROLES_GERENCIALES.includes(session.user.role ?? "USER")) return null;
  return session;
}

export async function obtenerClientesConServicioHistoricoConfirmado(): Promise<ActionResult<string[]>> {
  try {
    const rows = await db.$queryRaw<{ id: string }[]>`
      SELECT "id" FROM "cliente"
      WHERE "deletedAt" IS NULL AND "servicio_historico_confirmado"=true
    `;
    return { success: true, data: rows.map((r) => r.id) };
  } catch (error) {
    console.error("Error leyendo saneamiento histórico:", error);
    return { success: false, error: "No se pudo leer el saneamiento histórico" };
  }
}

export async function confirmarServicioHistoricoClientes(clienteIds: string[]): Promise<ActionResult<{ actualizados: number }>> {
  try {
    const session = await sesionGerencial();
    if (!session) return { success: false, error: "Solo MANAGER o SUPER_ADMIN puede confirmar servicios históricos" };
    const ids = [...new Set(clienteIds.filter(Boolean))];
    if (ids.length === 0) return { success: false, error: "Selecciona al menos un cliente" };

    const actualizados = await db.$executeRaw`
      UPDATE "cliente"
      SET "servicio_historico_confirmado"=true,
          "servicio_historico_confirmado_at"=CURRENT_TIMESTAMP,
          "servicio_historico_confirmado_por_id"=${session.user.id}
      WHERE "id" = ANY(${ids}::text[])
        AND "deletedAt" IS NULL
        AND "activo"=true
    `;
    return { success: true, data: { actualizados } };
  } catch (error) {
    console.error("Error confirmando servicio histórico:", error);
    return { success: false, error: "No se pudo confirmar el servicio histórico" };
  }
}
