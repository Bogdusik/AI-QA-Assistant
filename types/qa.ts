export type ReviewStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type TestCaseItem = {
  title: string;
  priority: string;
  type: "positive" | "negative" | "edge";
  preconditions: string;
  testData: string;
  steps: string[];
  expectedResult: string;
  assumptions: string;
  sourceEvidence: string;
  riskNote: string;
};

export type ChecklistItem = {
  title: string;
  category: string;
  type: "basic" | "validation" | "negative" | "edge";
  description: string;
  assumptions: string;
  sourceEvidence: string;
};

export type BugReportItem = {
  title: string;
  environment: string;
  preconditions: string;
  stepsToReproduce: string[];
  actualResult: string;
  expectedResult: string;
  severity: string;
  priority: string;
  notes: string;
  assumptions: string;
};

export type ApiTestIdeaItem = {
  title: string;
  category: string;
  purpose: string;
  requestNotes: string;
  expectedOutcome: string;
  suggestedStatusCode: string;
  assumptions: string;
  sourceEvidence: string;
};
