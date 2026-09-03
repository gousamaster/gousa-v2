"use server";
import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import {db} from "@/lib/db";
import {registrarAuditoriaNexus} from "@/lib/auditoria-nexus";
import type {ActionResult} from "@/types/action-result-types";

export type NarrativasNexus={
  trabajoActualEs:string|null; trabajoActualEn:string|null;
  trabajoAnteriorEs:string|null; trabajoAnteriorEn:string|null;
  motivoViajeEs:string|null; motivoViajeEn:string|null;
  motivoNegacionEs:string|null; motivoNegacionEn:string|null;
  sobreestadiaEs:string|null; sobreestadiaEn:string|null;
  antecedenteMigratorioEs:string|null; antecedenteMigratorioEn:string|null;
  actualizadoPorNombre:string|null; updatedAt:string|null;
};

type Editable=Omit<NarrativasNexus,"actualizadoPorNombre"|"updatedAt">;
const vacio:Editable={trabajoActualEs:null,trabajoActualEn:null,trabajoAnteriorEs:null,trabajoAnteriorEn:null,motivoViajeEs:null,motivoViajeEn:null,motivoNegacionEs:null,motivoNegacionEn:null,sobreestadiaEs:null,sobreestadiaEn:null,antecedenteMigratorioEs:null,antecedenteMigratorioEn:null};

export async function obtenerNarrativasNexus(clienteId:string):Promise<ActionResult<NarrativasNexus>>{
 try{const rows=await db.$queryRaw<Array<any>>`SELECT n.*,u."name" AS "actualizadoPorNombre" FROM "cliente_narrativas_nexus" n LEFT JOIN "user" u ON u."id"=n."actualizadoPorId" WHERE n."clienteId"=${clienteId} LIMIT 1`;const r=rows[0];if(!r)return{success:true,data:{...vacio,actualizadoPorNombre:null,updatedAt:null}};return{success:true,data:{trabajoActualEs:r.trabajoActualEs,trabajoActualEn:r.trabajoActualEn,trabajoAnteriorEs:r.trabajoAnteriorEs,trabajoAnteriorEn:r.trabajoAnteriorEn,motivoViajeEs:r.motivoViajeEs,motivoViajeEn:r.motivoViajeEn,motivoNegacionEs:r.motivoNegacionEs,motivoNegacionEn:r.motivoNegacionEn,sobreestadiaEs:r.sobreestadiaEs,sobreestadiaEn:r.sobreestadiaEn,antecedenteMigratorioEs:r.antecedenteMigratorioEs,antecedenteMigratorioEn:r.antecedenteMigratorioEn,actualizadoPorNombre:r.actualizadoPorNombre,updatedAt:r.updatedAt?.toISOString?.()??String(r.updatedAt)}}}catch(e){console.error(e);return{success:false,error:"Error al obtener narrativas NEXUS"}}
}

export async function guardarNarrativasNexus(clienteId:string,d:Editable):Promise<ActionResult<void>>{
 try{const s=await auth.api.getSession({headers:await headers()});if(!s?.user?.id)return{success:false,error:"No autorizado"};const v=(x:string|null)=>x?.trim()||null;await db.$executeRaw`INSERT INTO "cliente_narrativas_nexus" ("clienteId","trabajoActualEs","trabajoActualEn","trabajoAnteriorEs","trabajoAnteriorEn","motivoViajeEs","motivoViajeEn","motivoNegacionEs","motivoNegacionEn","sobreestadiaEs","sobreestadiaEn","antecedenteMigratorioEs","antecedenteMigratorioEn","actualizadoPorId","createdAt","updatedAt") VALUES (${clienteId},${v(d.trabajoActualEs)},${v(d.trabajoActualEn)},${v(d.trabajoAnteriorEs)},${v(d.trabajoAnteriorEn)},${v(d.motivoViajeEs)},${v(d.motivoViajeEn)},${v(d.motivoNegacionEs)},${v(d.motivoNegacionEn)},${v(d.sobreestadiaEs)},${v(d.sobreestadiaEn)},${v(d.antecedenteMigratorioEs)},${v(d.antecedenteMigratorioEn)},${s.user.id},NOW(),NOW()) ON CONFLICT ("clienteId") DO UPDATE SET "trabajoActualEs"=EXCLUDED."trabajoActualEs","trabajoActualEn"=EXCLUDED."trabajoActualEn","trabajoAnteriorEs"=EXCLUDED."trabajoAnteriorEs","trabajoAnteriorEn"=EXCLUDED."trabajoAnteriorEn","motivoViajeEs"=EXCLUDED."motivoViajeEs","motivoViajeEn"=EXCLUDED."motivoViajeEn","motivoNegacionEs"=EXCLUDED."motivoNegacionEs","motivoNegacionEn"=EXCLUDED."motivoNegacionEn","sobreestadiaEs"=EXCLUDED."sobreestadiaEs","sobreestadiaEn"=EXCLUDED."sobreestadiaEn","antecedenteMigratorioEs"=EXCLUDED."antecedenteMigratorioEs","antecedenteMigratorioEn"=EXCLUDED."antecedenteMigratorioEn","actualizadoPorId"=EXCLUDED."actualizadoPorId","updatedAt"=NOW()`;await registrarAuditoriaNexus({accion:"NARRATIVAS BILINGUES ACTUALIZADAS",entidad:"Cliente",entidadId:clienteId,clienteId,usuarioId:s.user.id,detalle:"Trabajo y antecedentes migratorios ES/EN actualizados"});return{success:true}}catch(e){console.error(e);return{success:false,error:"Error al guardar narrativas NEXUS"}}
}
