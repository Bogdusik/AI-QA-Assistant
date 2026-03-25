import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { getOrCreateGuestSession } from "@/lib/usage/guest";

export async function getActor() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return { kind: "user" as const, userId: session.user.id };
  }
  const guest = await getOrCreateGuestSession();
  return { kind: "guest" as const, guestSessionId: guest.id };
}
