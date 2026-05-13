import OpenAI from "openai";
import {
  apiTestIdeaSchema,
  bugReportSchema,
  checklistSchema,
  qualityAnalysisSchema,
  testCaseSchema
} from "@/lib/ai/schemas";
import { ZodError } from "zod";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type GeneratorKind = "test-cases" | "checklist" | "bug-report" | "api-ideas" | "quality-analysis";

function buildPrompt(kind: GeneratorKind, input: Record<string, unknown>, feedback?: string) {
  const baseRules = [
    "You are a senior QA engineer.",
    "Use strictly professional QA language.",
    "Do not invent undocumented behavior.",
    "If requirement is incomplete, set assumptions explicitly.",
    "Return valid JSON only.",
    "All required fields must be present and non-empty."
  ].join("\n");

  const specific =
    kind === "test-cases"
      ? "Return an object with shape: { items: [ { title, priority, type, preconditions, testData, steps, expectedResult, assumptions, sourceEvidence, riskNote } ] }."
      : kind === "checklist"
        ? "Return an object with shape: { items: [ { title, category, type, description, assumptions, sourceEvidence } ] }."
        : kind === "bug-report"
          ? "Return an object with shape: { item: { title, environment, preconditions, stepsToReproduce, actualResult, expectedResult, severity, priority, notes, assumptions } }."
          : kind === "api-ideas"
            ? "Return an object with shape: { items: [ { title, category, purpose, requestNotes, expectedOutcome, suggestedStatusCode, assumptions, sourceEvidence } ] }."
            : "Return an object with shape matching QualityAnalysis: { overallScore, strengths, weaknesses, suggestions, explainability: { whyScoreGiven, whatIsMissing }, plus one optional section for the artifact type }.";

  const feedbackBlock = feedback ? `\nIMPORTANT VALIDATION FEEDBACK:\n${feedback}` : "";

  return `${baseRules}\n${specific}${feedbackBlock}\nInput JSON:\n${JSON.stringify(input, null, 2)}`;
}

async function callModel(kind: GeneratorKind, input: Record<string, unknown>, feedback?: string) {
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS ?? "60000");
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  const maxTokensByKind: Record<GeneratorKind, number> = {
    "test-cases": 2000,
    checklist: 1500,
    "bug-report": 900,
    "api-ideas": 1700,
    "quality-analysis": 1400
  };

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: maxTokensByKind[kind],
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: buildPrompt(kind, input, feedback) }]
    }, { signal: controller.signal });
    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error("AI did not return content.");
    return JSON.parse(raw) as Record<string, unknown>;
  } finally {
    clearTimeout(t);
  }
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
                  // Common alias from LLMs
                  riskNote: (item as { riskNote?: unknown; riskNotes?: unknown }).riskNote ?? (item as { riskNotes?: unknown }).riskNotes
                } as Record<string, unknown>)
              : item;
          return testCaseSchema.parse(normalized);
        });
      } catch (err) {
        if (err instanceof ZodError) {
          feedback = `Schema mismatch: ${err.issues
            .slice(0, 6)
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ")}. Return every required field.`;
        } else {
          feedback = `Schema mismatch: ${(err as Error).message}. Return every required field.`;
        }
      }
    }
    throw new Error("AI returned invalid test case format after retries.");
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown AI error";
    throw new Error(`Could not generate test cases. ${reason}`);
  }
}

export async function generateChecklist(input: Record<string, unknown>) {
  try {
    let feedback: string | undefined;
    for (let attempt = 0; attempt < 2; attempt++) {
      const json = await callModel("checklist", input, feedback);
      const items = Array.isArray(json.items) ? json.items : [];
      if (!items.length) throw new Error("AI returned empty items array.");
      try {
        return items.map((item) => checklistSchema.parse(item));
      } catch (err) {
        if (err instanceof ZodError) {
          feedback = `Schema mismatch: ${err.issues
            .slice(0, 6)
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ")}. Return every required field.`;
        } else {
          feedback = `Schema mismatch: ${(err as Error).message}. Return every required field.`;
        }
      }
    }
    throw new Error("AI returned invalid checklist format after retries.");
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown AI error";
    throw new Error(`Could not generate checklist. ${reason}`);
  }
}

export async function formatBugReport(input: Record<string, unknown>) {
  try {
    let feedback: string | undefined;
    for (let attempt = 0; attempt < 2; attempt++) {
      const json = await callModel("bug-report", input, feedback);
      const candidate = json.item ?? json;
      try {
        return bugReportSchema.parse(candidate);
      } catch (err) {
        if (err instanceof ZodError) {
          feedback = `Schema mismatch: ${err.issues
            .slice(0, 6)
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ")}. Return every required field.`;
        } else {
          feedback = `Schema mismatch: ${(err as Error).message}. Return every required field.`;
        }
      }
    }
    throw new Error("AI returned invalid bug report format after retries.");
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown AI error";
    throw new Error(`Could not format bug report. ${reason}`);
  }
}

export async function generateApiIdeas(input: Record<string, unknown>) {
  try {
    let feedback: string | undefined;
    for (let attempt = 0; attempt < 2; attempt++) {
      const json = await callModel("api-ideas", input, feedback);
      const items = Array.isArray(json.items) ? json.items : [];
      if (!items.length) throw new Error("AI returned empty items array.");
      try {
        return items.map((item) => apiTestIdeaSchema.parse(item));
      } catch (err) {
        if (err instanceof ZodError) {
          feedback = `Schema mismatch: ${err.issues
            .slice(0, 6)
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ")}. Return every required field.`;
        } else {
          feedback = `Schema mismatch: ${(err as Error).message}. Return every required field.`;
        }
      }
    }
    throw new Error("AI returned invalid API ideas format after retries.");
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown AI error";
    throw new Error(`Could not generate API test ideas. ${reason}`);
  }
}

export async function analyzeQaQuality(input: Record<string, unknown>) {
  try {
    const json = await callModel("quality-analysis", input);
    return qualityAnalysisSchema.parse(json.analysis ?? json);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown AI error";
    throw new Error(`Could not analyze quality. ${reason}`);
  }
}

type GeneratedItemType = "TEST_CASE" | "CHECKLIST_ITEM" | "BUG_REPORT" | "API_TEST_IDEA";

function improvementPromptForType(itemType: GeneratedItemType) {
  if (itemType === "TEST_CASE") {
    return `Improve this TEST CASE artifact for clarity and QA quality.
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
Do not omit required fields. Return only the JSON object.`;
  }
  if (itemType === "CHECKLIST_ITEM") {
    return `Improve this CHECKLIST ITEM artifact for clarity and QA quality.
Return JSON matching:
{
  "title": string,
  "category": string,
  "type": "basic" | "validation" | "negative" | "edge",
  "description": string,
  "assumptions": string,
  "sourceEvidence": string
}
Return only the JSON object. Do not omit required fields.`;
  }
  if (itemType === "BUG_REPORT") {
    return `Improve this BUG REPORT artifact for clarity and QA quality.
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
Return only the JSON object. Do not omit required fields.`;
  }
  return `Improve this API TEST IDEA artifact for clarity and QA quality.
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
Return only the JSON object. Do not omit required fields.`;
}

function schemaForType(itemType: GeneratedItemType) {
  if (itemType === "TEST_CASE") return testCaseSchema;
  if (itemType === "CHECKLIST_ITEM") return checklistSchema;
  if (itemType === "BUG_REPORT") return bugReportSchema;
  return apiTestIdeaSchema;
}

function normalizeBeforeParse(itemType: GeneratedItemType, json: Record<string, unknown>) {
  if (itemType === "TEST_CASE") {
    const maybeRiskNote =
      typeof json["riskNote"] === "string"
        ? json["riskNote"]
        : typeof json["riskNotes"] === "string"
          ? json["riskNotes"]
          : undefined;
    return { ...json, riskNote: maybeRiskNote };
  }
  return json;
}

export async function improveGeneratedItem(input: {
  itemType: GeneratedItemType;
  contentJson: Record<string, unknown>;
}) {
  const { itemType, contentJson } = input;
  const prompt = improvementPromptForType(itemType);
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS ?? "60000");
  const maxTokens = 900;
  let feedback: string | undefined;

  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await client.chat.completions.create(
        {
          model: "gpt-4o-mini",
          temperature: 0.2,
          max_tokens: maxTokens,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "user",
              content: `${prompt}\n\nInput JSON:\n${JSON.stringify(contentJson, null, 2)}${feedback ? `\n\nValidation feedback:\n${feedback}` : ""}`
            }
          ]
        },
        { signal: controller.signal }
      );

      const raw = response.choices[0]?.message?.content;
      if (!raw) throw new Error("AI did not return content.");
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const normalized = normalizeBeforeParse(itemType, parsed);
      const schema = schemaForType(itemType);
      return schema.parse(normalized) as Record<string, unknown>;
    } catch (err) {
      if (err instanceof ZodError) {
        feedback = `Schema mismatch. Return valid JSON that satisfies all required fields for ${itemType}.`;
      } else {
        feedback = err instanceof Error ? err.message : "Unknown AI error";
      }
    } finally {
      clearTimeout(t);
    }
  }

  throw new Error("Could not improve this item. Please try again.");
}
