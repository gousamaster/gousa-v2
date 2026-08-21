export const ORIGENES_PROSPECTO = [
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "META", label: "Facebook / Instagram" },
  { value: "TIKTOK", label: "TikTok" },
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
  if (["META", "FACEBOOK", "INSTAGRAM"].includes(value)) return "Facebook / Instagram";
  if (value === "TIKTOK") return "TikTok";
  return ORIGENES_PROSPECTO.find((item) => item.value === value)?.label ?? value;
}
