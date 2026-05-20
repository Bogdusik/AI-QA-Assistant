import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
        <h2 className="font-medium">Account</h2>
        {session ? (
          <p className="mt-2 text-sm text-slate-600">
            Signed in as {session.user.email}. Role: {session.user.role}
          </p>
        ) : (
          <div className="mt-2 space-y-2 text-sm text-slate-600">
            <p>You are using guest mode with limited generation usage.</p>
            <Link href="/register">
              <Button>Create account</Button>
            </Link>
          </div>
        )}
      </Card>
      <Card>
        <h2 className="font-medium">API usage note</h2>
        <p className="mt-2 text-sm text-slate-600">
          AI generations use your configured OpenAI API key. Generated suggestions require human
          review before export.
        </p>
      </Card>
      <Card>
        <h2 className="font-medium">Export preferences</h2>
        <p className="mt-2 text-sm text-slate-600">
          By default export includes accepted items only.
        </p>
      </Card>
    </div>
  );
}
