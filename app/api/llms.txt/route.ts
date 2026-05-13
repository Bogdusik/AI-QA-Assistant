import { NextResponse } from "next/server";

const DOCS = `# AI QA Assistant — API Reference

Base URL: \`/api\`
Auth: Session cookie (NextAuth credentials). Guest sessions allowed on most endpoints with usage limits.

---

## Authentication

### POST /api/auth/[...nextauth]
NextAuth.js handler. Supports credentials (email + password).

### POST /api/register
Register a new user account.
Body: \`{ name: string (min 2), email: string, password: string (min 8) }\`
Responses: 200 OK | 409 Conflict (email exists) | 400 Bad Request | 500 Server Error

---

## Documents

### GET /api/documents
List documents for the current user or guest session.
Query params: \`q\` (title search), \`type\` (ALL|TEST_CASE_SET|CHECKLIST|BUG_REPORT|API_TEST_SET), \`status\` (ALL|DRAFT|ACTIVE|ARCHIVED)
Response: \`{ documents: [{ id, title, type, status, sourceType, createdAt, isDemo, _count: { generatedItems } }] }\`

### POST /api/documents
Duplicate an existing document.
Body: \`{ documentId: string }\`
Response: \`{ documentId: string }\`

### GET /api/documents/:id
Get a document with its generated items and requirement links.
Response: \`{ document: { id, title, type, status, sourceType, sourceText, sourceUrl, sourceFilePath, domainType, detailLevel, isDemo, generatedItems: [...], requirementLinks: [...] } }\`

### PATCH /api/documents/:id
Update document title or status.
Body: \`{ title?: string, status?: DRAFT|ACTIVE|ARCHIVED }\`
Response: \`{ ok: true }\`

### DELETE /api/documents/:id
Delete a document and all its items.
Response: \`{ ok: true }\`

---

## Generation

### POST /api/generate
Generate QA artifacts using AI (OpenAI gpt-4o-mini).
Body:
\`\`\`json
{
  "type": "TEST_CASE_SET" | "CHECKLIST" | "BUG_REPORT" | "API_TEST_SET",
  "title": "string (min 3)",
  "sourceText": "string (max 50000, optional)",
  "sourceUrl": "url string (optional)",
  "sourceFilePath": "string (optional)",
  "domainType": "WEB" | "MOBILE" | "API" | "GENERAL",
  "detailLevel": "SHORT" | "NORMAL" | "DETAILED",
  "payload": {}
}
\`\`\`
Response: \`{ documentId: string }\`
Notes: Guest sessions are limited by GUEST_USAGE_LIMIT and locked to first-used generator type.

---

## Generated Items

### PATCH /api/items/:id
Update a generated item's title, reviewStatus, or contentJson.
Body: \`{ title?: string, reviewStatus?: PENDING|ACCEPTED|REJECTED, contentJson?: object }\`
Response: \`{ ok: true }\`

### POST /api/items/:id/improve
Re-generate an improved version of a single item using AI.
Response: \`{ improvedContentJson: object, improvedTitle: string }\`

---

## Document Actions

### POST /api/documents/:id/bulk-review
Set all generated items in a document to a single review status.
Body: \`{ reviewStatus: PENDING|ACCEPTED|REJECTED }\`
Response: \`{ ok: true }\`

### POST /api/documents/:id/quality-analysis
Run AI quality analysis over all accepted items in a document. Saves result to DB.
Response: \`{ analysis: { id, overallScore, strengths, weaknesses, suggestions, explainability, analysisJson } }\`
Note: Requires at least one accepted item.

### GET /api/documents/:id/export
Export document items as a downloadable file.
Query params: \`format\` (md|csv|txt), \`includePending\` (true|false)
Response: File download (Content-Disposition: attachment)

---

## File Upload

### POST /api/upload
Upload an image or PDF file for use as source material.
Form data: \`file\` (File), \`mode\` (image|pdf)
Limits: 5MB max. Images: PNG/JPEG/WebP. PDFs validated by magic bytes.
Response: \`{ filePath: string, originalName: string, mimeType: string, extractedText: string }\`
Note: For PDFs, extractedText contains up to 6000 chars of extracted content.

---

## Item Types and Schemas

### TEST_CASE
\`{ title, priority, type (positive|negative|edge), preconditions, testData, steps[], expectedResult, assumptions, sourceEvidence, riskNote }\`

### CHECKLIST_ITEM
\`{ title, category, type (basic|validation|negative|edge), description, assumptions, sourceEvidence }\`

### BUG_REPORT
\`{ title, environment, preconditions, stepsToReproduce[], actualResult, expectedResult, severity, priority, notes, assumptions }\`

### API_TEST_IDEA
\`{ title, category, purpose, requestNotes, expectedOutcome, suggestedStatusCode, assumptions, sourceEvidence }\`
`;

export function GET() {
  return new NextResponse(DOCS, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
