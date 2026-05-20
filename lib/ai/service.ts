import OpenAI from "openai";
import {
  apiTestIdeaSchema,
  bugReportSchema,
  checklistSchema,
  qualityAnalysisSchema,
  testCaseSchema
} from "@/lib/ai/schemas";
import { ZodError, type ZodTypeAny } from "zod";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type GeneratorKind = "test-cases" | "checklist" | "bug-report" | "api-ideas" | "quality-analysis";

const BASE_RULES = [
  "You are a senior QA engineer.",
  "Use strictly professional QA language.",
  "Do not invent undocumented behavior.",
  "If requirement is incomplete, set assumptions explicitly.",
  "Return valid JSON only.",
  "All required fields must be present and non-empty."
].join("\n");

const KIND_SCHEMA: Record<GeneratorKind, string> = {
  "test-cases":
    "Return an object with shape: { items: [ { title, priority, type, preconditions, testData, steps, expectedResult, assumptions, sourceEvidence, riskNote } ] }.",
  checklist:
    "Return an object with shape: { items: [ { title, category, type, description, assumptions, sourceEvidence } ] }.",
  "bug-report":
    "Return an object with shape: { item: { title, environment, preconditions, stepsToReproduce, actualResult, expectedResult, severity, priority, notes, assumptions } }.",
  "api-ideas":
    "Return an object with shape: { items: [ { title, category, purpose, requestNotes, expectedOutcome, suggestedStatusCode, assumptions, sourceEvidence } ] }.",
  "quality-analysis":
    "Return an object with shape matching QualityAnalysis: { overallScore, strengths, weaknesses, suggestions, explainability: { whyScoreGiven, whatIsMissing }, plus one optional section for the artifact type }."
};

function buildSystemPrompt(kind: GeneratorKind): string {
  return `${BASE_RULES}\n${KIND_SCHEMA[kind]}`;
}

const MAX_TOKENS: Record<GeneratorKind, number> = {
  "test-cases": 2000,
  checklist: 1500,
  "bug-report": 900,
  "api-ideas": 1700,
  "quality-analysis": 1400
};

async function callModel(
  kind: GeneratorKind,
  input: Record<string, unknown>,
  feedback?: string
): Promise<Record<string, unknown>> {
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS ?? "60000");
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  const feedbackBlock = feedback ? `\nIMPORTANT VALIDATION FEEDBACK:\n${feedback}` : "";

  try {
    const response = await client.chat.completions.create(
      {
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: MAX_TOKENS[kind],
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildSystemPrompt(kind) },
          {
            role: "user",
            content: `Input JSON:\n${JSON.stringify(input, null, 2)}${feedbackBlock}`
          }
        ]
      },
      { signal: controller.signal }
    );
    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error("AI did not return content.");
    return JSON.parse(raw) as Record<string, unknown>;
  } finally {
    clearTimeout(t);
  }
}

function buildFeedback(err: unknown): string {
  if (err instanceof ZodError) {
    return `Schema mismatch: ${err.issues
      .slice(0, 6)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ")}. Return every required field.`;
  }
  return `Schema mismatch: ${err instanceof Error ? err.message : "Unknown error"}. Return every required field.`;
}

async function withRetry<T>(
  fetcher: (feedback?: string) => Promise<Record<string, unknown>>,
  validate: (raw: Record<string, unknown>) => T,
  attempts = 2
): Promise<T> {
  let feedback: string | undefined;
  for (let i = 0; i < attempts; i++) {
    const json = await fetcher(feedback);
    try {
      return validate(json);
    } catch (err) {
      feedback = buildFeedback(err);
    }
  }
  throw new Error("AI returned invalid format after retries.");
}

async function withRetryItems<T>(
  kind: GeneratorKind,
  input: Record<string, unknown>,
  schema: ZodTypeAny,
  attempts = 2
): Promise<T[]> {
  let feedback: string | undefined;
  for (let i = 0; i < attempts; i++) {
    const json = await callModel(kind, input, feedback);
    const items = Array.isArray(json.items) ? json.items : [];
    if (!items.length) throw new Error("AI returned empty items array.");
    try {
      return items.map((item) => schema.parse(item) as T);
    } catch (err) {
      feedback = buildFeedback(err);
    }
  }
  throw new Error("AI returned invalid format after retries.");
}

export async function generateTestCases(input: Record<string, unknown>) {
  try {
    let feedback: string | undefined;
    for (let attempt = 0; attempt < 2; attempt++) {
      const json = await callModel("test-cases", input, feedback);
      const items = Array.isArray(json.items) ? json.items : [];
      if (!items.length) throw new Error("AI returned empty items array.");
      try {
        return items.map((item) => {
          const normalized =
            item && typeof item === "object"
              ? ({
                  ...item,
                  riskNote:
                    (item as { riskNote?: unknown; riskNotes?: unknown }).riskNote ??
                    (item as { riskNotes?: unknown }).riskNotes
                } as Record<string, unknown>)
              : item;
          return testCaseSchema.parse(normalized);
        });
      } catch (err) {
        feedback = buildFeedback(err);
      }
    }
    throw new Error("AI returned invalid test case format after retries.");
  } catch (error) {
    throw new Error(
      `Could not generate test cases. ${error instanceof Error ? error.message : "Unknown AI error"}`
    );
  }
}

export async function generateChecklist(
  input: Record<string, unknown>
): Promise<Record<string, unknown>[]> {
  try {
    return (await withRetryItems("checklist", input, checklistSchema)) as Record<string, unknown>[];
  } catch (error) {
    throw new Error(
      `Could not generate checklist. ${error instanceof Error ? error.message : "Unknown AI error"}`
    );
  }
}

export async function formatBugReport(input: Record<string, unknown>) {
  try {
    return await withRetry(
      (feedback) => callModel("bug-report", input, feedback),
      (json) => bugReportSchema.parse(json.item ?? json)
    );
  } catch (error) {
    throw new Error(
      `Could not format bug report. ${error instanceof Error ? error.message : "Unknown AI error"}`
    );
  }
}

export async function generateApiIdeas(
  input: Record<string, unknown>
): Promise<Record<string, unknown>[]> {
  try {
    return (await withRetryItems("api-ideas", input, apiTestIdeaSchema)) as Record<
      string,
      unknown
    >[];
  } catch (error) {
    throw new Error(
      `Could not generate API test ideas. ${error instanceof Error ? error.message : "Unknown AI error"}`
    );
  }
}

export async function analyzeQaQuality(input: Record<string, unknown>) {
  try {
    return await withRetry(
      (feedback) => callModel("quality-analysis", input, feedback),
      (json) => qualityAnalysisSchema.parse(json.analysis ?? json)
    );
  } catch (error) {
    throw new Error(
      `Could not analyze quality. ${error instanceof Error ? error.message : "Unknown AI error"}`
    );
  }
}

type GeneratedItemType = "TEST_CASE" | "CHECKLIST_ITEM" | "BUG_REPORT" | "API_TEST_IDEA";

const IMPROVE_PROMPTS: Record<GeneratedItemType, string> = {
  TEST_CASE: `Improve this TEST CASE artifact for clarity and QA quality.
Return JSON matching:
{
  "title": string,
  "priority": string,
  "type": "positive" | "negative" | "edge",
  "preconditions": string,
  "testData": string,
  "steps": string[],
  "expectedResult": string,
  "assumptions": string,
  "sourceEvidence": string,
  "riskNote": string
}
Do not omit required fields. Return only the JSON object.`,

  CHECKLIST_ITEM: `Improve this CHECKLIST ITEM artifact for clarity and QA quality.
Return JSON matching:
{
  "title": string,
  "category": string,
  "type": "basic" | "validation" | "negative" | "edge",
  "description": string,
  "assumptions": string,
  "sourceEvidence": string
}
Return only the JSON object. Do not omit required fields.`,

  BUG_REPORT: `Improve this BUG REPORT artifact for clarity and QA quality.
Return JSON matching:
{
  "title": string,
  "environment": string,
  "preconditions": string,
  "stepsToReproduce": string[],
  "actualResult": string,
  "expectedResult": string,
  "severity": string,
  "priority": string,
  "notes": string,
  "assumptions": string
}
Return only the JSON object. Do not omit required fields.`,

  API_TEST_IDEA: `Improve this API TEST IDEA artifact for clarity and QA quality.
Return JSON matching:
{
  "title": string,
  "category": string,
  "purpose": string,
  "requestNotes": string,
  "expectedOutcome": string,
  "suggestedStatusCode": string,
  "assumptions": string,
  "sourceEvidence": string
}
Return only the JSON object. Do not omit required fields.`
};

const IMPROVE_SCHEMA: Record<GeneratedItemType, ZodTypeAny> = {
  TEST_CASE: testCaseSchema,
  CHECKLIST_ITEM: checklistSchema,
  BUG_REPORT: bugReportSchema,
  API_TEST_IDEA: apiTestIdeaSchema
};

function normalizeForImprove(itemType: GeneratedItemType, json: Record<string, unknown>) {
  if (itemType === "TEST_CASE") {
    return {
      ...json,
      riskNote:
        typeof json["riskNote"] === "string"
          ? json["riskNote"]
          : typeof json["riskNotes"] === "string"
            ? json["riskNotes"]
            : undefined
    };
  }
  return json;
}

export async function improveGeneratedItem(input: {
  itemType: GeneratedItemType;
  contentJson: Record<string, unknown>;
}) {
  const { itemType, contentJson } = input;
  const systemPrompt = IMPROVE_PROMPTS[itemType];
  const schema = IMPROVE_SCHEMA[itemType];
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS ?? "60000");
  let feedback: string | undefined;

  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await client.chat.completions.create(
        {
          model: "gpt-4o-mini",
          temperature: 0.2,
          max_tokens: 900,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Input JSON:\n${JSON.stringify(contentJson, null, 2)}${
                feedback ? `\n\nValidation feedback:\n${feedback}` : ""
              }`
            }
          ]
        },
        { signal: controller.signal }
      );
      const raw = response.choices[0]?.message?.content;
      if (!raw) throw new Error("AI did not return content.");
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const normalized = normalizeForImprove(itemType, parsed);
      return schema.parse(normalized) as Record<string, unknown>;
    } catch (err) {
      feedback =
        err instanceof ZodError
          ? `Schema mismatch. Return valid JSON satisfying all required fields for ${itemType}.`
          : err instanceof Error
            ? err.message
            : "Unknown AI error";
    } finally {
      clearTimeout(t);
    }
  }

  throw new Error("Could not improve this item. Please try again.");
}
