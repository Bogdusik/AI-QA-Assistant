import { Card } from "@/components/ui/card";

const CODE_CLASS =
  "rounded-lg border border-white/10 bg-slate-900/80 p-4 text-xs text-slate-300 overflow-auto";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

export default function ApiPracticePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">API Practice Pack</h1>
        <p className="text-slate-400">
          A beginner-friendly guide to practice API testing using the real endpoints of AI QA
          Assistant. This is documentation for learning and Postman practice, not an execution
          engine.
        </p>
      </div>

      <Section title="What is API testing?">
        <p className="text-slate-400">
          API testing validates behavior at the HTTP layer: request/response correctness, status
          codes, schema validation, authentication/authorization, and error handling—without using
          browser automation.
        </p>
      </Section>

      <Section title="HTTP methods (GET / POST / PUT / DELETE)">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-2">
            <p className="font-semibold text-white">GET</p>
            <p className="text-sm text-slate-400">Read data. Should not change server state.</p>
          </Card>
          <Card className="space-y-2">
            <p className="font-semibold text-white">POST</p>
            <p className="text-sm text-slate-400">
              Create or trigger an action (e.g., generate a document).
            </p>
          </Card>
          <Card className="space-y-2">
            <p className="font-semibold text-white">PUT</p>
            <p className="text-sm text-slate-400">
              Replace an existing resource (not heavily used in this MVP).
            </p>
          </Card>
          <Card className="space-y-2">
            <p className="font-semibold text-white">DELETE</p>
            <p className="text-sm text-slate-400">
              Remove a resource (documents only; demo is read-only).
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Status codes you should test">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["200", "OK", "Request succeeded; response contains the expected data."],
            ["201", "Created", "Resource created successfully."],
            ["400", "Bad Request", "Invalid input: schema validation failed."],
            ["401", "Unauthorized", "Missing or invalid authentication."],
            ["403", "Forbidden", "Authenticated but not allowed (ownership / demo read-only)."],
            ["404", "Not Found", "Resource doesn't exist or isn't accessible."],
            ["409", "Conflict", "Conflict with current state (e.g., duplicate email)."],
            ["500", "Internal Server Error", "Server crashed or an unhandled error occurred."]
          ].map(([code, label, desc]) => (
            <Card key={code} className="space-y-2">
              <p className="font-semibold text-white">
                {code} • {label}
              </p>
              <p className="text-sm text-slate-400">{desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="How to test this project with Postman">
        <p className="text-slate-400">
          Recommended workflow:
          <span className="font-medium text-white">
            {" "}
            register → login (get session cookie) → list documents → generate → export → quality
            analysis
          </span>
          .
        </p>
      </Section>

      <Section title="Postman requests (real endpoints)">
        <div className="space-y-6">
          <Card className="space-y-3">
            <h3 className="text-lg font-semibold text-white">1) Register user</h3>
            <p className="text-sm text-slate-400">
              Create a user account for authenticated requests.
            </p>

            <p className="text-sm text-white">
              <strong>Method:</strong> POST
            </p>
            <p className="text-sm text-white">
              <strong>URL:</strong> http://localhost:3000/api/register
            </p>
            <p className="text-sm text-white">
              <strong>Headers:</strong> Content-Type: application/json
            </p>

            <p className="text-sm font-medium text-white">Sample request body</p>
            <pre className={CODE_CLASS}>
              {`{
  "name": "Alice QA",
  "email": "alice.qa@example.com",
  "password": "Password123!"
}`}
            </pre>

            <p className="text-sm font-medium text-white">Expected response</p>
            <pre className={CODE_CLASS}>
              {`// 200 OK
{ "ok": true }

// 409 Conflict
{ "error": "Email already exists." }

// 400 Bad Request
{ "error": "Invalid registration data." }`}
            </pre>

            <p className="text-sm font-medium text-white">What to verify (QA)</p>
            <ul className="list-disc pl-5 text-sm text-slate-400">
              <li>Status code matches scenario</li>
              <li>No sensitive details in error messages</li>
              <li>Duplicate email returns 409</li>
            </ul>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-lg font-semibold text-white">2) Login (NextAuth Credentials)</h3>
            <p className="text-sm text-slate-400">
              This MVP uses NextAuth credentials. You must send a CSRF token. After login, your
              browser/session cookie is required for authenticated endpoints.
            </p>

            <p className="text-sm text-white">
              <strong>Method:</strong> GET
            </p>
            <p className="text-sm text-white">
              <strong>URL:</strong> http://localhost:3000/api/auth/csrf
            </p>
            <p className="text-sm text-white">
              <strong>Headers:</strong> (none required)
            </p>

            <p className="text-sm font-medium text-white">Then: POST login</p>
            <p className="text-sm text-white">
              <strong>Method:</strong> POST
            </p>
            <p className="text-sm text-white">
              <strong>URL:</strong> http://localhost:3000/api/auth/callback/credentials
            </p>
            <p className="text-sm text-white">
              <strong>Headers:</strong> Content-Type: application/x-www-form-urlencoded
            </p>

            <p className="text-sm font-medium text-white">Sample body (form)</p>
            <pre className={CODE_CLASS}>
              {`email=alice.qa@example.com
&password=Password123!
&csrfToken=PASTE_CSRF_TOKEN
&callbackUrl=http://localhost:3000/dashboard`}
            </pre>

            <p className="text-sm font-medium text-white">Expected response</p>
            <pre className={CODE_CLASS}>
              {`// 200/302 depending on NextAuth flow
// NextAuth will set session cookies in the response.
// Verify by calling:
GET /api/auth/session`}
            </pre>

            <p className="text-sm font-medium text-white">What to verify (QA)</p>
            <ul className="list-disc pl-5 text-sm text-slate-400">
              <li>After login, call `GET /api/auth/session` and verify user id/email</li>
              <li>Wrong password returns error (commonly 401/200 with error depending on flow)</li>
              <li>Check cookies are present in Postman (Cookie header)</li>
            </ul>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-lg font-semibold text-white">3) List documents</h3>
            <p className="text-sm text-slate-400">
              Filters: q, type, status. This endpoint returns documents visible to the actor (user
              or guest).
            </p>

            <p className="text-sm text-white">
              <strong>Method:</strong> GET
            </p>
            <p className="text-sm text-white">
              <strong>URL:</strong> http://localhost:3000/api/documents?q=&type=ALL&status=ALL
            </p>

            <p className="text-sm font-medium text-white">Headers</p>
            <pre className={CODE_CLASS}>
              {`// Auth via NextAuth cookies (for users) OR guest cookie (for guest)
Cookie: (paste your session cookies here)`}
            </pre>

            <p className="text-sm font-medium text-white">Expected response</p>
            <pre className={CODE_CLASS}>
              {`{
  "documents": [
    {
      "id": "...",
      "title": "...",
      "type": "TEST_CASE_SET",
      "status": "ACTIVE",
      "createdAt": "..."
    }
  ]
}`}
            </pre>

            <p className="text-sm font-medium text-white">What to verify (QA)</p>
            <ul className="list-disc pl-5 text-sm text-slate-400">
              <li>Search is case-insensitive</li>
              <li>Type/status filters work</li>
              <li>No documents from other users</li>
            </ul>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-lg font-semibold text-white">
              4) Generate a document (QA generation)
            </h3>
            <p className="text-sm text-slate-400">
              Creates a new Document and GeneratedItems in <strong>PENDING</strong> review status.
            </p>

            <p className="text-sm text-white">
              <strong>Method:</strong> POST
            </p>
            <p className="text-sm text-white">
              <strong>URL:</strong> http://localhost:3000/api/generate
            </p>
            <p className="text-sm text-white">
              <strong>Headers:</strong> Content-Type: application/json
            </p>

            <p className="text-sm font-medium text-white">Sample request body</p>
            <pre className={CODE_CLASS}>
              {`{
  "type": "TEST_CASE_SET",
  "title": "Registration Feature Testing",
  "sourceText": "User can register with email/password. Email must be unique...",
  "domainType": "WEB",
  "detailLevel": "DETAILED",
  "payload": {
    "contextNotes": "Optional extra structured context"
  }
}`}
            </pre>

            <p className="text-sm font-medium text-white">Expected response</p>
            <pre className={CODE_CLASS}>
              {`// 200 OK
{ "documentId": "..." }

// 400 Bad Request
{ "error": "Could not generate..." or "Guest mode is locked..." }`}
            </pre>

            <p className="text-sm font-medium text-white">What to verify (QA)</p>
            <ul className="list-disc pl-5 text-sm text-slate-400">
              <li>Document created with correct type/title</li>
              <li>Generated items start as PENDING</li>
              <li>Guest lock-in blocks different generator types</li>
            </ul>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-lg font-semibold text-white">
              5) Export document (accepted items)
            </h3>
            <p className="text-sm text-slate-400">
              Export includes <strong>ACCEPTED</strong> items by default. Use `includePending=true`
              only if you explicitly want it.
            </p>

            <p className="text-sm text-white">
              <strong>Method:</strong> GET
            </p>
            <p className="text-sm text-white">
              <strong>URL:</strong> http://localhost:3000/api/documents/{`{documentId}`}
              /export?format=md
            </p>

            <p className="text-sm font-medium text-white">Headers</p>
            <pre className={CODE_CLASS}>
              {`// Auth via cookies (user/guest ownership rules apply)
Cookie: (paste your session cookies here)`}
            </pre>

            <p className="text-sm font-medium text-white">Expected response</p>
            <pre className={CODE_CLASS}>
              {`// 200 OK
// Content-Disposition: attachment
// Content-Type: text/plain or text/csv
...exported document content...`}
            </pre>

            <p className="text-sm font-medium text-white">What to verify (QA)</p>
            <ul className="list-disc pl-5 text-sm text-slate-400">
              <li>Export does not include rejected items</li>
              <li>Export includes accepted items only (default)</li>
              <li>Forbidden/Not found for other users</li>
            </ul>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-lg font-semibold text-white">
              6) Quality analysis (uses accepted items)
            </h3>
            <p className="text-sm text-slate-400">
              Sends accepted items to AI and saves QualityAnalysis linked to the document. Demo
              documents are read-only and regeneration is blocked.
            </p>

            <p className="text-sm text-white">
              <strong>Method:</strong> POST
            </p>
            <p className="text-sm text-white">
              <strong>URL:</strong> http://localhost:3000/api/documents/{`{documentId}`}
              /quality-analysis
            </p>
            <p className="text-sm text-white">
              <strong>Headers:</strong> Cookie + Content-Type: application/json (body can be empty)
            </p>

            <p className="text-sm font-medium text-white">Sample request body</p>
            <pre className={CODE_CLASS}>{`{}`}</pre>

            <p className="text-sm font-medium text-white">Expected response</p>
            <pre className={CODE_CLASS}>
              {`{
  "analysis": {
    "id": "...",
    "overallScore": 0-100,
    "strengths": ["..."],
    "weaknesses": ["..."],
    "suggestions": ["..."],
    "explainability": { "...": "..." }
  }
}`}
            </pre>

            <p className="text-sm font-medium text-white">What to verify (QA)</p>
            <ul className="list-disc pl-5 text-sm text-slate-400">
              <li>Requires at least one ACCEPTED item</li>
              <li>Validation errors return 400</li>
              <li>Demo documents return 403</li>
            </ul>
          </Card>
        </div>
      </Section>

      <Section title="Suggested Postman test scenarios">
        <div className="space-y-4">
          <Card className="space-y-2">
            <p className="font-semibold text-white">POST /api/register</p>
            <ul className="list-disc pl-5 text-sm text-slate-400">
              <li>Positive: valid data → 200</li>
              <li>Negative: duplicate email → 409</li>
              <li>Validation: missing fields → 400</li>
              <li>Auth/permission: not required → still expect 200/400/409</li>
              <li>Edge: special characters in password/email</li>
            </ul>
          </Card>
          <Card className="space-y-2">
            <p className="font-semibold text-white">POST /api/generate</p>
            <ul className="list-disc pl-5 text-sm text-slate-400">
              <li>Positive: generate TEST_CASE_SET → 200 documentId</li>
              <li>Negative: guest lock-in to different generator → 400</li>
              <li>Validation: invalid URL format/sourceUrl → 400</li>
              <li>Auth/permission: no session vs guest cookie behavior</li>
              <li>Edge: empty payload object, very long sourceText</li>
            </ul>
          </Card>
          <Card className="space-y-2">
            <p className="font-semibold text-white">GET /api/documents</p>
            <ul className="list-disc pl-5 text-sm text-slate-400">
              <li>Positive: filters work → 200 with documents</li>
              <li>Negative: other user&apos;s doc access → not found/forbidden behavior</li>
              <li>Validation: malformed query params</li>
              <li>Auth/permission: cookie missing → guest fallback or empty list</li>
              <li>Edge: q with special characters</li>
            </ul>
          </Card>
          <Card className="space-y-2">
            <p className="font-semibold text-white">GET /api/documents/{`{documentId}`}/export</p>
            <ul className="list-disc pl-5 text-sm text-slate-400">
              <li>Positive: accepted-only export → 200</li>
              <li>Negative: includePending=true with no accepted items</li>
              <li>Validation: invalid format parameter</li>
              <li>Auth/permission: forbidden when not owner; demo read-only still exports</li>
              <li>Edge: long document titles / filename encoding</li>
            </ul>
          </Card>
          <Card className="space-y-2">
            <p className="font-semibold text-white">
              POST /api/documents/{`{documentId}`}/quality-analysis
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-400">
              <li>Positive: at least one ACCEPTED item → 200 analysis</li>
              <li>Negative: no accepted items → 400 &quot;No accepted items found...&quot;</li>
              <li>Validation: missing docId → 404</li>
              <li>Auth/permission: demo returns 403</li>
              <li>Edge: regenerate multiple times</li>
            </ul>
          </Card>
        </div>
      </Section>

      <Section title="What to check in API testing">
        <Card>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-400">
            <li>HTTP status code matches expected scenario</li>
            <li>Response body schema is valid (no missing required fields)</li>
            <li>Error messages are clear and non-technical where possible</li>
            <li>Missing fields / invalid types return 400 (schema validation)</li>
            <li>Auth behavior: 401 for missing/invalid auth, 403 for forbidden actions</li>
            <li>Duplicate requests and state transitions (e.g., export after accept)</li>
            <li>Boundary values (very long input, empty strings, special characters)</li>
          </ul>
        </Card>
      </Section>
    </div>
  );
}
