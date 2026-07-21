"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * The one-time code step after "check your email" — works from any device,
 * since verifyOtp just needs the code typed back in, not a secret stashed
 * in the browser that requested it (unlike the magic link itself, which
 * only completes sign-in in the same browser via PKCE).
 *
 * type is "email" per Supabase's own docs for verifying a signInWithOtp
 * code — "magiclink" (tried here previously) isn't the documented value
 * for this flow and didn't fix the "invalid or expired" reports.
 *
 * Not hardcoded to 6 digits — Supabase's documented default is 6, but the
 * actual length depends on this project's mailer/OTP config (observed
 * sending 8), and verifyOtp itself doesn't care about a specific length,
 * only that the value matches what was issued. Accepting a range instead
 * of an exact count means a project-side config change never silently
 * breaks this form again.
 */
export default function VerifyCodeForm({
  email,
  onResend,
}: {
  email: string;
  onResend: () => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setVerifying(true);

    const supabase = createSupabaseBrowserClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (verifyError) {
      setError(verifyError.message);
      setVerifying(false);
      return;
    }

    const res = await fetch("/api/onboarding/complete", { method: "POST" });
    const body = await res.json().catch(() => ({}));
    router.replace(body.redirectTo ?? "/dashboard");
  }

  async function handleResend() {
    setError("");
    setResending(true);
    const result = await onResend();
    setResending(false);
    if (result.error) {
      setError(result.error);
    } else {
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    }
  }

  return (
    <div className="text-center space-y-4">
      <div className="space-y-1">
        <h1 className="text-lg font-bold text-ink">Check your email</h1>
        <p className="text-sm text-ink-soft">
          We sent a code to <b>{email}</b>. Enter it below to continue — on whatever device
          you&apos;re using right now.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-left">
          {error}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-3">
        <Input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={10}
          placeholder="Enter your code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
          className="text-center text-lg tracking-[0.3em] font-semibold"
          required
        />
        <Button type="submit" className="w-full" disabled={verifying || code.length < 6}>
          {verifying ? "Verifying…" : "Verify & continue"}
        </Button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        className="text-sm text-blue font-medium hover:underline disabled:opacity-60"
      >
        {resending ? "Resending…" : resent ? "Code resent ✓" : "Resend code"}
      </button>
    </div>
  );
}
