export type ServicioVentaRapida={id:string;nombre:string;tarifa:number|null};

export const CATALOGO_VENTA_RAPIDA:ServicioVentaRapida[]=[
{id:"REC_CTA_IMP",nombre:"Recuperación de Cuenta e Impresión",tarifa:150},
{id:"IMP_CONFIRM",nombre:"Impresión de Confirmación",tarifa:10},
{id:"RASTREO_CTA",nombre:"Rastreo de Cuenta",tarifa:100},
{id:"ENVIO_INTERIOR",nombre:"Envío de Documentación al Interior",tarifa:120},
{id:"ASES_MIG_30",nombre:"Asesoría Migratoria 30 Minutos",tarifa:200},
{id:"ASES_MIG_30_50",nombre:"Asesoría Migratoria 30 a 50 Minutos",tarifa:300},
{id:"ASES_ULT_HORA",nombre:"Asesoría de Última Hora",tarifa:250},
{id:"SIM_CABINA",nombre:"Simulacro en Cabina Centro Simulación Consular",tarifa:450},
{id:"LLENADO_FORM",nombre:"Llenado de Formulario",tarifa:350},
{id:"ESTA",nombre:"Solicitud ESTA",tarifa:200},
{id:"REV_CASO",nombre:"Revisión de Caso e Interpretación",tarifa:200},
{id:"OTRO",nombre:"Otro Servicio – Detallar",tarifa:null},
];
