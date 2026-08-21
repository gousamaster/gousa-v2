"use client";

import type { RowSelectionState } from "@tanstack/react-table";
import { CheckSquare, Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { eliminarCliente, toggleClienteActivo } from "@/lib/actions/clientes/clientes-actions";
import { confirmarServicioHistoricoClientes } from "@/lib/actions/clientes/saneamiento-clientes-actions";
import { convertirClienteSinServicioAProspecto } from "@/lib/actions/prospectos/prospecto-cliente-actions";
import type { ClienteListItem } from "@/types/cliente-types";
import { ClientFormDrawer } from "./client-form-drawer";
import { createClientColumns } from "./client-table-columns";
import { GrupoFamiliarDrawer } from "./grupo-familiar-drawer";

type ClienteComercial = ClienteListItem & { serviciosContratados?: number; tramitesTotal?: number; sinServicio?: boolean; servicioHistoricoConfirmado?: boolean };
type TabClientes = "activos" | "por_revisar" | "inactivos";

export function ClientList({ initialClientes, regiones, onRefresh }: { initialClientes: ClienteComercial[]; regiones: Array<{ id: string; nombre: string }>; onRefresh: () => void }) {
  const router = useRouter();
  const [searchQuery,setSearchQuery]=useState(""); const [activeTab,setActiveTab]=useState<TabClientes>("activos"); const [rowSelection,setRowSelection]=useState<RowSelectionState>({});
  const [selectedCliente,setSelectedCliente]=useState<ClienteListItem|null>(null); const [isFormOpen,setIsFormOpen]=useState(false); const [clienteGrupoFamiliar,setClienteGrupoFamiliar]=useState<ClienteListItem|null>(null); const [isGrupoFamiliarOpen,setIsGrupoFamiliarOpen]=useState(false);
  const [clienteToDelete,setClienteToDelete]=useState<ClienteListItem|null>(null); const [clienteToProspect,setClienteToProspect]=useState<ClienteComercial|null>(null); const [confirmHistoricos,setConfirmHistoricos]=useState(false);

  const activos=initialClientes.filter(c=>c.activo); const porRevisar=initialClientes.filter(c=>c.activo&&c.sinServicio); const inactivos=initialClientes.filter(c=>!c.activo);
  const current=activeTab==="activos"?activos:activeTab==="por_revisar"?porRevisar:inactivos;
  const filtered=current.filter(c=>[c.nombreCompleto,c.email,c.telefonoCelular,c.registradoPorNombre].filter(Boolean).join(" ").toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedIds=Object.keys(rowSelection).filter(k=>rowSelection[k]).map(k=>filtered[Number.parseInt(k)]?.id).filter(Boolean);

  const refresh=()=>{setRowSelection({});onRefresh();};
  const columns=createClientColumns(c=>router.push(`/clients/${c.id}`),c=>{setSelectedCliente(c);setIsFormOpen(true);},c=>setClienteToDelete(c),async c=>{const r=await toggleClienteActivo(c.id);r.success?(toast.success("Estado actualizado"),refresh()):toast.error(r.error||"Error");},c=>{setClienteGrupoFamiliar(c);setIsGrupoFamiliarOpen(true);},c=>setClienteToProspect(c));

  const marcarHistoricos=async()=>{const r=await confirmarServicioHistoricoClientes(selectedIds); if(!r.success)return toast.error(r.error||"No se pudo actualizar"); toast.success(`${r.data.actualizados} registro(s) marcados como servicio histórico confirmado`);setConfirmHistoricos(false);refresh();};
  const enviarProspecto=async()=>{if(!clienteToProspect)return;const r=await convertirClienteSinServicioAProspecto(clienteToProspect.id);if(!r.success||!r.data)return toast.error(r.error||"No se pudo enviar");toast.success("Enviado a Prospectos");setClienteToProspect(null);refresh();router.push(`/prospectos/${r.data.id}`);};
  const borrar=async()=>{if(!clienteToDelete)return;const r=await eliminarCliente(clienteToDelete.id);r.success?(toast.success("Cliente eliminado"),refresh()):toast.error(r.error||"Error");setClienteToDelete(null);};

  return <>
    <Card><CardHeader><div className="flex items-center justify-between gap-4"><div><CardTitle>Lista de Clientes</CardTitle><p className="mt-1 text-sm text-muted-foreground">Saneamiento histórico: confirma quién sí tomó servicio o devuelve a Prospectos a quien todavía requiere gestión comercial.</p></div><Button onClick={()=>setIsFormOpen(true)}><Plus className="mr-2 h-4 w-4"/>Nuevo cliente</Button></div></CardHeader><CardContent>
      <div className="mb-4 space-y-4"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-10" placeholder="Buscar por nombre, email, teléfono o responsable..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/></div>
      {selectedIds.length>0&&<div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted p-4"><div className="flex items-center gap-2"><CheckSquare className="h-5 w-5 text-primary"/><span className="font-medium">{selectedIds.length} seleccionado(s)</span><Button variant="ghost" size="sm" onClick={()=>setRowSelection({})}><X className="mr-1 h-4 w-4"/>Limpiar</Button></div>{activeTab==="por_revisar"&&<Button size="sm" onClick={()=>setConfirmHistoricos(true)}>Servicio tomado</Button>}</div>}</div>
      <Tabs value={activeTab} onValueChange={v=>{setActiveTab(v as TabClientes);setRowSelection({});}}><TabsList className="grid w-full max-w-2xl grid-cols-3"><TabsTrigger value="activos">Clientes <Badge variant="secondary" className="ml-2">{activos.length}</Badge></TabsTrigger><TabsTrigger value="por_revisar">Por revisar <Badge variant="secondary" className="ml-2">{porRevisar.length}</Badge></TabsTrigger><TabsTrigger value="inactivos">Inactivos <Badge variant="secondary" className="ml-2">{inactivos.length}</Badge></TabsTrigger></TabsList>
      {(["activos","por_revisar","inactivos"] as const).map(tab=><TabsContent key={tab} value={tab} className="mt-4">{tab==="por_revisar"&&<div className="mb-4 rounded-lg border p-4 text-sm"><p className="font-medium">Depuración extraordinaria de la base histórica</p><p className="mt-1 text-muted-foreground">Selecciona quienes realmente tomaron un servicio y pulsa “Servicio tomado”. Los demás permanecerán aquí hasta que se confirme su situación o se envíen individualmente a Prospectos.</p></div>}<DataTable columns={columns} data={filtered} onRowSelectionChange={setRowSelection} rowSelection={rowSelection}/></TabsContent>)}</Tabs>
    </CardContent></Card>
    <ClientFormDrawer open={isFormOpen} onOpenChange={o=>{setIsFormOpen(o);if(!o)setSelectedCliente(null);}} cliente={selectedCliente} regiones={regiones} onSuccess={()=>{onRefresh();setIsFormOpen(false);setSelectedCliente(null);}}/>
    {clienteGrupoFamiliar&&<GrupoFamiliarDrawer open={isGrupoFamiliarOpen} onOpenChange={o=>{setIsGrupoFamiliarOpen(o);if(!o)setClienteGrupoFamiliar(null);}} cliente={clienteGrupoFamiliar} onSuccess={onRefresh}/>} 
    <ConfirmationDialog open={confirmHistoricos} onOpenChange={setConfirmHistoricos} onConfirm={marcarHistoricos} title="¿Confirmar servicio histórico?" description={`Marcarás ${selectedIds.length} registro(s) como clientes que sí tomaron servicio antes del saneamiento de NEXUS. Esto no inventará un servicio ni un monto; solo los excluirá de la bandeja “Por revisar”.`} confirmText="Confirmar servicio tomado" variant="default"/>
    <ConfirmationDialog open={!!clienteToProspect} onOpenChange={o=>{if(!o)setClienteToProspect(null);}} onConfirm={enviarProspecto} title="¿Enviar a Prospectos?" description={`${clienteToProspect?.nombreCompleto??"Este registro"} se desactivará como cliente activo y volverá al circuito comercial. Su historial no se elimina.`} confirmText="Enviar a Prospectos" variant="default"/>
    <ConfirmationDialog open={!!clienteToDelete} onOpenChange={o=>{if(!o)setClienteToDelete(null);}} onConfirm={borrar} title="¿Eliminar cliente?" description={`¿Eliminar a ${clienteToDelete?.nombreCompleto??"este cliente"}?`} confirmText="Eliminar" variant="destructive"/>
  </>;
}
