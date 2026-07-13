"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { consumeAuthHash } from "@/lib/supabase/consumeAuthHash";
import type { Session } from "@supabase/supabase-js";

type Status = "verifying" | "ready" | "invalid";

function homeForUserType(userType: string | undefined): string {
  return userType === "team"      ? "/admin"
       : userType === "client"    ? "/portal"
       : userType === "affiliate" ? "/affiliate"
       : "/admin-login";
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRecovery = searchParams.get("recovery") === "1";

  const [status, setStatus] = useState<Status>("verifying");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let resolved = false;

    function handleSession(session: Session | null, recovery: boolean) {
      if (!session || resolved) return;
      resolved = true;
      if (recovery) {
        setStatus("ready");
      } else {
        router.replace(homeForUserType(session.user.app_metadata?.user_type));
      }
    }

    // Direct admin-generated link (e.g. setup-first-admin.ts points straight
    // here) — the hash fragment hasn't been consumed yet. Parse and apply it
    // explicitly rather than relying on SDK auto-detection.
    consumeAuthHash().then(({ session, type }) => {
      handleSession(session, isRecovery || type === "recovery");
    });

    // Belt-and-suspenders in case SDK auto-detection does fire.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleSession(session, isRecovery || event === "PASSWORD_RECOVERY");
    });

    // Forwarded from /portal-login, which already consumed the fragment —
    // the session is already persisted, so just read it directly.
    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session, isRecovery));

    // No valid link at all (expired, already used, or visited directly).
    const timeout = setTimeout(() => {
      if (!resolved) setStatus("invalid");
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [isRecovery, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data, error: updateErr } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateErr) {
      setError(updateErr.message);
      return;
    }

    router.replace(homeForUserType(data.user?.app_metadata?.user_type));
  }

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Verifying your reset link…</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm space-y-4 bg-white p-8 rounded-xl border text-center">
          <h1 className="text-xl font-bold text-slate-800">Link expired or invalid</h1>
          <p className="text-sm text-slate-500">
            This password reset link is no longer valid. Ask an admin to send a new one, or sign in if you already know your password.
          </p>
          <a
            href="/admin-login"
            className="inline-block text-sm font-semibold text-[#1875F2] hover:underline"
          >
            Go to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-xl border">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800">Set a new password</h1>
          <p className="text-sm text-slate-500">Choose a password to finish resetting your account.</p>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-lg">{error}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1875F2] focus:border-transparent transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1875F2] focus:border-transparent transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1875F2] hover:bg-[#1461CE] text-white rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving…" : "Set password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">Verifying your reset link…</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
