import { GeneratorForm } from "@/features/generators/generator-form";

export default function GenerateTestCasesPage() {
  return (
    <GeneratorForm
      kind="TEST_CASE_SET"
      titleLabel="Generate Test Cases"
      sourceLabel="Requirement or feature description"
      payloadHint='{"contextNotes":"Optional notes","preloadedApi":"..."}'
    />
  );
}
