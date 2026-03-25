"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard"
    });
    if (result?.error) {
      setError("Invalid credentials.");
      setLoading(false);
      return;
    }
    if (result?.url) {
      window.location.href = result.url;
      return;
    }
    window.location.href = "/dashboard";
  }

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="space-y-1 text-sm">
          <span className="block font-medium">Email</span>
          <Input
            id="login-email"
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
            id="login-password"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && (
          <p className="text-sm text-red-600" role="status" aria-live="polite">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>
    </Card>
  );
}
