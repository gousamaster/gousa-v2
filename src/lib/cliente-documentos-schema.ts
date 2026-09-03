export const TIPOS_DOCUMENTO_CLIENTE = [
  "PASAPORTE",
  "CEDULA_IDENTIDAD",
  "CONFIRMACION_CITA",
  "FORMULARIO_LLENADO",
  "CONFIRMACION_FORMULARIO",
] as const;

export type TipoDocumentoCliente = (typeof TIPOS_DOCUMENTO_CLIENTE)[number];

// El esquema se administra mediante migraciones de Supabase.
// Se conserva la función para compatibilidad, sin DDL en tiempo de ejecución.
export async function ensureClienteDocumentosSchema() {
  return;
}
