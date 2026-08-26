"use client";
import jsPDF from "jspdf";

export type DatosFacturacionPdf={nombre:string;nit:string;concepto:string;monto:number;fecha:string;referencia?:string|null};

export function generarPdfDatosFacturacion(data:DatosFacturacionPdf){
 const doc=new jsPDF();
 doc.setFontSize(16);doc.text("GO USA · DATOS PARA FACTURACIÓN",20,22);
 doc.setFontSize(9);doc.text("Documento interno de apoyo. No constituye factura fiscal.",20,29);
 doc.setFontSize(11);
 const filas:[string,string][]=[
  ["Nombre / Razón Social",data.nombre],
  ["NIT / CI",data.nit],
  ["Concepto",data.concepto],
  ["Monto",`${Number(data.monto).toLocaleString("es-BO",{minimumFractionDigits:2,maximumFractionDigits:2})} Bs.`],
  ["Fecha",data.fecha],
 ];
 if(data.referencia)filas.push(["Referencia NEXUS",data.referencia]);
 let y=44;
 for(const [k,v] of filas){doc.setFont("helvetica","bold");doc.text(`${k}:`,20,y);doc.setFont("helvetica","normal");const lines=doc.splitTextToSize(v,125);doc.text(lines,70,y);y+=Math.max(9,lines.length*6+3)}
 doc.setDrawColor(180);doc.line(20,y+4,190,y+4);doc.setFontSize(9);doc.text("Entregar este documento a la persona responsable de emisión de facturas.",20,y+12);
 const safe=(data.nombre||"facturacion").replace(/[^a-zA-Z0-9_-]+/g,"_").slice(0,40);
 doc.save(`Datos_Facturacion_${safe}.pdf`);
}
