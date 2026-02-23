// src/components/system/clientes/client-form-drawer.tsx

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  actualizarClienteCompleto,
  crearClienteCompleto,
  obtenerClientePorId,
} from "@/lib/actions/clientes/clientes-actions";
import { descargarRespaldosCompletos } from "@/lib/utils/backup-utils";
import { formatDateForInput } from "@/lib/utils/date-format-helper";
import type { ClienteListItem } from "@/types/cliente-types";
import {
  type CreateClienteCompletoFormData,
  createClienteCompletoSchema,
} from "@/validations/cliente-validations";
import { DatosAcademicosForm } from "./datos-academicos-form";
import { DatosBasicosForm } from "./datos-basicos-form";
import { DatosLaboralesForm } from "./datos-laborales-form";
import { DatosMatrimonialesForm } from "./datos-matrimoniales-form";
import { DatosPatrocinadorForm } from "./datos-patrocinador-form";
import { DatosPersonalesForm } from "./datos-personales-form";
import { DatosViajeForm } from "./datos-viaje-form";

interface ClientFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: ClienteListItem | null;
  onSuccess: () => void;
  regiones: Array<{ id: string; nombre: string }>;
}

export function ClientFormDrawer({
  open,
  onOpenChange,
  cliente,
  onSuccess,
  regiones,
}: ClientFormDrawerProps) {
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState("basicos");
  const [isPending, startTransition] = useTransition();
  const isEdit = !!cliente;

  const lastFormDataRef = useRef<CreateClienteCompletoFormData | null>(null);

  const methods = useForm({
    resolver: zodResolver(createClienteCompletoSchema),
    mode: "onChange",
    defaultValues: {
      cliente: {
        nombres: "",
        apellidos: "",
        tipoCliente: "ADULTO",
        fechaNacimiento: null,
        regionId: "",
        registradoPorId: "",
      },
      datosPersonales: {},
      datosLaborales: {},
      datosAcademicos: {},
      datosMatrimoniales: {},
      datosPatrocinador: {},
      datosViaje: {},
    },
  } as const);

  useEffect(() => {
    async function cargarDatosCliente() {
      if (open && cliente) {
        setIsLoadingData(true);
        try {
          console.log("🔵 [Drawer] Cargando datos del cliente:", cliente.id);
          const result = await obtenerClientePorId(cliente.id);

          if (result.success && result.data) {
            const data = result.data;
            console.log("✅ [Drawer] Datos cargados, reseteando formulario");

            methods.reset({
              cliente: {
                nombres: data.nombres,
                apellidos: data.apellidos,
                tipoCliente: data.tipoCliente,
                fechaNacimiento: formatDateForInput(data.fechaNacimiento),
                lugarNacimiento: data.lugarNacimiento || null,
                nacionalidad: data.nacionalidad || null,
                numeroCi: data.numeroCi || null,
                numeroPasaporte: data.numeroPasaporte || null,
                email: data.email || null,
                telefonoCelular: data.telefonoCelular || null,
                regionId: data.regionId,
                registradoPorId: data.registradoPorId,
              },
              datosPersonales: data.datosPersonales
                ? {
                    pasaporteFechaEmision: formatDateForInput(
                      data.datosPersonales.pasaporteFechaEmision,
                    ),
                    pasaporteFechaExpiracion: formatDateForInput(
                      data.datosPersonales.pasaporteFechaExpiracion,
                    ),
                    facebook: data.datosPersonales.facebook || null,
                    instagram: data.datosPersonales.instagram || null,
                    direccionDomicilio:
                      data.datosPersonales.direccionDomicilio || null,
                    estadoCivil: data.datosPersonales.estadoCivil || null,
                    profesion: data.datosPersonales.profesion || null,
                    nombrePadre: data.datosPersonales.nombrePadre || null,
                    fechaNacimientoPadre: formatDateForInput(
                      data.datosPersonales.fechaNacimientoPadre,
                    ),
                    nombreMadre: data.datosPersonales.nombreMadre || null,
                    fechaNacimientoMadre: formatDateForInput(
                      data.datosPersonales.fechaNacimientoMadre,
                    ),
                  }
                : {},
              datosLaborales: data.datosLaborales
                ? {
                    ...data.datosLaborales,
                    fechaContratacion: formatDateForInput(
                      data.datosLaborales.fechaContratacion,
                    ),
                    fechaInicioTrabajoAnterior: formatDateForInput(
                      data.datosLaborales.fechaInicioTrabajoAnterior,
                    ),
                  }
                : {},
              datosAcademicos: data.datosAcademicos
                ? {
                    ...data.datosAcademicos,
                    fechaInicioEstudio: formatDateForInput(
                      data.datosAcademicos.fechaInicioEstudio,
                    ),
                    fechaFinEstudio: formatDateForInput(
                      data.datosAcademicos.fechaFinEstudio,
                    ),
                  }
                : {},
              datosMatrimoniales: data.datosMatrimoniales
                ? {
                    ...data.datosMatrimoniales,
                    conyugeFechaNacimiento: formatDateForInput(
                      data.datosMatrimoniales.conyugeFechaNacimiento,
                    ),
                    matrimonioFechaInicio: formatDateForInput(
                      data.datosMatrimoniales.matrimonioFechaInicio,
                    ),
                    matrimonioFechaFin: formatDateForInput(
                      data.datosMatrimoniales.matrimonioFechaFin,
                    ),
                  }
                : {},
              datosPatrocinador: data.datosPatrocinador
                ? {
                    ...data.datosPatrocinador,
                    fechaInicioTrabajoPatrocinador: formatDateForInput(
                      data.datosPatrocinador.fechaInicioTrabajoPatrocinador,
                    ),
                  }
                : {},
              datosViaje: data.datosViaje
                ? {
                    ...data.datosViaje,
                    fechaTentativa: formatDateForInput(
                      data.datosViaje.fechaTentativa,
                    ),
                  }
                : {},
            });
          }
        } catch (error) {
          console.error(
            "❌ [Drawer] Error al cargar datos del cliente:",
            error,
          );
          toast.error("Error al cargar los datos del cliente");
        } finally {
          setIsLoadingData(false);
        }
      }
    }

    if (open && !cliente) {
      console.log("🔵 [Drawer] Modo crear - Reseteando formulario");
      methods.reset({
        cliente: {
          nombres: "",
          apellidos: "",
          tipoCliente: "ADULTO",
          fechaNacimiento: null,
          regionId: "",
          registradoPorId: "",
        },
        datosPersonales: {},
        datosLaborales: {},
        datosAcademicos: {},
        datosMatrimoniales: {},
        datosPatrocinador: {},
        datosViaje: {},
      });
      setActiveTab("basicos");
      lastFormDataRef.current = null;
    } else if (open && cliente) {
      cargarDatosCliente();
    }
  }, [open, cliente, methods]);

  const handleSubmit = methods.handleSubmit(
    async (data: CreateClienteCompletoFormData) => {
      console.log("🔵 [Drawer] Formulario válido, enviando datos:", {
        modo: isEdit ? "EDITAR" : "CREAR",
        clienteId: cliente?.id,
        nombres: data.cliente.nombres,
        apellidos: data.cliente.apellidos,
        timestamp: new Date().toISOString(),
      });

      lastFormDataRef.current = data;

      startTransition(async () => {
        try {
          const result =
            isEdit && cliente
              ? await actualizarClienteCompleto(cliente.id, data)
              : await crearClienteCompleto(data);

          console.log("🔵 [Drawer] Respuesta recibida:", result);

          if (result.success) {
            console.log(
              `✅ [Drawer] Cliente ${isEdit ? "actualizado" : "creado"} exitosamente`,
            );
            toast.success(
              isEdit
                ? "Cliente actualizado correctamente"
                : "Cliente creado correctamente",
            );
            lastFormDataRef.current = null;
            onSuccess();
            onOpenChange(false);
          } else {
            console.error("❌ [Drawer] Error en respuesta:", result.error);

            console.log(
              "🛡️ [Drawer] Generando respaldo automático por fallo...",
            );
            descargarRespaldosCompletos(data);

            toast.error(result.error || "Error al procesar la solicitud", {
              duration: 5000,
              description:
                "Se ha descargado un respaldo de los datos automáticamente.",
            });
          }
        } catch (error) {
          const errorObj = error as Error;
          console.error("❌ [Drawer] Error capturado en cliente:", {
            error: errorObj,
            message: errorObj?.message,
            name: errorObj?.name,
            stack: errorObj?.stack,
          });

          console.log(
            "🛡️ [Drawer] Generando respaldo automático por excepción...",
          );
          if (lastFormDataRef.current) {
            descargarRespaldosCompletos(lastFormDataRef.current);
          }

          if (
            errorObj?.message?.includes("Server Action") ||
            errorObj?.message?.includes("Failed to find")
          ) {
            toast.error(
              "Error de conexión. Por favor, recarga la página (Ctrl+Shift+R) e intenta de nuevo.",
              {
                duration: 7000,
                description:
                  "Se ha descargado un respaldo de los datos automáticamente.",
              },
            );
          } else {
            toast.error("Ocurrió un error inesperado. Intenta nuevamente.", {
              duration: 5000,
              description:
                "Se ha descargado un respaldo de los datos automáticamente.",
            });
          }
        }
      });
    },
    (errors) => {
      console.error("❌ [Drawer] Errores de validación:", errors);

      let errorMessage = "Por favor completa todos los campos obligatorios";

      if (errors.cliente) {
        const clienteErrors = errors.cliente;
        const firstField = Object.keys(clienteErrors)[0];
        const firstError =
          clienteErrors[firstField as keyof typeof clienteErrors];

        if (
          firstError &&
          typeof firstError === "object" &&
          "message" in firstError &&
          typeof firstError.message === "string"
        ) {
          errorMessage = firstError.message;
        }
      }

      toast.error(errorMessage);
    },
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Editar cliente" : "Crear nuevo cliente"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifica los datos del cliente"
              : "Completa los datos para crear un nuevo cliente"}
          </SheetDescription>
        </SheetHeader>

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="p-4">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="basicos">Básicos</TabsTrigger>
                    <TabsTrigger value="personales">Personales</TabsTrigger>
                    <TabsTrigger value="laborales">Laborales</TabsTrigger>
                    <TabsTrigger value="academicos">Académicos</TabsTrigger>
                    <TabsTrigger value="matrimoniales">
                      Matrimoniales
                    </TabsTrigger>
                    <TabsTrigger value="patrocinador">Patrocinador</TabsTrigger>
                    <TabsTrigger value="viaje">Viaje</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basicos" className="mt-6">
                    <DatosBasicosForm regiones={regiones} />
                  </TabsContent>

                  <TabsContent value="personales" className="mt-6">
                    <DatosPersonalesForm />
                  </TabsContent>

                  <TabsContent value="laborales" className="mt-6">
                    <DatosLaboralesForm />
                  </TabsContent>

                  <TabsContent value="academicos" className="mt-6">
                    <DatosAcademicosForm />
                  </TabsContent>

                  <TabsContent value="matrimoniales" className="mt-6">
                    <DatosMatrimonialesForm />
                  </TabsContent>

                  <TabsContent value="patrocinador" className="mt-6">
                    <DatosPatrocinadorForm />
                  </TabsContent>

                  <TabsContent value="viaje" className="mt-6">
                    <DatosViajeForm />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t px-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEdit ? "Actualizar Cliente" : "Crear Cliente"}
                </Button>
              </div>
            </form>
          </FormProvider>
        )}
      </SheetContent>
    </Sheet>
  );
}
