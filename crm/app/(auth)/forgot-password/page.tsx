"use client";

import { useState, Suspense } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";

const LOGO =
  "https://mlgepubil2mw.i.optimole.com/w:742/h:157/q:mauto/g:sm/f:best/https://bluuhq.com/wp-content/uploads/2026/05/cropped-bluuhq.png";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const siteUrl = window.location.origin;

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password?recovery=1`,
    });

    setLoading(false);

    if (resetErr) {
      setError(resetErr.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm space-y-4 bg-white p-8 rounded-xl border text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Check your email</h1>
          <p className="text-sm text-slate-500">
            If an account exists for <strong className="text-slate-700">{email}</strong>, you&apos;ll receive a password reset link shortly.
          </p>
          <Link
            href="/admin-login"
            className="inline-block text-sm font-semibold text-[#1875F2] hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-xl border">
        <div className="mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="BluuHQ" className="h-7" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800">Reset your password</h1>
          <p className="text-sm text-slate-500">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@bluuhq.com"
              autoComplete="email"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1875F2] focus:border-transparent transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1875F2] hover:bg-[#1461CE] text-white rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/admin-login"
            className="text-sm text-slate-500 hover:text-[#1875F2] transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
