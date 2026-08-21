import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RentACarContainer } from "@/components/system/servicios/rentacar/rentacar-container";

export default async function RentACarPage(){const session=await auth.api.getSession({headers:await headers()});if(!session?.user)redirect("/sign-in");return <RentACarContainer/>}
