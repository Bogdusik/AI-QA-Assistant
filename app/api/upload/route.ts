import { NextResponse } from "next/server";
import { storeFile, tryExtractPdfText, validateMime } from "@/lib/files/upload";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const mode = form.get("mode");
    if (!(file instanceof File))
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    if (mode !== "image" && mode !== "pdf") {
      return NextResponse.json({ error: "Invalid upload mode." }, { status: 400 });
    }
    validateMime(file, mode);
    const stored = await storeFile(file, mode);
    const extractedText = mode === "pdf" ? await tryExtractPdfText(stored.bytes) : "";
    return NextResponse.json({
      filePath: stored.filePath,
      originalName: stored.originalName,
      mimeType: stored.mimeType,
      extractedText
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 }
    );
  }
}
