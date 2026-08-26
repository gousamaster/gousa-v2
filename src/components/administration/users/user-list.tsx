// src/components/administration/users/user-list.tsx

"use client";

import { Loader2, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { resetUserPasswordBySuperAdmin } from "@/lib/actions/admin-user-security-actions";
import type {
  DepartmentWithRelations,
  UserWithRelations,
} from "@/lib/actions/types/action-types";
import { deleteUser } from "@/lib/actions/user-actions";
import { UserFormDrawer } from "./user-form-drawer";
import { createUserColumns } from "./user-table-columns";

interface UserListProps {
  initialUsers: UserWithRelations[];
  departments: DepartmentWithRelations[];
  managers: UserWithRelations[];
  onRefresh: () => void;
}

export function UserList({
  initialUsers,
  departments,
  managers,
  onRefresh,
}: UserListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithRelations | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRelations | null>(
    null,
  );
  const [passwordUser, setPasswordUser] = useState<UserWithRelations | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const filteredUsers = initialUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleEdit = (user: UserWithRelations) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = (user: UserWithRelations) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleManageRole = (user: UserWithRelations) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleResetPassword = (user: UserWithRelations) => {
    setPasswordUser(user);
    setNewPassword("");
    setConfirmPassword("");
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    const result = await deleteUser(userToDelete.id);

    if (result.success) {
      toast.success("Usuario eliminado correctamente");
      onRefresh();
    } else {
      toast.error(result.error || "Error al eliminar usuario");
    }

    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  const handlePasswordChange = async () => {
    if (!passwordUser) return;
    if (!newPassword || newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await resetUserPasswordBySuperAdmin(passwordUser.id, newPassword);
      if (result.success) {
        toast.success(`Contraseña actualizada para ${passwordUser.name}`);
        setPasswordUser(null);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(result.error || "No se pudo cambiar la contraseña");
      }
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cambiar la contraseña");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const columns = createUserColumns(
    handleEdit,
    handleDelete,
    handleManageRole,
    handleResetPassword,
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usuarios</CardTitle>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <DataTable columns={columns} data={filteredUsers} />
        </CardContent>
      </Card>

      <UserFormDrawer
        open={isFormOpen}
        onOpenChange={handleFormClose}
        user={selectedUser}
        departments={departments}
        managers={managers}
        onSuccess={() => {
          onRefresh();
          handleFormClose();
        }}
      />

      <ConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="¿Eliminar usuario?"
        description={`¿Estás seguro de que deseas eliminar a ${userToDelete?.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
      />

      <Sheet
        open={!!passwordUser}
        onOpenChange={(open) => {
          if (!open) {
            setPasswordUser(null);
            setNewPassword("");
            setConfirmPassword("");
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-md p-4">
          <SheetHeader>
            <SheetTitle>Cambiar contraseña</SheetTitle>
            <SheetDescription>
              {passwordUser
                ? `Define una nueva contraseña para ${passwordUser.name}. Solo un SUPER_ADMIN puede ejecutar esta acción.`
                : ""}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="admin-new-password">
                Nueva contraseña
              </label>
              <Input
                id="admin-new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                Debe contener mayúsculas, minúsculas y números.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="admin-confirm-password">
                Confirmar contraseña
              </label>
              <Input
                id="admin-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setPasswordUser(null)}
                disabled={isChangingPassword}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !newPassword || !confirmPassword}
              >
                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cambiar contraseña
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
