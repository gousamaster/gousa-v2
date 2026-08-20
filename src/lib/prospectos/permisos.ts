import { db } from "@/lib/db";

const ROLES_TOTALES = new Set(["ADMIN", "SUPER_ADMIN"]);

export async function alcanceProspectos(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) return { accesoTotal: false, userIds: [] as string[] };
  if (ROLES_TOTALES.has(user.role)) return { accesoTotal: true, userIds: [user.id] };

  if (user.role === "MANAGER") {
    const subordinados = await db.user.findMany({
      where: { managerId: user.id, status: "ACTIVE", banned: { not: true } },
      select: { id: true },
    });
    return { accesoTotal: false, userIds: [user.id, ...subordinados.map((u) => u.id)] };
  }

  return { accesoTotal: false, userIds: [user.id] };
}

export async function idsProspectosAsignados(userId: string) {
  const rows = await db.$queryRaw<{ prospectoId: string }[]>`
    SELECT DISTINCT "prospecto_id" AS "prospectoId"
    FROM "prospecto_seguimiento"
    WHERE "responsable_id" = ${userId}
  `;
  return rows.map((row) => row.prospectoId);
}

export async function puedeAccederProspecto(userId: string, prospectoId: string) {
  const alcance = await alcanceProspectos(userId);
  if (alcance.accesoTotal) return true;

  const prospecto = await db.prospecto.findFirst({
    where: {
      id: prospectoId,
      deletedAt: null,
      creadoPorId: { in: alcance.userIds },
    },
    select: { id: true },
  });
  if (prospecto) return true;

  const asignado = await db.$queryRaw<{ total: bigint }[]>`
    SELECT COUNT(*) AS "total"
    FROM "prospecto_seguimiento"
    WHERE "prospecto_id" = ${prospectoId}
      AND "responsable_id" = ${userId}
  `;
  return Number(asignado[0]?.total ?? 0) > 0;
}
