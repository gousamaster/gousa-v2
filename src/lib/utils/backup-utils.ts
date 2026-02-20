// src/lib/utils/backup-utils.ts

import type { CreateClienteCompletoFormData } from "@/validations/cliente-validations";

/**
 * Genera un respaldo de los datos del cliente en formato JSON
 */
export function descargarRespaldoJSON(data: CreateClienteCompletoFormData) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const nombreCliente =
      `${data.cliente.nombres}_${data.cliente.apellidos}`.replace(/\s+/g, "_");
    const filename = `RESPALDO_${nombreCliente}_${timestamp}.json`;

    const backup = {
      metadata: {
        fechaRespaldo: new Date().toISOString(),
        tipo: "Respaldo de Cliente",
        version: "1.0",
      },
      datos: data,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("✅ Respaldo JSON descargado:", filename);
  } catch (error) {
    console.error("❌ Error al descargar respaldo JSON:", error);
  }
}

/**
 * Genera un respaldo de los datos del cliente en formato HTML legible
 */
export function descargarRespaldoHTML(data: CreateClienteCompletoFormData) {
  try {
    const timestamp = new Date().toLocaleString("es-BO", {
      dateStyle: "full",
      timeStyle: "medium",
    });
    const nombreCliente = `${data.cliente.nombres} ${data.cliente.apellidos}`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Respaldo de Cliente - ${nombreCliente}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 900px;
      margin: 40px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      margin: -30px -30px 30px -30px;
    }
    h1 {
      margin: 0;
      font-size: 24px;
    }
    .alert {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin-bottom: 30px;
      border-radius: 4px;
    }
    .alert strong {
      color: #856404;
    }
    .section {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
    }
    .section:last-child {
      border-bottom: none;
    }
    h2 {
      color: #667eea;
      font-size: 20px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    .field-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-bottom: 15px;
    }
    .field {
      margin-bottom: 10px;
    }
    .field-label {
      font-weight: 600;
      color: #555;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .field-value {
      color: #333;
      font-size: 15px;
      padding: 8px 0;
    }
    .empty {
      color: #999;
      font-style: italic;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    .timestamp {
      color: #ddd;
      font-size: 14px;
      margin-top: 10px;
    }
    @media print {
      body {
        background: white;
        margin: 0;
      }
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛡️ Respaldo de Datos del Cliente</h1>
      <div class="timestamp">Generado: ${timestamp}</div>
    </div>

    <div class="alert">
      <strong>⚠️ IMPORTANTE:</strong> Este archivo contiene un respaldo automático de los datos 
      que se intentaron guardar. Por favor, contacte al administrador del sistema o intente 
      guardar nuevamente desde el sistema.
    </div>

    <div class="section">
      <h2>📋 Datos Básicos</h2>
      <div class="field-group">
        <div class="field">
          <div class="field-label">Nombres</div>
          <div class="field-value">${data.cliente.nombres || '<span class="empty">No especificado</span>'}</div>
        </div>
        <div class="field">
          <div class="field-label">Apellidos</div>
          <div class="field-value">${data.cliente.apellidos || '<span class="empty">No especificado</span>'}</div>
        </div>
        <div class="field">
          <div class="field-label">Tipo de Cliente</div>
          <div class="field-value">${data.cliente.tipoCliente === "ADULTO" ? "Adulto" : "Infante"}</div>
        </div>
        <div class="field">
          <div class="field-label">Fecha de Nacimiento</div>
          <div class="field-value">${data.cliente.fechaNacimiento ? new Date(data.cliente.fechaNacimiento).toLocaleDateString("es-BO") : '<span class="empty">No especificado</span>'}</div>
        </div>
        <div class="field">
          <div class="field-label">Lugar de Nacimiento</div>
          <div class="field-value">${data.cliente.lugarNacimiento || '<span class="empty">No especificado</span>'}</div>
        </div>
        <div class="field">
          <div class="field-label">Nacionalidad</div>
          <div class="field-value">${data.cliente.nacionalidad || '<span class="empty">No especificado</span>'}</div>
        </div>
        <div class="field">
          <div class="field-label">Número de CI</div>
          <div class="field-value">${data.cliente.numeroCi || '<span class="empty">No especificado</span>'}</div>
        </div>
        <div class="field">
          <div class="field-label">Número de Pasaporte</div>
          <div class="field-value">${data.cliente.numeroPasaporte || '<span class="empty">No especificado</span>'}</div>
        </div>
        <div class="field">
          <div class="field-label">Email</div>
          <div class="field-value">${data.cliente.email || '<span class="empty">No especificado</span>'}</div>
        </div>
        <div class="field">
          <div class="field-label">Teléfono</div>
          <div class="field-value">${data.cliente.telefonoCelular || '<span class="empty">No especificado</span>'}</div>
        </div>
      </div>
    </div>

    ${
      data.datosPersonales && Object.keys(data.datosPersonales).length > 0
        ? `
    <div class="section">
      <h2>👤 Datos Personales</h2>
      <div class="field-group">
        ${data.datosPersonales.pasaporteFechaEmision ? `<div class="field"><div class="field-label">Pasaporte - Fecha Emisión</div><div class="field-value">${new Date(data.datosPersonales.pasaporteFechaEmision).toLocaleDateString("es-BO")}</div></div>` : ""}
        ${data.datosPersonales.pasaporteFechaExpiracion ? `<div class="field"><div class="field-label">Pasaporte - Fecha Expiración</div><div class="field-value">${new Date(data.datosPersonales.pasaporteFechaExpiracion).toLocaleDateString("es-BO")}</div></div>` : ""}
        ${data.datosPersonales.facebook ? `<div class="field"><div class="field-label">Facebook</div><div class="field-value">${data.datosPersonales.facebook}</div></div>` : ""}
        ${data.datosPersonales.instagram ? `<div class="field"><div class="field-label">Instagram</div><div class="field-value">${data.datosPersonales.instagram}</div></div>` : ""}
        ${data.datosPersonales.direccionDomicilio ? `<div class="field"><div class="field-label">Dirección Domicilio</div><div class="field-value">${data.datosPersonales.direccionDomicilio}</div></div>` : ""}
        ${data.datosPersonales.estadoCivil ? `<div class="field"><div class="field-label">Estado Civil</div><div class="field-value">${data.datosPersonales.estadoCivil}</div></div>` : ""}
        ${data.datosPersonales.profesion ? `<div class="field"><div class="field-label">Profesión</div><div class="field-value">${data.datosPersonales.profesion}</div></div>` : ""}
        ${data.datosPersonales.nombrePadre ? `<div class="field"><div class="field-label">Nombre del Padre</div><div class="field-value">${data.datosPersonales.nombrePadre}</div></div>` : ""}
        ${data.datosPersonales.nombreMadre ? `<div class="field"><div class="field-label">Nombre de la Madre</div><div class="field-value">${data.datosPersonales.nombreMadre}</div></div>` : ""}
      </div>
    </div>
    `
        : ""
    }

    ${
      data.datosLaborales && Object.keys(data.datosLaborales).length > 0
        ? `
    <div class="section">
      <h2>💼 Datos Laborales</h2>
      <div class="field-group">
        ${data.datosLaborales.lugarTrabajo ? `<div class="field"><div class="field-label">Lugar de Trabajo</div><div class="field-value">${data.datosLaborales.lugarTrabajo}</div></div>` : ""}
        ${data.datosLaborales.cargoTrabajo ? `<div class="field"><div class="field-label">Cargo</div><div class="field-value">${data.datosLaborales.cargoTrabajo}</div></div>` : ""}
        ${data.datosLaborales.percepcionSalarial ? `<div class="field"><div class="field-label">Salario</div><div class="field-value">Bs ${data.datosLaborales.percepcionSalarial}</div></div>` : ""}
        ${data.datosLaborales.direccionTrabajo ? `<div class="field"><div class="field-label">Dirección Trabajo</div><div class="field-value">${data.datosLaborales.direccionTrabajo}</div></div>` : ""}
        ${data.datosLaborales.telefonoTrabajo ? `<div class="field"><div class="field-label">Teléfono Trabajo</div><div class="field-value">${data.datosLaborales.telefonoTrabajo}</div></div>` : ""}
      </div>
    </div>
    `
        : ""
    }

    ${
      data.datosAcademicos && Object.keys(data.datosAcademicos).length > 0
        ? `
    <div class="section">
      <h2>🎓 Datos Académicos</h2>
      <div class="field-group">
        ${data.datosAcademicos.lugarEstudio ? `<div class="field"><div class="field-label">Lugar de Estudio</div><div class="field-value">${data.datosAcademicos.lugarEstudio}</div></div>` : ""}
        ${data.datosAcademicos.carreraEstudio ? `<div class="field"><div class="field-label">Carrera</div><div class="field-value">${data.datosAcademicos.carreraEstudio}</div></div>` : ""}
        ${data.datosAcademicos.direccionEstudio ? `<div class="field"><div class="field-label">Dirección</div><div class="field-value">${data.datosAcademicos.direccionEstudio}</div></div>` : ""}
      </div>
    </div>
    `
        : ""
    }

    ${
      data.datosMatrimoniales && Object.keys(data.datosMatrimoniales).length > 0
        ? `
    <div class="section">
      <h2>💑 Datos Matrimoniales</h2>
      <div class="field-group">
        ${data.datosMatrimoniales.conyugeNombreCompleto ? `<div class="field"><div class="field-label">Nombre del Cónyuge</div><div class="field-value">${data.datosMatrimoniales.conyugeNombreCompleto}</div></div>` : ""}
        ${data.datosMatrimoniales.conyugeLugarNacimiento ? `<div class="field"><div class="field-label">Lugar de Nacimiento</div><div class="field-value">${data.datosMatrimoniales.conyugeLugarNacimiento}</div></div>` : ""}
      </div>
    </div>
    `
        : ""
    }

    ${
      data.datosPatrocinador && Object.keys(data.datosPatrocinador).length > 0
        ? `
    <div class="section">
      <h2>🤝 Datos del Patrocinador</h2>
      <div class="field-group">
        ${data.datosPatrocinador.nombrePatrocinador ? `<div class="field"><div class="field-label">Nombre</div><div class="field-value">${data.datosPatrocinador.nombrePatrocinador}</div></div>` : ""}
        ${data.datosPatrocinador.direccionPatrocinador ? `<div class="field"><div class="field-label">Dirección</div><div class="field-value">${data.datosPatrocinador.direccionPatrocinador}</div></div>` : ""}
        ${data.datosPatrocinador.telefonoPatrocinador ? `<div class="field"><div class="field-label">Teléfono</div><div class="field-value">${data.datosPatrocinador.telefonoPatrocinador}</div></div>` : ""}
        ${data.datosPatrocinador.emailPatrocinador ? `<div class="field"><div class="field-label">Email</div><div class="field-value">${data.datosPatrocinador.emailPatrocinador}</div></div>` : ""}
      </div>
    </div>
    `
        : ""
    }

    ${
      data.datosViaje && Object.keys(data.datosViaje).length > 0
        ? `
    <div class="section">
      <h2>✈️ Datos de Viaje</h2>
      <div class="field-group">
        ${data.datosViaje.motivo ? `<div class="field"><div class="field-label">Motivo</div><div class="field-value">${data.datosViaje.motivo}</div></div>` : ""}
        ${data.datosViaje.lugar ? `<div class="field"><div class="field-label">Destino</div><div class="field-value">${data.datosViaje.lugar}</div></div>` : ""}
        ${data.datosViaje.tiempoEstadia ? `<div class="field"><div class="field-label">Tiempo de Estadía</div><div class="field-value">${data.datosViaje.tiempoEstadia}</div></div>` : ""}
        ${data.datosViaje.contactoDestino ? `<div class="field"><div class="field-label">Contacto en Destino</div><div class="field-value">${data.datosViaje.contactoDestino}</div></div>` : ""}
      </div>
    </div>
    `
        : ""
    }

    <div class="footer">
      <p><strong>GO USA CRM</strong> - Sistema de Gestión de Clientes</p>
      <p>Este documento fue generado automáticamente como respaldo de seguridad</p>
      <p style="margin-top: 10px; color: #e74c3c;">
        <strong>⚠️ Los datos en este archivo no han sido guardados en el sistema</strong>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    const filenameHTML = `RESPALDO_${nombreCliente.replace(/\s+/g, "_")}_${new Date().toISOString().replace(/[:.]/g, "-")}.html`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filenameHTML;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("✅ Respaldo HTML descargado:", filenameHTML);
  } catch (error) {
    console.error("❌ Error al descargar respaldo HTML:", error);
  }
}

/**
 * Descarga ambos respaldos (JSON + HTML)
 */
export function descargarRespaldosCompletos(
  data: CreateClienteCompletoFormData,
) {
  console.log("🛡️ Generando respaldos de seguridad...");
  descargarRespaldoJSON(data);

  setTimeout(() => {
    descargarRespaldoHTML(data);
  }, 500);
}
