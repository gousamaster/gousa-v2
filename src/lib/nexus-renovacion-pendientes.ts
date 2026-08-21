import { db } from "@/lib/db";import { ensureNexusPostConsularSchema } from "@/lib/nexus-post-consular-schema";
export async function getRenovacionesCourierPendientes(){await ensureNexusPostConsularSchema();return db.$queryRaw<Array<{tramiteId:string;clienteId:string|null;cliente:string|null;fechaDespacho:Date;dias:number;prioridad:string}>>`
 SELECT r."tramiteId",r."clienteId",TRIM(COALESCE(c."nombres",'')||' '||COALESCE(c."apellidos",'')) AS cliente,r."fechaDespacho",FLOOR(EXTRACT(EPOCH FROM (NOW()-r."fechaDespacho"))/86400)::int AS dias,
 CASE WHEN NOW()-r."fechaDespacho">INTERVAL '25 days' THEN 'VENCIDO' WHEN NOW()-r."fechaDespacho">=INTERVAL '20 days' THEN 'ALTA' WHEN NOW()-r."fechaDespacho">=INTERVAL '5 days' THEN 'REVISAR' ELSE 'EN_PLAZO' END AS prioridad
 FROM "nexus_renovacion" r LEFT JOIN "cliente" c ON c."id"=r."clienteId" WHERE r."via"='COURIER' AND r."fechaDespacho" IS NOT NULL AND r."fechaRetorno" IS NULL ORDER BY r."fechaDespacho" ASC`}
