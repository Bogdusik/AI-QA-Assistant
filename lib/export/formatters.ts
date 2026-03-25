type ExportableItem = {
  title: string;
  reviewStatus: "PENDING" | "ACCEPTED" | "REJECTED";
  contentJson: Record<string, unknown>;
};

export function toMarkdown(documentTitle: string, items: ExportableItem[]) {
  const lines = [`# ${documentTitle}`, ""];
  items.forEach((item, idx) => {
    lines.push(`## ${idx + 1}. ${item.title} (${item.reviewStatus})`);
    Object.entries(item.contentJson).forEach(([key, value]) => {
      lines.push(`- **${key}**: ${Array.isArray(value) ? value.join(" | ") : String(value)}`);
    });
    lines.push("");
  });
  return lines.join("\n");
}

export function toPlainText(documentTitle: string, items: ExportableItem[]) {
  const lines = [`${documentTitle}`, "=".repeat(documentTitle.length), ""];
  items.forEach((item, idx) => {
    lines.push(`${idx + 1}. ${item.title} [${item.reviewStatus}]`);
    Object.entries(item.contentJson).forEach(([key, value]) => {
      lines.push(`  - ${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`);
    });
    lines.push("");
  });
  return lines.join("\n");
}

export function toCsv(items: ExportableItem[]) {
  const rows: string[] = ["title,reviewStatus,key,value"];
  items.forEach((item) => {
    Object.entries(item.contentJson).forEach(([key, value]) => {
      const normalized = Array.isArray(value) ? value.join(" | ") : String(value);
      rows.push(
        `"${item.title.replaceAll('"', '""')}","${item.reviewStatus}","${key.replaceAll('"', '""')}","${normalized.replaceAll('"', '""')}"`
      );
    });
  });
  return rows.join("\n");
}
