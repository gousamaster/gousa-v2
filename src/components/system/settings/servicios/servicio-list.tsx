// src/components/system/settings/servicios/servicio-list.tsx

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
  eliminarServicio,
  toggleServicioActivo,
} from "@/lib/actions/catalogos/servicios-actions";
import type { RegionListItem } from "@/types/region-types";
import type { ServicioListItem } from "@/types/servicio-types";
import { ServicioFormDrawer } from "./servicio-form-drawer";
import { ServicioPreciosManager } from "./servicio-precios-manager";
import { createServicioColumns } from "./servicio-table-columns";

interface ServicioListProps {
  initialServicios: ServicioListItem[];
  regiones: RegionListItem[];
  onRefresh: () => void;
}

export function ServicioList({
  initialServicios,
  regiones,
  onRefresh,
}: ServicioListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServicio, setSelectedServicio] =
    useState<ServicioListItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreciosManagerOpen, setIsPreciosManagerOpen] = useState(false);
  const [servicioToDelete, setServicioToDelete] =
    useState<ServicioListItem | null>(null);
  const [servicioForPrecios, setServicioForPrecios] =
    useState<ServicioListItem | null>(null);

  const filteredServicios = initialServicios.filter(
    (servicio) =>
      servicio.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      servicio.codigo.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEdit = (servicio: ServicioListItem) => {
    setSelectedServicio(servicio);
    setIsFormOpen(true);
  };

  const handleDelete = (servicio: ServicioListItem) => {
    setServicioToDelete(servicio);
    setIsDeleteDialogOpen(true);
  };

  const handleToggle = async (servicio: ServicioListItem) => {
    const result = await toggleServicioActivo(servicio.id);

    if (result.success) {
      toast.success(
        `Servicio ${servicio.activo ? "desactivado" : "activado"} correctamente`,
      );
      onRefresh();
    } else {
      toast.error(result.error || "Error al cambiar estado del servicio");
    }
  };

  const handleManagePrecios = (servicio: ServicioListItem) => {
    setServicioForPrecios(servicio);
    setIsPreciosManagerOpen(true);
  };

  const confirmDelete = async () => {
    if (!servicioToDelete) return;

    const result = await eliminarServicio(servicioToDelete.id);

    if (result.success) {
      toast.success("Servicio eliminado correctamente");
      onRefresh();
    } else {
      toast.error(result.error || "Error al eliminar servicio");
    }

    setIsDeleteDialogOpen(false);
    setServicioToDelete(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedServicio(null);
  };

  const handlePreciosManagerClose = () => {
    setIsPreciosManagerOpen(false);
    setServicioForPrecios(null);
  };

  const columns = createServicioColumns(
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
            <CardTitle>Servicios</CardTitle>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo servicio
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

          <DataTable columns={columns} data={filteredServicios} />
        </CardContent>
      </Card>

      <ServicioFormDrawer
        open={isFormOpen}
        onOpenChange={handleFormClose}
        servicio={selectedServicio}
        onSuccess={() => {
          onRefresh();
          handleFormClose();
        }}
      />

      {servicioForPrecios && (
        <ServicioPreciosManager
          open={isPreciosManagerOpen}
          onOpenChange={handlePreciosManagerClose}
          servicio={servicioForPrecios}
          regiones={regiones}
          onSuccess={onRefresh}
        />
      )}

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="¿Eliminar servicio?"
        description={`¿Estás seguro de que deseas eliminar el servicio ${servicioToDelete?.nombre}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
      />
    </>
  );
}
