import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";

const MAX_MB = 5;
const allowed = {
  image: ["image/png", "image/jpeg", "image/webp"],
  pdf: ["application/pdf"]
};

export async function storeFile(file: File) {
  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  await fs.mkdir(uploadDir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.byteLength > MAX_MB * 1024 * 1024) throw new Error("File exceeds 5MB limit.");
  const ext = path.extname(file.name) || "";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, bytes);
  return { filePath, mimeType: file.type, originalName: file.name, bytes };
}

export function validateMime(file: File, mode: "image" | "pdf") {
  if (!allowed[mode].includes(file.type)) throw new Error(`Invalid ${mode} file type.`);
}

export async function tryExtractPdfText(bytes: Buffer) {
  try {
    const parsed = await pdfParse(bytes);
    return parsed.text?.slice(0, 6000) || "";
  } catch {
    return "";
  }
}
