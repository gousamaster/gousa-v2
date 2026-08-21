"use client";
import {useEffect,useState} from "react";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Card,CardContent,CardHeader,CardTitle} from "@/components/ui/card";
import {guardarCentroVisasCliente,obtenerCentroVisasCliente} from "@/lib/actions/clientes/centro-visas-actions";
import {toast} from "sonner";

export function ClienteCentroVisasTab({clienteId,emailCliente}:{clienteId:string;emailCliente?:string|null}){
 const[mismoCorreo,setMismoCorreo]=useState(true);const[email,setEmail]=useState(emailCliente??"");const[password,setPassword]=useState("");const[passwordGuardada,setPasswordGuardada]=useState(false);const[loading,setLoading]=useState(true);const[saving,setSaving]=useState(false);
 useEffect(()=>{void(async()=>{setLoading(true);const r=await obtenerCentroVisasCliente(clienteId);if(r.success){setMismoCorreo(r.data.mismoCorreo);setEmail(r.data.mismoCorreo?(emailCliente??r.data.email):r.data.email);setPasswordGuardada(r.data.passwordGuardada)}else toast.error(r.error);setLoading(false)})()},[clienteId,emailCliente]);
 useEffect(()=>{if(mismoCorreo)setEmail(emailCliente??"")},[mismoCorreo,emailCliente]);
 async function guardar(){setSaving(true);const r=await guardarCentroVisasCliente(clienteId,{mismoCorreo,email,emailCliente,password:password||null});if(r.success){toast.success("Acceso al Centro de Visas guardado");setPassword("");setPasswordGuardada(true)}else toast.error(r.error);setSaving(false)}
 return <Card><CardHeader><CardTitle>Acceso Centro de Visas USA</CardTitle><p className="text-sm text-muted-foreground">Credenciales utilizadas para la cuenta del cliente en ais.usvisa-info.com. La contraseña se guarda cifrada y no se muestra en pantalla.</p></CardHeader><CardContent className="space-y-5">{loading?<p className="text-sm text-muted-foreground">Cargando...</p>:<><label className="flex items-center gap-2 text-sm font-medium"><Checkbox checked={mismoCorreo} onCheckedChange={v=>setMismoCorreo(v===true)}/><span>Mismo correo personal para Centro de Visas</span></label><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Correo Centro de Visas</Label><Input type="email" value={email} disabled={mismoCorreo} onChange={e=>setEmail(e.target.value)} placeholder="correo usado en Centro de Visas"/></div><div className="space-y-2"><Label>Contraseña Centro de Visas</Label><Input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={passwordGuardada?"Contraseña guardada · escribir solo para cambiar":"Registrar contraseña"}/><p className="text-xs text-muted-foreground">{passwordGuardada?"Ya existe una contraseña cifrada. Déjala vacía para conservarla.":"Aún no hay contraseña registrada."}</p></div></div><Button onClick={guardar} disabled={saving}>{saving?"Guardando...":"Guardar acceso Centro de Visas"}</Button></>}</CardContent></Card>
}
