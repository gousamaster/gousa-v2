import { db } from "@/lib/db";

const ROLES_TOTALES = new Set(["ADMIN", "SUPER_ADMIN", "MANAGER"]);

export async function alcanceProspectos(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) return { accesoTotal: false, userIds: [] as string[] };
  if (ROLES_TOTALES.has(user.role)) return { accesoTotal: true, userIds: [user.id] };

  return { accesoTotal: false, userIds: [user.id] };
}

export async function idsProspectosAsignados(userId: string) {
  const rows = await db.$queryRaw<{ prospectoId: string }[]>`
    SELECT DISTINCT "prospectoId"
    FROM (
      SELECT p."id" AS "prospectoId"
      FROM "prospecto" p
      WHERE p."deletedAt" IS NULL AND p."responsable_comercial_id"=${userId}
      UNION
      SELECT s."prospecto_id" AS "prospectoId"
      FROM "prospecto_seguimiento" s
      WHERE s."responsable_id"=${userId}
    ) asignados
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
    FROM "prospecto" p
    WHERE p."id"=${prospectoId}
      AND p."deletedAt" IS NULL
      AND (
        p."responsable_comercial_id"=${userId}
        OR EXISTS (
          SELECT 1 FROM "prospecto_seguimiento" s
          WHERE s."prospecto_id"=p."id" AND s."responsable_id"=${userId}
        )
      )
  `;
  return Number(asignado[0]?.total ?? 0) > 0;
}
