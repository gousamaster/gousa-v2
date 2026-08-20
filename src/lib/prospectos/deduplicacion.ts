export type ProspectoIdentidad = {
  id: string;
  nombres: string;
  apellidos: string | null;
  telefono: string;
  email: string | null;
  convertido?: boolean;
};

export function normalizarEmail(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function normalizarTelefono(value: string | null | undefined) {
  let digits = (value ?? "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);

  // Para Bolivia, un número local válido suele tener 8 dígitos. Si llega con
  // prefijo +591/591, comparamos por los últimos 8 para evitar duplicados por formato.
  if (digits.startsWith("591") && digits.length >= 11) digits = digits.slice(-8);
  if (digits.startsWith("0") && digits.length === 9) digits = digits.slice(1);

  return digits;
}

export function detectarProspectoDuplicado(
  prospectos: ProspectoIdentidad[],
  telefono: string,
  email?: string | null,
  excluirId?: string,
) {
  const telefonoNormalizado = normalizarTelefono(telefono);
  const emailNormalizado = normalizarEmail(email);

  for (const prospecto of prospectos) {
    if (excluirId && prospecto.id === excluirId) continue;

    const telefonoCoincide =
      telefonoNormalizado.length >= 8 &&
      normalizarTelefono(prospecto.telefono) === telefonoNormalizado;
    const emailCoincide =
      emailNormalizado.length > 0 &&
      normalizarEmail(prospecto.email) === emailNormalizado;

    if (telefonoCoincide || emailCoincide) {
      return {
        prospecto,
        coincidencia: telefonoCoincide && emailCoincide
          ? "TELEFONO_EMAIL"
          : telefonoCoincide
            ? "TELEFONO"
            : "EMAIL",
      } as const;
    }
  }

  return null;
}
