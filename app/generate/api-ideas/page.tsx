import { GeneratorForm } from "@/features/generators/generator-form";

export default function ApiIdeasPage() {
  return (
    <GeneratorForm
      kind="API_TEST_SET"
      titleLabel="API Test Ideas"
      sourceLabel="Endpoint details and expected behavior"
      payloadHint='{"method":"POST","authType":"Bearer token","headers":{"Content-Type":"application/json"},"requestPayload":{"email":"a@b.com"}}'
    />
  );
}
