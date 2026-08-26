"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireSuperAdmin() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session?.user?.id) return { ok: false as const, error: "Sesión no válida" };

  const actor = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
  if (!actor || actor.role !== "SUPER_ADMIN") {
    return { ok: false as const, error: "Solo SUPER_ADMIN puede cambiar contraseñas" };
  }
  return { ok: true as const, headers: requestHeaders, actor };
}

function validatePassword(password: string) {
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Debe contener mayúsculas, minúsculas y números";
  }
  return null;
}

export async function resetUserPasswordBySuperAdmin(userId: string, newPassword: string) {
  try {
    const access = await requireSuperAdmin();
    if (!access.ok) return { success: false, error: access.error };

    const validation = validatePassword(newPassword);
    if (validation) return { success: false, error: validation };

    if (userId === access.actor.id) {
      return { success: false, error: "Para tu propia contraseña utiliza el cambio de contraseña de tu cuenta" };
    }

    const target = await db.user.findUnique({ where: { id: userId }, select: { id: true, name: true } });
    if (!target) return { success: false, error: "Usuario no encontrado" };

    await auth.api.setUserPassword({
      body: { userId, newPassword },
      headers: access.headers,
    });

    // Cierra sesiones existentes para que la nueva contraseña sea efectiva en el próximo acceso.
    await db.session.deleteMany({ where: { userId } });
    revalidatePath("/administration");
    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("resetUserPasswordBySuperAdmin", error);
    return { success: false, error: "No se pudo cambiar la contraseña" };
  }
}
