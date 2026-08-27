export const ACTIVACION_VENTAS_ROLE = "ACTIVACION_VENTAS" as const;

export const ACTIVACION_VENTAS_ALLOWED_PREFIXES = [
  "/dashboard",
  "/nexus-score",
  "/prospectos",
] as const;

export function isActivacionVentas(role?: string | null): boolean {
  return role === ACTIVACION_VENTAS_ROLE;
}

export function canActivacionVentasAccessPath(pathname: string): boolean {
  return ACTIVACION_VENTAS_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
