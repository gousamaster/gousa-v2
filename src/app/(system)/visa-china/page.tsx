import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChinaCasesContainer } from "@/components/system/china/china-cases-container";
import { auth } from "@/lib/auth";

export default async function VisaChinaPage(){
  const session=await auth.api.getSession({headers:await headers()});
  if(!session?.user)redirect("/sign-in");
  return <ChinaCasesContainer/>;
}
