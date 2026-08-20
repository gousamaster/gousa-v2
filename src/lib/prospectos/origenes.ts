export const ORIGENES_PROSPECTO = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "WEB", label: "Sitio web" },
  { value: "REFERIDO", label: "Referido" },
  { value: "OFICINA", label: "Oficina" },
  { value: "LLAMADA", label: "Llamada" },
  { value: "CAMPANA", label: "Campaña" },
  { value: "OTRO", label: "Otro" },
] as const;

export type OrigenProspecto = (typeof ORIGENES_PROSPECTO)[number]["value"];

export function esOrigenProspecto(value: string): value is OrigenProspecto {
  return ORIGENES_PROSPECTO.some((item) => item.value === value);
}

export function etiquetaOrigenProspecto(value: string | null | undefined) {
  if (!value) return "Sin definir";
  return ORIGENES_PROSPECTO.find((item) => item.value === value)?.label ?? value;
}
