import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getActor } from "@/lib/auth/actor";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, ctx: Ctx) {
  const actor = await getActor();
  const { id } = await ctx.params;
  const doc = await prisma.document.findFirst({
    where: { id },
    include: { generatedItems: true, requirementLinks: true }
  });
  if (!doc) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if ((doc as { isDemo?: boolean }).isDemo) return NextResponse.json({ document: doc });
  if (actor.kind === "user" && doc.userId !== actor.userId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  if (actor.kind === "guest" && doc.guestSessionId !== actor.guestSessionId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  return NextResponse.json({ document: doc });
}

const patchSchema = z.object({
  title: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional()
});

export async function PATCH(req: Request, ctx: Ctx) {
  const actor = await getActor();
  const { id } = await ctx.params;
  const body = patchSchema.parse(await req.json());
  const doc = await prisma.document.findFirst({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if ((doc as { isDemo?: boolean }).isDemo)
    return NextResponse.json({ error: "Demo Project is read-only." }, { status: 403 });

  const updated = await prisma.document.updateMany({
    where: {
      id,
      ...(actor.kind === "user" ? { userId: actor.userId } : { guestSessionId: actor.guestSessionId })
    },
    data: body
  });
  if (!updated.count) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, ctx: Ctx) {
  const actor = await getActor();
  const { id } = await ctx.params;
  const doc = await prisma.document.findFirst({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if ((doc as { isDemo?: boolean }).isDemo)
    return NextResponse.json({ error: "Demo Project is read-only." }, { status: 403 });

  const deleted = await prisma.document.deleteMany({
    where: {
      id,
      ...(actor.kind === "user" ? { userId: actor.userId } : { guestSessionId: actor.guestSessionId })
    }
  });
  if (!deleted.count) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
