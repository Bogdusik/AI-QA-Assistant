import { GeneratorForm } from "@/features/generators/generator-form";

export default function GenerateChecklistPage() {
  return (
    <GeneratorForm
      kind="CHECKLIST"
      titleLabel="Generate Checklist"
      sourceLabel="Feature description"
      payloadHint='{"releaseScope":"Optional scope notes"}'
    />
  );
}
