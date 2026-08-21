import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Ds160AccessButton({clienteId}:{clienteId:string}){
 return <Button asChild variant="outline" size="sm"><Link href={`/clientes/${clienteId}/nexus/ds160`}>Abrir control DS-160</Link></Button>;
}
