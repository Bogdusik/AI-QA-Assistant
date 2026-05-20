import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getActor } from "@/lib/auth/actor";
import { improveGeneratedItem } from "@/lib/ai/service";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const actor = await getActor();

    const rateLimitKey = getRateLimitKey(req, actor.kind === "user" ? actor.userId : undefined);
    const { allowed, retryAfterMs } = checkRateLimit(rateLimitKey);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a minute." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const item = await prisma.generatedItem.findUnique({
      where: { id },
      include: { document: true }
    });
    if (!item) return NextResponse.json({ error: "Not found." }, { status: 404 });
    if ((item.document as { isDemo?: boolean }).isDemo)
      return NextResponse.json({ error: "Demo Project is read-only." }, { status: 403 });
    if (actor.kind === "user" && item.document.userId !== actor.userId)
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    if (actor.kind === "guest" && item.document.guestSessionId !== actor.guestSessionId)
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });

    const improved = await improveGeneratedItem({
      itemType: item.itemType,
      contentJson: item.contentJson as unknown as Record<string, unknown>
    });

    return NextResponse.json({
      improvedContentJson: improved,
      improvedTitle:
        typeof (improved as { title?: unknown }).title === "string"
          ? (improved as { title?: unknown }).title
          : item.title
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI improvement failed.";
    const isAiError = message.startsWith("Could not improve") || message.includes("AI");
    return NextResponse.json({ error: message }, { status: isAiError ? 502 : 500 });
  }
}
