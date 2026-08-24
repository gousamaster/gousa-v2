export const PROSPECTO_SCORE_VERSION = "NEXUS-SCORE-2.3-GOUSA-2027";

export type ScoreOption = { value:string; label:string; factor:number; puntos:number };
export type ScoreQuestion = { id:string; titulo:string; ayuda:string; peso:number; opciones:ScoreOption[]; tipo?:"BASE"|"PENALIDAD"; multiple?:boolean; maxSelections?:number };
export type ProspectoScoreAnswers = Record<string,string|string[]>;
export type ProspectoScoreInsight = { preguntaId:string; titulo:string; respuesta:string; aporte:number; peso:number };
export type ProspectoScoreAnalysis = { prioridadComercial:"ALTA"|"MEDIA"|"BAJA"; fortalezas:ProspectoScoreInsight[]; alertas:ProspectoScoreInsight[]; acciones:string[] };

function opcion(value:string,label:string,puntos:number,peso:number):ScoreOption{return{value,label,puntos,factor:peso===0?(puntos<0?-1:1):puntos/peso}}

export const PROSPECTO_SCORE_QUESTIONS:ScoreQuestion[]=[
 {id:"estado_civil",titulo:"Estado civil declarado",ayuda:"Registrar la situación actual tal como fue informada por el prospecto.",peso:10,tipo:"BASE",opciones:[opcion("soltero","Soltero(a)",4,10),opcion("casado","Casado(a)",10,10),opcion("divorciado","Divorciado(a)",6,10),opcion("conviviente","Conviviente",8,10)]},
 {id:"hijos",titulo:"Situación de hijos",ayuda:"Seleccionar la alternativa que mejor representa la situación familiar declarada.",peso:5,tipo:"BASE",opciones:[opcion("dependientes","Con hijos dependientes",5,5),opcion("independientes","Con hijos independientes",4,5),opcion("sin_hijos","Sin hijos",1,5)]},
 {id:"situacion_laboral",titulo:"Situación laboral principal",ayuda:"Seleccionar una sola alternativa principal.",peso:15,tipo:"BASE",opciones:[
   opcion("dependiente_privada_5","Dependiente empresa privada +5 años",10,15),
   opcion("dependiente_publica_5","Dependiente empresa pública +5 años",15,15),
   opcion("dependiente_menos_2_gestora","Dependiente hace menos de 2 años pero aporta a Gestora",5,15),
   opcion("independiente_nit_menos_2_movimiento","Independiente con NIT menos de 2 años y movimiento",10,15),
   opcion("independiente_nit_5","Independiente con NIT +5 años",15,15),
   opcion("independiente_sin_respaldo","Independiente sin respaldo",5,15),
   opcion("independiente_sin_nit_buenas_transacciones","Independiente sin NIT pero con buenas transacciones",10,15),
   opcion("sin_trabajo_renta","Sin trabajo, con renta/propiedades",12,15),
   opcion("sin_trabajo_patrocinante","Sin trabajo, con patrocinante",8,15),
   opcion("sin_trabajo_sin_patrocinante","Sin trabajo y sin patrocinante",-10,15)
 ]},
 {id:"antiguedad_laboral",titulo:"Antigüedad / estabilidad laboral",ayuda:"Aplicar a la actividad laboral, empresarial o económica principal cuando corresponda.",peso:15,tipo:"BASE",opciones:[
   opcion("menos_1","Menos de 1 año",4,15),
   opcion("1_2","Estable entre 1 a 2 años",6,15),
   opcion("3_5","Estable entre 3 a 5 años",10,15),
   opcion("mas_5","Estable más de 5 años",15,15),
   opcion("no_aplica_invitacion_dependiente","No aplica: viaja con invitación o como dependiente de alguien",13,15)
 ]},
 {id:"ingresos",titulo:"Percepción salarial / ingresos mensuales",ayuda:"Usar el ingreso mensual principal declarado y respaldable.",peso:15,tipo:"BASE",opciones:[opcion("hasta_3300","Bs 3.300 o menos",2,15),opcion("3300_6000","Bs 3.300 a Bs 6.000",4,15),opcion("6000_9999","Bs 6.000 a Bs 9.999",9,15),opcion("10000_19999","Bs 10.000 a Bs 19.999",12,15),opcion("20000_mas","Bs 20.000 o más",15,15)]},
 {id:"vivienda",titulo:"Vivienda / estabilidad residencial",ayuda:"Seleccionar la condición residencial principal.",peso:10,tipo:"BASE",opciones:[
   opcion("propiedad","Propiedad inmueble a su nombre",10,10),
   opcion("anticretico","Anticrético",7,10),
   opcion("alquiler_menor_2500","Alquiler hasta Bs 2.500",3,10),
   opcion("alquiler_3000_mas","Alquiler Bs 3.000 o más",5,10),
   opcion("vive_padres","Vive con padres",4,10)
 ]},
 {id:"solidez_financiera",titulo:"Principal señal patrimonial / financiera",ayuda:"Elegir la señal que mejor represente la situación actual.",peso:10,tipo:"BASE",opciones:[
   opcion("otro_patrimonio","Otro patrimonio a su nombre",7,10),
   opcion("cuentas_bancarias","Cuentas bancarias con ahorro/movimiento",10,10),
   opcion("efectivo_ahorrado","Dinero en efectivo ahorrado",6,10),
   opcion("deuda_alta_productiva","Deuda bancaria alta vinculada a negocio/propiedad",10,10),
   opcion("deuda_mediana_baja","Deuda bancaria mediana o baja",5,10),
   opcion("sin_deuda_sin_bienes","Sin deuda pero sin bienes",-6,10)
 ]},
 {id:"entorno_usa",titulo:"Contexto de viaje / vínculos en Estados Unidos",ayuda:"Registrar la situación que mejor describa el contexto principal del viaje.",peso:10,tipo:"BASE",opciones:[
   opcion("familiar_ciudadano","Familiar de primer grado ciudadano estadounidense",8,10),
   opcion("evento_feria","Invitación a evento o feria en Estados Unidos",10,10),
   opcion("amistad_legal","Amistad o conocido en USA con estatus legal, ciudadano o residente estable",7,10),
   opcion("sin_conocido_respaldo","Sin ningún conocido en USA pero con respaldos",10,10),
   opcion("motivo_no_claro","No tiene claro el motivo de viaje",0,10),
   opcion("familiar_directo_irregular","Familiar directo en USA con situación migratoria irregular",-16,10)
 ]},
 {id:"historial_viajes",titulo:"Historial de viajes al exterior",ayuda:"Seleccionar la alternativa que mejor resuma el historial internacional declarado.",peso:10,tipo:"BASE",opciones:[
   opcion("mas_3_fuera_fronteras","Más de 3 países fuera de fronteras visitados en los últimos años",10,10),
   opcion("al_menos_2_fronterizos_5","Al menos 2 países visitados (fronterizos) en los últimos 5 años",6,10),
   opcion("mas_5_historicos","Más de 5 países visitados, pero de forma histórica",6,10),
   opcion("ninguno_laboral","Ningún viaje al exterior por temas laborales",6,10),
   opcion("ninguno_falta_interes","Ningún viaje al exterior por falta de interés",2,10)
 ]},
 {id:"antecedentes",titulo:"ANTECEDENTES",ayuda:"Selecciona hasta 2 antecedentes relevantes. Si no corresponde ninguno, marca “Sin antecedentes”.",peso:0,tipo:"PENALIDAD",multiple:true,maxSelections:2,opciones:[
   opcion("deportacion_menos_20","Deportación / remoción de EE.UU. hace menos de 20 años",-25,0),
   opcion("estadia_menos_2","Estadía irregular en EE.UU. · salió hace menos de 2 años",-25,0),
   opcion("estadia_aprox_5","Estadía irregular en EE.UU. · salió hace aproximadamente 5 años",-20,0),
   opcion("estadia_5_10","Estadía irregular en EE.UU. · salió hace 5 a 10 años",-15,0),
   opcion("estadia_mas_10","Estadía irregular en EE.UU. · salió hace más de 10 años",-10,0),
   opcion("estadia_mas_10_estable","Estadía irregular en EE.UU. · salió hace más de 10 años y hoy su situación es estable",-3,0),
   opcion("negacion_usa_menos_1_sin_cambios","Negación previa de visa USA · menos de 1 año y sin cambios",-15,0),
   opcion("negacion_usa_2_5_con_cambios","Negación previa de visa USA · hace 2 a 5 años y existen cambios",-6,0),
   opcion("negacion_usa_mas_5_con_cambios","Negación previa de visa USA · hace más de 5 años y existen cambios",-3,0),
   opcion("negacion_otro_ultimos_5","Negación de visa de otro país · últimos 5 años",-5,0),
   opcion("negacion_otro_mas_5","Negación de visa de otro país · hace más de 5 años",-2,0),
   opcion("vivio_otro_pais_reciente","Vivió/migró en otro país · actualmente o recientemente",-10,0),
   opcion("antecedente_usa_antiguo","Otro antecedente en USA · antecedente antiguo",-3,0),
   opcion("detencion_antecedente","Otro antecedente en USA · incluyó detención y antecedente",-22,0),
   opcion("fianza_sin_problema","Otro antecedente en USA · tuvo pago de fianza y no hubo otro problema declarado",-10,0),
   opcion("sin_antecedentes","Sin antecedentes",0,0)
 ]}
];

function selectedOptions(pregunta:ScoreQuestion,respuesta:string|string[]|undefined){const values=Array.isArray(respuesta)?respuesta:[respuesta].filter(Boolean) as string[];return values.map(value=>pregunta.opciones.find(o=>o.value===value)).filter((o):o is ScoreOption=>Boolean(o))}

export function calcularProspectoScore(respuestas:ProspectoScoreAnswers){let score=0;for(const pregunta of PROSPECTO_SCORE_QUESTIONS){const seleccionadas=selectedOptions(pregunta,respuestas[pregunta.id]);if(!seleccionadas.length)throw new Error(`Respuesta inválida para ${pregunta.id}`);score+=seleccionadas.reduce((total,item)=>total+item.puntos,0)}const scoreNormalizado=Math.max(0,Math.min(100,Math.round(score)));return{score:scoreNormalizado,clasificacion:clasificarProspectoScore(scoreNormalizado)}}

export function analizarProspectoScore(respuestas:ProspectoScoreAnswers):ProspectoScoreAnalysis{const items=PROSPECTO_SCORE_QUESTIONS.flatMap(p=>selectedOptions(p,respuestas[p.id]).map(s=>({preguntaId:p.id,titulo:p.titulo,respuesta:s.label,aporte:s.puntos,peso:p.peso,factor:s.factor,tipo:p.tipo})));const fortalezas=items.filter(i=>i.tipo!=="PENALIDAD"&&i.factor>=.75).sort((a,b)=>b.aporte-a.aporte).slice(0,4).map(({factor:_f,tipo:_t,...i})=>i);const alertas=items.filter(i=>i.aporte<0).sort((a,b)=>a.aporte-b.aporte).slice(0,6).map(({factor:_f,tipo:_t,...i})=>i);const acciones=alertas.map(a=>a.tipo==="PENALIDAD"?`Revisar antecedente migratorio antes de avanzar: ${a.respuesta}.`:`Revisar: ${a.titulo}.`);const{score}=calcularProspectoScore(respuestas);const prioridadComercial=score>=70?"ALTA":score>=45?"MEDIA":"BAJA";return{prioridadComercial,fortalezas,alertas,acciones:[...new Set(acciones)].slice(0,6)} as ProspectoScoreAnalysis}

export function clasificarProspectoScore(score:number){if(score>=70)return"ALTA_OPORTUNIDAD";if(score>=45)return"MEDIA_OPORTUNIDAD";return"BAJA_OPORTUNIDAD"}

export function validarRespuestasProspectoScore(respuestas:ProspectoScoreAnswers){return PROSPECTO_SCORE_QUESTIONS.every(p=>{const respuesta=respuestas[p.id];if(p.multiple){if(!Array.isArray(respuesta)||respuesta.length<1||respuesta.length>(p.maxSelections??2))return false;const sin=respuesta.includes("sin_antecedentes");if(sin&&respuesta.length>1)return false;return respuesta.every(v=>p.opciones.some(o=>o.value===v))}return typeof respuesta==="string"&&p.opciones.some(o=>o.value===respuesta)})}
