"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Triggers Supabase's built-in email-change confirmation flow — it emails
 * the new address (and the old one too, if "Secure email change" is on in
 * the project's Auth settings) and only updates auth.users.email once
 * confirmed. shops.owner_email then re-syncs on its own via the
 * on_auth_user_email_updated trigger (see supabase/schema.sql) — nothing
 * else needs to happen here after the request goes out.
 */
export default function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: `${window.location.origin}/auth/callback` }
    );

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="bg-white border border-line rounded-lg p-4 space-y-3">
      <Label>Account email</Label>
      {sent ? (
        <p className="text-sm text-ink-soft">
          Check <b>{email}</b> (and your current inbox, if prompted) for a confirmation link to finish the
          change.
        </p>
      ) : (
        <>
          <p className="text-xs text-ink-soft -mt-1">Currently signed in as {currentEmail}.</p>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="new@email.com"
              required
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={loading || !email}>
              {loading ? "Sending…" : "Change"}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
