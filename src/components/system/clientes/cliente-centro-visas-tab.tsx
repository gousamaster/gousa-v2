"use client";
import {useEffect,useState} from "react";
import {ExternalLink,Eye,EyeOff,Loader2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card,CardContent,CardHeader,CardTitle} from "@/components/ui/card";
import {guardarCentroVisasCliente,obtenerCentroVisasCliente,revelarPasswordCentroVisasCliente} from "@/lib/actions/clientes/centro-visas-actions";
import {toast} from "sonner";

const AIS_URL="https://ais.usvisa-info.com/es-bo/niv";

export function ClienteCentroVisasTab({clienteId,emailCliente}:{clienteId:string;emailCliente?:string|null}){
 const[mismoCorreo,setMismoCorreo]=useState(true);const[email,setEmail]=useState(emailCliente??"");const[password,setPassword]=useState("");const[passwordGuardada,setPasswordGuardada]=useState(false);const[mostrarPassword,setMostrarPassword]=useState(false);const[revelando,setRevelando]=useState(false);const[loading,setLoading]=useState(true);const[saving,setSaving]=useState(false);
 useEffect(()=>{void(async()=>{setLoading(true);const r=await obtenerCentroVisasCliente(clienteId);if(r.success){setMismoCorreo(r.data.mismoCorreo);setEmail(r.data.mismoCorreo?(emailCliente??r.data.email):r.data.email);setPasswordGuardada(r.data.passwordGuardada)}else toast.error(r.error);setLoading(false)})()},[clienteId,emailCliente]);
 useEffect(()=>{if(mismoCorreo)setEmail(emailCliente??"")},[mismoCorreo,emailCliente]);
 async function guardar(){setSaving(true);const r=await guardarCentroVisasCliente(clienteId,{mismoCorreo,email,emailCliente,password:password||null});if(r.success){toast.success("Acceso al Centro de Visas guardado");setPassword("");setMostrarPassword(false);setPasswordGuardada(true)}else toast.error(r.error);setSaving(false)}
 async function alternarPassword(){
   if(mostrarPassword){setMostrarPassword(false);setPassword("");return}
   if(password.trim()){setMostrarPassword(true);return}
   if(!passwordGuardada){setMostrarPassword(true);return}
   setRevelando(true);const r=await revelarPasswordCentroVisasCliente(clienteId);setRevelando(false);
   if(r.success){setPassword(r.password);setMostrarPassword(true)}else toast.error(r.error);
 }
 return <Card><CardHeader><CardTitle>Acceso Centro de Visas USA</CardTitle><p className="text-sm text-muted-foreground">Credenciales utilizadas para la cuenta del cliente en ais.usvisa-info.com. La contraseña permanece cifrada y solo se revela temporalmente al solicitarlo.</p></CardHeader><CardContent className="space-y-5">{loading?<p className="text-sm text-muted-foreground">Cargando...</p>:<><label className="flex items-center gap-2 text-sm font-medium"><Checkbox checked={mismoCorreo} onCheckedChange={v=>setMismoCorreo(v===true)}/><span>Mismo correo personal para Centro de Visas</span></label><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Correo Centro de Visas</Label><Input type="email" value={email} disabled={mismoCorreo} onChange={e=>setEmail(e.target.value)} placeholder="correo usado en Centro de Visas"/></div><div className="space-y-2"><Label>Contraseña Centro de Visas</Label><div className="relative"><Input className="pr-11" type={mostrarPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder={passwordGuardada?"Contraseña guardada · usar el ojo para verla":"Registrar contraseña"}/><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-10" onClick={()=>void alternarPassword()} disabled={revelando} aria-label={mostrarPassword?"Ocultar contraseña":"Mostrar contraseña"}>{revelando?<Loader2 className="h-4 w-4 animate-spin"/>:mostrarPassword?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</Button></div><p className="text-xs text-muted-foreground">{passwordGuardada?"Ya existe una contraseña cifrada. Pulsa el ojo para verla o escribe una nueva para reemplazarla.":"Aún no hay contraseña registrada."}</p></div></div><div className="flex flex-wrap gap-3"><Button onClick={guardar} disabled={saving}>{saving?"Guardando...":"Guardar acceso Centro de Visas"}</Button><Button asChild variant="outline"><a href={AIS_URL} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4"/>Revisar en AIS</a></Button></div><div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">La contraseña se mantiene cifrada en NEXUS. Solo se descifra bajo demanda al pulsar el ícono de visibilidad y vuelve a ocultarse al cerrar la vista o guardarla.</div></>}</CardContent></Card>
}
