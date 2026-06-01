"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormData = z.infer<typeof loginSchema>;

function PortalLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const [error, setError] = useState<string | null>(
    callbackError ? "Sign-in failed — please try again." : null
  );
  const [loading, setLoading] = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Resend invite state
  const [showResendInvite, setShowResendInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    setError(null);
    const result = await signIn("client-credentials", {
      username: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.replace("/portal");
  }

  async function handleForgotPassword() {
    if (!forgotEmail.includes("@")) {
      setForgotError("Please enter a valid email address.");
      return;
    }
    setForgotLoading(true);
    setForgotError(null);
    try {
      const res = await fetch("/api/portal/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Something went wrong");
      }
      setForgotSent(true);
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleResendInvite() {
    if (!inviteEmail.includes("@")) {
      setInviteError("Please enter a valid email address.");
      return;
    }
    setInviteLoading(true);
    setInviteError(null);
    try {
      const res = await fetch("/api/portal/auth/resend-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Something went wrong");
      }
      setInviteSent(true);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setInviteLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
      <div className="w-full max-w-sm space-y-6 p-8 border border-slate-200 rounded-xl shadow-sm bg-white">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-800">
            {showForgotPassword ? "Reset Password" : "Client Portal"}
          </h1>
          <p className="text-sm text-slate-500">
            {showForgotPassword
              ? "Enter your email and we'll send you a reset link."
              : "Sign in to your BluuHQ portal"}
          </p>
        </div>

        {/* Main login form */}
        {!showForgotPassword && !showResendInvite && (
          <>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1875F2] focus:border-transparent"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <input
                  {...register("password")}
                  type="password"
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1875F2] focus:border-transparent"
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1875F2] hover:bg-[#1461CE] text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);
                  setShowResendInvite(false);
                  setError(null);
                }}
                className="text-sm text-slate-500 hover:text-[#1875F2] transition-colors text-left"
              >
                Forgot your password?
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResendInvite(true);
                  setShowForgotPassword(false);
                  setError(null);
                }}
                className="text-sm text-slate-500 hover:text-[#1875F2] transition-colors text-left"
              >
                Never set a password? Get a sign-in link instead.
              </button>
            </div>
          </>
        )}

        {/* Forgot password form */}
        {showForgotPassword && (
          <div className="space-y-4">
            {forgotSent ? (
              <div className="bg-green-50 border border-green-200 rounded-md px-4 py-3 text-sm text-green-700">
                If that email is in our system, you&apos;ll receive a reset link shortly.
              </div>
            ) : (
              <>
                {forgotError && (
                  <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
                    {forgotError}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1875F2]"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                  className="w-full bg-[#1875F2] hover:bg-[#1461CE] text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {forgotLoading ? "Sending…" : "Send Reset Email"}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotSent(false);
                setForgotError(null);
                setForgotEmail("");
              }}
              className="text-sm text-slate-500 hover:text-[#1875F2] transition-colors"
            >
              Back to sign in
            </button>
          </div>
        )}

        {/* Resend invite form */}
        {showResendInvite && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-slate-800">Get a sign-in link</h2>
              <p className="text-sm text-slate-500">Enter your email and we'll send you a one-click link to sign in.</p>
            </div>
            {inviteSent ? (
              <div className="bg-green-50 border border-green-200 rounded-md px-4 py-3 text-sm text-green-700">
                If that email is in our system, you'll receive a sign-in link shortly. Check your inbox.
              </div>
            ) : (
              <>
                {inviteError && (
                  <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
                    {inviteError}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1875F2]"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleResendInvite}
                  disabled={inviteLoading}
                  className="w-full bg-[#1875F2] hover:bg-[#1461CE] text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {inviteLoading ? "Sending…" : "Send Sign-in Link"}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setShowResendInvite(false);
                setInviteSent(false);
                setInviteError(null);
                setInviteEmail("");
              }}
              className="text-sm text-slate-500 hover:text-[#1875F2] transition-colors"
            >
              Back to sign in
            </button>
          </div>
        )}

        {/* Help text */}
        <p className="text-xs text-slate-400 text-center">
          Need help?{" "}
          <a
            href="mailto:hello@bluuhq.com"
            className="text-slate-500 hover:text-[#1875F2] underline underline-offset-2"
          >
            Email hello@bluuhq.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <Suspense>
      <PortalLoginForm />
    </Suspense>
  );
}
