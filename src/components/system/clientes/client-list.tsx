"use client";

import type { RowSelectionState } from "@tanstack/react-table";
import { CheckSquare, History, Plus, Search, UserCheck, Users, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { eliminarCliente, toggleClienteActivo } from "@/lib/actions/clientes/clientes-actions";
import { agregarMiembro, obtenerParentescos } from "@/lib/actions/clientes/grupos-familiares-actions";
import { confirmarServicioHistoricoClientes } from "@/lib/actions/clientes/saneamiento-clientes-actions";
import { obtenerGruposFamiliaresActivos } from "@/lib/actions/grupos-familiares/grupos-familiares-actions";
import { convertirClienteSinServicioAProspecto } from "@/lib/actions/prospectos/prospecto-cliente-actions";
import { GESTIONES_NEXUS } from "@/lib/nexus/gestiones";
import type { ClienteListItem } from "@/types/cliente-types";
import type { GrupoFamiliarListItem } from "@/types/grupo-familiar-types";
import { ClienteHistoricoDrawer } from "./cliente-historico-drawer";
import { ClientFormDrawer } from "./client-form-drawer";
import { createClientColumns } from "./client-table-columns";
import { GrupoFamiliarDrawer } from "./grupo-familiar-drawer";

type ClienteComercial = ClienteListItem & { serviciosContratados?: number; tramitesTotal?: number; sinServicio?: boolean; servicioHistoricoConfirmado?: boolean };
type TabClientes = "activos" | "por_revisar" | "inactivos";
type Parentesco = { id: string; nombre: string; codigo: string };

export function ClientList({ initialClientes, regiones, onRefresh }: { initialClientes: ClienteComercial[]; regiones: Array<{ id: string; nombre: string }>; onRefresh: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gestionId = searchParams.get("gestion");
  const gestion = GESTIONES_NEXUS.find((g)=>g.id===gestionId);
  const [searchQuery,setSearchQuery]=useState(""); const [activeTab,setActiveTab]=useState<TabClientes>("activos"); const [rowSelection,setRowSelection]=useState<RowSelectionState>({});
  const [selectedCliente,setSelectedCliente]=useState<ClienteListItem|null>(null); const [isFormOpen,setIsFormOpen]=useState(false); const [isHistoricoOpen,setIsHistoricoOpen]=useState(false); const [clienteGrupoFamiliar,setClienteGrupoFamiliar]=useState<ClienteListItem|null>(null); const [isGrupoFamiliarOpen,setIsGrupoFamiliarOpen]=useState(false);
  const [clienteToDelete,setClienteToDelete]=useState<ClienteListItem|null>(null); const [clienteToProspect,setClienteToProspect]=useState<ClienteComercial|null>(null); const [confirmHistoricos,setConfirmHistoricos]=useState(false); const [isAsignarGrupoOpen,setIsAsignarGrupoOpen]=useState(false);

  const activos=initialClientes.filter(c=>c.activo); const porRevisar=initialClientes.filter(c=>c.activo&&c.sinServicio); const inactivos=initialClientes.filter(c=>!c.activo);
  const current=activeTab==="activos"?activos:activeTab==="por_revisar"?porRevisar:inactivos;
  const filtered=current.filter(c=>[c.nombreCompleto,c.email,c.telefonoCelular,c.registradoPorNombre].filter(Boolean).join(" ").toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedIds=Object.keys(rowSelection).filter(k=>rowSelection[k]).map(k=>filtered[Number.parseInt(k)]?.id).filter(Boolean);
  const selectedClientes=filtered.filter(c=>selectedIds.includes(c.id));

  const refresh=()=>{setRowSelection({});onRefresh();};
  const abrirCliente=(c:ClienteListItem)=>router.push(gestion?`/clients/${c.id}?gestion=${gestion.id}`:`/clients/${c.id}`);
  const abrirAfiliados=()=>router.push("/clients?seccion=afiliados");
  const columns=createClientColumns(abrirCliente,c=>{setSelectedCliente(c);setIsFormOpen(true);},c=>setClienteToDelete(c),async c=>{const r=await toggleClienteActivo(c.id);r.success?(toast.success("Estado actualizado"),refresh()):toast.error(r.error||"Error");},c=>{setClienteGrupoFamiliar(c);setIsGrupoFamiliarOpen(true);},c=>setClienteToProspect(c));

  const marcarHistoricos=async()=>{const r=await confirmarServicioHistoricoClientes(selectedIds); if(!r.success)return toast.error(r.error||"No se pudo actualizar"); toast.success(`${r.data.actualizados} registro(s) marcados como servicio histórico confirmado`);setConfirmHistoricos(false);refresh();};
  const enviarProspecto=async()=>{if(!clienteToProspect)return;const r=await convertirClienteSinServicioAProspecto(clienteToProspect.id);if(!r.success||!r.data)return toast.error(r.error||"No se pudo enviar");toast.success("Enviado a Prospectos");setClienteToProspect(null);refresh();router.push(`/prospectos/${r.data.id}`);};
  const borrar=async()=>{if(!clienteToDelete)return;const r=await eliminarCliente(clienteToDelete.id);r.success?(toast.success("Cliente eliminado"),refresh()):toast.error(r.error||"Error");setClienteToDelete(null);};

  return <>
    {gestion&&<div className="rounded-lg border border-primary/30 bg-primary/5 p-4"><p className="font-semibold">Gestión seleccionada: {gestion.nombre}</p><p className="mt-1 text-sm text-muted-foreground">Busca al cliente y usa “Ver detalle”. NEXUS abrirá directamente su flujo de Servicios y Trámites con esta gestión como contexto.</p></div>}
    <Card><CardHeader><div className="flex items-center justify-between gap-4"><div><CardTitle>Lista de Clientes</CardTitle><p className="mt-1 text-sm text-muted-foreground">Consulta clientes actuales, históricos e inactivos. Los afiliados tienen su propia vista comercial.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={abrirAfiliados}><UserCheck className="mr-2 h-4 w-4"/>Clientes afiliados</Button><Button variant="outline" onClick={()=>setIsHistoricoOpen(true)}><History className="mr-2 h-4 w-4"/>Cliente histórico</Button><Button onClick={()=>setIsFormOpen(true)}><Plus className="mr-2 h-4 w-4"/>Nuevo cliente</Button></div></div></CardHeader><CardContent>
      <div className="mb-4 space-y-4"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-10" placeholder="Buscar por nombre, email, teléfono o responsable..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/></div>
      {selectedIds.length>0&&<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted p-4"><div className="flex items-center gap-2"><CheckSquare className="h-5 w-5 text-primary"/><span className="font-medium">{selectedIds.length} seleccionado(s)</span><Button variant="ghost" size="sm" onClick={()=>setRowSelection({})}><X className="mr-1 h-4 w-4"/>Limpiar</Button></div><div className="flex flex-wrap gap-2">{activeTab==="activos"&&<Button size="sm" variant="outline" onClick={()=>setIsAsignarGrupoOpen(true)}><Users className="mr-2 h-4 w-4"/>Asignar a grupo familiar</Button>}{activeTab==="por_revisar"&&<Button size="sm" onClick={()=>setConfirmHistoricos(true)}>Servicio tomado</Button>}</div></div>}</div>
      <Tabs value={activeTab} onValueChange={v=>{setActiveTab(v as TabClientes);setRowSelection({});}}><TabsList className="grid w-full max-w-2xl grid-cols-3"><TabsTrigger value="activos">Clientes <Badge variant="secondary" className="ml-2">{activos.length}</Badge></TabsTrigger><TabsTrigger value="por_revisar">Por revisar <Badge variant="secondary" className="ml-2">{porRevisar.length}</Badge></TabsTrigger><TabsTrigger value="inactivos">Inactivos <Badge variant="secondary" className="ml-2">{inactivos.length}</Badge></TabsTrigger></TabsList>
      {(["activos","por_revisar","inactivos"] as const).map(tab=><TabsContent key={tab} value={tab} className="mt-4">{tab==="por_revisar"&&<div className="mb-4 rounded-lg border p-4 text-sm"><p className="font-medium">Depuración extraordinaria de la base histórica</p><p className="mt-1 text-muted-foreground">Selecciona quienes realmente tomaron un servicio y pulsa “Servicio tomado”. Los demás permanecerán aquí hasta que se confirme su situación o se envíen individualmente a Prospectos.</p></div>}<DataTable columns={columns} data={filtered} onRowSelectionChange={setRowSelection} rowSelection={rowSelection}/></TabsContent>)}</Tabs>
    </CardContent></Card>
    <ClienteHistoricoDrawer open={isHistoricoOpen} onOpenChange={setIsHistoricoOpen} regiones={regiones} onSuccess={refresh}/>
    <ClientFormDrawer open={isFormOpen} onOpenChange={o=>{setIsFormOpen(o);if(!o)setSelectedCliente(null);}} cliente={selectedCliente} regiones={regiones} onSuccess={()=>{onRefresh();setIsFormOpen(false);setSelectedCliente(null);}}/>
    {clienteGrupoFamiliar&&<GrupoFamiliarDrawer open={isGrupoFamiliarOpen} onOpenChange={o=>{setIsGrupoFamiliarOpen(o);if(!o)setClienteGrupoFamiliar(null);}} cliente={clienteGrupoFamiliar} onSuccess={onRefresh}/>} 
    <AsignarGrupoFamiliarDrawer open={isAsignarGrupoOpen} onOpenChange={setIsAsignarGrupoOpen} clientes={selectedClientes} onSuccess={()=>{setIsAsignarGrupoOpen(false);refresh();}}/>
    <ConfirmationDialog open={confirmHistoricos} onOpenChange={setConfirmHistoricos} onConfirm={marcarHistoricos} title="¿Confirmar servicio histórico?" description={`Marcarás ${selectedIds.length} registro(s) como clientes que sí tomaron servicio antes del saneamiento de NEXUS. Esto no inventará un servicio ni un monto; solo los excluirá de la bandeja “Por revisar”.`} confirmText="Confirmar servicio tomado" variant="default"/>
    <ConfirmationDialog open={!!clienteToProspect} onOpenChange={o=>{if(!o)setClienteToProspect(null);}} onConfirm={enviarProspecto} title="¿Enviar a Prospectos?" description={`${clienteToProspect?.nombreCompleto??"Este registro"} se desactivará como cliente activo y volverá al circuito comercial. Su historial no se elimina.`} confirmText="Enviar a Prospectos" variant="default"/>
    <ConfirmationDialog open={!!clienteToDelete} onOpenChange={o=>{if(!o)setClienteToDelete(null);}} onConfirm={borrar} title="¿Eliminar cliente?" description={`¿Eliminar a ${clienteToDelete?.nombreCompleto??"este cliente"}?`} confirmText="Eliminar" variant="destructive"/>
  </>;
}

function AsignarGrupoFamiliarDrawer({open,onOpenChange,clientes,onSuccess}:{open:boolean;onOpenChange:(v:boolean)=>void;clientes:ClienteListItem[];onSuccess:()=>void}){
  const[grupos,setGrupos]=useState<GrupoFamiliarListItem[]>([]);
  const[parentescos,setParentescos]=useState<Parentesco[]>([]);
  const[grupoId,setGrupoId]=useState("");
  const[relaciones,setRelaciones]=useState<Record<string,string>>({});
  const[loading,setLoading]=useState(false);
  const[saving,setSaving]=useState(false);

  useEffect(()=>{if(!open)return;setLoading(true);setGrupoId("");setRelaciones({});void Promise.all([obtenerGruposFamiliaresActivos(),obtenerParentescos()]).then(([g,p])=>{if(g.success&&g.data)setGrupos(g.data);else toast.error(g.error||"No se pudieron cargar los grupos familiares");if(p.success&&p.data)setParentescos(p.data);else toast.error(p.error||"No se pudieron cargar los parentescos");}).finally(()=>setLoading(false));},[open]);

  async function asignar(){
    if(!grupoId)return toast.error("Selecciona el grupo familiar");
    const sinParentesco=clientes.filter(c=>!relaciones[c.id]);
    if(sinParentesco.length)return toast.error(`Selecciona el parentesco de ${sinParentesco[0].nombreCompleto}`);
    setSaving(true);
    let agregados=0,omitidos=0;
    for(const cliente of clientes){
      const r=await agregarMiembro(grupoId,{clienteId:cliente.id,parentescoId:relaciones[cliente.id]});
      if(r.success)agregados++;else if((r.error||"").toLowerCase().includes("ya es miembro"))omitidos++;else{setSaving(false);toast.error(`${cliente.nombreCompleto}: ${r.error||"No se pudo asignar"}`);return;}
    }
    setSaving(false);
    toast.success(`${agregados} cliente(s) asignados al grupo familiar${omitidos?` · ${omitidos} ya pertenecían al grupo`:""}`);
    onSuccess();
  }

  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="w-full overflow-y-auto sm:max-w-xl"><SheetHeader><SheetTitle>Asignar a grupo familiar</SheetTitle><SheetDescription>Los clientes seleccionados seguirán siendo registros individuales. NEXUS solo los vinculará al mismo grupo para poder gestionar simulacros y entrevistas grupales.</SheetDescription></SheetHeader><div className="space-y-5 px-4 pb-6">{loading?<p className="text-sm text-muted-foreground">Cargando grupos familiares...</p>:<><div className="space-y-2"><p className="text-sm font-medium">Grupo familiar</p><Select value={grupoId} onValueChange={setGrupoId}><SelectTrigger className="w-full"><SelectValue placeholder="Selecciona un grupo existente"/></SelectTrigger><SelectContent>{grupos.map(g=><SelectItem key={g.id} value={g.id}>{g.nombre}{g.titular?` · Titular: ${g.titular.nombreCompleto}`:""} · {g.totalMiembros} miembro(s)</SelectItem>)}</SelectContent></Select>{grupos.length===0&&<p className="text-xs text-muted-foreground">No hay grupos familiares activos. Crea primero un grupo desde el menú individual de un cliente.</p>}</div><div className="space-y-3"><p className="text-sm font-medium">Personas seleccionadas ({clientes.length})</p>{clientes.map(c=><div key={c.id} className="rounded-lg border p-3"><p className="font-medium text-sm">{c.nombreCompleto}</p><p className="mb-2 text-xs text-muted-foreground">{c.email||c.telefonoCelular||"Cliente GO USA"}</p><Select value={relaciones[c.id]||""} onValueChange={v=>setRelaciones(prev=>({...prev,[c.id]:v}))}><SelectTrigger className="w-full"><SelectValue placeholder="Parentesco dentro del grupo"/></SelectTrigger><SelectContent>{parentescos.map(p=><SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}</SelectContent></Select></div>)}</div><div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">Una vez vinculados, el grupo podrá utilizarse para programar un mismo simulacro o entrevista para sus integrantes. No se fusionan fichas ni se altera el servicio individual de cada cliente.</div><div className="flex gap-3"><Button type="button" variant="outline" className="flex-1" onClick={()=>onOpenChange(false)} disabled={saving}>Cancelar</Button><Button type="button" className="flex-1" onClick={()=>void asignar()} disabled={saving||!grupoId||clientes.length===0}>{saving?"Asignando...":"Asignar seleccionados"}</Button></div></>}</div></SheetContent></Sheet>;
}
