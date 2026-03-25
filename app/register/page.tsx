"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not create account.");
      return;
    }
    router.push("/login");
  }

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="space-y-1 text-sm">
          <span className="block font-medium">Full name</span>
          <Input
            id="register-name"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="block font-medium">Email</span>
          <Input
            id="register-email"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="block font-medium">Password</span>
          <Input
            id="register-password"
            placeholder="Password (min 8 chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        {error && (
          <p className="text-sm text-red-600" role="status" aria-live="polite">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </Button>
      </form>
    </Card>
  );
}
