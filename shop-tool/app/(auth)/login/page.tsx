"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import VerifyCodeForm from "@/components/onboarding/verify-code-form";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function sendCode() {
    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: signInError?.message };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await sendCode();

    setLoading(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-bg-soft flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center font-extrabold text-lg">
          Bluu<span className="text-blue">Shop</span>
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            {sent ? (
              <VerifyCodeForm email={email} onResend={sendCode} />
            ) : (
              <>
                <div className="space-y-1">
                  <h1 className="text-xl font-bold text-ink">Log in to your shop</h1>
                  <p className="text-sm text-ink-soft">We&apos;ll email you a code — no password needed.</p>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@business.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending…" : "Send code"}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        {!sent && (
          <p className="text-center text-sm text-ink-soft">
            No shop yet? <a href="/create" className="text-blue font-medium hover:underline">Create one free</a>
          </p>
        )}
      </div>
    </div>
  );
}
