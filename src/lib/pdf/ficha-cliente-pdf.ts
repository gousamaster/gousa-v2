// src/lib/pdf/ficha-cliente-pdf.ts
// ARCHIVO COMPLETO con datos de viaje incluidos

import type { ClienteCompleto } from "@/types/cliente-types";

type Campo = { label: string; value: string };
type Seccion = { titulo: string; campos: Campo[] };

/**
 * Construye las secciones de la ficha filtrando campos sin datos
 * Implementa patrón Builder para construir el documento dinámicamente
 */
function buildSecciones(cliente: ClienteCompleto): Seccion[] {
  const secciones: Seccion[] = [];

  const fmt = (val: string | null | undefined) =>
    val && val.trim() !== "" ? val : null;

  const fmtDate = (val: Date | string | null | undefined) => {
    if (!val) return null;
    try {
      return new Date(val).toLocaleDateString("es-BO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  const fmtMoney = (val: number | null | undefined) =>
    val != null ? `${val.toLocaleString("es-BO")} Bs.` : null;

  const campos = (pares: Array<[string, string | null]>): Campo[] =>
    pares
      .filter(([, v]) => v !== null)
      .map(([label, value]) => ({ label, value: value as string }));

  // ── Datos Básicos ──────────────────────────────────────────────────────────
  const basicos = campos([
    ["Nombres", fmt(cliente.nombres)],
    ["Apellidos", fmt(cliente.apellidos)],
    [
      "Tipo de Cliente",
      cliente.tipoCliente === "ADULTO" ? "Adulto" : "Infante",
    ],
    ["Región", fmt(cliente.region?.nombre)],
    ["Fecha de Nacimiento", fmtDate(cliente.fechaNacimiento)],
    ["Lugar de Nacimiento", fmt(cliente.lugarNacimiento)],
    ["Nacionalidad", fmt(cliente.nacionalidad)],
    ["Número de CI", fmt(cliente.numeroCi)],
    ["Número de Pasaporte", fmt(cliente.numeroPasaporte)],
    ["Email", fmt(cliente.email)],
    ["Teléfono Celular", fmt(cliente.telefonoCelular)],
    ["Registrado por", fmt(cliente.registradoPor?.name)],
  ]);
  if (basicos.length > 0)
    secciones.push({ titulo: "Datos Básicos", campos: basicos });

  // ── Datos Personales ───────────────────────────────────────────────────────
  if (cliente.datosPersonales) {
    const dp = cliente.datosPersonales;
    const personales = campos([
      ["Emisión de Pasaporte", fmtDate(dp.pasaporteFechaEmision)],
      ["Expiración de Pasaporte", fmtDate(dp.pasaporteFechaExpiracion)],
      ["Facebook", fmt(dp.facebook)],
      ["Instagram", fmt(dp.instagram)],
      ["Dirección de Domicilio", fmt(dp.direccionDomicilio)],
      ["Estado Civil", fmt(dp.estadoCivil)],
      ["Profesión", fmt(dp.profesion)],
      ["Nombre del Padre", fmt(dp.nombrePadre)],
      ["Nacimiento del Padre", fmtDate(dp.fechaNacimientoPadre)],
      ["Nombre de la Madre", fmt(dp.nombreMadre)],
      ["Nacimiento de la Madre", fmtDate(dp.fechaNacimientoMadre)],
    ]);
    if (personales.length > 0)
      secciones.push({ titulo: "Datos Personales", campos: personales });
  }

  // ── Datos Laborales ────────────────────────────────────────────────────────
  if (cliente.datosLaborales) {
    const dl = cliente.datosLaborales;
    const laborales = campos([
      ["Lugar de Trabajo", fmt(dl.lugarTrabajo)],
      ["Cargo", fmt(dl.cargoTrabajo)],
      ["Descripción del Trabajo", fmt(dl.descripcionTrabajo)],
      ["Dirección de Trabajo", fmt(dl.direccionTrabajo)],
      ["Teléfono de Trabajo", fmt(dl.telefonoTrabajo)],
      ["Fecha de Contratación", fmtDate(dl.fechaContratacion)],
      ["Percepción Salarial", fmtMoney(dl.percepcionSalarial)],
      ["Trabajo Anterior", fmt(dl.nombreTrabajoAnterior)],
      ["Teléfono Trabajo Anterior", fmt(dl.telefonoTrabajoAnterior)],
      ["Dirección Trabajo Anterior", fmt(dl.direccionTrabajoAnterior)],
      ["Inicio Trabajo Anterior", fmtDate(dl.fechaInicioTrabajoAnterior)],
      ["Referencia Trabajo Anterior", fmt(dl.referenciaTrabajoAnterior)],
    ]);
    if (laborales.length > 0)
      secciones.push({ titulo: "Datos Laborales", campos: laborales });
  }

  // ── Datos Académicos ───────────────────────────────────────────────────────
  if (cliente.datosAcademicos) {
    const da = cliente.datosAcademicos;
    const academicos = campos([
      ["Institución de Estudio", fmt(da.lugarEstudio)],
      ["Carrera", fmt(da.carreraEstudio)],
      ["Dirección de Estudio", fmt(da.direccionEstudio)],
      ["Teléfono de Estudio", fmt(da.telefonoEstudio)],
      ["Inicio de Estudios", fmtDate(da.fechaInicioEstudio)],
      ["Fin de Estudios", fmtDate(da.fechaFinEstudio)],
    ]);
    if (academicos.length > 0)
      secciones.push({ titulo: "Datos Académicos", campos: academicos });
  }

  // ── Datos Matrimoniales ────────────────────────────────────────────────────
  if (cliente.datosMatrimoniales) {
    const dm = cliente.datosMatrimoniales;
    const matrimoniales = campos([
      ["Nombre del Cónyuge", fmt(dm.conyugeNombreCompleto)],
      ["Nacimiento del Cónyuge", fmtDate(dm.conyugeFechaNacimiento)],
      ["Lugar de Nacimiento del Cónyuge", fmt(dm.conyugeLugarNacimiento)],
      ["Inicio del Matrimonio", fmtDate(dm.matrimonioFechaInicio)],
      ["Fin del Matrimonio", fmtDate(dm.matrimonioFechaFin)],
    ]);
    if (matrimoniales.length > 0)
      secciones.push({ titulo: "Datos Matrimoniales", campos: matrimoniales });
  }

  // ── Datos del Patrocinador ─────────────────────────────────────────────────
  if (cliente.datosPatrocinador) {
    const dpa = cliente.datosPatrocinador;
    const patrocinador = campos([
      ["Nombre del Patrocinador", fmt(dpa.nombrePatrocinador)],
      ["Dirección del Patrocinador", fmt(dpa.direccionPatrocinador)],
      ["Teléfono del Patrocinador", fmt(dpa.telefonoPatrocinador)],
      ["Email del Patrocinador", fmt(dpa.emailPatrocinador)],
      ["Trabajo del Patrocinador", fmt(dpa.trabajoPatrocinador)],
      [
        "Inicio Trabajo Patrocinador",
        fmtDate(dpa.fechaInicioTrabajoPatrocinador),
      ],
      [
        "Salario del Patrocinador",
        fmtMoney(dpa.percepcionSalarialPatrocinador),
      ],
    ]);
    if (patrocinador.length > 0)
      secciones.push({
        titulo: "Datos del Patrocinador",
        campos: patrocinador,
      });
  }

  // ── Datos de Viaje ─────────────────────────────────────────────────────────
  if (cliente.datosViaje) {
    const dv = cliente.datosViaje;
    const viaje = campos([
      ["Motivo del Viaje", fmt(dv.motivo)],
      ["Lugar de Destino", fmt(dv.lugar)],
      ["Fecha Tentativa", fmtDate(dv.fechaTentativa)],
      ["Tiempo de Estadía", fmt(dv.tiempoEstadia)],
      ["Contacto en Destino", fmt(dv.contactoDestino)],
      ["Dirección del Contacto", fmt(dv.direccionContacto)],
      ["Teléfono del Contacto", fmt(dv.telefonoContacto)],
      ["Países Visitados", fmt(dv.paisesVisitados)],
    ]);
    if (viaje.length > 0)
      secciones.push({ titulo: "Datos de Viaje", campos: viaje });
  }

  return secciones;
}

/**
 * Genera y descarga la ficha del cliente en PDF
 * Solo incluye campos con datos — campos vacíos son omitidos
 */
export async function descargarFichaClientePdf(
  cliente: ClienteCompleto,
): Promise<void> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const secciones = buildSecciones(cliente);

  const MARGEN_IZQ = 15;
  const MARGEN_DER = 195;
  const ANCHO_LABEL = 70;
  const ANCHO_VALOR = MARGEN_DER - MARGEN_IZQ - ANCHO_LABEL;
  const COLOR_PRIMARIO: [number, number, number] = [30, 64, 175];
  const COLOR_SECCION: [number, number, number] = [239, 246, 255];
  const COLOR_TEXTO: [number, number, number] = [30, 30, 30];
  const COLOR_LABEL: [number, number, number] = [80, 80, 80];
  const COLOR_LINEA: [number, number, number] = [200, 210, 230];

  let y = 20;

  const checkPageBreak = (altura: number) => {
    if (y + altura > 280) {
      doc.addPage();
      y = 20;
    }
  };

  // ── Encabezado ──────────────────────────────────────────────────────────────
  doc.setFillColor(...COLOR_PRIMARIO);
  doc.rect(0, 0, 210, 18, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("FICHA DE CLIENTE", MARGEN_IZQ, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const fechaEmision = new Date().toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(`Emitido: ${fechaEmision}`, MARGEN_DER, 11, { align: "right" });

  // ── Nombre del cliente ──────────────────────────────────────────────────────
  doc.setTextColor(...COLOR_TEXTO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`${cliente.nombres} ${cliente.apellidos}`, MARGEN_IZQ, y + 8);
  y += 16;

  doc.setDrawColor(...COLOR_LINEA);
  doc.setLineWidth(0.3);
  doc.line(MARGEN_IZQ, y, MARGEN_DER, y);
  y += 6;

  // ── Secciones ───────────────────────────────────────────────────────────────
  for (const seccion of secciones) {
    checkPageBreak(14);

    doc.setFillColor(...COLOR_SECCION);
    doc.rect(MARGEN_IZQ, y, MARGEN_DER - MARGEN_IZQ, 7, "F");

    doc.setTextColor(...COLOR_PRIMARIO);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(seccion.titulo.toUpperCase(), MARGEN_IZQ + 2, y + 5);
    y += 10;

    for (const campo of seccion.campos) {
      const lineasValor = doc.splitTextToSize(campo.value, ANCHO_VALOR);
      const alturaFila = Math.max(6, lineasValor.length * 5);

      checkPageBreak(alturaFila + 1);

      doc.setTextColor(...COLOR_LABEL);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(campo.label, MARGEN_IZQ + 2, y + 4);

      doc.setTextColor(...COLOR_TEXTO);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(lineasValor, MARGEN_IZQ + ANCHO_LABEL, y + 4);

      doc.setDrawColor(...COLOR_LINEA);
      doc.setLineWidth(0.1);
      doc.line(MARGEN_IZQ, y + alturaFila, MARGEN_DER, y + alturaFila);

      y += alturaFila + 1;
    }

    y += 4;
  }

  // ── Pie de página ───────────────────────────────────────────────────────────
  const totalPaginas = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLOR_LINEA);
    doc.line(MARGEN_IZQ, 287, MARGEN_DER, 287);
    doc.setTextColor(...COLOR_LABEL);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(
      "GO USA CRM — Documento generado automáticamente",
      MARGEN_IZQ,
      292,
    );
    doc.text(`Página ${i} de ${totalPaginas}`, MARGEN_DER, 292, {
      align: "right",
    });
  }

  const nombreArchivo =
    `ficha-${cliente.apellidos.toLowerCase()}-${cliente.nombres.toLowerCase()}.pdf`
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  doc.save(nombreArchivo);
}
