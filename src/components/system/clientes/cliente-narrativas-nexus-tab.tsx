"use client";
import {useEffect,useState}from"react";
import{Loader2,Save,Languages}from"lucide-react";
import{Button}from"@/components/ui/button";
import{Card,CardContent,CardHeader,CardTitle}from"@/components/ui/card";
import{Label}from"@/components/ui/label";
import{Textarea}from"@/components/ui/textarea";
import{guardarNarrativasNexus,obtenerNarrativasNexus,type NarrativasNexus}from"@/lib/actions/clientes/narrativas-nexus-actions";
import{toast}from"sonner";

type Editable=Omit<NarrativasNexus,"actualizadoPorNombre"|"updatedAt">;
const empty:Editable={trabajoActualEs:null,trabajoActualEn:null,trabajoAnteriorEs:null,trabajoAnteriorEn:null,motivoViajeEs:null,motivoViajeEn:null,motivoNegacionEs:null,motivoNegacionEn:null,sobreestadiaEs:null,sobreestadiaEn:null,antecedenteMigratorioEs:null,antecedenteMigratorioEn:null};

export function ClienteNarrativasNexusTab({clienteId}:{clienteId:string}){
 const[d,setD]=useState<Editable>(empty),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[meta,setMeta]=useState("");
 useEffect(()=>{void(async()=>{const r=await obtenerNarrativasNexus(clienteId);if(r.success&&r.data){const{actualizadoPorNombre,updatedAt,...x}=r.data;setD(x);setMeta(actualizadoPorNombre?`Última actualización: ${actualizadoPorNombre}${updatedAt?` · ${new Date(updatedAt).toLocaleString("es-BO")}`:""}`:"")}setLoading(false)})()},[clienteId]);
 function set(k:keyof Editable,v:string){setD(p=>({...p,[k]:v||null}))}
 async function save(){setSaving(true);const r=await guardarNarrativasNexus(clienteId,d);setSaving(false);r.success?toast.success("Descripciones bilingües guardadas"):toast.error(r.error??"No se pudo guardar")}
 if(loading)return <div className="py-8 text-sm text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin"/>Cargando...</div>;
 return <div className="space-y-4">
  <div className="rounded-lg border bg-muted/30 p-3 text-sm"><Languages className="mr-2 inline h-4 w-4"/><b>Descripciones ES / EN para DS-160.</b> Guarda el relato original en español y la versión final editable en inglés.</div>
  <Pair title="Trabajo actual · descripción y funciones" es={d.trabajoActualEs} en={d.trabajoActualEn} onEs={v=>set("trabajoActualEs",v)} onEn={v=>set("trabajoActualEn",v)}/>
  <Pair title="Trabajo anterior · descripción y funciones" es={d.trabajoAnteriorEs} en={d.trabajoAnteriorEn} onEs={v=>set("trabajoAnteriorEs",v)} onEn={v=>set("trabajoAnteriorEn",v)}/>
  <Pair title="Motivo de viaje" es={d.motivoViajeEs} en={d.motivoViajeEn} onEs={v=>set("motivoViajeEs",v)} onEn={v=>set("motivoViajeEn",v)}/>
  <Pair title="Negación anterior de Visa USA · motivo / explicación" es={d.motivoNegacionEs} en={d.motivoNegacionEn} onEs={v=>set("motivoNegacionEs",v)} onEn={v=>set("motivoNegacionEn",v)}/>
  <Pair title="Sobreestadía / estadía irregular en EE.UU. · explicación" es={d.sobreestadiaEs} en={d.sobreestadiaEn} onEs={v=>set("sobreestadiaEs",v)} onEn={v=>set("sobreestadiaEn",v)}/>
  <Pair title="Otro antecedente migratorio en EE.UU. · explicación" es={d.antecedenteMigratorioEs} en={d.antecedenteMigratorioEn} onEs={v=>set("antecedenteMigratorioEs",v)} onEn={v=>set("antecedenteMigratorioEn",v)}/>
  <div className="flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{meta||"Aún sin actualización registrada"}</p><Button onClick={()=>void save()} disabled={saving}>{saving?<Loader2 className="mr-2 h-4 w-4 animate-spin"/>:<Save className="mr-2 h-4 w-4"/>}Guardar descripciones ES / EN</Button></div>
 </div>
}
function Pair({title,es,en,onEs,onEn}:{title:string;es:string|null;en:string|null;onEs:(v:string)=>void;onEn:(v:string)=>void}){return <Card><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div><Label>Español · información original</Label><Textarea className="mt-2" rows={4} value={es??""} onChange={e=>onEs(e.target.value)} placeholder="Registrar explicación completa en español..."/></div><div><Label>English · versión para formulario</Label><Textarea className="mt-2" rows={4} value={en??""} onChange={e=>onEn(e.target.value)} placeholder="Editable English version..."/><p className="mt-1 text-xs text-muted-foreground">Revisar antes de utilizar en CEAC / DS-160.</p></div></CardContent></Card>}
