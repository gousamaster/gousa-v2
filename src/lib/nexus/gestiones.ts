export const GESTIONES_NEXUS = [
  { id: "VISA_USA_B1B2", nombre: "Nueva Visa Americana No Inmigrante B1/B2" },
  { id: "VISA_USA_OTRAS_NIV", nombre: "Nueva Visa Americana No Inmigrante – otras categorías" },
  { id: "RENOVACION_VISA_USA", nombre: "Renovación Visa Americana" },
  { id: "VISA_USA_INMIGRANTE", nombre: "Visa Americana Inmigrante" },
  { id: "VISA_CHINA", nombre: "Visa China" },
  { id: "ASESORIA_MIGRATORIA", nombre: "Asesoría Migratoria" },
  { id: "SERVICIO_PREPARACION", nombre: "Servicio de Preparación" },
] as const;

export type GestionNexusId = (typeof GESTIONES_NEXUS)[number]["id"];
