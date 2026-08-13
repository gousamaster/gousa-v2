"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ClienteDatosMigratorios } from "@/types/cliente-types";

type TriState = "" | "true" | "false";

interface ClienteMigratorioTabProps {
  clienteId: string;
  datosMigratorios?: ClienteDatosMigratorios;
}

function booleanToTriState(
  value: boolean | null | undefined,
): TriState {
  if (value === true) return "true";
  if (value === false) return "false";
  return "";
}

function formatDate(
  value: Date | string | null | undefined,
): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function TriStateSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: TriState;
  onChange: (value: TriState) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <select
        id={id}
        value={value}
        onChange={(event) =>
          onChange(event.target.value as TriState)
        }
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <option value="">No informado</option>
        <option value="false">No</option>
        <option value="true">Sí</option>
      </select>
    </div>
  );
}

export function ClienteMigratorioTab({
  clienteId,
  datosMigratorios,
}: ClienteMigratorioTabProps) {
  const initial = useMemo(
    () => datosMigratorios,
    [datosMigratorios],
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(
    null,
  );

  // VISA USA
  const [tuvoVisaUsaAntes, setTuvoVisaUsaAntes] =
    useState<TriState>(
      booleanToTriState(initial?.tuvoVisaUsaAntes),
    );

  const [tipoVisaUsaAnterior, setTipoVisaUsaAnterior] =
    useState(initial?.tipoVisaUsaAnterior ?? "");

  const [numeroVisaAnterior, setNumeroVisaAnterior] =
    useState(initial?.numeroVisaAnterior ?? "");

  const [fechaEmisionVisaUsa, setFechaEmisionVisaUsa] =
    useState(formatDate(initial?.fechaEmisionVisaUsa));

  const [
    fechaVencimientoVisaUsa,
    setFechaVencimientoVisaUsa,
  ] = useState(
    formatDate(initial?.fechaVencimientoVisaUsa),
  );

  const [
    visaRevocadaCancelada,
    setVisaRevocadaCancelada,
  ] = useState<TriState>(
    booleanToTriState(
      initial?.visaRevocadaCancelada,
    ),
  );

  const [
    detalleRevocacionCancelacion,
    setDetalleRevocacionCancelacion,
  ] = useState(
    initial?.detalleRevocacionCancelacion ?? "",
  );

  // VIAJES USA
  const [viajoUsaAntes, setViajoUsaAntes] =
    useState<TriState>(
      booleanToTriState(initial?.viajoUsaAntes),
    );

  const [cantidadViajesUsa, setCantidadViajesUsa] =
    useState(
      initial?.cantidadViajesUsa?.toString() ?? "",
    );

  const [ultimoIngresoUsa, setUltimoIngresoUsa] =
    useState(formatDate(initial?.ultimoIngresoUsa));

  const [ultimaSalidaUsa, setUltimaSalidaUsa] =
    useState(formatDate(initial?.ultimaSalidaUsa));

  const [
    duracionUltimaEstadiaDias,
    setDuracionUltimaEstadiaDias,
  ] = useState(
    initial?.duracionUltimaEstadiaDias?.toString() ??
      "",
  );

  const [
    cumplioSiempreTiempoAutorizado,
    setCumplioSiempreTiempoAutorizado,
  ] = useState<TriState>(
    booleanToTriState(
      initial?.cumplioSiempreTiempoAutorizado,
    ),
  );

  // SOBREESTADÍA
  const [tuvoSobreestadia, setTuvoSobreestadia] =
    useState<TriState>(
      booleanToTriState(initial?.tuvoSobreestadia),
    );

  const [diasSobreestadia, setDiasSobreestadia] =
    useState(
      initial?.diasSobreestadia?.toString() ?? "",
    );

  const [
    detalleSobreestadia,
    setDetalleSobreestadia,
  ] = useState(initial?.detalleSobreestadia ?? "");

  // TRABAJO NO AUTORIZADO
  const [
    trabajoNoAutorizadoUsa,
    setTrabajoNoAutorizadoUsa,
  ] = useState<TriState>(
    booleanToTriState(
      initial?.trabajoNoAutorizadoUsa,
    ),
  );

  const [
    detalleTrabajoNoAutorizado,
    setDetalleTrabajoNoAutorizado,
  ] = useState(
    initial?.detalleTrabajoNoAutorizado ?? "",
  );

  // RECHAZOS
  const [
    tuvoRechazoVisaUsa,
    setTuvoRechazoVisaUsa,
  ] = useState<TriState>(
    booleanToTriState(initial?.tuvoRechazoVisaUsa),
  );

  const [
    cantidadRechazosVisaUsa,
    setCantidadRechazosVisaUsa,
  ] = useState(
    initial?.cantidadRechazosVisaUsa?.toString() ??
      "",
  );

  const [
    fechaUltimoRechazoVisa,
    setFechaUltimoRechazoVisa,
  ] = useState(
    formatDate(initial?.fechaUltimoRechazoVisa),
  );

  const [
    tipoVisaUltimoRechazo,
    setTipoVisaUltimoRechazo,
  ] = useState(
    initial?.tipoVisaUltimoRechazo ?? "",
  );

  const [
    motivoRechazoConocido,
    setMotivoRechazoConocido,
  ] = useState(
    initial?.motivoRechazoConocido ?? "",
  );

  // FRONTERA / CBP
  const [
    tuvoEntradaRechazadaUsa,
    setTuvoEntradaRechazadaUsa,
  ] = useState<TriState>(
    booleanToTriState(
      initial?.tuvoEntradaRechazadaUsa,
    ),
  );

  const [
    fechaEntradaRechazada,
    setFechaEntradaRechazada,
  ] = useState(
    formatDate(initial?.fechaEntradaRechazada),
  );

  const [
    detalleEntradaRechazada,
    setDetalleEntradaRechazada,
  ] = useState(
    initial?.detalleEntradaRechazada ?? "",
  );

  const [tuvoProblemaCbP, setTuvoProblemaCbP] =
    useState<TriState>(
      booleanToTriState(initial?.tuvoProblemaCbP),
    );

  const [
    detalleProblemaCbP,
    setDetalleProblemaCbP,
  ] = useState(initial?.detalleProblemaCbP ?? "");

  // DEPORTACIÓN / REMOCIÓN
  const [
    tuvoDeportacionRemocion,
    setTuvoDeportacionRemocion,
  ] = useState<TriState>(
    booleanToTriState(
      initial?.tuvoDeportacionRemocion,
    ),
  );

  const [
    fechaDeportacionRemocion,
    setFechaDeportacionRemocion,
  ] = useState(
    formatDate(initial?.fechaDeportacionRemocion),
  );

  const [
    detalleDeportacionRemocion,
    setDetalleDeportacionRemocion,
  ] = useState(
    initial?.detalleDeportacionRemocion ?? "",
  );

  // PETICIONES
  const [
    tuvoPeticionMigratoriaUsa,
    setTuvoPeticionMigratoriaUsa,
  ] = useState<TriState>(
    booleanToTriState(
      initial?.tuvoPeticionMigratoriaUsa,
    ),
  );

  const [
    tipoPeticionMigratoria,
    setTipoPeticionMigratoria,
  ] = useState(
    initial?.tipoPeticionMigratoria ?? "",
  );

  const [
    estadoPeticionMigratoria,
    setEstadoPeticionMigratoria,
  ] = useState(
    initial?.estadoPeticionMigratoria ?? "",
  );

  const [
    detallePeticionMigratoria,
    setDetallePeticionMigratoria,
  ] = useState(
    initial?.detallePeticionMigratoria ?? "",
  );

  const [
    solicitoResidenciaUsa,
    setSolicitoResidenciaUsa,
  ] = useState<TriState>(
    booleanToTriState(
      initial?.solicitoResidenciaUsa,
    ),
  );

  const [solicitoAsiloUsa, setSolicitoAsiloUsa] =
    useState<TriState>(
      booleanToTriState(initial?.solicitoAsiloUsa),
    );

  const [
    solicitoCambioEstatusUsa,
    setSolicitoCambioEstatusUsa,
  ] = useState<TriState>(
    booleanToTriState(
      initial?.solicitoCambioEstatusUsa,
    ),
  );

  // OTROS
  const [
    tuvoOtroAntecedenteMigratorio,
    setTuvoOtroAntecedenteMigratorio,
  ] = useState<TriState>(
    booleanToTriState(
      initial?.tuvoOtroAntecedenteMigratorio,
    ),
  );

  const [
    detalleOtroAntecedenteMigratorio,
    setDetalleOtroAntecedenteMigratorio,
  ] = useState(
    initial?.detalleOtroAntecedenteMigratorio ?? "",
  );

  const [
    observacionesMigratorias,
    setObservacionesMigratorias,
  ] = useState(
    initial?.observacionesMigratorias ?? "",
  );

  function triStateToBoolean(
    value: TriState,
  ): boolean | null {
    if (value === "true") return true;
    if (value === "false") return false;
    return null;
  }

  function nullableNumber(
    value: string,
  ): number | null {
    if (!value.trim()) return null;

    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : null;
  }

  function nullableText(
    value: string,
  ): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  function nullableDate(
    value: string,
  ): string | null {
    return value || null;
  }

  async function handleSave() {
    try {
      setSaving(true);
      setMessage(null);

      const payload = {
        tuvoVisaUsaAntes:
          triStateToBoolean(tuvoVisaUsaAntes),
        tipoVisaUsaAnterior:
          nullableText(tipoVisaUsaAnterior),
        numeroVisaAnterior:
          nullableText(numeroVisaAnterior),
        fechaEmisionVisaUsa:
          nullableDate(fechaEmisionVisaUsa),
        fechaVencimientoVisaUsa:
          nullableDate(fechaVencimientoVisaUsa),
        visaRevocadaCancelada:
          triStateToBoolean(
            visaRevocadaCancelada,
          ),
        detalleRevocacionCancelacion:
          nullableText(
            detalleRevocacionCancelacion,
          ),

        viajoUsaAntes:
          triStateToBoolean(viajoUsaAntes),
        cantidadViajesUsa:
          nullableNumber(cantidadViajesUsa),
        ultimoIngresoUsa:
          nullableDate(ultimoIngresoUsa),
        ultimaSalidaUsa:
          nullableDate(ultimaSalidaUsa),
        duracionUltimaEstadiaDias:
          nullableNumber(
            duracionUltimaEstadiaDias,
          ),
        cumplioSiempreTiempoAutorizado:
          triStateToBoolean(
            cumplioSiempreTiempoAutorizado,
          ),

        tuvoSobreestadia:
          triStateToBoolean(tuvoSobreestadia),
        diasSobreestadia:
          nullableNumber(diasSobreestadia),
        detalleSobreestadia:
          nullableText(detalleSobreestadia),

        trabajoNoAutorizadoUsa:
          triStateToBoolean(
            trabajoNoAutorizadoUsa,
          ),
        detalleTrabajoNoAutorizado:
          nullableText(
            detalleTrabajoNoAutorizado,
          ),

        tuvoRechazoVisaUsa:
          triStateToBoolean(
            tuvoRechazoVisaUsa,
          ),
        cantidadRechazosVisaUsa:
          nullableNumber(
            cantidadRechazosVisaUsa,
          ),
        fechaUltimoRechazoVisa:
          nullableDate(fechaUltimoRechazoVisa),
        tipoVisaUltimoRechazo:
          nullableText(tipoVisaUltimoRechazo),
        motivoRechazoConocido:
          nullableText(motivoRechazoConocido),

        tuvoEntradaRechazadaUsa:
          triStateToBoolean(
            tuvoEntradaRechazadaUsa,
          ),
        fechaEntradaRechazada:
          nullableDate(fechaEntradaRechazada),
        detalleEntradaRechazada:
          nullableText(
            detalleEntradaRechazada,
          ),

        tuvoProblemaCbP:
          triStateToBoolean(tuvoProblemaCbP),
        detalleProblemaCbP:
          nullableText(detalleProblemaCbP),

        tuvoDeportacionRemocion:
          triStateToBoolean(
            tuvoDeportacionRemocion,
          ),
        fechaDeportacionRemocion:
          nullableDate(
            fechaDeportacionRemocion,
          ),
        detalleDeportacionRemocion:
          nullableText(
            detalleDeportacionRemocion,
          ),

        tuvoPeticionMigratoriaUsa:
          triStateToBoolean(
            tuvoPeticionMigratoriaUsa,
          ),
        tipoPeticionMigratoria:
          nullableText(tipoPeticionMigratoria),
        estadoPeticionMigratoria:
          nullableText(
            estadoPeticionMigratoria,
          ),
        detallePeticionMigratoria:
          nullableText(
            detallePeticionMigratoria,
          ),

        solicitoResidenciaUsa:
          triStateToBoolean(
            solicitoResidenciaUsa,
          ),
        solicitoAsiloUsa:
          triStateToBoolean(solicitoAsiloUsa),
        solicitoCambioEstatusUsa:
          triStateToBoolean(
            solicitoCambioEstatusUsa,
          ),

        tuvoOtroAntecedenteMigratorio:
          triStateToBoolean(
            tuvoOtroAntecedenteMigratorio,
          ),
        detalleOtroAntecedenteMigratorio:
          nullableText(
            detalleOtroAntecedenteMigratorio,
          ),
        observacionesMigratorias:
          nullableText(
            observacionesMigratorias,
          ),
      };

      const response = await fetch(
        `/api/clientes/${clienteId}/migratorio`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const text = await response.text();

        throw new Error(
          text ||
            "No se pudieron guardar los datos migratorios",
        );
      }

      setMessage(
        "Datos migratorios guardados correctamente.",
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "No se pudieron guardar los datos migratorios.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold">
          Historial Migratorio
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Registra únicamente información confirmada.
          “No informado” no será interpretado por
          NEXUS como respuesta negativa ni positiva.
        </p>
      </div>

      {/* VISA USA */}
      <section className="space-y-4 rounded-lg border p-5">
        <h4 className="font-semibold">
          Visa estadounidense previa
        </h4>

        <TriStateSelect
          id="tuvoVisaUsaAntes"
          label="¿Tuvo visa estadounidense anteriormente?"
          value={tuvoVisaUsaAntes}
          onChange={setTuvoVisaUsaAntes}
        />

        {tuvoVisaUsaAntes === "true" && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de visa anterior</Label>
                <Input
                  value={tipoVisaUsaAnterior}
                  onChange={(e) =>
                    setTipoVisaUsaAnterior(
                      e.target.value,
                    )
                  }
                  placeholder="B1/B2, F1, J1..."
                />
              </div>

              <div className="space-y-2">
                <Label>Número de visa</Label>
                <Input
                  value={numeroVisaAnterior}
                  onChange={(e) =>
                    setNumeroVisaAnterior(
                      e.target.value,
                    )
                  }
                  placeholder="Si se conoce"
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha de emisión</Label>
                <Input
                  type="date"
                  value={fechaEmisionVisaUsa}
                  onChange={(e) =>
                    setFechaEmisionVisaUsa(
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha de vencimiento</Label>
                <Input
                  type="date"
                  value={fechaVencimientoVisaUsa}
                  onChange={(e) =>
                    setFechaVencimientoVisaUsa(
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>

            <TriStateSelect
              id="visaRevocadaCancelada"
              label="¿Alguna visa fue revocada o cancelada?"
              value={visaRevocadaCancelada}
              onChange={
                setVisaRevocadaCancelada
              }
            />

            {visaRevocadaCancelada === "true" && (
              <div className="space-y-2">
                <Label>
                  Detalle de revocación o cancelación
                </Label>
                <Textarea
                  value={
                    detalleRevocacionCancelacion
                  }
                  onChange={(e) =>
                    setDetalleRevocacionCancelacion(
                      e.target.value,
                    )
                  }
                  rows={3}
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* VIAJES USA */}
      <section className="space-y-4 rounded-lg border p-5">
        <h4 className="font-semibold">
          Viajes anteriores a Estados Unidos
        </h4>

        <TriStateSelect
          id="viajoUsaAntes"
          label="¿Ingresó anteriormente a Estados Unidos?"
          value={viajoUsaAntes}
          onChange={setViajoUsaAntes}
        />

        {viajoUsaAntes === "true" && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Cantidad aproximada de viajes
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={cantidadViajesUsa}
                  onChange={(e) =>
                    setCantidadViajesUsa(
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Duración última estadía (días)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={
                    duracionUltimaEstadiaDias
                  }
                  onChange={(e) =>
                    setDuracionUltimaEstadiaDias(
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Último ingreso</Label>
                <Input
                  type="date"
                  value={ultimoIngresoUsa}
                  onChange={(e) =>
                    setUltimoIngresoUsa(
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Última salida</Label>
                <Input
                  type="date"
                  value={ultimaSalidaUsa}
                  onChange={(e) =>
                    setUltimaSalidaUsa(
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>

            <TriStateSelect
              id="cumplioSiempreTiempoAutorizado"
              label="¿Cumplió siempre el tiempo de permanencia autorizado?"
              value={
                cumplioSiempreTiempoAutorizado
              }
              onChange={
                setCumplioSiempreTiempoAutorizado
              }
            />
          </div>
        )}
      </section>

      {/* RECHAZOS */}
      <section className="space-y-4 rounded-lg border p-5">
        <h4 className="font-semibold">
          Rechazos de visa
        </h4>

        <TriStateSelect
          id="tuvoRechazoVisaUsa"
          label="¿Tuvo algún rechazo de visa estadounidense?"
          value={tuvoRechazoVisaUsa}
          onChange={setTuvoRechazoVisaUsa}
        />

        {tuvoRechazoVisaUsa === "true" && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Cantidad de rechazos
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={
                    cantidadRechazosVisaUsa
                  }
                  onChange={(e) =>
                    setCantidadRechazosVisaUsa(
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Fecha del último rechazo
                </Label>
                <Input
                  type="date"
                  value={
                    fechaUltimoRechazoVisa
                  }
                  onChange={(e) =>
                    setFechaUltimoRechazoVisa(
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Tipo de visa rechazada
              </Label>
              <Input
                value={tipoVisaUltimoRechazo}
                onChange={(e) =>
                  setTipoVisaUltimoRechazo(
                    e.target.value,
                  )
                }
                placeholder="B1/B2, F1..."
              />
            </div>

            <div className="space-y-2">
              <Label>
                Motivo conocido del rechazo
              </Label>
              <Textarea
                value={motivoRechazoConocido}
                onChange={(e) =>
                  setMotivoRechazoConocido(
                    e.target.value,
                  )
                }
                rows={3}
                placeholder="Ej. 214(b), documentos, no informado..."
              />
            </div>
          </div>
        )}
      </section>

      {/* INCUMPLIMIENTOS */}
      <section className="space-y-5 rounded-lg border p-5">
        <h4 className="font-semibold">
          Cumplimiento migratorio
        </h4>

        <TriStateSelect
          id="tuvoSobreestadia"
          label="¿Permaneció alguna vez más tiempo del autorizado?"
          value={tuvoSobreestadia}
          onChange={setTuvoSobreestadia}
        />

        {tuvoSobreestadia === "true" && (
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label>
                Días aproximados de sobreestadía
              </Label>
              <Input
                type="number"
                min="1"
                value={diasSobreestadia}
                onChange={(e) =>
                  setDiasSobreestadia(
                    e.target.value,
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Detalle de la sobreestadía
              </Label>
              <Textarea
                value={detalleSobreestadia}
                onChange={(e) =>
                  setDetalleSobreestadia(
                    e.target.value,
                  )
                }
                rows={3}
              />
            </div>
          </div>
        )}

        <TriStateSelect
          id="trabajoNoAutorizadoUsa"
          label="¿Trabajó alguna vez en Estados Unidos sin autorización?"
          value={trabajoNoAutorizadoUsa}
          onChange={
            setTrabajoNoAutorizadoUsa
          }
        />

        {trabajoNoAutorizadoUsa === "true" && (
          <div className="space-y-2">
            <Label>
              Detalle del trabajo no autorizado
            </Label>
            <Textarea
              value={
                detalleTrabajoNoAutorizado
              }
              onChange={(e) =>
                setDetalleTrabajoNoAutorizado(
                  e.target.value,
                )
              }
              rows={3}
            />
          </div>
        )}
      </section>

      {/* FRONTERA */}
      <section className="space-y-5 rounded-lg border p-5">
        <h4 className="font-semibold">
          Frontera, ingreso y CBP
        </h4>

        <TriStateSelect
          id="tuvoEntradaRechazadaUsa"
          label="¿Le rechazaron alguna vez el ingreso a Estados Unidos?"
          value={tuvoEntradaRechazadaUsa}
          onChange={
            setTuvoEntradaRechazadaUsa
          }
        />

        {tuvoEntradaRechazadaUsa === "true" && (
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label>
                Fecha aproximada
              </Label>
              <Input
                type="date"
                value={fechaEntradaRechazada}
                onChange={(e) =>
                  setFechaEntradaRechazada(
                    e.target.value,
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Detalle</Label>
              <Textarea
                value={
                  detalleEntradaRechazada
                }
                onChange={(e) =>
                  setDetalleEntradaRechazada(
                    e.target.value,
                  )
                }
                rows={3}
              />
            </div>
          </div>
        )}

        <TriStateSelect
          id="tuvoProblemaCbP"
          label="¿Tuvo algún otro problema o incidente con CBP?"
          value={tuvoProblemaCbP}
          onChange={setTuvoProblemaCbP}
        />

        {tuvoProblemaCbP === "true" && (
          <div className="space-y-2">
            <Label>Detalle del incidente</Label>
            <Textarea
              value={detalleProblemaCbP}
              onChange={(e) =>
                setDetalleProblemaCbP(
                  e.target.value,
                )
              }
              rows={3}
            />
          </div>
        )}
      </section>

      {/* DEPORTACIÓN */}
      <section className="space-y-4 rounded-lg border p-5">
        <h4 className="font-semibold">
          Deportación o remoción
        </h4>

        <TriStateSelect
          id="tuvoDeportacionRemocion"
          label="¿Tuvo alguna deportación, remoción o salida obligatoria?"
          value={tuvoDeportacionRemocion}
          onChange={
            setTuvoDeportacionRemocion
          }
        />

        {tuvoDeportacionRemocion === "true" && (
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label>Fecha aproximada</Label>
              <Input
                type="date"
                value={
                  fechaDeportacionRemocion
                }
                onChange={(e) =>
                  setFechaDeportacionRemocion(
                    e.target.value,
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Detalle</Label>
              <Textarea
                value={
                  detalleDeportacionRemocion
                }
                onChange={(e) =>
                  setDetalleDeportacionRemocion(
                    e.target.value,
                  )
                }
                rows={3}
              />
            </div>
          </div>
        )}
      </section>

      {/* PETICIONES */}
      <section className="space-y-5 rounded-lg border p-5">
        <h4 className="font-semibold">
          Peticiones y procesos migratorios
        </h4>

        <TriStateSelect
          id="tuvoPeticionMigratoriaUsa"
          label="¿Tuvo o tiene alguna petición o proceso migratorio en Estados Unidos?"
          value={tuvoPeticionMigratoriaUsa}
          onChange={
            setTuvoPeticionMigratoriaUsa
          }
        />

        {tuvoPeticionMigratoriaUsa === "true" && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Tipo de petición o proceso
                </Label>
                <Input
                  value={
                    tipoPeticionMigratoria
                  }
                  onChange={(e) =>
                    setTipoPeticionMigratoria(
                      e.target.value,
                    )
                  }
                  placeholder="I-130, I-140, asilo..."
                />
              </div>

              <div className="space-y-2">
                <Label>Estado actual</Label>
                <Input
                  value={
                    estadoPeticionMigratoria
                  }
                  onChange={(e) =>
                    setEstadoPeticionMigratoria(
                      e.target.value,
                    )
                  }
                  placeholder="Pendiente, aprobada, negada..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Detalle del proceso
              </Label>
              <Textarea
                value={
                  detallePeticionMigratoria
                }
                onChange={(e) =>
                  setDetallePeticionMigratoria(
                    e.target.value,
                  )
                }
                rows={3}
              />
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <TriStateSelect
            id="solicitoResidenciaUsa"
            label="¿Solicitó residencia?"
            value={solicitoResidenciaUsa}
            onChange={
              setSolicitoResidenciaUsa
            }
          />

          <TriStateSelect
            id="solicitoAsiloUsa"
            label="¿Solicitó asilo?"
            value={solicitoAsiloUsa}
            onChange={setSolicitoAsiloUsa}
          />

          <TriStateSelect
            id="solicitoCambioEstatusUsa"
            label="¿Solicitó cambio de estatus?"
            value={solicitoCambioEstatusUsa}
            onChange={
              setSolicitoCambioEstatusUsa
            }
          />
        </div>
      </section>

      {/* OTROS */}
      <section className="space-y-4 rounded-lg border p-5">
        <h4 className="font-semibold">
          Otros antecedentes migratorios
        </h4>

        <TriStateSelect
          id="tuvoOtroAntecedenteMigratorio"
          label="¿Existe algún otro antecedente migratorio relevante?"
          value={
            tuvoOtroAntecedenteMigratorio
          }
          onChange={
            setTuvoOtroAntecedenteMigratorio
          }
        />

        {tuvoOtroAntecedenteMigratorio ===
          "true" && (
          <div className="space-y-2">
            <Label>
              Detalle del antecedente
            </Label>
            <Textarea
              value={
                detalleOtroAntecedenteMigratorio
              }
              onChange={(e) =>
                setDetalleOtroAntecedenteMigratorio(
                  e.target.value,
                )
              }
              rows={3}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>
            Observaciones migratorias generales
          </Label>
          <Textarea
            value={observacionesMigratorias}
            onChange={(e) =>
              setObservacionesMigratorias(
                e.target.value,
              )
            }
            rows={4}
            placeholder="Información adicional relevante para el análisis del caso..."
          />
        </div>
      </section>

      <div className="flex items-center justify-between border-t pt-5">
        <div className="text-sm">
          {message && (
            <span className="text-muted-foreground">
              {message}
            </span>
          )}
        </div>

        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? "Guardando..."
            : "Guardar datos migratorios"}
        </Button>
      </div>
    </div>
  );
}
