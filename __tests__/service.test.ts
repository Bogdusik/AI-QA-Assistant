import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// ─── Mock openai before any import of service ──────────────────────────────────
// vi.hoisted ensures the variable is available inside the hoisted vi.mock factory.
const mockCreate = vi.hoisted(() => vi.fn());
vi.mock("openai", () => ({
  default: vi.fn(() => ({
    chat: { completions: { create: mockCreate } }
  }))
}));

import { generateChecklist, formatBugReport, generateApiIdeas } from "@/lib/ai/service";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeOpenAIResponse(content: unknown) {
  return {
    choices: [{ message: { content: JSON.stringify(content) } }]
  };
}

const validChecklistItem = {
  title: "Check auth headers",
  category: "Security",
  type: "validation",
  description: "Ensure Authorization header is required",
  assumptions: "Bearer token scheme used",
  sourceEvidence: "API spec section 2"
};

const validBugReport = {
  title: "Crash on logout",
  environment: "Chrome 120",
  preconditions: "User logged in",
  stepsToReproduce: ["Click logout"],
  actualResult: "App crashes",
  expectedResult: "Redirect to /login",
  severity: "critical",
  priority: "P0",
  notes: "",
  assumptions: "Session cookie present"
};

const validApiIdea = {
  title: "GET /users without token",
  category: "Auth",
  purpose: "Verify 401 returned",
  requestNotes: "No Authorization header",
  expectedOutcome: "401 Unauthorized",
  suggestedStatusCode: "401",
  assumptions: "Endpoint requires auth",
  sourceEvidence: "Security spec"
};

// ─── generateChecklist ─────────────────────────────────────────────────────────

describe("generateChecklist", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("returns parsed checklist items on a valid first response", async () => {
    mockCreate.mockResolvedValueOnce(
      makeOpenAIResponse({ items: [validChecklistItem, validChecklistItem] })
    );
    const result = await generateChecklist({ title: "Test" });
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe("Check auth headers");
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("retries once when the first response fails schema validation", async () => {
    // First call returns invalid item (missing required fields)
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse({ items: [{ title: "Incomplete" }] }));
    // Second call returns valid item
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse({ items: [validChecklistItem] }));

    const result = await generateChecklist({ title: "Test" });
    expect(result).toHaveLength(1);
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting retries", async () => {
    mockCreate.mockResolvedValue(makeOpenAIResponse({ items: [{ bad: "data" }] }));
    await expect(generateChecklist({ title: "Test" })).rejects.toThrow(
      /Could not generate checklist/
    );
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it("throws when AI returns empty items array", async () => {
    mockCreate.mockResolvedValue(makeOpenAIResponse({ items: [] }));
    await expect(generateChecklist({ title: "Test" })).rejects.toThrow(
      /Could not generate checklist/
    );
  });

  it("throws when AI returns no content", async () => {
    mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: null } }] });
    await expect(generateChecklist({ title: "Test" })).rejects.toThrow(
      /Could not generate checklist/
    );
  });

  it("includes validation feedback in the second call's prompt", async () => {
    mockCreate
      .mockResolvedValueOnce(makeOpenAIResponse({ items: [{ title: "bad" }] }))
      .mockResolvedValueOnce(makeOpenAIResponse({ items: [validChecklistItem] }));

    await generateChecklist({ title: "Test" });
    type CallArgs = { messages: { role: string; content: string }[] };
    const secondCallArgs = (mockCreate as Mock).mock.calls[1][0] as CallArgs;
    const userMessage = secondCallArgs.messages.find((m) => m.role === "user");
    expect(userMessage?.content).toContain("IMPORTANT VALIDATION FEEDBACK");
  });
});

// ─── formatBugReport ──────────────────────────────────────────────────────────

describe("formatBugReport", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("returns a parsed bug report from { item: ... } wrapper", async () => {
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse({ item: validBugReport }));
    const result = await formatBugReport({ title: "Test" });
    expect(result.title).toBe("Crash on logout");
  });

  it("returns a parsed bug report from flat response", async () => {
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse(validBugReport));
    const result = await formatBugReport({ title: "Test" });
    expect(result.severity).toBe("critical");
  });

  it("throws on persistent invalid responses", async () => {
    mockCreate.mockResolvedValue(makeOpenAIResponse({ bad: "shape" }));
    await expect(formatBugReport({ title: "Test" })).rejects.toThrow(/Could not format bug report/);
  });
});

// ─── generateApiIdeas ─────────────────────────────────────────────────────────

describe("generateApiIdeas", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("returns parsed API test ideas", async () => {
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse({ items: [validApiIdea, validApiIdea] }));
    const result = await generateApiIdeas({ title: "Test" });
    expect(result).toHaveLength(2);
    expect((result[0] as { suggestedStatusCode: string }).suggestedStatusCode).toBe("401");
  });

  it("uses system + user message split", async () => {
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse({ items: [validApiIdea] }));
    await generateApiIdeas({ title: "Test" });

    type CallArgs = {
      messages: { role: string; content: string }[];
      response_format: { type: string };
    };
    const callArgs = (mockCreate as Mock).mock.calls[0][0] as CallArgs;
    expect(callArgs.messages.some((m) => m.role === "system")).toBe(true);
    expect(callArgs.messages.some((m) => m.role === "user")).toBe(true);
  });

  it("passes the input JSON in the user message", async () => {
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse({ items: [validApiIdea] }));
    await generateApiIdeas({ title: "My endpoint", domainType: "API" });

    type CallArgs = {
      messages: { role: string; content: string }[];
      response_format: { type: string };
    };
    const callArgs = (mockCreate as Mock).mock.calls[0][0] as CallArgs;
    const userMsg = callArgs.messages.find((m) => m.role === "user");
    expect(userMsg?.content).toContain("My endpoint");
  });

  it("sets response_format to json_object", async () => {
    mockCreate.mockResolvedValueOnce(makeOpenAIResponse({ items: [validApiIdea] }));
    await generateApiIdeas({ title: "Test" });

    type CallArgs = {
      messages: { role: string; content: string }[];
      response_format: { type: string };
    };
    const callArgs = (mockCreate as Mock).mock.calls[0][0] as CallArgs;
    expect(callArgs.response_format).toEqual({ type: "json_object" });
  });
});

// ─── Rate limit util ───────────────────────────────────────────────────────────

describe("checkRateLimit", () => {
  it("allows requests below the limit", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 10).allowed).toBe(true);
    }
  });

  it("blocks after the limit is reached", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 10; i++) {
      checkRateLimit(key, 10);
    }
    expect(checkRateLimit(key, 10).allowed).toBe(false);
  });

  it("returns remaining count correctly", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    const key = `test-${Math.random()}`;
    checkRateLimit(key, 10);
    checkRateLimit(key, 10);
    const result = checkRateLimit(key, 10);
    expect(result.remaining).toBe(7);
  });
});
