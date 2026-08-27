export const ACTIVACION_VENTAS_ROLE = "ACTIVACION_VENTAS" as const;

export const ACTIVACION_VENTAS_ALLOWED_PREFIXES = [
  "/dashboard",
  "/nexus-score",
  "/prospectos",
  "/servicios",
] as const;

export function isActivacionVentas(role?: string | null): boolean {
  return role === ACTIVACION_VENTAS_ROLE;
}

export function canActivacionVentasAccessPath(pathname: string): boolean {
  if (
    ACTIVACION_VENTAS_ALLOWED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return true;
  }

  // Excepción controlada: después de convertir un prospecto, Ventas puede abrir
  // únicamente la ficha individual para emitir el servicio. No se habilita la
  // bandeja de Clientes ni rutas internas adicionales.
  return /^\/clients\/[^/]+$/.test(pathname);
}
