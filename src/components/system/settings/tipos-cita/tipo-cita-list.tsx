// src/components/system/settings/tipos-cita/tipo-cita-list.tsx

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
  eliminarTipoCita,
  toggleTipoCitaActivo,
} from "@/lib/actions/catalogos/tipos-cita-actions";
import type { RegionListItem } from "@/types/region-types";
import type { TipoCitaListItem } from "@/types/tipo-cita-types";
import { TipoCitaFormDrawer } from "./tipo-cita-form-drawer";
import { TipoCitaPreciosManager } from "./tipo-cita-precios-manager";
import { createTipoCitaColumns } from "./tipo-cita-table-columns";

interface TipoCitaListProps {
  initialTiposCita: TipoCitaListItem[];
  regiones: RegionListItem[];
  onRefresh: () => void;
}

export function TipoCitaList({
  initialTiposCita,
  regiones,
  onRefresh,
}: TipoCitaListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTipoCita, setSelectedTipoCita] =
    useState<TipoCitaListItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreciosOpen, setIsPreciosOpen] = useState(false);
  const [tipoCitaForPrecios, setTipoCitaForPrecios] =
    useState<TipoCitaListItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tipoCitaToDelete, setTipoCitaToDelete] =
    useState<TipoCitaListItem | null>(null);

  const filteredTiposCita = initialTiposCita.filter(
    (tipo) =>
      tipo.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tipo.codigo.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEdit = (tipoCita: TipoCitaListItem) => {
    setSelectedTipoCita(tipoCita);
    setIsFormOpen(true);
  };

  const handleDelete = (tipoCita: TipoCitaListItem) => {
    setTipoCitaToDelete(tipoCita);
    setIsDeleteDialogOpen(true);
  };

  const handleToggle = async (tipoCita: TipoCitaListItem) => {
    const result = await toggleTipoCitaActivo(tipoCita.id);

    if (result.success) {
      toast.success(
        `Tipo de cita ${tipoCita.activo ? "desactivado" : "activado"} correctamente`,
      );
      onRefresh();
    } else {
      toast.error(result.error || "Error al cambiar estado del tipo de cita");
    }
  };

  const handleManagePrecios = (tipoCita: TipoCitaListItem) => {
    setTipoCitaForPrecios(tipoCita);
    setIsPreciosOpen(true);
  };

  const confirmDelete = async () => {
    if (!tipoCitaToDelete) return;

    const result = await eliminarTipoCita(tipoCitaToDelete.id);

    if (result.success) {
      toast.success("Tipo de cita eliminado correctamente");
      onRefresh();
    } else {
      toast.error(result.error || "Error al eliminar tipo de cita");
    }

    setIsDeleteDialogOpen(false);
    setTipoCitaToDelete(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTipoCita(null);
  };

  const handlePreciosClose = () => {
    setIsPreciosOpen(false);
    setTipoCitaForPrecios(null);
  };

  const columns = createTipoCitaColumns(
    handleEdit,
    handleDelete,
    handleToggle,
    handleManagePrecios,
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tipos de Cita</CardTitle>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo tipo de cita
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

          <DataTable columns={columns} data={filteredTiposCita} />
        </CardContent>
      </Card>

      <TipoCitaFormDrawer
        open={isFormOpen}
        onOpenChange={handleFormClose}
        tipoCita={selectedTipoCita}
        onSuccess={() => {
          onRefresh();
          handleFormClose();
        }}
      />

      {tipoCitaForPrecios && (
        <TipoCitaPreciosManager
          open={isPreciosOpen}
          onOpenChange={handlePreciosClose}
          tipoCita={tipoCitaForPrecios}
          regiones={regiones}
          onSuccess={onRefresh}
        />
      )}

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="¿Eliminar tipo de cita?"
        description={`¿Estás seguro de que deseas eliminar el tipo de cita ${tipoCitaToDelete?.nombre}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
      />
    </>
  );
}
