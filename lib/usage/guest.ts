import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import type { FeatureUsed } from "@prisma/client";

const COOKIE_NAME = "aiqa_guest_session";

export async function getOrCreateGuestSession() {
  const store = await cookies();
  const sessionKey = store.get(COOKIE_NAME)?.value ?? `guest_${crypto.randomUUID()}`;
  const existing = await prisma.guestSession.findUnique({ where: { sessionKey } });
  if (existing) return existing;
  return prisma.guestSession.create({ data: { sessionKey, usageCount: 0 } });
}

function getFeatureUsedFromDocType(type: string): FeatureUsed {
  if (type === "TEST_CASE_SET") return "TEST_CASE_GENERATION";
  if (type === "CHECKLIST") return "CHECKLIST_GENERATION";
  if (type === "BUG_REPORT") return "BUG_REPORT_ASSISTANT";
  return "API_TEST_IDEAS";
}

function featureLabel(featureUsed: FeatureUsed) {
  if (featureUsed === "TEST_CASE_GENERATION") return "Test Cases";
  if (featureUsed === "CHECKLIST_GENERATION") return "Checklist";
  if (featureUsed === "BUG_REPORT_ASSISTANT") return "Bug Report";
  return "API Ideas";
}

export async function enforceGuestAccess(docTypeForMapping: string) {
  const featureUsed = getFeatureUsedFromDocType(docTypeForMapping);
  const limit = Number(process.env.GUEST_USAGE_LIMIT ?? "5");
  const guest = await getOrCreateGuestSession();

  if (guest.allowedFeatureUsed && guest.allowedFeatureUsed !== featureUsed) {
    throw new Error(
      `Guest mode is locked to ${featureLabel(guest.allowedFeatureUsed as FeatureUsed)}. Create an account to unlock other generators.`
    );
  }

  // Lock to first-used generator type.
  if (!guest.allowedFeatureUsed) {
    await prisma.guestSession.update({
      where: { id: guest.id },
      data: { allowedFeatureUsed: featureUsed }
    });
  }

  if (guest.usageCount >= limit) {
    throw new Error("Guest usage limit reached. Create an account for unlimited usage.");
  }
  await prisma.guestSession.update({
    where: { id: guest.id },
    data: { usageCount: { increment: 1 } }
  });
  return guest;
}
