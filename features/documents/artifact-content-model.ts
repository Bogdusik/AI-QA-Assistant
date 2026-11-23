// Turns an artifact's contentJson (test case, checklist, bug report, API idea) into a readable
// shape for read-only views. Pure, so it is tested without rendering.

export type ContentTag = { label: string; value: string };
export type ContentPair = { label: string; value: string };
export type ContentSection =
  | { label: string; kind: "text"; text: string }
  | { label: string; kind: "ordered" | "bullets"; items: string[] }
  | { label: string; kind: "pairs"; pairs: ContentPair[] };

const TAG_KEYS = new Set(["type", "priority", "severity", "method", "status", "category"]);
const ORDERED_KEYS = /step|reproduc/i;

export function humanize(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function asText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

export function describeContent(content: unknown): {
  tags: ContentTag[];
  sections: ContentSection[];
} {
  if (content === null || content === undefined) return { tags: [], sections: [] };
  if (typeof content !== "object" || Array.isArray(content)) {
    return { tags: [], sections: [{ label: "Content", kind: "text", text: asText(content) }] };
  }

  const tags: ContentTag[] = [];
  const sections: ContentSection[] = [];

  for (const [key, value] of Object.entries(content as Record<string, unknown>)) {
    if (key === "title" || value === null || value === undefined || value === "") continue;
    const label = humanize(key);

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      sections.push({
        label,
        kind: ORDERED_KEYS.test(key) ? "ordered" : "bullets",
        items: value.map(asText)
      });
    } else if (typeof value === "object") {
      const pairs = Object.entries(value as Record<string, unknown>).map(([k, v]) => ({
        label: humanize(k),
        value: asText(v)
      }));
      if (pairs.length) sections.push({ label, kind: "pairs", pairs });
    } else if (TAG_KEYS.has(key.toLowerCase()) && asText(value).length <= 24) {
      tags.push({ label, value: asText(value) });
    } else {
      sections.push({ label, kind: "text", text: asText(value) });
    }
  }

  return { tags, sections };
}
