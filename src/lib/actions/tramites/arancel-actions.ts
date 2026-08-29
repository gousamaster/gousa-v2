"use server";
import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import {db} from "@/lib/db";
import {registrarAuditoriaNexus} from "@/lib/auditoria-nexus";
import type {ActionResult} from "@/types/action-result-types";

export type ArancelPendienteTime={id:string;tramiteId:string;clienteId:string;clienteNombre:string;servicioNombre:string;fechaEnvio:Date;venceAt:Date;estado:string;observacion:string|null;ultimoUsuario:string|null};
export type ArancelEstadoNexus={id:string;fechaEnvio:Date;venceAt:Date;estado:string;observacion:string|null;pagoConfirmadoAt:Date|null;ultimoUsuario:string|null};

async function sessionUser(){const s=await auth.api.getSession({headers:await headers()});return s?.user?.id??null}

export async function obtenerEstadoArancel(tramiteId:string):Promise<ActionResult<ArancelEstadoNexus|null>>{
 try{const rows=await db.$queryRaw<Array<{id:string;fechaEnvio:Date;venceAt:Date;estado:string;observacion:string|null;pagoConfirmadoAt:Date|null;ultimoUsuario:string|null}>>`SELECT a."id",a."fechaEnvio",a."venceAt",a."estado",a."observacion",a."pagoConfirmadoAt",u."name" AS "ultimoUsuario" FROM "tramite_arancel_nexus" a LEFT JOIN "user" u ON u."id"=a."ultimoUsuarioId" WHERE a."tramiteId"=${tramiteId} LIMIT 1`;return{success:true,data:rows[0]??null}
 }catch(e){console.error(e);return{success:false,error:"No se pudo cargar el seguimiento de arancel"}}
}

export async function registrarEnvioHojaArancel(tramiteId:string,fechaEnvio:string,observacion?:string|null):Promise<ActionResult<void>>{
 try{const userId=await sessionUser();if(!userId)return{success:false,error:"No autorizado"};const t=await db.tramite.findUnique({where:{id:tramiteId},select:{clienteId:true}});if(!t)return{success:false,error:"Trámite no encontrado"};const fecha=new Date(fechaEnvio);if(Number.isNaN(fecha.getTime()))return{success:false,error:"Fecha de envío inválida"};if(fecha.getTime()>Date.now()+5*60*1000)return{success:false,error:"La fecha de envío no puede estar en el futuro"};const vence=new Date(fecha.getTime()+24*60*60*1000);
 await db.$executeRaw`INSERT INTO "tramite_arancel_nexus" ("id","tramiteId","clienteId","fechaEnvio","venceAt","estado","observacion","ultimoUsuarioId","createdAt","updatedAt") VALUES (${crypto.randomUUID()},${tramiteId},${t.clienteId},${fecha},${vence},'PENDIENTE',${observacion?.trim()||null},${userId},NOW(),NOW()) ON CONFLICT ("tramiteId") DO UPDATE SET "fechaEnvio"=EXCLUDED."fechaEnvio","venceAt"=EXCLUDED."venceAt","estado"='PENDIENTE',"observacion"=EXCLUDED."observacion","ultimoUsuarioId"=EXCLUDED."ultimoUsuarioId","pagoConfirmadoAt"=NULL,"updatedAt"=NOW()`;
 await registrarAuditoriaNexus({accion:"HOJA DE PAGO ENVIADA",entidad:"Arancel",entidadId:tramiteId,clienteId:t.clienteId,usuarioId:userId,detalle:`Seguimiento programado para ${vence.toLocaleString("es-BO")}`});return{success:true}
 }catch(e){console.error(e);return{success:false,error:"No se pudo registrar el envío de la hoja de pago"}}
}

export async function confirmarPagoArancel(tramiteId:string):Promise<ActionResult<void>>{
 try{const userId=await sessionUser();if(!userId)return{success:false,error:"No autorizado"};const t=await db.tramite.findUnique({where:{id:tramiteId},select:{clienteId:true}});if(!t)return{success:false,error:"Trámite no encontrado"};const estado=await db.$queryRaw<Array<{venceAt:Date;estado:string}>>`SELECT "venceAt","estado" FROM "tramite_arancel_nexus" WHERE "tramiteId"=${tramiteId} LIMIT 1`;if(!estado[0])return{success:false,error:"Primero registra el envío de la hoja de pago"};if(estado[0].estado==="PAGADO")return{success:true};if(new Date(estado[0].venceAt).getTime()>Date.now())return{success:false,error:"Deben cumplirse al menos 24 horas desde el envío de la hoja antes de confirmar el pago"};const r=await db.$executeRaw`UPDATE "tramite_arancel_nexus" SET "estado"='PAGADO',"pagoConfirmadoAt"=NOW(),"ultimoUsuarioId"=${userId},"updatedAt"=NOW() WHERE "tramiteId"=${tramiteId}`;if(!r)return{success:false,error:"No se pudo confirmar el pago"};await registrarAuditoriaNexus({accion:"PAGO DE ARANCEL CONFIRMADO",entidad:"Arancel",entidadId:tramiteId,clienteId:t.clienteId,usuarioId:userId,detalle:"Arancel confirmado después del periodo mínimo de 24 horas. Cliente habilitado para programación de cita."});return{success:true}
 }catch(e){console.error(e);return{success:false,error:"No se pudo confirmar el pago del arancel"}}
}

export async function reenviarHojaArancel(tramiteId:string,nuevaFecha:string,observacion?:string|null):Promise<ActionResult<void>>{
 try{const userId=await sessionUser();if(!userId)return{success:false,error:"No autorizado"};const t=await db.tramite.findUnique({where:{id:tramiteId},select:{clienteId:true}});if(!t)return{success:false,error:"Trámite no encontrado"};const fecha=new Date(nuevaFecha);if(Number.isNaN(fecha.getTime()))return{success:false,error:"Fecha de reenvío inválida"};if(fecha.getTime()>Date.now()+5*60*1000)return{success:false,error:"La fecha de reenvío no puede estar en el futuro"};const vence=new Date(fecha.getTime()+24*60*60*1000);const r=await db.$executeRaw`UPDATE "tramite_arancel_nexus" SET "fechaEnvio"=${fecha},"venceAt"=${vence},"estado"='REENVIADO',"observacion"=${observacion?.trim()||null},"ultimoUsuarioId"=${userId},"pagoConfirmadoAt"=NULL,"updatedAt"=NOW() WHERE "tramiteId"=${tramiteId}`;if(!r)return{success:false,error:"Primero registra el envío inicial de la hoja"};await registrarAuditoriaNexus({accion:"HOJA DE PAGO REENVIADA",entidad:"Arancel",entidadId:tramiteId,clienteId:t.clienteId,usuarioId:userId,detalle:`Nuevo seguimiento en 24 horas${observacion?` · ${observacion}`:""}`});return{success:true}
 }catch(e){console.error(e);return{success:false,error:"No se pudo registrar el reenvío"}}
}

export async function obtenerArancelesPendientesTime():Promise<ActionResult<ArancelPendienteTime[]>>{
 try{const rows=await db.$queryRaw<Array<{id:string;tramiteId:string;clienteId:string;clienteNombre:string;servicioNombre:string;fechaEnvio:Date;venceAt:Date;estado:string;observacion:string|null;ultimoUsuario:string|null}>>`SELECT a."id",a."tramiteId",a."clienteId",concat(c."nombres",' ',c."apellidos") AS "clienteNombre",s."nombre" AS "servicioNombre",a."fechaEnvio",a."venceAt",a."estado",a."observacion",u."name" AS "ultimoUsuario" FROM "tramite_arancel_nexus" a JOIN "tramite" t ON t."id"=a."tramiteId" JOIN "cliente" c ON c."id"=a."clienteId" JOIN "cliente_servicio" cs ON cs."id"=t."clienteServicioId" JOIN "catalogo_servicio" s ON s."id"=cs."servicioId" LEFT JOIN "user" u ON u."id"=a."ultimoUsuarioId" WHERE a."estado" IN ('PENDIENTE','REENVIADO') AND a."venceAt"<=NOW() ORDER BY a."venceAt" ASC`;return{success:true,data:rows}
 }catch(e){console.error(e);return{success:false,error:"No se pudieron cargar los pendientes de arancel"}}
}
