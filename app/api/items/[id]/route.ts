import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getActor } from "@/lib/auth/actor";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  title: z.string().optional(),
  reviewStatus: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).optional(),
  contentJson: z.record(z.any()).optional()
});

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = schema.parse(await req.json());
  const actor = await getActor();
  const item = await prisma.generatedItem.findUnique({
    where: { id },
    include: { document: true }
  });
  if (!item) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if ((item.document as { isDemo?: boolean }).isDemo) {
    return NextResponse.json({ error: "Demo Project is read-only." }, { status: 403 });
  }
  if (actor.kind === "user" && item.document.userId !== actor.userId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  if (actor.kind === "guest" && item.document.guestSessionId !== actor.guestSessionId) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  await prisma.generatedItem.update({ where: { id }, data: body });
  return NextResponse.json({ ok: true });
}
