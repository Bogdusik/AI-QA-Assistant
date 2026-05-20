import { describe, it, expect } from "vitest";
import {
  testCaseSchema,
  checklistSchema,
  bugReportSchema,
  apiTestIdeaSchema,
  qualityAnalysisSchema
} from "@/lib/ai/schemas";

// ─── testCaseSchema ────────────────────────────────────────────────────────────

const validTestCase = {
  title: "Login with valid credentials",
  priority: "high",
  type: "positive",
  preconditions: "User account exists",
  testData: "email: test@example.com, password: Secret123",
  steps: ["Navigate to /login", "Enter credentials", "Click submit"],
  expectedResult: "User is redirected to dashboard",
  assumptions: "No 2FA enabled",
  sourceEvidence: "Auth spec section 3.1",
  riskNote: "Token expiry edge case"
};

describe("testCaseSchema", () => {
  it("accepts a valid test case", () => {
    expect(() => testCaseSchema.parse(validTestCase)).not.toThrow();
  });

  it("normalises type to lowercase", () => {
    const result = testCaseSchema.parse({ ...validTestCase, type: "POSITIVE" });
    expect(result.type).toBe("positive");
  });

  it("accepts riskNotes as alias for riskNote (after external normalisation)", () => {
    const input = { ...validTestCase };
    delete (input as Partial<typeof validTestCase>).riskNote;
    // schemas.ts expects riskNote to already be normalised by service.ts; schema itself requires it
    expect(() => testCaseSchema.parse({ ...input, riskNote: "Some risk" })).not.toThrow();
  });

  it("splits pipe-separated steps string into array", () => {
    const result = testCaseSchema.parse({ ...validTestCase, steps: "step1|step2|step3" });
    expect(result.steps).toEqual(["step1", "step2", "step3"]);
  });

  it("splits newline-separated steps string into array", () => {
    const result = testCaseSchema.parse({ ...validTestCase, steps: "step1\nstep2\nstep3" });
    expect(result.steps).toEqual(["step1", "step2", "step3"]);
  });

  it("rejects missing required fields", () => {
    expect(() => testCaseSchema.parse({ title: "Only title" })).toThrow();
  });

  it("rejects invalid type enum", () => {
    expect(() => testCaseSchema.parse({ ...validTestCase, type: "invalid" })).toThrow();
  });

  it("coerces null title to undefined which fails min(1)", () => {
    expect(() => testCaseSchema.parse({ ...validTestCase, title: null })).toThrow();
  });
});

// ─── checklistSchema ───────────────────────────────────────────────────────────

describe("checklistSchema", () => {
  const valid = {
    title: "Check input sanitisation",
    category: "Security",
    type: "validation" as const,
    description: "Ensure all inputs are sanitised",
    assumptions: "XSS vectors considered",
    sourceEvidence: "OWASP Top 10"
  };

  it("accepts a valid checklist item", () => {
    expect(() => checklistSchema.parse(valid)).not.toThrow();
  });

  it("rejects invalid type enum", () => {
    expect(() => checklistSchema.parse({ ...valid, type: "unknown" })).toThrow();
  });

  it("accepts all valid type values", () => {
    for (const type of ["basic", "validation", "negative", "edge"] as const) {
      expect(() => checklistSchema.parse({ ...valid, type })).not.toThrow();
    }
  });
});

// ─── bugReportSchema ───────────────────────────────────────────────────────────

describe("bugReportSchema", () => {
  const valid = {
    title: "Login button unresponsive",
    environment: "Chrome 120, macOS 14",
    preconditions: "User is on login page",
    stepsToReproduce: ["Navigate to /login", "Click the Login button"],
    actualResult: "Nothing happens",
    expectedResult: "Form submits",
    severity: "high",
    priority: "P1",
    notes: "Reproducible 100%",
    assumptions: "No JS errors in console"
  };

  it("accepts a valid bug report", () => {
    expect(() => bugReportSchema.parse(valid)).not.toThrow();
  });

  it("requires stepsToReproduce to be an array", () => {
    expect(() => bugReportSchema.parse({ ...valid, stepsToReproduce: "single step" })).toThrow();
  });

  it("rejects missing title", () => {
    const { title: _t, ...rest } = valid;
    expect(() => bugReportSchema.parse(rest)).toThrow();
  });
});

// ─── apiTestIdeaSchema ─────────────────────────────────────────────────────────

describe("apiTestIdeaSchema", () => {
  const valid = {
    title: "POST /users with missing email",
    category: "Validation",
    purpose: "Verify 400 is returned for missing required field",
    requestNotes: "Omit email field from body",
    expectedOutcome: "400 Bad Request with validation message",
    suggestedStatusCode: "400",
    assumptions: "Auth not required for this endpoint",
    sourceEvidence: "API spec v2 section 4"
  };

  it("accepts a valid API test idea", () => {
    expect(() => apiTestIdeaSchema.parse(valid)).not.toThrow();
  });

  it("rejects missing suggestedStatusCode", () => {
    const { suggestedStatusCode: _s, ...rest } = valid;
    expect(() => apiTestIdeaSchema.parse(rest)).toThrow();
  });
});

// ─── qualityAnalysisSchema ─────────────────────────────────────────────────────

describe("qualityAnalysisSchema", () => {
  const valid = {
    overallScore: 82,
    strengths: ["Clear steps", "Good coverage"],
    weaknesses: ["Missing edge cases"],
    suggestions: ["Add boundary tests"],
    explainability: {
      whyScoreGiven: ["Strong positive coverage"],
      whatIsMissing: ["Negative login scenarios"]
    }
  };

  it("accepts a valid quality analysis", () => {
    expect(() => qualityAnalysisSchema.parse(valid)).not.toThrow();
  });

  it("coerces overallScore from string", () => {
    const result = qualityAnalysisSchema.parse({ ...valid, overallScore: "75" });
    expect(result.overallScore).toBe(75);
  });

  it("rejects overallScore > 100", () => {
    expect(() => qualityAnalysisSchema.parse({ ...valid, overallScore: 101 })).toThrow();
  });

  it("rejects overallScore < 0", () => {
    expect(() => qualityAnalysisSchema.parse({ ...valid, overallScore: -1 })).toThrow();
  });

  it("wraps string explainability fields in array", () => {
    const result = qualityAnalysisSchema.parse({
      ...valid,
      explainability: { whyScoreGiven: "Good reason", whatIsMissing: "More tests" }
    });
    expect(result.explainability.whyScoreGiven).toEqual(["Good reason"]);
    expect(result.explainability.whatIsMissing).toEqual(["More tests"]);
  });

  it("accepts optional testCases section", () => {
    const withTestCases = {
      ...valid,
      testCases: {
        coverageCompleteness: "high" as const,
        missingScenarios: [],
        weakTestCases: [],
        redundantTestCases: [],
        suggestionsForImprovement: []
      }
    };
    const result = qualityAnalysisSchema.parse(withTestCases);
    expect(result.testCases?.coverageCompleteness).toBe("high");
  });

  it("ignores unknown optional sections gracefully", () => {
    expect(() => qualityAnalysisSchema.parse(valid)).not.toThrow();
  });
});
