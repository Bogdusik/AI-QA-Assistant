import {
  PrismaClient,
  DocumentType,
  SourceType,
  ItemType,
  ReviewStatus,
  Prisma
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@aiqa.local" },
    update: {},
    create: {
      email: "demo@aiqa.local",
      name: "Demo QA User",
      role: "USER"
    }
  });

  // Create a minimal demo project (read-only) for recruiters/interviewers.
  const demoProjectId = "demo_project_1";

  async function upsertDemoDocument(type: DocumentType, title: string) {
    const existing = await prisma.document.findFirst({ where: { demoProjectId, type } });
    if (existing) return existing;
    return prisma.document.create({
      data: {
        type,
        title,
        isDemo: true,
        demoProjectId,
        status: "ACTIVE",
        sourceType: SourceType.TEXT,
        sourceText: "Demo Project input data for AI QA Assistant.",
        domainType: "WEB",
        detailLevel: "NORMAL"
      }
    });
  }

  const demoTestCases = await upsertDemoDocument(DocumentType.TEST_CASE_SET, "Demo Project - Test Cases");
  const demoChecklist = await upsertDemoDocument(DocumentType.CHECKLIST, "Demo Project - Checklist");
  const demoBug = await upsertDemoDocument(DocumentType.BUG_REPORT, "Demo Project - Bug Report");
  const demoApi = await upsertDemoDocument(DocumentType.API_TEST_SET, "Demo Project - API Test Ideas");

  async function upsertItemsForDoc(
    documentId: string,
    items: Array<{ itemType: ItemType; title: string; contentJson: Prisma.InputJsonValue; reviewStatus?: ReviewStatus }>
  ) {
    await prisma.generatedItem.deleteMany({ where: { documentId } });
    await prisma.generatedItem.createMany({
      data: items.map((i, idx) => ({
        documentId,
        itemType: i.itemType,
        title: i.title,
        contentJson: i.contentJson,
        contentMarkdown: null,
        reviewStatus: i.reviewStatus ?? "ACCEPTED",
        sortOrder: idx
      }))
    });
  }

  // Test cases (accepted)
  await upsertItemsForDoc(demoTestCases.id, [
    {
      itemType: ItemType.TEST_CASE,
      title: "User Registration succeeds with valid data",
      contentJson: {
        title: "User Registration succeeds with valid data",
        priority: "High",
        type: "positive",
        preconditions: "User is on registration page",
        testData: "email: user@example.com, password: Password123, confirmPassword: Password123",
        steps: ["Open registration page", "Enter unique email", "Enter strong password", "Confirm password", "Click Register"],
        expectedResult: "Success message displayed and user redirected to dashboard",
        assumptions: "Email format validation is enabled and email is not already registered",
        sourceEvidence: "Demo Project input data",
        riskNote: "No expiration policy specified for tokens"
      }
    },
    {
      itemType: ItemType.TEST_CASE,
      title: "Registration fails with existing email",
      contentJson: {
        title: "Registration fails with existing email",
        priority: "High",
        type: "negative",
        preconditions: "Email already exists",
        testData: "email: existing@example.com, password: Password123, confirmPassword: Password123",
        steps: ["Open registration page", "Enter existing email", "Enter password", "Confirm password", "Click Register"],
        expectedResult: "Clear error shown and user remains on registration page",
        assumptions: "Uniqueness constraint is enforced server-side",
        sourceEvidence: "Demo Project input data",
        riskNote: "Error message may leak whether email exists"
      }
    }
  ]);

  // Checklist
  await upsertItemsForDoc(demoChecklist.id, [
    {
      itemType: ItemType.CHECKLIST_ITEM,
      title: "Happy path: registration form validation",
      contentJson: {
        title: "Happy path: registration form validation",
        category: "Core validation",
        type: "basic",
        description: "Valid email and strong password should allow account creation and show success state.",
        assumptions: "Frontend + backend validation are aligned",
        sourceEvidence: "Demo Project input data"
      }
    },
    {
      itemType: ItemType.CHECKLIST_ITEM,
      title: "Negative: existing email handling",
      contentJson: {
        title: "Negative: existing email handling",
        category: "Negative scenarios",
        type: "negative",
        description: "Existing email should produce a clear error without exposing sensitive information unnecessarily.",
        assumptions: "Uniqueness constraint is enforced",
        sourceEvidence: "Demo Project input data"
      }
    }
  ]);

  // Bug report draft
  await upsertItemsForDoc(demoBug.id, [
    {
      itemType: ItemType.BUG_REPORT,
      title: "Bug draft: registration accepts invalid email format",
      contentJson: {
        title: "Bug draft: registration accepts invalid email format",
        environment: "Web app (demo)",
        preconditions: "User is on registration page",
        stepsToReproduce: ["Enter invalid email format", "Enter any password", "Confirm password", "Click Register"],
        actualResult: "UI allows submission or returns unclear error message.",
        expectedResult: "User gets clear validation error and submission is blocked.",
        severity: "Medium",
        priority: "Medium",
        notes: "Ensure error message is user-friendly and consistent between client and server.",
        assumptions: "Both frontend and backend validation exist"
      }
    }
  ]);

  // API test ideas
  await upsertItemsForDoc(demoApi.id, [
    {
      itemType: ItemType.API_TEST_IDEA,
      title: "Positive: create account with valid payload",
      contentJson: {
        title: "Positive: create account with valid payload",
        category: "positive",
        purpose: "Verify account creation flow works end-to-end.",
        requestNotes: "POST /api/register with valid JSON payload.",
        expectedOutcome: "201/200 response and user record created.",
        suggestedStatusCode: "201",
        assumptions: "Endpoint exists and returns created resource or success response.",
        sourceEvidence: "Demo Project input data"
      }
    },
    {
      itemType: ItemType.API_TEST_IDEA,
      title: "Negative: reject duplicate email with clear error",
      contentJson: {
        title: "Negative: reject duplicate email with clear error",
        category: "negative",
        purpose: "Verify uniqueness constraint and error clarity.",
        requestNotes: "POST /api/register with duplicate email.",
        expectedOutcome: "4xx response with non-sensitive error message.",
        suggestedStatusCode: "409",
        assumptions: "DB has unique constraint on email.",
        sourceEvidence: "Demo Project input data"
      }
    }
  ]);

  async function upsertQualityAnalysisForDoc(documentId: string, type: DocumentType) {
    const existing = await prisma.qualityAnalysis.findUnique({ where: { documentId } });
    if (existing) return;

    const payload =
      type === DocumentType.TEST_CASE_SET
        ? {
            overallScore: 86,
            strengths: ["Includes positive and negative registration scenarios", "Clear preconditions and expected outcomes"],
            weaknesses: ["Some edge validation scenarios may be missing (e.g., whitespace in email)", "Assumptions are not fully detailed"],
            suggestions: ["Add edge cases for email casing/whitespace", "Add rate-limiting and lockout scenarios if applicable"],
            explainability: {
              whyScoreGiven: ["Covers key flows: success and major failure modes.", "Steps and expected results are readable and actionable."],
              whatIsMissing: ["Edge validation coverage (whitespace, casing)", "Security-related negative checks (error leakage, rate limits)."]
            }
          }
        : type === DocumentType.CHECKLIST
          ? {
              overallScore: 80,
              strengths: ["Grouped items for validation and negative flows", "Actionable checklist statements"],
              weaknesses: ["May lack deeper negative/edge validations (password rules variants)"],
              suggestions: ["Add validation items for password complexity boundaries", "Add edge-case inputs to checklist"],
              explainability: {
                whyScoreGiven: ["Checklist contains required high-level validation coverage."],
                whatIsMissing: ["More validation detail per rule and additional edge inputs."]
              }
            }
          : type === DocumentType.BUG_REPORT
            ? {
                overallScore: 78,
                strengths: ["Bug draft has clear reproduction steps and expected/actual separation"],
                weaknesses: ["Severity/priority suggestions are generic"],
                suggestions: ["Add specific UI element/field references", "Add additional data validation checks"],
                explainability: {
                  whyScoreGiven: ["StepsToReproduce and results are clear."],
                  whatIsMissing: ["Exact field-level validation and consistent environment details."]
                }
              }
            : {
                overallScore: 82,
                strengths: ["Includes positive and negative API test ideas", "Has response code suggestions"],
                weaknesses: ["May lack auth/security and boundary validation tests"],
                suggestions: ["Add validation tests for missing/invalid fields", "Add auth and permission tests if endpoints require access"],
                explainability: {
                  whyScoreGiven: ["Covers core success and uniqueness failure paths."],
                  whatIsMissing: ["More edge cases and security validations (auth/CSRF/rate limiting)."]
                }
              };

    await prisma.qualityAnalysis.create({
      data: {
        documentId,
        overallScore: payload.overallScore,
        strengths: payload.strengths,
        weaknesses: payload.weaknesses,
        suggestions: payload.suggestions,
        explainability: payload.explainability as Prisma.InputJsonValue,
        analysisJson: payload as unknown as Prisma.InputJsonValue
      }
    });
  }

  await upsertQualityAnalysisForDoc(demoTestCases.id, DocumentType.TEST_CASE_SET);
  await upsertQualityAnalysisForDoc(demoChecklist.id, DocumentType.CHECKLIST);
  await upsertQualityAnalysisForDoc(demoBug.id, DocumentType.BUG_REPORT);
  await upsertQualityAnalysisForDoc(demoApi.id, DocumentType.API_TEST_SET);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
