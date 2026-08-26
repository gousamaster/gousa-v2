export const CATALOGO_SERVICIOS_NEXUS = [
  {orden:1,nombre:"Solicitud Nueva Visa B1/B2 Cliente A MENOR",precio:600,recargoRegional:true},
  {orden:2,nombre:"Solicitud Nueva Visa B1/B2 Cliente A ADULTO",precio:750,recargoRegional:true},
  {orden:3,nombre:"Solicitud Nueva Visa B1/B2 Cliente B MENOR",precio:800,recargoRegional:true},
  {orden:4,nombre:"Solicitud Nueva Visa B1/B2 Cliente B ADULTO",precio:950,recargoRegional:true},
  {orden:5,nombre:"Solicitud Nueva Visa B1/B2 Cliente C MENOR",precio:1100,recargoRegional:true},
  {orden:6,nombre:"Solicitud Nueva Visa B1/B2 Cliente C ADULTO",precio:1300,recargoRegional:true},
  {orden:7,nombre:"Solicitud Nueva Visa B1/B2 con PERDÓN MIGRATORIO",precio:1350,recargoRegional:true},
  {orden:8,nombre:"Solicitud Nueva Visa F1/J1 Cliente A",precio:750,recargoRegional:true},
  {orden:9,nombre:"Solicitud Nueva Visa F1/J1 Cliente B",precio:950,recargoRegional:true},
  {orden:10,nombre:"Solicitud Renovación Visa B1/B2 por Courier",precio:550,recargoRegional:true},
  {orden:11,nombre:"Solicitud Renovación Visa B1/B2 con Entrevista",precio:700,recargoRegional:true},
  {orden:12,nombre:"Solicitud Visa No Inmigrante – otras categorías (A/C/D/G/M/P)",precio:1500,recargoRegional:true},
  {orden:13,nombre:"Solicitud Visa No Inmigrante – otras categorías (H/K/O)",precio:3000,recargoRegional:false},
  {orden:14,nombre:"Solicitud Visa Inmigrante",precio:10000,recargoRegional:false},
  {orden:15,nombre:"Asesoría Migratoria y Evaluación – 30 minutos (Virtual/Presencial)",precio:200,recargoRegional:false},
  {orden:16,nombre:"Asesoría Migratoria – 40 minutos a 1 hora (Virtual/Presencial)",precio:300,recargoRegional:false},
  {orden:17,nombre:"Simulacro en Centro de Simulación Consular",precio:450,recargoRegional:false},
  {orden:18,nombre:"Asesoría Última Hora",precio:200,recargoRegional:false},
  {orden:19,nombre:"Recuperación de Cuenta e Impresión",precio:150,recargoRegional:false},
  {orden:20,nombre:"Reprogramación y Monitoreo de Cita",precio:250,recargoRegional:false},
  {orden:21,nombre:"Recojo y Despacho de Documento",precio:120,recargoRegional:false},
  {orden:22,nombre:"Asesoría Renovación Pasaporte Americano",precio:300,recargoRegional:false},
  {orden:23,nombre:"Servicio de Asesoría Personalizada",precio:500,recargoRegional:false},
  {orden:24,nombre:"Solicitud Visa China – Turismo (L)",precio:550,recargoRegional:true},
  {orden:25,nombre:"Solicitud Visa China – Negocios (M)",precio:550,recargoRegional:true},
  {orden:26,nombre:"Solicitud Visa China – SIN RESPALDOS",precio:1000,recargoRegional:true},
  {orden:27,nombre:"Canton Fair Pack – Inscripción + habilitación de credencial",precio:700,recargoRegional:false},
  {orden:28,nombre:"Visa China + Canton Fair Pack",precio:1100,recargoRegional:true},
] as const;

export function precioServicioNexus(orden:number, regionNombre:string){
  const servicio=CATALOGO_SERVICIOS_NEXUS.find(s=>s.orden===orden);
  if(!servicio)return null;
  const esLaPaz=/la\s*paz/i.test(regionNombre);
  const recargo=!esLaPaz&&servicio.recargoRegional?100:0;
  return {base:servicio.precio,recargo,total:servicio.precio+recargo};
}
