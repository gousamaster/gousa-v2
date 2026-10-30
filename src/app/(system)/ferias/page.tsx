import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

type Servicio = { id:string; nombre:string; region_id:string; region:string; precio:number };
type Reserva = { id:bigint; cliente_nombre:string; telefono:string; servicio_nombre:string; precio:number; anticipo:number; metodo_pago:string; comprobante_numero:string|null; estado:string; creado_at:Date };
const fmt=(n:number)=>Number(n).toFixed(2);
const folio=(id:bigint)=>`FER-2026-${String(id).padStart(4,"0")}`;

async function user() {
 const session=await auth.api.getSession({headers:await headers()});
 if(!session?.user?.id) redirect("/sign-in");
 const found=await db.user.findUnique({where:{id:session.user.id},select:{id:true,role:true,status:true,banned:true}});
 if(!found||found.status!=="ACTIVE"||found.banned) redirect("/sign-in");
 return found;
}

async function registrar(form:FormData) {
 "use server";
 const u=await user();
 const nombre=String(form.get("nombre")||"").trim().slice(0,150);
 const telefono=String(form.get("telefono")||"").replace(/[^0-9+]/g,"").slice(0,25);
 const servicioId=String(form.get("servicio")||"");
 const [servicioIdReal,regionId]=servicioId.split("|");
 const anticipo=Number(form.get("anticipo")||100);
 const metodo=String(form.get("metodo")||"QR");
 const comprobante=String(form.get("comprobante")||"").trim().slice(0,120);
 const fecha=String(form.get("fecha")||"");
 const respaldo=String(form.get("respaldo")||"").trim().slice(0,500);
 if(!nombre||telefono.length<7||!["QR","EFECTIVO"].includes(metodo)||!Number.isFinite(anticipo)||anticipo<0|| (fecha&&!/^\\d{4}-\\d{2}-\\d{2}$/.test(fecha))) redirect("/ferias?error=datos");
 const precios=await db.$queryRaw<{nombre:string;precio:Prisma.Decimal}[]>`select s.nombre,p.precio from catalogo_servicio s join servicio_precio_por_region p on p."servicioId"=s.id where s.id=${servicioIdReal} and p."regionId"=${regionId} and s.activo=true and p.activo=true limit 1`;
 if(!precios.length||anticipo>Number(precios[0].precio)) redirect("/ferias?error=precio");
 const result=await db.$queryRaw<{id:bigint}[]>`insert into feria_reserva(cliente_nombre,telefono,servicio_id,servicio_nombre,region_id,precio,anticipo,metodo_pago,comprobante_numero,comprobante_fecha,respaldo_url,creado_por_id) values (${nombre},${telefono},${servicioIdReal},${precios[0].nombre},${regionId},${precios[0].precio},${anticipo},${metodo},${comprobante||null},${fecha?new Date(fecha+"T12:00:00Z"):null},${respaldo||null},${u.id}) returning id`;
 revalidatePath("/ferias");
 redirect("/ferias?creado="+result[0].id.toString());
}

async function confirmar(form:FormData) {
 "use server";
 const u=await user();
 if(!["SUPER_ADMIN","MANAGER"].includes(u.role)) redirect("/ferias?error=permiso");
 const id=Number(form.get("id"));
 if(!Number.isSafeInteger(id)||id<1) redirect("/ferias?error=datos");
 await db.$executeRaw`update feria_reserva set estado='CONFIRMADO', confirmado_por_id=${u.id}, confirmado_at=now() where id=${id} and estado='PENDIENTE' and (metodo_pago='EFECTIVO' or (nullif(trim(comprobante_numero),'') is not null and comprobante_fecha is not null))`;
 revalidatePath("/ferias");
 redirect("/ferias");
}

export default async function FeriasPage({searchParams}:{searchParams:Promise<{creado?:string;error?:string}>}) {
 const u=await user();
 const params=await searchParams;
 const servicios=await db.$queryRaw<Servicio[]>`select s.id,s.nombre,r.id as region_id,r.nombre as region,p.precio::float8 as precio from catalogo_servicio s join servicio_precio_por_region p on p."servicioId"=s.id join region r on r.id=p."regionId" where s.activo=true and p.activo=true and r.activo=true order by s.nombre,r.nombre`;
 const reservas=await db.$queryRaw<Reserva[]>`select id,cliente_nombre,telefono,servicio_nombre,precio::float8 as precio,anticipo::float8 as anticipo,metodo_pago,comprobante_numero,estado,creado_at from feria_reserva order by id desc limit 40`;
 const admin=["SUPER_ADMIN","MANAGER"].includes(u.role);
 return <section className="space-y-6 p-1">
  <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-800 to-blue-600 p-6 text-white"><p className="text-xs font-bold uppercase tracking-widest text-blue-100">GO USA · FIPAZ 2026</p><h1 className="mt-2 text-3xl font-extrabold">FERIAS · Reservas</h1><p className="mt-2 text-sm text-blue-100">Precios actuales de NEXUS · QR impreso de feria · Recibos correlativos tras verificación.</p></div>
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5"><div><h2 className="text-lg font-bold text-blue-950">Captación de prospectos · FIPAZ</h2><p className="mt-1 text-sm text-blue-800">Registra visitantes aunque no hagan una reserva. Se guardarán en Prospectos con origen Campaña y detalle FIPAZ 2026.</p></div><Link href="/prospectos?feria=FIPAZ2026" className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white">+ Registrar prospecto de feria</Link></div>
  {params.error&&<p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">No se pudo completar la operación ({params.error}). Revisa los datos y permisos.</p>}
  {params.creado&&<p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Reserva registrada. Queda pendiente la confirmación del pago.</p>}
  <form action={registrar} className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-2">
   <h2 className="text-lg font-bold md:col-span-2">Nueva reserva de feria</h2>
   <label className="text-sm font-semibold">Nombre completo<input name="nombre" required maxLength={150} className="mt-1 w-full rounded-lg border p-3 font-normal" placeholder="Nombre del interesado"/></label>
   <label className="text-sm font-semibold">WhatsApp<input name="telefono" required className="mt-1 w-full rounded-lg border p-3 font-normal" placeholder="Número de contacto"/></label>
   <label className="text-sm font-semibold md:col-span-2">Servicio y precio actual<select name="servicio" required className="mt-1 w-full rounded-lg border p-3 font-normal"><option value="">Selecciona un servicio</option>{servicios.map(s=><option key={s.id+"|"+s.region_id} value={s.id+"|"+s.region_id}>{s.nombre} · {s.region} · Bs {fmt(s.precio)}</option>)}</select></label>
   <label className="text-sm font-semibold">Anticipo (Bs)<input name="anticipo" type="number" min="0" step="0.01" defaultValue="100" required className="mt-1 w-full rounded-lg border p-3 font-normal"/></label>
   <label className="text-sm font-semibold">Forma de pago<select name="metodo" className="mt-1 w-full rounded-lg border p-3 font-normal"><option value="QR">QR bancario de feria</option><option value="EFECTIVO">Efectivo</option></select></label>
   <label className="text-sm font-semibold">N.º comprobante QR<input name="comprobante" maxLength={120} className="mt-1 w-full rounded-lg border p-3 font-normal" placeholder="Número de operación"/></label>
   <label className="text-sm font-semibold">Fecha de pago<input name="fecha" type="date" className="mt-1 w-full rounded-lg border p-3 font-normal"/></label>
   <label className="text-sm font-semibold md:col-span-2">Referencia del respaldo (enlace seguro o código)<input name="respaldo" maxLength={500} className="mt-1 w-full rounded-lg border p-3 font-normal" placeholder="Referencia interna del comprobante"/></label>
   <p className="text-xs text-slate-500 md:col-span-2">El registro no confirma el ingreso bancario. Administración verificará el pago antes de emitir el recibo definitivo.</p>
   <button type="submit" className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white md:col-span-2">Registrar reserva pendiente</button>
  </form>
  <div className="rounded-2xl border bg-white p-5"><h2 className="mb-4 text-lg font-bold">Últimas reservas</h2><div className="space-y-3">{reservas.length===0&&<p className="text-sm text-slate-500">Aún no hay reservas registradas.</p>}{reservas.map(r=><div key={String(r.id)} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"><div><p className="font-bold">{folio(r.id)} · {r.cliente_nombre}</p><p className="text-sm text-slate-600">{r.servicio_nombre} · {r.telefono}</p><p className="text-xs text-slate-500">{r.estado} · {r.metodo_pago}{r.comprobante_numero?" · Comp. "+r.comprobante_numero:""}</p></div><div className="flex flex-wrap items-center gap-2">{admin&&<span className="text-sm font-semibold">Bs {fmt(r.anticipo)} / {fmt(r.precio)}</span>}{r.estado==="CONFIRMADO"&&<Link className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700" href={"/ferias/recibo/"+r.id}>Ver recibo</Link>}{admin&&r.estado==="PENDIENTE"&&<form action={confirmar}><input type="hidden" name="id" value={String(r.id)}/><button className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white">Confirmar pago</button></form>}</div></div>)}</div></div>
 </section>;
}
