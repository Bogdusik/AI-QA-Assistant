import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getActor } from "@/lib/auth/actor";

export async function GET(req: Request) {
  const actor = await getActor();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const docs = await prisma.document.findMany({
    where: {
      ...(actor.kind === "user"
        ? { userId: actor.userId }
        : { guestSessionId: actor.guestSessionId }),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(type && type !== "ALL" ? { type: type as never } : {}),
      ...(status && status !== "ALL" ? { status: status as never } : {})
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      sourceType: true,
      createdAt: true,
      isDemo: true,
      _count: { select: { generatedItems: true } }
    }
  });
  return NextResponse.json({ documents: docs });
}

const duplicateSchema = z.object({ documentId: z.string() });

export async function POST(req: Request) {
  try {
    const actor = await getActor();
    const body = duplicateSchema.parse(await req.json());
    const doc = await prisma.document.findFirst({
      where: {
        id: body.documentId,
        ...(actor.kind === "user"
          ? { userId: actor.userId }
          : { guestSessionId: actor.guestSessionId })
      },
      include: { generatedItems: true, requirementLinks: true }
    });
    if (!doc) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if ((doc as { isDemo?: boolean }).isDemo)
      return NextResponse.json({ error: "Demo Project is read-only." }, { status: 403 });

    const clone = await prisma.$transaction(async (tx) => {
      const created = await tx.document.create({
        data: {
          userId: doc.userId,
          guestSessionId: doc.guestSessionId,
          type: doc.type,
          title: `${doc.title} (Copy)`,
          status: doc.status,
          sourceType: doc.sourceType,
          sourceText: doc.sourceText,
          sourceUrl: doc.sourceUrl,
          sourceFilePath: doc.sourceFilePath,
          domainType: doc.domainType,
          detailLevel: doc.detailLevel
        }
      });
      await tx.generatedItem.createMany({
        data: doc.generatedItems.map((i) => ({
          documentId: created.id,
          itemType: i.itemType,
          title: i.title,
          contentJson: (i.contentJson ?? {}) as Prisma.InputJsonValue,
          reviewStatus: i.reviewStatus,
          sortOrder: i.sortOrder,
          sourceEvidence: i.sourceEvidence,
          assumptions: i.assumptions,
          riskNotes: i.riskNotes
        }))
      });
      await tx.requirementLink.createMany({
        data: doc.requirementLinks.map((l) => ({
          documentId: created.id,
          parentRequirementText: l.parentRequirementText,
          linkedArtifactType: l.linkedArtifactType,
          coverageNote: l.coverageNote
        }))
      });
      return created;
    });

    return NextResponse.json({ documentId: clone.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data." }, { status: 400 });
    }
    return NextResponse.json({ error: "Duplication failed." }, { status: 500 });
  }
}
