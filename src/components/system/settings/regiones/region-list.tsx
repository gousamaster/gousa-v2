// src/components/system/settings/regiones/region-list.tsx

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
  eliminarRegion,
  toggleRegionActivo,
} from "@/lib/actions/catalogos/regiones-actions";
import type { RegionListItem } from "@/types/region-types";
import { RegionFormDrawer } from "./region-form-drawer";
import { createRegionColumns } from "./region-table-columns";

interface RegionListProps {
  initialRegiones: RegionListItem[];
  onRefresh: () => void;
}

export function RegionList({ initialRegiones, onRefresh }: RegionListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<RegionListItem | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState<RegionListItem | null>(
    null,
  );

  const filteredRegiones = initialRegiones.filter(
    (region) =>
      region.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      region.codigo.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEdit = (region: RegionListItem) => {
    setSelectedRegion(region);
    setIsFormOpen(true);
  };

  const handleDelete = (region: RegionListItem) => {
    setRegionToDelete(region);
    setIsDeleteDialogOpen(true);
  };

  const handleToggle = async (region: RegionListItem) => {
    const result = await toggleRegionActivo(region.id);

    if (result.success) {
      toast.success(
        `Región ${region.activo ? "desactivada" : "activada"} correctamente`,
      );
      onRefresh();
    } else {
      toast.error(result.error || "Error al cambiar estado de la región");
    }
  };

  const confirmDelete = async () => {
    if (!regionToDelete) return;

    const result = await eliminarRegion(regionToDelete.id);

    if (result.success) {
      toast.success("Región eliminada correctamente");
      onRefresh();
    } else {
      toast.error(result.error || "Error al eliminar región");
    }

    setIsDeleteDialogOpen(false);
    setRegionToDelete(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedRegion(null);
  };

  const columns = createRegionColumns(handleEdit, handleDelete, handleToggle);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Regiones</CardTitle>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva región
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

          <DataTable columns={columns} data={filteredRegiones} />
        </CardContent>
      </Card>

      <RegionFormDrawer
        open={isFormOpen}
        onOpenChange={handleFormClose}
        region={selectedRegion}
        onSuccess={() => {
          onRefresh();
          handleFormClose();
        }}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="¿Eliminar región?"
        description={`¿Estás seguro de que deseas eliminar la región ${regionToDelete?.nombre}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
      />
    </>
  );
}
