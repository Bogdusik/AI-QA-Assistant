import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getActor } from "@/lib/auth/actor";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({ reviewStatus: z.enum(["PENDING", "ACCEPTED", "REJECTED"]) });

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = schema.parse(await req.json());
  const actor = await getActor();
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if ((doc as { isDemo?: boolean }).isDemo) return NextResponse.json({ error: "Demo Project is read-only." }, { status: 403 });
  if (actor.kind === "user" && doc.userId !== actor.userId) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  if (actor.kind === "guest" && doc.guestSessionId !== actor.guestSessionId)
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  await prisma.generatedItem.updateMany({
    where: { documentId: id },
    data: { reviewStatus: body.reviewStatus }
  });
  return NextResponse.json({ ok: true });
}
