import { z } from "zod";

export const testCaseSchema = z.object({
  title: z.preprocess((v) => (v == null ? undefined : v), z.string().min(1)),
  priority: z.preprocess((v) => (v == null ? undefined : String(v)), z.string().min(1)),
  type: z.preprocess(
    (v) => {
      if (v == null) return undefined;
      const s = String(v).toLowerCase().trim();
      return s;
    },
    z.enum(["positive", "negative", "edge"])
  ),
  preconditions: z.preprocess((v) => (v == null ? undefined : String(v)), z.string().min(1)),
  testData: z.preprocess((v) => {
    if (v == null) return undefined;
    if (typeof v === "string") return v;
    return JSON.stringify(v);
  }, z.string().min(1)),
  steps: z.preprocess((v) => {
    if (v == null) return undefined;
    if (Array.isArray(v)) return v.map((x) => String(x));
    if (typeof v === "string") {
      return v
        .split(/\r?\n|[|]+/g)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [String(v)];
  }, z.array(z.string()).min(1)),
  expectedResult: z.preprocess((v) => (v == null ? undefined : String(v)), z.string().min(1)),
  assumptions: z.preprocess((v) => (v == null ? undefined : String(v)), z.string().min(1)),
  sourceEvidence: z.preprocess((v) => (v == null ? undefined : String(v)), z.string().min(1)),
  riskNote: z.preprocess((v) => (v == null ? undefined : String(v)), z.string().min(1))
});

export const checklistSchema = z.object({
  title: z.string(),
  category: z.string(),
  type: z.enum(["basic", "validation", "negative", "edge"]),
  description: z.string(),
  assumptions: z.string(),
  sourceEvidence: z.string()
});

export const bugReportSchema = z.object({
  title: z.string(),
  environment: z.string(),
  preconditions: z.string(),
  stepsToReproduce: z.array(z.string()),
  actualResult: z.string(),
  expectedResult: z.string(),
  severity: z.string(),
  priority: z.string(),
  notes: z.string(),
  assumptions: z.string()
});

export const apiTestIdeaSchema = z.object({
  title: z.string(),
  category: z.string(),
  purpose: z.string(),
  requestNotes: z.string(),
  expectedOutcome: z.string(),
  suggestedStatusCode: z.string(),
  assumptions: z.string(),
  sourceEvidence: z.string()
});

export const qualityAnalysisSchema = z.object({
  overallScore: z.preprocess((v) => {
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const n = Number(v.trim());
      return Number.isFinite(n) ? n : v;
    }
    return v;
  }, z.number().min(0).max(100)),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  explainability: z.object({
    whyScoreGiven: z
      .union([z.array(z.string()), z.string()])
      .transform((v) => (Array.isArray(v) ? v : [v])),
    whatIsMissing: z
      .union([z.array(z.string()), z.string()])
      .transform((v) => (Array.isArray(v) ? v : [v]))
  }),
  testCases: z
    .object({
      coverageCompleteness: z.enum(["low", "medium", "high"]),
      missingScenarios: z.array(z.string()),
      weakTestCases: z.array(z.string()),
      redundantTestCases: z.array(z.string()),
      suggestionsForImprovement: z.array(z.string())
    })
    .optional(),
  checklist: z
    .object({
      missingAreas: z.array(z.string()),
      insufficientValidation: z.array(z.string()),
      missingEdgeCases: z.array(z.string())
    })
    .optional(),
  bugReport: z
    .object({
      clarityIssues: z.array(z.string()),
      missingStepsOrData: z.array(z.string()),
      incorrectSeverityPrioritySuggestions: z.array(z.string())
    })
    .optional(),
  apiTests: z
    .object({
      missingValidation: z.array(z.string()),
      missingEdgeCases: z.array(z.string()),
      missingNegativeScenarios: z.array(z.string()),
      missingAuthSecurityChecks: z.array(z.string())
    })
    .optional()
});
