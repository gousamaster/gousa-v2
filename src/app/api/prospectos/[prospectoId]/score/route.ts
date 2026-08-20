import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { puedeAccederProspecto } from "@/lib/prospectos/permisos";
import { registrarAuditoriaProspecto } from "@/lib/prospectos/auditoria";
import {
  analizarProspectoScore,
  calcularProspectoScore,
  PROSPECTO_SCORE_QUESTIONS,
  PROSPECTO_SCORE_VERSION,
  type ProspectoScoreAnswers,
  validarRespuestasProspectoScore,
} from "@/lib/nexus/prospecto-score";

type ScoreRow = {
  id: string; prospectoId: string; evaluadorId: string | null; evaluadorNombre: string | null;
  modeloVersion: string; respuestas: ProspectoScoreAnswers; score: number; clasificacion: string; createdAt: Date;
};

function enrichEvaluation(row: ScoreRow | undefined) {
  if (!row) return null;
  return { ...row, analisis: row.modeloVersion === PROSPECTO_SCORE_VERSION && validarRespuestasProspectoScore(row.respuestas) ? analizarProspectoScore(row.respuestas) : null };
}

export async function GET(_request: Request, { params }: { params: Promise<{ prospectoId: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { prospectoId } = await params;
    if (!(await puedeAccederProspecto(session.user.id, prospectoId))) return NextResponse.json({ error: "Sin permiso para ver el Score NEXUS de este prospecto" }, { status: 403 });

    const prospecto = await db.prospecto.findFirst({ where: { id: prospectoId, deletedAt: null }, select: { id: true, nombres: true, apellidos: true, scorePreliminar: true } });
    if (!prospecto) return NextResponse.json({ error: "Prospecto no encontrado" }, { status: 404 });

    const rows = await db.$queryRaw<ScoreRow[]>`
      SELECT e."id", e."prospecto_id" AS "prospectoId", e."evaluador_id" AS "evaluadorId", u."name" AS "evaluadorNombre",
        e."modelo_version" AS "modeloVersion", e."respuestas", e."score", e."clasificacion", e."created_at" AS "createdAt"
      FROM "prospecto_score_evaluacion" e
      LEFT JOIN "user" u ON u."id" = e."evaluador_id"
      WHERE e."prospecto_id" = ${prospectoId}
      ORDER BY e."created_at" DESC
      LIMIT 10
    `;

    return NextResponse.json({
      prospecto,
      modelo: { version: PROSPECTO_SCORE_VERSION, preguntas: PROSPECTO_SCORE_QUESTIONS, aviso: "Score NEXUS es un índice interno y orientativo de preparación del perfil. No es una probabilidad oficial de aprobación consular ni garantiza un resultado migratorio." },
      ultimaEvaluacion: enrichEvaluation(rows[0]),
      historial: rows,
    });
  } catch (error) {
    console.error("Error al cargar score NEXUS:", error);
    return NextResponse.json({ error: "No se pudo cargar la evaluación NEXUS" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ prospectoId: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { prospectoId } = await params;
    if (!(await puedeAccederProspecto(session.user.id, prospectoId))) return NextResponse.json({ error: "Sin permiso para evaluar este prospecto" }, { status: 403 });

    const body = await request.json();
    const respuestas = body.respuestas as ProspectoScoreAnswers | undefined;
    if (!respuestas || !validarRespuestasProspectoScore(respuestas)) return NextResponse.json({ error: "Debes responder todas las preguntas con opciones válidas" }, { status: 400 });

    const prospecto = await db.prospecto.findFirst({ where: { id: prospectoId, deletedAt: null }, select: { id: true, scorePreliminar: true } });
    if (!prospecto) return NextResponse.json({ error: "Prospecto no encontrado" }, { status: 404 });

    const resultado = calcularProspectoScore(respuestas);
    const analisis = analizarProspectoScore(respuestas);
    const evaluacionId = randomUUID();
    const respuestasJson = JSON.stringify(respuestas);

    await db.$transaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO "prospecto_score_evaluacion" ("id", "prospecto_id", "evaluador_id", "modelo_version", "respuestas", "score", "clasificacion")
        VALUES (${evaluacionId}, ${prospectoId}, ${session.user.id}, ${PROSPECTO_SCORE_VERSION}, CAST(${respuestasJson} AS jsonb), ${resultado.score}, ${resultado.clasificacion})
      `;
      await tx.prospecto.update({ where: { id: prospectoId }, data: { scorePreliminar: resultado.score } });
      await registrarAuditoriaProspecto(tx, { prospectoId, usuarioId: session.user.id, accion: "SCORE_NEXUS", detalle: { scoreAnterior: prospecto.scorePreliminar, scoreNuevo: resultado.score, clasificacion: resultado.clasificacion, modeloVersion: PROSPECTO_SCORE_VERSION, evaluacionId } });
    });

    return NextResponse.json({ evaluacion: { id: evaluacionId, score: resultado.score, clasificacion: resultado.clasificacion, modeloVersion: PROSPECTO_SCORE_VERSION, respuestas, analisis } });
  } catch (error) {
    console.error("Error al guardar score NEXUS:", error);
    return NextResponse.json({ error: "No se pudo guardar la evaluación NEXUS" }, { status: 500 });
  }
}
