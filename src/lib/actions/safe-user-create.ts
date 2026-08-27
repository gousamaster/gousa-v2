"use server";

import { UserRole, UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult, CreateUserDTO, UserWithRelations } from "./types/action-types";

export async function createUserWithoutSessionSwitch(dto: CreateUserDTO): Promise<ActionResult<UserWithRelations>> {
  try {
    if (!dto.name?.trim()) return { success: false, error: "El nombre es requerido", code: "REQUIRED_NAME" };
    const email = dto.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { success: false, error: "Email inválido", code: "INVALID_EMAIL" };
    if (!dto.password || dto.password.length < 8 || !/[A-Z]/.test(dto.password) || !/[a-z]/.test(dto.password) || !/[0-9]/.test(dto.password)) {
      return { success: false, error: "La contraseña debe tener al menos 8 caracteres, mayúsculas, minúsculas y números", code: "PASSWORD_WEAK" };
    }
    if (await db.user.findUnique({ where: { email } })) return { success: false, error: "El email ya está registrado", code: "EMAIL_EXISTS" };

    // La API administrativa crea la cuenta sin autenticar al nuevo asesor en
    // el navegador del Super Admin. signUpEmail no debe usarse desde administración.
    const result = await auth.api.createUser({
      body: {
        email,
        password: dto.password,
        name: dto.name,
        role: dto.role ?? UserRole.USER,
      },
    });

    if (!result?.user) throw new Error("No se pudo crear la cuenta del asesor");

    const user = await db.user.update({
      where: { id: result.user.id },
      data: {
        role: dto.role ?? UserRole.USER,
        status: dto.status ?? UserStatus.ACTIVE,
        departmentId: dto.departmentId ?? null,
        managerId: dto.managerId ?? null,
        image: dto.image ?? null,
        birthDate: dto.birthDate ?? null,
        phone: dto.phone ?? null,
        emailVerified: true,
        banned: false,
        banReason: null,
        banExpires: null,
        updatedAt: new Date(),
      },
      include: {
        department: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true, role: true } },
        subordinates: { select: { id: true, name: true, role: true } },
      },
    });

    revalidatePath("/administration");
    return { success: true, data: user as UserWithRelations };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error al crear asesor", code: "CREATE_ERROR" };
  }
}
