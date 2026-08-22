"use server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "@/types/action-result-types";

export type HistorialClienteData={
  nombreTrabajoAnterior:string|null;
  cargoTrabajoAnterior:string|null;
  descripcionTrabajoAnterior:string|null;
  telefonoTrabajoAnterior:string|null;
  direccionTrabajoAnterior:string|null;
  fechaInicioTrabajoAnterior:string|null;
  fechaFinTrabajoAnterior:string|null;
  referenciaTrabajoAnterior:string|null;
  lugarEstudioAnterior:string|null;
  carreraEstudioAnterior:string|null;
  direccionEstudioAnterior:string|null;
  telefonoEstudioAnterior:string|null;
  fechaInicioEstudioAnterior:string|null;
  fechaFinEstudioAnterior:string|null;
  actualizadoPorNombre:string|null;
  updatedAt:string|null;
};

let ready=false;let promise:Promise<void>|null=null;
async function ensureSchema(){if(ready)return;if(promise)return promise;promise=(async()=>{await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "cliente_historial_previo" (
"clienteId" TEXT NOT NULL PRIMARY KEY REFERENCES "cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE,
"nombreTrabajoAnterior" TEXT,
"cargoTrabajoAnterior" TEXT,
"descripcionTrabajoAnterior" TEXT,
"telefonoTrabajoAnterior" TEXT,
"direccionTrabajoAnterior" TEXT,
"fechaInicioTrabajoAnterior" TIMESTAMP(3),
"fechaFinTrabajoAnterior" TIMESTAMP(3),
"referenciaTrabajoAnterior" TEXT,
"lugarEstudioAnterior" TEXT,
"carreraEstudioAnterior" TEXT,
"direccionEstudioAnterior" TEXT,
"telefonoEstudioAnterior" TEXT,
"fechaInicioEstudioAnterior" TIMESTAMP(3),
"fechaFinEstudioAnterior" TIMESTAMP(3),
"actualizadoPorId" TEXT REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE,
"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);ready=true})();try{await promise}finally{if(!ready)promise=null}}
function isoDate(v:Date|null){return v?v.toISOString().slice(0,10):null}
export async function obtenerHistorialCliente(clienteId:string):Promise<ActionResult<HistorialClienteData>>{try{await ensureSchema();const rows=await db.$queryRaw<Array<any>>`SELECT h.*,u."name" AS "actualizadoPorNombre",l."nombreTrabajoAnterior" AS "legacyNombre",l."telefonoTrabajoAnterior" AS "legacyTelefono",l."direccionTrabajoAnterior" AS "legacyDireccion",l."fechaInicioTrabajoAnterior" AS "legacyInicio",l."referenciaTrabajoAnterior" AS "legacyReferencia" FROM "cliente" c LEFT JOIN "cliente_historial_previo" h ON h."clienteId"=c."id" LEFT JOIN "cliente_datos_laborales" l ON l."clienteId"=c."id" LEFT JOIN "user" u ON u."id"=h."actualizadoPorId" WHERE c."id"=${clienteId} LIMIT 1`;const r=rows[0];if(!r)return{success:false,error:"Cliente no encontrado"};return{success:true,data:{nombreTrabajoAnterior:r.nombreTrabajoAnterior??r.legacyNombre??null,cargoTrabajoAnterior:r.cargoTrabajoAnterior??null,descripcionTrabajoAnterior:r.descripcionTrabajoAnterior??null,telefonoTrabajoAnterior:r.telefonoTrabajoAnterior??r.legacyTelefono??null,direccionTrabajoAnterior:r.direccionTrabajoAnterior??r.legacyDireccion??null,fechaInicioTrabajoAnterior:isoDate(r.fechaInicioTrabajoAnterior??r.legacyInicio??null),fechaFinTrabajoAnterior:isoDate(r.fechaFinTrabajoAnterior??null),referenciaTrabajoAnterior:r.referenciaTrabajoAnterior??r.legacyReferencia??null,lugarEstudioAnterior:r.lugarEstudioAnterior??null,carreraEstudioAnterior:r.carreraEstudioAnterior??null,direccionEstudioAnterior:r.direccionEstudioAnterior??null,telefonoEstudioAnterior:r.telefonoEstudioAnterior??null,fechaInicioEstudioAnterior:isoDate(r.fechaInicioEstudioAnterior??null),fechaFinEstudioAnterior:isoDate(r.fechaFinEstudioAnterior??null),actualizadoPorNombre:r.actualizadoPorNombre??null,updatedAt:r.updatedAt?r.updatedAt.toISOString():null}}}catch(e){console.error("obtenerHistorialCliente",e);return{success:false,error:"No se pudo cargar el historial previo"}}}
export async function guardarHistorialCliente(clienteId:string,input:Omit<HistorialClienteData,"actualizadoPorNombre"|"updatedAt">):Promise<ActionResult<void>>{try{await ensureSchema();const session=await auth.api.getSession({headers:await headers()});if(!session?.user?.id)return{success:false,error:"No autorizado"};const d=(v:string|null)=>v?new Date(`${v}T12:00:00.000Z`):null;await db.$executeRaw`INSERT INTO "cliente_historial_previo" ("clienteId","nombreTrabajoAnterior","cargoTrabajoAnterior","descripcionTrabajoAnterior","telefonoTrabajoAnterior","direccionTrabajoAnterior","fechaInicioTrabajoAnterior","fechaFinTrabajoAnterior","referenciaTrabajoAnterior","lugarEstudioAnterior","carreraEstudioAnterior","direccionEstudioAnterior","telefonoEstudioAnterior","fechaInicioEstudioAnterior","fechaFinEstudioAnterior","actualizadoPorId","createdAt","updatedAt") VALUES (${clienteId},${input.nombreTrabajoAnterior||null},${input.cargoTrabajoAnterior||null},${input.descripcionTrabajoAnterior||null},${input.telefonoTrabajoAnterior||null},${input.direccionTrabajoAnterior||null},${d(input.fechaInicioTrabajoAnterior)},${d(input.fechaFinTrabajoAnterior)},${input.referenciaTrabajoAnterior||null},${input.lugarEstudioAnterior||null},${input.carreraEstudioAnterior||null},${input.direccionEstudioAnterior||null},${input.telefonoEstudioAnterior||null},${d(input.fechaInicioEstudioAnterior)},${d(input.fechaFinEstudioAnterior)},${session.user.id},NOW(),NOW()) ON CONFLICT ("clienteId") DO UPDATE SET "nombreTrabajoAnterior"=EXCLUDED."nombreTrabajoAnterior","cargoTrabajoAnterior"=EXCLUDED."cargoTrabajoAnterior","descripcionTrabajoAnterior"=EXCLUDED."descripcionTrabajoAnterior","telefonoTrabajoAnterior"=EXCLUDED."telefonoTrabajoAnterior","direccionTrabajoAnterior"=EXCLUDED."direccionTrabajoAnterior","fechaInicioTrabajoAnterior"=EXCLUDED."fechaInicioTrabajoAnterior","fechaFinTrabajoAnterior"=EXCLUDED."fechaFinTrabajoAnterior","referenciaTrabajoAnterior"=EXCLUDED."referenciaTrabajoAnterior","lugarEstudioAnterior"=EXCLUDED."lugarEstudioAnterior","carreraEstudioAnterior"=EXCLUDED."carreraEstudioAnterior","direccionEstudioAnterior"=EXCLUDED."direccionEstudioAnterior","telefonoEstudioAnterior"=EXCLUDED."telefonoEstudioAnterior","fechaInicioEstudioAnterior"=EXCLUDED."fechaInicioEstudioAnterior","fechaFinEstudioAnterior"=EXCLUDED."fechaFinEstudioAnterior","actualizadoPorId"=EXCLUDED."actualizadoPorId","updatedAt"=NOW()`;
await db.$executeRaw`INSERT INTO "cliente_datos_laborales" ("id","clienteId","nombreTrabajoAnterior","telefonoTrabajoAnterior","direccionTrabajoAnterior","fechaInicioTrabajoAnterior","referenciaTrabajoAnterior","createdAt","updatedAt") VALUES (${crypto.randomUUID()},${clienteId},${input.nombreTrabajoAnterior||null},${input.telefonoTrabajoAnterior||null},${input.direccionTrabajoAnterior||null},${d(input.fechaInicioTrabajoAnterior)},${input.referenciaTrabajoAnterior||null},NOW(),NOW()) ON CONFLICT ("clienteId") DO UPDATE SET "nombreTrabajoAnterior"=EXCLUDED."nombreTrabajoAnterior","telefonoTrabajoAnterior"=EXCLUDED."telefonoTrabajoAnterior","direccionTrabajoAnterior"=EXCLUDED."direccionTrabajoAnterior","fechaInicioTrabajoAnterior"=EXCLUDED."fechaInicioTrabajoAnterior","referenciaTrabajoAnterior"=EXCLUDED."referenciaTrabajoAnterior","updatedAt"=NOW()`;return{success:true}}catch(e){console.error("guardarHistorialCliente",e);return{success:false,error:"No se pudo guardar el historial previo"}}}
