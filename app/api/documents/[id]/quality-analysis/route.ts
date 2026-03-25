import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getActor } from "@/lib/auth/actor";
import { analyzeQaQuality } from "@/lib/ai/service";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const actor = await getActor();
    const document = await prisma.document.findUnique({
      where: { id },
      include: { generatedItems: { where: { reviewStatus: "ACCEPTED" }, orderBy: { sortOrder: "asc" } } }
    });
    if (!document) return NextResponse.json({ error: "Document not found." }, { status: 404 });
    if ((document as { isDemo?: boolean }).isDemo) return NextResponse.json({ error: "Demo Project is read-only." }, { status: 403 });
    if (actor.kind === "user" && document.userId !== actor.userId) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    if (actor.kind === "guest" && document.guestSessionId !== actor.guestSessionId)
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    if (!document.generatedItems.length) {
      return NextResponse.json({ error: "No accepted items found. Accept items first." }, { status: 400 });
    }

    const analysis = await analyzeQaQuality({
      documentType: document.type,
      documentTitle: document.title,
      sourceText: document.sourceText,
      sourceUrl: document.sourceUrl,
      acceptedItems: document.generatedItems.map((item) => ({
        title: item.title,
        itemType: item.itemType,
        content: item.contentJson
      }))
    });

    const saved = await prisma.qualityAnalysis.upsert({
      where: { documentId: document.id },
      update: {
        overallScore: analysis.overallScore,
        strengths: analysis.strengths as unknown as Prisma.InputJsonValue,
        weaknesses: analysis.weaknesses as unknown as Prisma.InputJsonValue,
        suggestions: analysis.suggestions as unknown as Prisma.InputJsonValue,
        explainability: analysis.explainability as unknown as Prisma.InputJsonValue,
        analysisJson: analysis as unknown as Prisma.InputJsonValue
      },
      create: {
        documentId: document.id,
        overallScore: analysis.overallScore,
        strengths: analysis.strengths as unknown as Prisma.InputJsonValue,
        weaknesses: analysis.weaknesses as unknown as Prisma.InputJsonValue,
        suggestions: analysis.suggestions as unknown as Prisma.InputJsonValue,
        explainability: analysis.explainability as unknown as Prisma.InputJsonValue,
        analysisJson: analysis as unknown as Prisma.InputJsonValue
      }
    });

    return NextResponse.json({
      analysis: {
        id: saved.id,
        overallScore: saved.overallScore,
        strengths: saved.strengths,
        weaknesses: saved.weaknesses,
        suggestions: saved.suggestions,
        explainability: saved.explainability,
        analysisJson: saved.analysisJson
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Quality analysis failed." },
      { status: 400 }
    );
  }
}
