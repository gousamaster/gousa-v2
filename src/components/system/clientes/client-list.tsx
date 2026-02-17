// src/components/system/clientes/client-list.tsx

"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  eliminarCliente,
  toggleClienteActivo,
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

/**
 * Componente de lista de clientes
 * Implementa patrón Observer para reaccionar a cambios en los datos
 * y patrón Command para encapsular acciones del usuario
 */
export function ClientList({
  initialClientes,
  regiones,
  onRefresh,
}: ClientListProps) {
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

  const filteredClientes = initialClientes.filter(
    (cliente) =>
      cliente.nombreCompleto
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliente.telefonoCelular
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const handleView = (cliente: ClienteListItem) => {
    toast.info("Vista de detalle en desarrollo");
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
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <DataTable columns={columns} data={filteredClientes} />
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
    </>
  );
}
