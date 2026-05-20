import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── All mocks BEFORE importing the route ─────────────────────────────────────

vi.mock("@/lib/auth/actor", () => ({
  getActor: vi.fn().mockResolvedValue({ kind: "user", userId: "user-1" })
}));

vi.mock("@/lib/usage/guest", () => ({
  enforceGuestAccess: vi.fn().mockResolvedValue(undefined)
}));

const mockGenerateChecklist = vi.hoisted(() => vi.fn());
vi.mock("@/lib/ai/service", () => ({
  generateTestCases: vi.fn(),
  generateChecklist: mockGenerateChecklist,
  formatBugReport: vi.fn(),
  generateApiIdeas: vi.fn()
}));

const mockTransaction = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db/prisma", () => ({
  prisma: { $transaction: mockTransaction }
}));

// Rate limiter always allows in tests
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 9, retryAfterMs: 0 }),
  getRateLimitKey: vi.fn().mockReturnValue("user:user-1")
}));

// next-auth server session (pulled in by getActor's auth-options dependency chain)
vi.mock("next-auth", () => ({ getServerSession: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/auth/auth-options", () => ({ authOptions: {} }));

import { POST } from "@/app/api/generate/route";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const validChecklistItem = {
  title: "Validate required fields",
  category: "Validation",
  type: "validation",
  description: "Ensure required fields return 400",
  assumptions: "REST API",
  sourceEvidence: "spec",
  sourceEvidence2: undefined,
  riskNote: undefined
};

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

const validBody = {
  type: "CHECKLIST",
  title: "Login flow checklist",
  sourceText: "The user should be able to log in with email and password.",
  domainType: "WEB",
  detailLevel: "NORMAL"
};

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateChecklist.mockResolvedValue([validChecklistItem]);
    // Default successful transaction
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const mockTx = {
        document: {
          create: vi.fn().mockResolvedValue({ id: "doc-123" })
        },
        generatedItem: {
          createMany: vi.fn().mockResolvedValue({ count: 1 })
        },
        requirementLink: {
          create: vi.fn().mockResolvedValue({ id: "req-1" })
        }
      };
      return fn(mockTx);
    });
  });

  it("returns 400 for invalid Zod schema (missing title)", async () => {
    const req = makeRequest({ type: "CHECKLIST" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  it("returns 400 for title shorter than 3 chars", async () => {
    const req = makeRequest({ ...validBody, title: "AB" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for title longer than 200 chars", async () => {
    const req = makeRequest({ ...validBody, title: "A".repeat(201) });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 with documentId on success", async () => {
    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.documentId).toBe("doc-123");
  });

  it("calls generateChecklist when type is CHECKLIST", async () => {
    const req = makeRequest(validBody);
    await POST(req);
    expect(mockGenerateChecklist).toHaveBeenCalledOnce();
    expect(mockGenerateChecklist).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Login flow checklist" })
    );
  });

  it("wraps all DB writes in a single $transaction call", async () => {
    const req = makeRequest(validBody);
    await POST(req);
    expect(mockTransaction).toHaveBeenCalledOnce();
  });

  it("creates document, items, and requirementLink inside the transaction", async () => {
    let capturedTx: {
      document: { create: ReturnType<typeof vi.fn> };
      generatedItem: { createMany: ReturnType<typeof vi.fn> };
      requirementLink: { create: ReturnType<typeof vi.fn> };
    } | null = null;

    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const mockTx = {
        document: { create: vi.fn().mockResolvedValue({ id: "doc-456" }) },
        generatedItem: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
        requirementLink: { create: vi.fn().mockResolvedValue({ id: "req-1" }) }
      };
      capturedTx = mockTx;
      return fn(mockTx);
    });

    const req = makeRequest(validBody);
    await POST(req);

    expect(capturedTx!.document.create).toHaveBeenCalledOnce();
    expect(capturedTx!.generatedItem.createMany).toHaveBeenCalledOnce();
    expect(capturedTx!.requirementLink.create).toHaveBeenCalledOnce();
  });

  it("rolls back on createMany failure — returns 500 not a partial document", async () => {
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const mockTx = {
        document: { create: vi.fn().mockResolvedValue({ id: "doc-789" }) },
        generatedItem: {
          createMany: vi.fn().mockRejectedValue(new Error("DB constraint violation"))
        },
        requirementLink: { create: vi.fn() }
      };
      return fn(mockTx);
    });

    const req = makeRequest(validBody);
    const res = await POST(req);
    // The transaction throws, route catches it and returns 500
    expect(res.status).toBe(500);
    // requirementLink.create was never called (transaction aborted)
  });

  it("returns 502 when AI service throws", async () => {
    mockGenerateChecklist.mockRejectedValueOnce(
      new Error("Could not generate checklist. AI returned invalid format after retries.")
    );
    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(502);
    const data = await res.json();
    expect(data.error).toContain("Could not generate checklist");
  });

  it("returns 429 when rate limit is exceeded", async () => {
    const { checkRateLimit } = await import("@/lib/rate-limit");
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      retryAfterMs: 30_000
    });

    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
  });
});
