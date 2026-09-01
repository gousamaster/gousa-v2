// src/lib/auth.ts

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, organization } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
import { db } from "@/lib/db";

const accessControl = createAccessControl(defaultStatements);
const nexusAdminRole = accessControl.newRole({ ...adminAc.statements });
const nexusUserRole = accessControl.newRole({});

const trustedOrigins = [
  "https://gousa-nexus.vercel.app",
  process.env.BETTER_AUTH_URL,
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  trustedOrigins,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Cambiar a true en producción
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
    updateAge: 60 * 60 * 24, // Actualizar sesión cada 24 horas
  },

  plugins: [
    nextCookies(),

    // Better Auth requiere declarar explícitamente los roles personalizados.
    // SUPER_ADMIN y ADMIN reciben permisos administrativos; los demás no.
    admin({
      ac: accessControl,
      roles: {
        SUPER_ADMIN: nexusAdminRole,
        ADMIN: nexusAdminRole,
        MANAGER: nexusUserRole,
        SUPERVISOR: nexusUserRole,
        USER: nexusUserRole,
        ACTIVACION_VENTAS: nexusUserRole,
      },
      defaultRole: "USER",
      impersonationSessionDuration: 60 * 60, // 1 hora
    }),

    // Plugin de organizaciones
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 5, // Límite de organizaciones por usuario
      invitationExpiresIn: 60 * 60 * 24 * 7, // 7 días
    }),
  ],

  // Configuración adicional de seguridad
  advanced: {
    generateId: false, // Usar IDs generados por Prisma
    crossSubDomainCookies: {
      enabled: false,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
