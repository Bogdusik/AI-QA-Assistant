import { describeContent } from "./artifact-content-model";

export function ArtifactContent({ content }: { content: unknown }) {
  const { tags, sections } = describeContent(content);

  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.label}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/70"
            >
              <span className="text-white/40">{tag.label}:</span> {tag.value}
            </span>
          ))}
        </div>
      )}

      {sections.map((section) => (
        <div key={section.label} className="space-y-1">
          <p className="qa-label uppercase tracking-wide">{section.label}</p>
          {section.kind === "text" && (
            <p className="leading-relaxed text-white/80">{section.text}</p>
          )}
          {section.kind === "ordered" && (
            <ol className="list-decimal space-y-0.5 pl-5 text-white/80">
              {section.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          )}
          {section.kind === "bullets" && (
            <ul className="list-disc space-y-0.5 pl-5 text-white/80">
              {section.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
          {section.kind === "pairs" && (
            <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-0.5">
              {section.pairs.map((pair) => (
                <div key={pair.label} className="contents">
                  <dt className="text-white/40">{pair.label}</dt>
                  <dd className="break-words font-mono text-xs text-white/80">{pair.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      ))}
    </div>
  );
}
