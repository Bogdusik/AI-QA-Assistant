import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { toCsv, toMarkdown, toPlainText } from "@/lib/export/formatters";
import { getActor } from "@/lib/auth/actor";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const actor = await getActor();
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "md";
  const includePending = searchParams.get("includePending") === "true";
  const doc = await prisma.document.findUnique({
    where: { id },
    include: { generatedItems: { orderBy: { sortOrder: "asc" } } }
  });
  if (!doc) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!((doc as { isDemo?: boolean }).isDemo)) {
    if (actor.kind === "user" && doc.userId !== actor.userId) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    if (actor.kind === "guest" && doc.guestSessionId !== actor.guestSessionId) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const filtered = doc.generatedItems.filter((i) => i.reviewStatus === "ACCEPTED" || includePending);
  const payloadItems = filtered.map((i) => ({
    title: i.title,
    reviewStatus: i.reviewStatus,
    contentJson: i.contentJson as Record<string, unknown>
  }));
  const content =
    format === "csv"
      ? toCsv(payloadItems)
      : format === "txt"
        ? toPlainText(doc.title, payloadItems)
        : toMarkdown(doc.title, payloadItems);

  const safeFilename = doc.title
    .replace(/[^a-zA-Z0-9_\-\s]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 100) || "export";

  return new Response(content, {
    headers: {
      "Content-Type": format === "csv" ? "text/csv" : "text/plain",
      "Content-Disposition": `attachment; filename="${safeFilename}.${format}"`
    }
  });
}
