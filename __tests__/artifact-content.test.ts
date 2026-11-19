import { describe, it, expect } from "vitest";
import { describeContent } from "@/features/documents/artifact-content-model";

describe("describeContent", () => {
  const testCase = {
    title: "User Registration succeeds with valid data",
    type: "positive",
    priority: "High",
    preconditions: "Registration page is reachable",
    steps: ["Open registration page", "Enter unique email", "Click Register"],
    expectedResult: "Account is created and the user is signed in",
    testData: { email: "new.user@example.com", password: "S3cure!pass" }
  };

  it("skips the title, which the card already shows", () => {
    const { tags, sections } = describeContent(testCase);
    expect(tags.map((t) => t.label)).not.toContain("Title");
    expect(sections.map((s) => s.label)).not.toContain("Title");
  });

  it("turns short scalar fields into tags", () => {
    const { tags } = describeContent(testCase);
    expect(tags).toEqual([
      { label: "Type", value: "positive" },
      { label: "Priority", value: "High" }
    ]);
  });

  it("numbers steps and keeps text fields as paragraphs", () => {
    const { sections } = describeContent(testCase);
    expect(sections).toContainEqual({
      label: "Steps",
      kind: "ordered",
      items: ["Open registration page", "Enter unique email", "Click Register"]
    });
    expect(sections).toContainEqual({
      label: "Expected result",
      kind: "text",
      text: "Account is created and the user is signed in"
    });
  });

  it("shows nested objects as key/value pairs", () => {
    const { sections } = describeContent(testCase);
    expect(sections).toContainEqual({
      label: "Test data",
      kind: "pairs",
      pairs: [
        { label: "Email", value: "new.user@example.com" },
        { label: "Password", value: "S3cure!pass" }
      ]
    });
  });

  it("uses bullets for lists that are not steps", () => {
    const { sections } = describeContent({ items: ["Check the logo", "Check the footer"] });
    expect(sections).toEqual([
      { label: "Items", kind: "bullets", items: ["Check the logo", "Check the footer"] }
    ]);
  });

  it("handles a non-object value without throwing", () => {
    expect(describeContent("plain text")).toEqual({
      tags: [],
      sections: [{ label: "Content", kind: "text", text: "plain text" }]
    });
    expect(describeContent(null)).toEqual({ tags: [], sections: [] });
  });
});
