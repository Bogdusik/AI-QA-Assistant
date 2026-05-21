import { Card } from "@/components/ui/card";

function SqlBlock({ sql }: { sql: string }) {
  return (
    <pre className="max-w-full overflow-auto rounded-lg border border-white/10 bg-slate-900/80 p-4 text-xs text-slate-300">
      {sql}
    </pre>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

export default function SqlPracticePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">SQL Practice Pack</h1>
        <p className="text-slate-400">
          Beginner-friendly SQL examples using the real PostgreSQL tables created by Prisma in AI QA
          Assistant. Useful for junior QA learning and interview preparation.
        </p>
      </div>

      <Section title="Quick SQL reminders (what to practice)">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-2">
            <p className="font-semibold text-white">SELECT</p>
            <p className="text-sm text-slate-400">Choose which columns you want to see.</p>
          </Card>
          <Card className="space-y-2">
            <p className="font-semibold text-white">WHERE</p>
            <p className="text-sm text-slate-400">Filter rows (e.g., type, status, userId).</p>
          </Card>
          <Card className="space-y-2">
            <p className="font-semibold text-white">ORDER BY</p>
            <p className="text-sm text-slate-400">Sort output (e.g., newest documents).</p>
          </Card>
          <Card className="space-y-2">
            <p className="font-semibold text-white">COUNT</p>
            <p className="text-sm text-slate-400">Count matching records (e.g., pending items).</p>
          </Card>
        </div>
      </Section>

      <Section title="Useful QA SQL queries for this project">
        <div className="space-y-4">
          <Card className="space-y-3">
            <p className="font-semibold text-white">Get all documents (newest first)</p>
            <SqlBlock sql={`SELECT *\nFROM "Document"\nORDER BY "createdAt" DESC;`} />
            <p className="text-sm text-slate-400">
              QA use: quickly inspect what artifacts exist and how your system is behaving.
            </p>
          </Card>

          <Card className="space-y-3">
            <p className="font-semibold text-white">Get documents by type</p>
            <SqlBlock
              sql={`SELECT *\nFROM "Document"\nWHERE "type" = 'TEST_CASE_SET'\nORDER BY "createdAt" DESC;`}
            />
            <p className="text-sm text-slate-400">
              QA use: find only test-case documents when debugging generation or export behavior.
            </p>
          </Card>

          <Card className="space-y-3">
            <p className="font-semibold text-white">Get accepted generated items</p>
            <SqlBlock
              sql={`SELECT *\nFROM "GeneratedItem"\nWHERE "reviewStatus" = 'ACCEPTED'\nORDER BY "createdAt" DESC;`}
            />
            <p className="text-sm text-slate-400">
              QA use: validate what will be exported and saved coverage for human-accepted
              artifacts.
            </p>
          </Card>

          <Card className="space-y-3">
            <p className="font-semibold text-white">Count pending items</p>
            <SqlBlock
              sql={`SELECT COUNT(*)::int AS pendingItems\nFROM "GeneratedItem"\nWHERE "reviewStatus" = 'PENDING';`}
            />
            <p className="text-sm text-slate-400">
              QA use: measure review backlog and generation throughput.
            </p>
          </Card>

          <Card className="space-y-3">
            <p className="font-semibold text-white">Find documents created by a specific user</p>
            <SqlBlock
              sql={`SELECT *\nFROM "Document"\nWHERE "userId" = 'USER_ID_HERE'\nORDER BY "createdAt" DESC;`}
            />
            <p className="text-sm text-slate-400">
              QA use: reproduce issues for a specific account and verify ownership rules.
            </p>
          </Card>

          <Card className="space-y-3">
            <p className="font-semibold text-white">Find documents without any accepted items</p>
            <SqlBlock
              sql={`SELECT d.*\nFROM "Document" d\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM "GeneratedItem" gi\n  WHERE gi."documentId" = d."id"\n    AND gi."reviewStatus" = 'ACCEPTED'\n)\nORDER BY d."createdAt" DESC;`}
            />
            <p className="text-sm text-slate-400">
              QA use: verify export behavior defaults to ACCEPTED and detect documents stuck in
              PENDING/REJECTED.
            </p>
          </Card>

          <Card className="space-y-3">
            <p className="font-semibold text-white">Get quality analysis scores (by document)</p>
            <SqlBlock
              sql={`SELECT\n  d."id" AS "documentId",\n  d."title",\n  d."type" AS "documentType",\n  qa."overallScore",\n  qa."createdAt" AS "analysisCreatedAt"\nFROM "QualityAnalysis" qa\nJOIN "Document" d ON d."id" = qa."documentId"\nORDER BY qa."createdAt" DESC;`}
            />
            <p className="text-sm text-slate-400">
              QA use: audit model quality, compare scores across runs, and debug quality analysis.
            </p>
          </Card>

          <Card className="space-y-3">
            <p className="font-semibold text-white">Order documents by newest (explicit query)</p>
            <SqlBlock
              sql={`SELECT "id", "title", "type", "createdAt"\nFROM "Document"\nORDER BY "createdAt" DESC\nLIMIT 20;`}
            />
            <p className="text-sm text-slate-400">
              QA use: quickly locate the latest artifacts created during a test session.
            </p>
          </Card>

          <Card className="space-y-3">
            <p className="font-semibold text-white">
              Find guest usage history (limit / investigate)
            </p>
            <SqlBlock
              sql={`SELECT\n  ul.*,\n  gs."sessionKey",\n  gs."usageCount",\n  gs."allowedFeatureUsed"\nFROM "UsageLog" ul\nLEFT JOIN "GuestSession" gs ON gs."id" = ul."guestSessionKey"\nORDER BY ul."createdAt" DESC\nLIMIT 50;`}
            />
            <p className="text-sm text-slate-400">
              QA use: verify guest lock-in and usage limiting behavior over time.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Beginner SQL exercises">
        <div className="space-y-4">
          <Card className="space-y-2">
            <p className="font-semibold text-white">Exercise 1: find all bug report documents</p>
            <SqlBlock
              sql={`SELECT *\nFROM "Document"\nWHERE "type" = 'BUG_REPORT'\nORDER BY "createdAt" DESC;`}
            />
            <p className="text-sm text-slate-400">
              Try: add a WHERE for userId, then compare counts.
            </p>
          </Card>

          <Card className="space-y-2">
            <p className="font-semibold text-white">Exercise 2: count rejected items</p>
            <SqlBlock
              sql={`SELECT COUNT(*)::int AS rejectedItems\nFROM "GeneratedItem"\nWHERE "reviewStatus" = 'REJECTED';`}
            />
            <p className="text-sm text-slate-400">
              Try: group by documentId to see which docs are most rejected.
            </p>
          </Card>

          <Card className="space-y-2">
            <p className="font-semibold text-white">Exercise 3: show all accepted test cases</p>
            <SqlBlock
              sql={`SELECT gi.*\nFROM "GeneratedItem" gi\nJOIN "Document" d ON d."id" = gi."documentId"\nWHERE d."type" = 'TEST_CASE_SET'\n  AND gi."reviewStatus" = 'ACCEPTED'\nORDER BY gi."createdAt" DESC;`}
            />
            <p className="text-sm text-slate-400">
              Try: add gi.&quot;priority&quot; filter and see what changes.
            </p>
          </Card>

          <Card className="space-y-2">
            <p className="font-semibold text-white">Exercise 4: list latest 5 documents</p>
            <SqlBlock
              sql={`SELECT "id", "title", "type", "createdAt"\nFROM "Document"\nORDER BY "createdAt" DESC\nLIMIT 5;`}
            />
            <p className="text-sm text-slate-400">Try: add title search with LIKE.</p>
          </Card>

          <Card className="space-y-2">
            <p className="font-semibold text-white">Exercise 5: find users with most documents</p>
            <SqlBlock
              sql={`SELECT\n  u."id" AS "userId",\n  u."email",\n  COUNT(d."id")::int AS "documentCount"\nFROM "User" u\nLEFT JOIN "Document" d ON d."userId" = u."id"\nWHERE d."id" IS NOT NULL\nGROUP BY u."id", u."email"\nORDER BY "documentCount" DESC\nLIMIT 10;`}
            />
            <p className="text-sm text-slate-400">
              Try: include guest docs by switching logic around guestSessionId.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Common QA use cases for SQL">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-400">
          <li>Checking test data integrity (missing fields, unexpected nulls)</li>
          <li>Verifying saved records after human review (PENDING → ACCEPTED / REJECTED)</li>
          <li>
            Validating business logic (export includes only ACCEPTED, demo is read-only, etc.)
          </li>
          <li>
            Checking if duplicate entities exist (e.g., duplicate emails via auth table logic)
          </li>
        </ul>
      </Section>

      <Section title="How to use this page for interview practice">
        <Card className="space-y-2">
          <p className="font-semibold text-white">Suggested approach</p>
          <p className="text-sm text-slate-400">
            Pick one query (e.g., &quot;documents without accepted items&quot;), run it against your
            local DB, then explain: what it measures, why it matters for QA, and how you&apos;d use
            it to debug a real issue.
          </p>
          <p className="text-sm text-slate-400">
            This helps you talk like a QA engineer: not only SQL syntax, but also how the query maps
            to product behavior.
          </p>
        </Card>
      </Section>
    </div>
  );
}
