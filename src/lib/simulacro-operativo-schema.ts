import { db } from "@/lib/db";

let ready=false;
let promise:Promise<void>|null=null;

export async function ensureSimulacroOperativoSchema(){
  if(ready)return;
  if(promise)return promise;
  promise=(async()=>{
    await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "simulacro_operativo" (
      "citaId" TEXT NOT NULL PRIMARY KEY REFERENCES "cita"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      "perfil" TEXT,
      "documentos" JSONB NOT NULL DEFAULT '[]'::jsonb,
      "observaciones" TEXT,
      "realizado" BOOLEAN NOT NULL DEFAULT FALSE,
      "realizadoAt" TIMESTAMP(3),
      "atendidoPorId" TEXT REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    ready=true;
  })();
  try{await promise;}finally{if(!ready)promise=null;}
}
