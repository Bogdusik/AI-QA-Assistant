import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { getActor } from "@/lib/auth/actor";
import { prisma } from "@/lib/db/prisma";
import { enforceGuestAccess } from "@/lib/usage/guest";
import { generateApiIdeas, generateChecklist, generateTestCases, formatBugReport } from "@/lib/ai/service";

const schema = z.object({
  type: z.enum(["TEST_CASE_SET", "CHECKLIST", "BUG_REPORT", "API_TEST_SET"]),
  title: z.string().min(3),
  sourceText: z.string().max(50000).optional(),
  sourceUrl: z
    .union([z.string().url(), z.literal(""), z.undefined()])
    .transform((v) => (v === "" ? undefined : v)),
  sourceFilePath: z.string().optional(),
  domainType: z.enum(["WEB", "MOBILE", "API", "GENERAL"]).default("GENERAL"),
  detailLevel: z.enum(["SHORT", "NORMAL", "DETAILED"]).default("NORMAL"),
  payload: z.record(z.any()).default({})
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const actor = await getActor();
    if (actor.kind === "guest") await enforceGuestAccess(body.type);

    const baseInput = {
      title: body.title,
      sourceText: body.sourceText,
      sourceUrl: body.sourceUrl,
      domainType: body.domainType,
      detailLevel: body.detailLevel,
      ...body.payload
    };

    let generated: Record<string, unknown>[] = [];
    let itemType: "TEST_CASE" | "CHECKLIST_ITEM" | "BUG_REPORT" | "API_TEST_IDEA" = "TEST_CASE";

    if (body.type === "TEST_CASE_SET") {
      generated = await generateTestCases(baseInput);
      itemType = "TEST_CASE";
    } else if (body.type === "CHECKLIST") {
      generated = await generateChecklist(baseInput);
      itemType = "CHECKLIST_ITEM";
    } else if (body.type === "BUG_REPORT") {
      generated = [await formatBugReport(baseInput)];
      itemType = "BUG_REPORT";
    } else {
      generated = await generateApiIdeas(baseInput);
      itemType = "API_TEST_IDEA";
    }

    const sourceType = body.sourceFilePath
      ? "MIXED"
      : body.sourceUrl && body.sourceText
        ? "MIXED"
        : body.sourceUrl
          ? "URL"
          : "TEXT";
    const doc = await prisma.document.create({
      data: {
        type: body.type,
        title: body.title,
        sourceText: body.sourceText,
        sourceUrl: body.sourceUrl || null,
        sourceFilePath: body.sourceFilePath || null,
        sourceType,
        domainType: body.domainType,
        detailLevel: body.detailLevel,
        status: "ACTIVE",
        ...(actor.kind === "user" ? { userId: actor.userId } : { guestSessionId: actor.guestSessionId })
      }
    });

    await prisma.generatedItem.createMany({
      data: generated.map((item, idx) => ({
        documentId: doc.id,
        itemType,
        title: String(item.title ?? `${itemType} #${idx + 1}`),
        contentJson: item as Prisma.InputJsonValue,
        reviewStatus: "PENDING",
        sortOrder: idx,
        sourceEvidence: String(item.sourceEvidence ?? ""),
        assumptions: String(item.assumptions ?? ""),
        riskNotes: String(item.riskNote ?? "")
      }))
    });

    await prisma.requirementLink.create({
      data: {
        documentId: doc.id,
        parentRequirementText: body.sourceText || body.title,
        linkedArtifactType: body.type,
        coverageNote: "Generated from current request input."
      }
    });

    return NextResponse.json({ documentId: doc.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
