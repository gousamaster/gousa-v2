import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  calcularProspectoScore,
  PROSPECTO_SCORE_QUESTIONS,
  PROSPECTO_SCORE_VERSION,
  type ProspectoScoreAnswers,
  validarRespuestasProspectoScore,
} from "@/lib/nexus/prospecto-score";

type ScoreRow = {
  id: string;
  prospectoId: string;
  evaluadorId: string | null;
  evaluadorNombre: string | null;
  modeloVersion: string;
  respuestas: ProspectoScoreAnswers;
  score: number;
  clasificacion: string;
  createdAt: Date;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ prospectoId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { prospectoId } = await params;

    const prospecto = await db.prospecto.findFirst({
      where: { id: prospectoId, deletedAt: null },
      select: { id: true, nombres: true, apellidos: true, scorePreliminar: true },
    });

    if (!prospecto) {
      return NextResponse.json({ error: "Prospecto no encontrado" }, { status: 404 });
    }

    const rows = await db.$queryRaw<ScoreRow[]>`
      SELECT
        e."id" AS "id",
        e."prospecto_id" AS "prospectoId",
        e."evaluador_id" AS "evaluadorId",
        u."name" AS "evaluadorNombre",
        e."modelo_version" AS "modeloVersion",
        e."respuestas" AS "respuestas",
        e."score" AS "score",
        e."clasificacion" AS "clasificacion",
        e."created_at" AS "createdAt"
      FROM "prospecto_score_evaluacion" e
      LEFT JOIN "user" u ON u."id" = e."evaluador_id"
      WHERE e."prospecto_id" = ${prospectoId}
      ORDER BY e."created_at" DESC
      LIMIT 10
    `;

    return NextResponse.json({
      prospecto,
      modelo: {
        version: PROSPECTO_SCORE_VERSION,
        preguntas: PROSPECTO_SCORE_QUESTIONS,
        aviso:
          "Score NEXUS es un índice interno y orientativo de preparación del perfil. No es una probabilidad oficial de aprobación consular ni garantiza un resultado migratorio.",
      },
      ultimaEvaluacion: rows[0] ?? null,
      historial: rows,
    });
  } catch (error) {
    console.error("Error al cargar score NEXUS:", error);
    return NextResponse.json(
      { error: "No se pudo cargar la evaluación NEXUS" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectoId: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { prospectoId } = await params;
    const body = await request.json();
    const respuestas = body.respuestas as ProspectoScoreAnswers | undefined;

    if (!respuestas || !validarRespuestasProspectoScore(respuestas)) {
      return NextResponse.json(
        { error: "Debes responder todas las preguntas con opciones válidas" },
        { status: 400 },
      );
    }

    const prospecto = await db.prospecto.findFirst({
      where: { id: prospectoId, deletedAt: null },
      select: { id: true },
    });

    if (!prospecto) {
      return NextResponse.json({ error: "Prospecto no encontrado" }, { status: 404 });
    }

    const resultado = calcularProspectoScore(respuestas);
    const evaluacionId = randomUUID();
    const respuestasJson = JSON.stringify(respuestas);

    await db.$transaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO "prospecto_score_evaluacion" (
          "id",
          "prospecto_id",
          "evaluador_id",
          "modelo_version",
          "respuestas",
          "score",
          "clasificacion"
        ) VALUES (
          ${evaluacionId},
          ${prospectoId},
          ${session.user.id},
          ${PROSPECTO_SCORE_VERSION},
          CAST(${respuestasJson} AS jsonb),
          ${resultado.score},
          ${resultado.clasificacion}
        )
      `;

      await tx.prospecto.update({
        where: { id: prospectoId },
        data: { scorePreliminar: resultado.score },
      });
    });

    return NextResponse.json({
      evaluacion: {
        id: evaluacionId,
        score: resultado.score,
        clasificacion: resultado.clasificacion,
        modeloVersion: PROSPECTO_SCORE_VERSION,
      },
    });
  } catch (error) {
    console.error("Error al guardar score NEXUS:", error);
    return NextResponse.json(
      { error: "No se pudo guardar la evaluación NEXUS" },
      { status: 500 },
    );
  }
}
