"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (signInError) {
      setError(signInError.message);
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
              <div className="text-center space-y-2">
                <h1 className="text-lg font-bold text-ink">Check your email</h1>
                <p className="text-sm text-ink-soft">
                  We sent a sign-in link to <b>{email}</b>. Open it on this device to continue.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <h1 className="text-xl font-bold text-ink">Log in to your shop</h1>
                  <p className="text-sm text-ink-soft">We&apos;ll email you a magic link — no password needed.</p>
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
                    {loading ? "Sending…" : "Send magic link"}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-ink-soft">
          No shop yet? <a href="/create" className="text-blue font-medium hover:underline">Create one free</a>
        </p>
      </div>
    </div>
  );
}
