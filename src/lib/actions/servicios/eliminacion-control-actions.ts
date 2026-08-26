"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registrarAuditoriaNexus } from "@/lib/auditoria-nexus";
import type { ActionResult } from "@/types/action-result-types";

const ROLES_ELIMINACION = new Set(["SUPER_ADMIN", "MANAGER"]);

async function usuarioActual() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;
  return db.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true, name: true } });
}

function autorizado(role: string | null | undefined) {
  return Boolean(role && ROLES_ELIMINACION.has(role));
}

async function ensureAuditoriaVentaRapida() {
  await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "venta_rapida_eliminada_nexus" (
    "id" TEXT PRIMARY KEY,
    "ventaId" TEXT NOT NULL,
    "nombrePersona" TEXT NOT NULL,
    "servicioNombre" TEXT NOT NULL,
    "montoServicio" DECIMAL(12,2) NOT NULL,
    "montoCobrado" DECIMAL(12,2) NOT NULL,
    "motivo" TEXT,
    "eliminadoPorId" TEXT REFERENCES "user"("id") ON DELETE SET NULL,
    "eliminadoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "venta_rapida_eliminada_nexus_fecha_idx" ON "venta_rapida_eliminada_nexus" ("eliminadoAt" DESC)`);
}

export async function obtenerPermisoEliminacionNexus(): Promise<ActionResult<{ puedeEliminar: boolean; role: string }>> {
  try {
    const u = await usuarioActual();
    if (!u) return { success: false, error: "No autorizado" };
    return { success: true, data: { puedeEliminar: autorizado(u.role), role: u.role ?? "USER" } };
  } catch (e) {
    console.error(e);
    return { success: false, error: "No se pudieron verificar los permisos" };
  }
}

export async function eliminarVentaRapidaNexus(id: string, motivo?: string): Promise<ActionResult<void>> {
  try {
    const u = await usuarioActual();
    if (!u) return { success: false, error: "No autorizado" };
    if (!autorizado(u.role)) return { success: false, error: "Solo Manager o Super Admin pueden eliminar ventas" };
    await ensureAuditoriaVentaRapida();
    const rows = await db.$queryRaw<Array<{ id: string; nombrePersona: string; servicioNombre: string; montoServicio: unknown; montoCobrado: unknown }>>`
      SELECT "id","nombrePersona","servicioNombre","montoServicio","montoCobrado"
      FROM "venta_rapida_nexus" WHERE "id"=${id} LIMIT 1`;
    const venta = rows[0];
    if (!venta) return { success: false, error: "Venta rápida no encontrada" };
    await db.$transaction(async (tx) => {
      await tx.$executeRaw`INSERT INTO "venta_rapida_eliminada_nexus" ("id","ventaId","nombrePersona","servicioNombre","montoServicio","montoCobrado","motivo","eliminadoPorId","eliminadoAt") VALUES (${crypto.randomUUID()},${venta.id},${venta.nombrePersona},${venta.servicioNombre},${Number(venta.montoServicio)},${Number(venta.montoCobrado)},${motivo?.trim()||null},${u.id},NOW())`;
      await tx.$executeRaw`DELETE FROM "venta_rapida_nexus" WHERE "id"=${id}`;
    });
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "No se pudo eliminar la venta rápida" };
  }
}

export async function eliminarServicioClienteNexus(id: string, motivo?: string): Promise<ActionResult<void>> {
  try {
    const u = await usuarioActual();
    if (!u) return { success: false, error: "No autorizado" };
    if (!autorizado(u.role)) return { success: false, error: "Solo Manager o Super Admin pueden eliminar servicios" };

    const servicio = await db.clienteServicio.findUnique({
      where: { id },
      include: {
        servicio: { select: { nombre: true } },
        tramites: { where: { deletedAt: null }, select: { id: true }, take: 1 },
      },
    });
    if (!servicio || servicio.deletedAt) return { success: false, error: "Servicio no encontrado" };
    if (servicio.tramites.length > 0) {
      return { success: false, error: "Este servicio ya tiene un trámite activo. Elimina o cierra primero ese trámite para evitar perder trazabilidad." };
    }

    await db.clienteServicio.update({ where: { id }, data: { deletedAt: new Date() } });
    await registrarAuditoriaNexus({
      accion: "SERVICIO ELIMINADO",
      entidad: "Servicio",
      entidadId: id,
      clienteId: servicio.clienteId,
      usuarioId: u.id,
      detalle: `${servicio.servicio.nombre}${motivo?.trim() ? ` · Motivo: ${motivo.trim()}` : ""}`,
    });
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "No se pudo eliminar el servicio" };
  }
}
