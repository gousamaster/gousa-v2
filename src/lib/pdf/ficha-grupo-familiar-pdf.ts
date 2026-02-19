// src/lib/pdf/ficha-grupo-familiar-pdf.ts

import type { ClienteCompleto } from "@/types/cliente-types";
import { descargarFichaClientePdf } from "./ficha-cliente-pdf";

type GrupoFamiliar = {
  id: string;
  nombre: string;
  descripcion: string | null;
};

type MiembroConDatos = {
  esTitular: boolean;
  parentesco: { nombre: string };
  cliente: ClienteCompleto;
};

/**
 * Genera PDFs individuales para cada miembro del grupo familiar
 * Patrón Composite: agrupa múltiples descargas individuales
 */
export async function descargarFichasGrupoFamiliarPdf(
  grupo: GrupoFamiliar,
  miembros: MiembroConDatos[],
): Promise<void> {
  const { jsPDF } = await import("jspdf");

  // Crear documento maestro
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let primeraFicha = true;

  for (const miembro of miembros) {
    if (!primeraFicha) {
      doc.addPage();
    }
    primeraFicha = false;

    // Generar ficha individual para este miembro
    // (Aquí delegamos a la función existente)
    await generarFichaEnDoc(doc, miembro.cliente, miembro, grupo);
  }

  // Descargar archivo único con todas las fichas
  const nombreArchivo = `grupo-${grupo.nombre
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")}-${new Date().toISOString().slice(0, 10)}.pdf`;

  doc.save(nombreArchivo);
}

/**
 * Genera ficha de cliente dentro de un documento existente
 */
async function generarFichaEnDoc(
  doc: any,
  cliente: ClienteCompleto,
  miembro: MiembroConDatos,
  grupo: GrupoFamiliar,
): Promise<void> {
  const MARGEN_IZQ = 15;
  const MARGEN_DER = 195;
  const COLOR_PRIMARIO: [number, number, number] = [30, 64, 175];
  const COLOR_TEXTO: [number, number, number] = [30, 30, 30];
  const COLOR_LABEL: [number, number, number] = [80, 80, 80];

  let y = 20;

  // Header con info del grupo
  doc.setFillColor(...COLOR_PRIMARIO);
  doc.rect(0, 0, 210, 18, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("FICHA DE CLIENTE - GRUPO FAMILIAR", MARGEN_IZQ, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(grupo.nombre, MARGEN_DER, 11, { align: "right" });

  // Rol en el grupo
  doc.setTextColor(...COLOR_TEXTO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const rol = miembro.esTitular
    ? "TITULAR"
    : miembro.parentesco.nombre.toUpperCase();
  doc.text(rol, MARGEN_IZQ, y + 6);

  y += 10;
  doc.setFontSize(14);
  doc.text(`${cliente.nombres} ${cliente.apellidos}`, MARGEN_IZQ, y);
  y += 10;

  // Datos básicos en formato compacto
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const agregarCampo = (label: string, valor: string | null | undefined) => {
    if (valor) {
      doc.setTextColor(...COLOR_LABEL);
      doc.text(`${label}:`, MARGEN_IZQ, y);
      doc.setTextColor(...COLOR_TEXTO);
      doc.text(valor, MARGEN_IZQ + 50, y);
      y += 6;
    }
  };

  agregarCampo("Tipo", cliente.tipoCliente === "ADULTO" ? "Adulto" : "Infante");
  agregarCampo("CI", cliente.numeroCi);
  agregarCampo("Pasaporte", cliente.numeroPasaporte);
  agregarCampo("Email", cliente.email);
  agregarCampo("Teléfono", cliente.telefonoCelular);
  agregarCampo("Región", cliente.region?.nombre);

  if (cliente.fechaNacimiento) {
    agregarCampo(
      "Fecha Nacimiento",
      new Date(cliente.fechaNacimiento).toLocaleDateString("es-BO"),
    );
  }

  // Nota al pie
  y = 280;
  doc.setFontSize(7);
  doc.setTextColor(...COLOR_LABEL);
  doc.text(
    `Grupo: ${grupo.nombre} • Generado: ${new Date().toLocaleDateString("es-BO")}`,
    105,
    y,
    { align: "center" },
  );
}
