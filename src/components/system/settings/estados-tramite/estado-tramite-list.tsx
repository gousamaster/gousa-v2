// src/components/system/settings/estados-tramite/estado-tramite-list.tsx

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
  eliminarEstadoTramite,
  toggleEstadoTramiteActivo,
} from "@/lib/actions/catalogos/estados-tramite-actions";
import type { EstadoTramiteListItem } from "@/types/estado-tramite-types";
import { EstadoTramiteFormDrawer } from "./estado-tramite-form-drawer";
import { createEstadoTramiteColumns } from "./estado-tramite-table-columns";

interface EstadoTramiteListProps {
  initialEstadosTramite: EstadoTramiteListItem[];
  onRefresh: () => void;
}

export function EstadoTramiteList({
  initialEstadosTramite,
  onRefresh,
}: EstadoTramiteListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEstado, setSelectedEstado] =
    useState<EstadoTramiteListItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [estadoToDelete, setEstadoToDelete] =
    useState<EstadoTramiteListItem | null>(null);

  const filteredEstados = initialEstadosTramite.filter(
    (estado) =>
      estado.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      estado.codigo.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEdit = (estado: EstadoTramiteListItem) => {
    setSelectedEstado(estado);
    setIsFormOpen(true);
  };

  const handleDelete = (estado: EstadoTramiteListItem) => {
    setEstadoToDelete(estado);
    setIsDeleteDialogOpen(true);
  };

  const handleToggle = async (estado: EstadoTramiteListItem) => {
    const result = await toggleEstadoTramiteActivo(estado.id);

    if (result.success) {
      toast.success(
        `Estado ${estado.activo ? "desactivado" : "activado"} correctamente`,
      );
      onRefresh();
    } else {
      toast.error(result.error || "Error al cambiar estado");
    }
  };

  const confirmDelete = async () => {
    if (!estadoToDelete) return;

    const result = await eliminarEstadoTramite(estadoToDelete.id);

    if (result.success) {
      toast.success("Estado de trámite eliminado correctamente");
      onRefresh();
    } else {
      toast.error(result.error || "Error al eliminar estado de trámite");
    }

    setIsDeleteDialogOpen(false);
    setEstadoToDelete(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedEstado(null);
  };

  const columns = createEstadoTramiteColumns(
    handleEdit,
    handleDelete,
    handleToggle,
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Estados de Trámite</CardTitle>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo estado
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <DataTable columns={columns} data={filteredEstados} />
        </CardContent>
      </Card>

      <EstadoTramiteFormDrawer
        open={isFormOpen}
        onOpenChange={handleFormClose}
        estado={selectedEstado}
        onSuccess={() => {
          onRefresh();
          handleFormClose();
        }}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="¿Eliminar estado de trámite?"
        description={`¿Estás seguro de que deseas eliminar el estado ${estadoToDelete?.nombre}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
      />
    </>
  );
}
