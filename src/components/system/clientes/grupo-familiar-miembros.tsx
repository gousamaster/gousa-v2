// src/components/system/clientes/grupo-familiar-miembros.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, Trash2, UserCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  agregarMiembro,
  buscarClientesParaGrupo,
  type GrupoFamiliarDetalle,
  obtenerParentescos,
  removerMiembro,
} from "@/lib/actions/clientes/grupos-familiares-actions";
import {
  type AddMiembroFormData,
  addMiembroSchema,
} from "@/validations/grupo-familiar-validations";

interface GrupoFamiliarMiembrosProps {
  grupo: GrupoFamiliarDetalle;
  onBack: () => void;
  onSuccess: () => void;
}

/**
 * Vista de detalle y gestión de miembros de un grupo familiar
 * Implementa patrón Command para agregar/remover miembros
 */
export function GrupoFamiliarMiembros({
  grupo,
  onBack,
  onSuccess,
}: GrupoFamiliarMiembrosProps) {
  const [miembros, setMiembros] = useState(grupo.miembros);
  const [removiendo, setRemoviendo] = useState<string | null>(null);
  const [mostrarFormAgregar, setMostrarFormAgregar] = useState(false);

  const handleRemover = async (clienteId: string, esTitular: boolean) => {
    if (esTitular && miembros.length > 1) {
      toast.error(
        "No se puede remover al titular mientras haya otros miembros",
      );
      return;
    }

    setRemoviendo(clienteId);
    const result = await removerMiembro(grupo.id, clienteId);
    setRemoviendo(null);

    if (result.success) {
      toast.success("Miembro removido del grupo");
      if (miembros.length === 1) {
        onSuccess();
      } else {
        setMiembros((prev) => prev.filter((m) => m.cliente.id !== clienteId));
      }
    } else {
      toast.error(result.error ?? "Error al remover el miembro");
    }
  };

  const handleMiembroAgregado = (
    nuevoMiembro: GrupoFamiliarDetalle["miembros"][0],
  ) => {
    setMiembros((prev) => [...prev, nuevoMiembro]);
    setMostrarFormAgregar(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-sm text-muted-foreground">
            {miembros.length} miembro{miembros.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {miembros.map((miembro) => (
          <div
            key={miembro.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">
                  {miembro.cliente.nombres} {miembro.cliente.apellidos}
                </p>
                {miembro.esTitular && (
                  <Badge variant="default" className="text-xs">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Titular
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {miembro.parentesco.nombre}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() =>
                handleRemover(miembro.cliente.id, miembro.esTitular)
              }
              disabled={removiendo === miembro.cliente.id}
            >
              {removiendo === miembro.cliente.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>

      <Separator />

      {mostrarFormAgregar ? (
        <AgregarMiembroForm
          grupoFamiliarId={grupo.id}
          onSuccess={handleMiembroAgregado}
          onCancel={() => setMostrarFormAgregar(false)}
        />
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setMostrarFormAgregar(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Miembro
        </Button>
      )}
    </div>
  );
}

// ─── Sub-componente: Formulario para agregar miembro ─────────────────────────

interface AgregarMiembroFormProps {
  grupoFamiliarId: string;
  onSuccess: (miembro: GrupoFamiliarDetalle["miembros"][0]) => void;
  onCancel: () => void;
}

function AgregarMiembroForm({
  grupoFamiliarId,
  onSuccess,
  onCancel,
}: AgregarMiembroFormProps) {
  const [parentescos, setParentescos] = useState<
    Array<{ id: string; nombre: string; codigo: string }>
  >([]);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<
    Array<{
      id: string;
      nombres: string;
      apellidos: string;
      numeroCi: string | null;
    }>
  >([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<{
    id: string;
    nombres: string;
    apellidos: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddMiembroFormData>({
    resolver: zodResolver(addMiembroSchema),
  });

  useEffect(() => {
    obtenerParentescos().then((result) => {
      if (result.success && result.data) setParentescos(result.data);
    });
  }, []);

  useEffect(() => {
    if (busqueda.length < 2) {
      setResultados([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const result = await buscarClientesParaGrupo(busqueda, grupoFamiliarId);
      if (result.success && result.data) setResultados(result.data);
      setIsSearching(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [busqueda, grupoFamiliarId]);

  const seleccionarCliente = (cliente: (typeof resultados)[0]) => {
    setClienteSeleccionado(cliente);
    setValue("clienteId", cliente.id);
    setBusqueda(`${cliente.nombres} ${cliente.apellidos}`);
    setResultados([]);
  };

  const onSubmit = handleSubmit(async (data) => {
    if (!clienteSeleccionado) return;

    setIsSubmitting(true);
    const result = await agregarMiembro(grupoFamiliarId, data);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Miembro agregado correctamente");
      const parentesco = parentescos.find((p) => p.id === data.parentescoId);
      onSuccess({
        id: `temp-${Date.now()}`,
        esTitular: false,
        cliente: {
          id: clienteSeleccionado.id,
          nombres: clienteSeleccionado.nombres,
          apellidos: clienteSeleccionado.apellidos,
          tipoCliente: "ADULTO",
          email: null,
          telefonoCelular: null,
        },
        parentesco: {
          id: data.parentescoId,
          nombre: parentesco?.nombre ?? "",
          codigo: parentesco?.codigo ?? "",
        },
      });
    } else {
      toast.error(result.error ?? "Error al agregar el miembro");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 border rounded-lg p-4">
      <p className="font-medium text-sm">Agregar nuevo miembro</p>

      <div className="space-y-2">
        <Label>Buscar cliente</Label>
        <div className="relative">
          <Input
            placeholder="Nombre, apellido o CI..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              if (clienteSeleccionado) {
                setClienteSeleccionado(null);
                setValue("clienteId", "");
              }
            }}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {resultados.length > 0 && (
          <div className="border rounded-md divide-y">
            {resultados.map((c) => (
              <button
                key={c.id}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                onClick={() => seleccionarCliente(c)}
              >
                <span className="font-medium">
                  {c.nombres} {c.apellidos}
                </span>
                {c.numeroCi && (
                  <span className="text-muted-foreground ml-2">
                    CI: {c.numeroCi}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {errors.clienteId && (
          <p className="text-sm text-destructive">{errors.clienteId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Parentesco</Label>
        <Controller
          control={control}
          name="parentescoId"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona parentesco" />
              </SelectTrigger>
              <SelectContent>
                {parentescos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.parentescoId && (
          <p className="text-sm text-destructive">
            {errors.parentescoId.message}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting || !clienteSeleccionado}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Agregar
        </Button>
      </div>
    </form>
  );
}
