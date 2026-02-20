// src/components/system/clientes/client-list.tsx

"use client";

import type { RowSelectionState } from "@tanstack/react-table";
import {
  CheckSquare,
  Plus,
  Power,
  PowerOff,
  Search,
  Trash2,
  X,
} from "lucide-react";
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
import {
  eliminarCliente,
  eliminarClientesEnLote,
  toggleClienteActivo,
  toggleClientesActivoEnLote,
} from "@/lib/actions/clientes/clientes-actions";
import type { ClienteListItem } from "@/types/cliente-types";
import { ClientFormDrawer } from "./client-form-drawer";
import { createClientColumns } from "./client-table-columns";
import { GrupoFamiliarDrawer } from "./grupo-familiar-drawer";

interface ClientListProps {
  initialClientes: ClienteListItem[];
  regiones: Array<{ id: string; nombre: string }>;
  onRefresh: () => void;
}

export function ClientList({
  initialClientes,
  regiones,
  onRefresh,
}: ClientListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCliente, setSelectedCliente] =
    useState<ClienteListItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] =
    useState<ClienteListItem | null>(null);
  const [isGrupoFamiliarOpen, setIsGrupoFamiliarOpen] = useState(false);
  const [clienteGrupoFamiliar, setClienteGrupoFamiliar] =
    useState<ClienteListItem | null>(null);
  const [activeTab, setActiveTab] = useState<"activos" | "inactivos">(
    "activos",
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<
    "activar" | "desactivar" | "eliminar" | null
  >(null);

  const clientesActivos = initialClientes.filter((c) => c.activo);
  const clientesInactivos = initialClientes.filter((c) => !c.activo);

  const currentClientes =
    activeTab === "activos" ? clientesActivos : clientesInactivos;

  const filteredClientes = currentClientes.filter(
    (cliente) =>
      cliente.nombreCompleto
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.telefonoCelular
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const selectedClienteIds = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((index) => filteredClientes[Number.parseInt(index)]?.id)
    .filter(Boolean);

  const handleView = (cliente: ClienteListItem) => {
    router.push(`/clients/${cliente.id}`);
  };

  const handleEdit = (cliente: ClienteListItem) => {
    setSelectedCliente(cliente);
    setIsFormOpen(true);
  };

  const handleDelete = (cliente: ClienteListItem) => {
    setClienteToDelete(cliente);
    setIsDeleteDialogOpen(true);
  };

  const handleToggle = async (cliente: ClienteListItem) => {
    const result = await toggleClienteActivo(cliente.id);
    if (result.success) {
      toast.success(
        `Cliente ${cliente.activo ? "desactivado" : "activado"} correctamente`,
      );
      onRefresh();
    } else {
      toast.error(result.error || "Error al cambiar estado del cliente");
    }
  };

  const handleGrupoFamiliar = (cliente: ClienteListItem) => {
    setClienteGrupoFamiliar(cliente);
    setIsGrupoFamiliarOpen(true);
  };

  const confirmDelete = async () => {
    if (!clienteToDelete) return;
    const result = await eliminarCliente(clienteToDelete.id);
    if (result.success) {
      toast.success("Cliente eliminado correctamente");
      onRefresh();
    } else {
      toast.error(result.error || "Error al eliminar cliente");
    }
    setIsDeleteDialogOpen(false);
    setClienteToDelete(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedCliente(null);
  };

  const handleBulkAction = (action: "activar" | "desactivar" | "eliminar") => {
    if (selectedClienteIds.length === 0) {
      toast.error("Selecciona al menos un cliente");
      return;
    }
    setBulkAction(action);
    setIsBulkActionDialogOpen(true);
  };

  const confirmBulkAction = async () => {
    if (!bulkAction || selectedClienteIds.length === 0) return;

    try {
      if (bulkAction === "eliminar") {
        const result = await eliminarClientesEnLote(selectedClienteIds);
        if (result.success) {
          toast.success(
            `${result.data.eliminados} cliente(s) eliminado(s) correctamente`,
          );
          setRowSelection({});
          onRefresh();
        } else {
          toast.error(result.error || "Error al eliminar clientes");
        }
      } else {
        const nuevoEstado = bulkAction === "activar";
        const result = await toggleClientesActivoEnLote(
          selectedClienteIds,
          nuevoEstado,
        );
        if (result.success) {
          toast.success(
            `${result.data.actualizados} cliente(s) ${nuevoEstado ? "activado(s)" : "desactivado(s)"} correctamente`,
          );
          setRowSelection({});
          onRefresh();
        } else {
          toast.error(result.error || "Error al actualizar clientes");
        }
      }
    } catch (error) {
      console.error("Error en acción en lote:", error);
      toast.error("Error al procesar la acción");
    } finally {
      setIsBulkActionDialogOpen(false);
      setBulkAction(null);
    }
  };

  const getBulkActionMessage = () => {
    if (!bulkAction) return "";
    const count = selectedClienteIds.length;
    switch (bulkAction) {
      case "activar":
        return `¿Estás seguro de que deseas activar ${count} cliente(s)?`;
      case "desactivar":
        return `¿Estás seguro de que deseas desactivar ${count} cliente(s)?`;
      case "eliminar":
        return `¿Estás seguro de que deseas eliminar ${count} cliente(s)? Esta acción no se puede deshacer.`;
      default:
        return "";
    }
  };

  const columns = createClientColumns(
    handleView,
    handleEdit,
    handleDelete,
    handleToggle,
    handleGrupoFamiliar,
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Clientes</CardTitle>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {selectedClienteIds.length > 0 && (
              <div className="flex items-center justify-between rounded-lg border bg-muted p-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {selectedClienteIds.length} cliente(s) seleccionado(s)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRowSelection({})}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Limpiar
                  </Button>
                </div>
                <div className="flex gap-2">
                  {activeTab === "activos" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction("desactivar")}
                    >
                      <PowerOff className="mr-2 h-4 w-4" />
                      Desactivar
                    </Button>
                  )}
                  {activeTab === "inactivos" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction("activar")}
                    >
                      <Power className="mr-2 h-4 w-4" />
                      Activar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction("eliminar")}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as "activos" | "inactivos");
              setRowSelection({});
            }}
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="activos" className="relative">
                Activos
                <Badge variant="secondary" className="ml-2">
                  {clientesActivos.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="inactivos" className="relative">
                Inactivos
                <Badge variant="secondary" className="ml-2">
                  {clientesInactivos.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activos" className="mt-4">
              <DataTable
                columns={columns}
                data={filteredClientes}
                onRowSelectionChange={setRowSelection}
                rowSelection={rowSelection}
              />
            </TabsContent>

            <TabsContent value="inactivos" className="mt-4">
              <DataTable
                columns={columns}
                data={filteredClientes}
                onRowSelectionChange={setRowSelection}
                rowSelection={rowSelection}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ClientFormDrawer
        open={isFormOpen}
        onOpenChange={handleFormClose}
        cliente={selectedCliente}
        regiones={regiones}
        onSuccess={() => {
          onRefresh();
          handleFormClose();
        }}
      />

      {clienteGrupoFamiliar && (
        <GrupoFamiliarDrawer
          open={isGrupoFamiliarOpen}
          onOpenChange={(open) => {
            setIsGrupoFamiliarOpen(open);
            if (!open) setClienteGrupoFamiliar(null);
          }}
          cliente={clienteGrupoFamiliar}
          onSuccess={onRefresh}
        />
      )}

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="¿Eliminar cliente?"
        description={`¿Estás seguro de que deseas eliminar al cliente ${clienteToDelete?.nombreCompleto}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
      />

      <ConfirmationDialog
        open={isBulkActionDialogOpen}
        onOpenChange={setIsBulkActionDialogOpen}
        onConfirm={confirmBulkAction}
        title={`${bulkAction === "eliminar" ? "Eliminar" : bulkAction === "activar" ? "Activar" : "Desactivar"} clientes`}
        description={getBulkActionMessage()}
        confirmText={
          bulkAction === "eliminar"
            ? "Eliminar"
            : bulkAction === "activar"
              ? "Activar"
              : "Desactivar"
        }
        variant={bulkAction === "eliminar" ? "destructive" : "default"}
      />
    </>
  );
}
