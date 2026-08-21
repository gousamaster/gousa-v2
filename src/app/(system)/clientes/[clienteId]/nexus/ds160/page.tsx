import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Ds160Tab from "@/components/nexus/Ds160Tab";
import { auth } from "@/lib/auth";

export default async function Ds160Page({params}:{params:Promise<{clienteId:string}>}){
 const session=await auth.api.getSession({headers:await headers()});
 if(!session?.user)redirect("/sign-in");
 const {clienteId}=await params;
 return <section className="mx-auto w-full max-w-6xl p-6"><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">GO USA · Inteligencia Operativa</p><h1 className="text-2xl font-bold">NEXUS · DS-160</h1><p className="text-sm text-muted-foreground">Control individual del formulario, revisión y cierre operativo.</p></div><Ds160Tab clienteId={clienteId}/></section>;
}
