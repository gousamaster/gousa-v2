// src/components/system/settings/parentescos/parentesco-list.tsx

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
  eliminarParentesco,
  toggleParentescoActivo,
} from "@/lib/actions/catalogos/parentescos-actions";
import type { ParentescoListItem } from "@/types/parentesco-types";
import { ParentescoFormDrawer } from "./parentesco-form-drawer";
import { createParentescoColumns } from "./parentesco-table-columns";

interface ParentescoListProps {
  initialParentescos: ParentescoListItem[];
  onRefresh: () => void;
}

export function ParentescoList({
  initialParentescos,
  onRefresh,
}: ParentescoListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParentesco, setSelectedParentesco] =
    useState<ParentescoListItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [parentescoToDelete, setParentescoToDelete] =
    useState<ParentescoListItem | null>(null);

  const filteredParentescos = initialParentescos.filter(
    (parentesco) =>
      parentesco.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      parentesco.codigo.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEdit = (parentesco: ParentescoListItem) => {
    setSelectedParentesco(parentesco);
    setIsFormOpen(true);
  };

  const handleDelete = (parentesco: ParentescoListItem) => {
    setParentescoToDelete(parentesco);
    setIsDeleteDialogOpen(true);
  };

  const handleToggle = async (parentesco: ParentescoListItem) => {
    const result = await toggleParentescoActivo(parentesco.id);

    if (result.success) {
      toast.success(
        `Parentesco ${parentesco.activo ? "desactivado" : "activado"} correctamente`,
      );
      onRefresh();
    } else {
      toast.error(result.error || "Error al cambiar estado del parentesco");
    }
  };

  const confirmDelete = async () => {
    if (!parentescoToDelete) return;

    const result = await eliminarParentesco(parentescoToDelete.id);

    if (result.success) {
      toast.success("Parentesco eliminado correctamente");
      onRefresh();
    } else {
      toast.error(result.error || "Error al eliminar parentesco");
    }

    setIsDeleteDialogOpen(false);
    setParentescoToDelete(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedParentesco(null);
  };

  const columns = createParentescoColumns(
    handleEdit,
    handleDelete,
    handleToggle,
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Parentescos</CardTitle>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo parentesco
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

          <DataTable columns={columns} data={filteredParentescos} />
        </CardContent>
      </Card>

      <ParentescoFormDrawer
        open={isFormOpen}
        onOpenChange={handleFormClose}
        parentesco={selectedParentesco}
        onSuccess={() => {
          onRefresh();
          handleFormClose();
        }}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="¿Eliminar parentesco?"
        description={`¿Estás seguro de que deseas eliminar el parentesco ${parentescoToDelete?.nombre}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
      />
    </>
  );
}
