import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { db } from "@/lib/db";

function credentialsKey(){
  const secret=process.env.NEXUS_CREDENTIALS_KEY||process.env.BETTER_AUTH_SECRET||process.env.AUTH_SECRET;
  if(!secret)throw new Error("Falta configurar una clave de cifrado para credenciales");
  return createHash("sha256").update(secret).digest();
}

export function encryptCredential(value:string){
  const iv=randomBytes(12);const cipher=createCipheriv("aes-256-gcm",credentialsKey(),iv);
  const encrypted=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);
  const tag=cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptCredential(value:string){
  const [ivB64,tagB64,dataB64]=value.split(".");
  if(!ivB64||!tagB64||!dataB64)throw new Error("Credencial cifrada inválida");
  const decipher=createDecipheriv("aes-256-gcm",credentialsKey(),Buffer.from(ivB64,"base64"));
  decipher.setAuthTag(Buffer.from(tagB64,"base64"));
  return Buffer.concat([decipher.update(Buffer.from(dataB64,"base64")),decipher.final()]).toString("utf8");
}

export async function ensureClienteCentroVisasSchema(){
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "cliente_centro_visas" (
      "clienteId" TEXT PRIMARY KEY REFERENCES "cliente"("id") ON DELETE CASCADE,
      "mismoCorreo" BOOLEAN NOT NULL DEFAULT TRUE,
      "email" TEXT NOT NULL,
      "passwordEncrypted" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function getClienteCentroVisas(clienteId:string){
  await ensureClienteCentroVisasSchema();
  const rows=await db.$queryRaw<Array<{mismoCorreo:boolean;email:string;passwordEncrypted:string}>>`
    SELECT "mismoCorreo","email","passwordEncrypted" FROM "cliente_centro_visas" WHERE "clienteId"=${clienteId} LIMIT 1
  `;
  return rows[0]??null;
}

export async function upsertClienteCentroVisas(args:{clienteId:string;mismoCorreo:boolean;email:string;password?:string|null}){
  await ensureClienteCentroVisasSchema();
  const actual=await getClienteCentroVisas(args.clienteId);
  const encrypted=args.password?.trim()?encryptCredential(args.password.trim()):actual?.passwordEncrypted;
  if(!encrypted)throw new Error("La contraseña del Centro de Visas es obligatoria");
  await db.$executeRaw`
    INSERT INTO "cliente_centro_visas" ("clienteId","mismoCorreo","email","passwordEncrypted","updatedAt")
    VALUES (${args.clienteId},${args.mismoCorreo},${args.email},${encrypted},CURRENT_TIMESTAMP)
    ON CONFLICT ("clienteId") DO UPDATE SET
      "mismoCorreo"=${args.mismoCorreo},"email"=${args.email},"passwordEncrypted"=${encrypted},"updatedAt"=CURRENT_TIMESTAMP
  `;
}
