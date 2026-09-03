// El esquema de pendientes NEXUS se administra mediante migraciones de Supabase.
// Se conserva esta función para compatibilidad con los consumidores existentes,
// evitando ejecutar DDL en cada instancia/serverless request.
export async function ensureNexusPendientesSchema() {
  return;
}
