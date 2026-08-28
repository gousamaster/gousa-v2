// src/components/system/citas/programar-cita-drawer.tsx
"use client";
import {Loader2} from "lucide-react";
import {useEffect,useMemo,useState} from "react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {Sheet,SheetContent,SheetHeader,SheetTitle} from "@/components/ui/sheet";
import {Textarea} from "@/components/ui/textarea";
import {obtenerTiposCita} from "@/lib/actions/citas/citas-actions";
import {crearCitaIncluida} from "@/lib/actions/citas/cita-incluida-actions";
import {useSession} from "@/lib/auth-client";

type TramiteParticipante={id:string;cliente:{nombres:string;apellidos:string};servicio:{nombre:string}};
interface Props{open:boolean;onOpenChange:(open:boolean)=>void;tramiteId?:string;grupoFamiliarId?:string;regionId:string;tramitesDisponibles?:TramiteParticipante[];onSuccess:(citaId:string)=>void;tipoPreferido?:"SIMULACRO"|"ENTREVISTA";titulo?:string}

export function ProgramarCitaDrawer({open,onOpenChange,tramiteId,grupoFamiliarId,tramitesDisponibles=[],onSuccess,tipoPreferido,titulo}:Props){
 const{data:session}=useSession();
 const[tiposCita,setTiposCita]=useState<Array<{id:string;nombre:string;precioRegion:number|null}>>([]);
 const[tipoId,setTipoId]=useState("");
 const[fechaHora,setFechaHora]=useState("");
 const[lugar,setLugar]=useState("");
 const[modalidad,setModalidad]=useState<"PRESENCIAL"|"VIRTUAL">("PRESENCIAL");
 const[notas,setNotas]=useState("");
 const[participantes,setParticipantes]=useState<string[]>([]);
 const[isSubmitting,setIsSubmitting]=useState(false);
 const[cabina,setCabina]=useState(false);
 const otros=tramitesDisponibles.filter(t=>t.id!==tramiteId);
 const tipoSeleccionado=useMemo(()=>tiposCita.find(t=>t.id===tipoId),[tiposCita,tipoId]);
 const esSimulacro=(tipoSeleccionado?.nombre??"").toLowerCase().includes("simulacr");

 useEffect(()=>{if(!open)return;void(async()=>{const t=await obtenerTiposCita();if(t.success&&t.data){setTiposCita(t.data);if(tipoPreferido){const patron=tipoPreferido==="SIMULACRO"?/simulacr/i:/entrevista|consular|embajada/i;const preferido=t.data.find(x=>patron.test(x.nombre));if(preferido)setTipoId(preferido.id)}}})()},[open,tipoPreferido]);
 useEffect(()=>{if(!esSimulacro)setCabina(false)},[esSimulacro]);
 function toggle(id:string){setParticipantes(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])}
 function cerrar(v:boolean){if(!v){setTipoId("");setFechaHora("");setLugar("");setModalidad("PRESENCIAL");setNotas("");setParticipantes([]);setCabina(false)}onOpenChange(v)}
 async function submit(e:React.FormEvent){
  e.preventDefault();
  if(!session?.user?.id)return;
  if(!tipoId)return toast.error("Selecciona el tipo de cita");
  if(!fechaHora)return toast.error("Registra fecha y hora");
  if(modalidad==="PRESENCIAL"&&!cabina&&!lugar.trim())return toast.error("Registra el lugar");
  setIsSubmitting(true);
  const lugarFinal=cabina?"Centro de Simulación Consular · Cabina":modalidad==="VIRTUAL"?(lugar.trim()||"Virtual"):lugar.trim();
  const notasFinal=`Modalidad: ${modalidad==="VIRTUAL"?"Virtual":"Presencial"}${notas.trim()?`\n${notas.trim()}`:""}`;
  const r=await crearCitaIncluida({tramiteId:tramiteId??null,grupoFamiliarId:grupoFamiliarId??null,tipoCitaId:tipoId,fechaHora,lugar:lugarFinal||null,notas:notasFinal,participanteTramiteIds:participantes},session.user.id);
  setIsSubmitting(false);
  if(r.success&&r.data){toast.success(cabina?"Simulacro en cabina programado correctamente":"Cita programada correctamente");cerrar(false);onSuccess(r.data.id)}else toast.error(r.error??"Error al programar");
 }

 return <Sheet open={open} onOpenChange={cerrar}><SheetContent className="w-full sm:max-w-lg overflow-y-auto p-4"><SheetHeader><SheetTitle>{titulo??(grupoFamiliarId?"Programar Cita Grupal":"Programar Cita")}</SheetTitle></SheetHeader><form onSubmit={submit} className="mt-6 space-y-5">
  <div className="space-y-2"><Label>Tipo de cita *</Label><Select value={tipoId} onValueChange={setTipoId}><SelectTrigger><SelectValue placeholder="Selecciona tipo de cita"/></SelectTrigger><SelectContent>{tiposCita.map(t=><SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>)}</SelectContent></Select></div>
  {esSimulacro&&<div className="rounded-lg border border-primary/30 bg-primary/5 p-4"><label className="flex items-start gap-3 cursor-pointer"><Checkbox checked={cabina} onCheckedChange={v=>setCabina(v===true)}/><div><p className="font-semibold">Simulacro en Centro de Simulación Consular</p><p className="text-xs text-muted-foreground">Opción operativa incluida en el servicio contratado. No genera un segundo cobro desde esta agenda.</p></div></label></div>}
  <div className="space-y-2"><Label>Modalidad *</Label><Select value={modalidad} onValueChange={v=>setModalidad(v as "PRESENCIAL"|"VIRTUAL")}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="PRESENCIAL">Presencial</SelectItem><SelectItem value="VIRTUAL">Virtual</SelectItem></SelectContent></Select></div>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-2"><Label>Fecha y hora *</Label><Input type="datetime-local" value={fechaHora} onChange={e=>setFechaHora(e.target.value)}/></div><div className="space-y-2"><Label>{modalidad==="VIRTUAL"?"Enlace / referencia":"Lugar"}</Label><Input disabled={cabina} placeholder={modalidad==="VIRTUAL"?"Meet, Zoom, WhatsApp...":"Oficina, Embajada..."} value={cabina?"Centro de Simulación Consular · Cabina":lugar} onChange={e=>setLugar(e.target.value)}/></div></div>
  <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">La cita o simulacro está asociado al servicio ya contratado. Precios, descuentos y estado de pago se administran únicamente desde <b>Servicios y Trámites</b>.</div>
  {otros.length>0&&<div className="space-y-2"><Label>Participantes adicionales</Label>{otros.map(t=><label key={t.id} className="flex gap-3 border rounded p-2"><Checkbox checked={participantes.includes(t.id)} onCheckedChange={()=>toggle(t.id)}/><span>{t.cliente.nombres} {t.cliente.apellidos}</span></label>)}</div>}
  <div><Label>Notas</Label><Textarea rows={3} value={notas} onChange={e=>setNotas(e.target.value)}/></div>
  <div className="flex gap-3"><Button type="button" variant="outline" className="flex-1" onClick={()=>cerrar(false)}>Cancelar</Button><Button type="submit" className="flex-1" disabled={isSubmitting}>{isSubmitting&&<Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Programar</Button></div>
 </form></SheetContent></Sheet>
}
