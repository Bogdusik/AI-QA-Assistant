import { GeneratorForm } from "@/features/generators/generator-form";

export default function BugReportAssistantPage() {
  return (
    <GeneratorForm
      kind="BUG_REPORT"
      titleLabel="Bug Report Assistant"
      sourceLabel="Rough bug details"
      payloadHint='{"environment":"Windows 11, Chrome 125","preconditions":"...","steps":["..."],"actualResult":"...","expectedResult":"..."}'
    />
  );
}
