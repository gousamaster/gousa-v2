import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "La conversión rápida fue deshabilitada. Convierte el prospecto desde la ficha completa de Cliente para conservar todos los datos y la trazabilidad NEXUS.",
      code: "CONVERSION_COMPLETA_REQUERIDA",
    },
    { status: 410 },
  );
}
