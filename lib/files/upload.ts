import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";

const MAX_MB = 5;

const SAFE_EXTENSIONS: Record<"image" | "pdf", string[]> = {
  image: [".png", ".jpg", ".jpeg", ".webp"],
  pdf: [".pdf"]
};

function validateMagicBytes(bytes: Buffer, mode: "image" | "pdf") {
  if (mode === "pdf") {
    if (bytes.slice(0, 4).toString("ascii") !== "%PDF") throw new Error("Invalid PDF file.");
    return;
  }
  const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isJPEG = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebP =
    bytes.slice(0, 4).toString("ascii") === "RIFF" &&
    bytes.slice(8, 12).toString("ascii") === "WEBP";
  if (!isPNG && !isJPEG && !isWebP) throw new Error("Invalid image file.");
}

export async function storeFile(file: File, mode: "image" | "pdf") {
  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  await fs.mkdir(uploadDir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.byteLength > MAX_MB * 1024 * 1024) throw new Error("File exceeds 5MB limit.");
  validateMagicBytes(bytes, mode);
  const rawExt = path.extname(file.name).toLowerCase();
  const safeExt = SAFE_EXTENSIONS[mode].includes(rawExt) ? rawExt : "";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`;
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, bytes);
  return { filePath, mimeType: file.type, originalName: file.name, bytes };
}

export function validateMime(file: File, mode: "image" | "pdf") {
  const rawExt = path.extname(file.name).toLowerCase();
  if (!SAFE_EXTENSIONS[mode].includes(rawExt)) throw new Error(`Invalid ${mode} file type.`);
}

export async function tryExtractPdfText(bytes: Buffer) {
  try {
    const parsed = await pdfParse(bytes);
    return parsed.text?.slice(0, 6000) || "";
  } catch {
    return "";
  }
}
