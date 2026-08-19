import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { HospedajeContainer } from "@/components/system/servicios/hospedaje/hospedaje-container";

export default async function HospedajePage(){
  const session=await auth.api.getSession({headers:await headers()});
  if(!session?.user) redirect("/sign-in");
  return <HospedajeContainer/>;
}
