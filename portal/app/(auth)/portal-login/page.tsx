"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const LOGO =
  "https://mlgepubil2mw.i.optimole.com/w:742/h:157/q:mauto/g:sm/f:best/https://bluuhq.com/wp-content/uploads/2026/05/cropped-bluuhq.png";

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

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const [showResendInvite, setShowResendInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
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

  const isAltView = showForgotPassword || showResendInvite;

  return (
    <div className="min-h-screen flex">
      {/* ── Left: image + brand panel ──────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1400&auto=format&fit=crop&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(150deg, rgba(10,54,115,0.92) 0%, rgba(24,117,242,0.78) 100%)",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="BluuHQ" className="h-9 brightness-0 invert" />
        </div>

        {/* Tagline */}
        <div className="relative z-10 space-y-4">
          <div className="w-10 h-1 rounded-full bg-white/40" />
          <h2 className="text-white text-[2rem] font-bold leading-snug">
            Your business,<br />beautifully managed.
          </h2>
          <p className="text-white/65 text-sm leading-relaxed max-w-xs">
            Invoices, files, subscriptions, and communication — all in one place, just for you.
          </p>
        </div>
      </div>

      {/* ── Right: form panel ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 lg:px-16">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 self-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="BluuHQ" className="h-7" />
          </div>

          <div className="w-full max-w-sm space-y-6">
            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-800">
                {showForgotPassword
                  ? "Reset your password"
                  : showResendInvite
                  ? "Get a sign-in link"
                  : "Welcome back"}
              </h1>
              <p className="text-sm text-slate-500">
                {showForgotPassword
                  ? "Enter your email and we'll send a reset link."
                  : showResendInvite
                  ? "We'll email you a one-click link to sign in instantly."
                  : "Sign in to your client portal"}
              </p>
            </div>

            {/* Main login form */}
            {!isAltView && (
              <>
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-lg">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="you@company.com"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1875F2] focus:border-transparent transition"
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <input
                      {...register("password")}
                      type="password"
                      placeholder="••••••••"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1875F2] focus:border-transparent transition"
                      autoComplete="current-password"
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1875F2] hover:bg-[#1461CE] text-white rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Signing in…" : "Sign in"}
                  </button>
                </form>

                <div className="flex flex-col gap-2 pt-1">
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
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                    If that email is in our system, you&apos;ll receive a reset link shortly.
                  </div>
                ) : (
                  <>
                    {forgotError && (
                      <div className="text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-lg">
                        {forgotError}
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Email</label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1875F2] transition"
                        autoComplete="email"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={forgotLoading}
                      className="w-full bg-[#1875F2] hover:bg-[#1461CE] text-white rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors"
                    >
                      {forgotLoading ? "Sending…" : "Send Reset Link"}
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
                  ← Back to sign in
                </button>
              </div>
            )}

            {/* Resend invite form */}
            {showResendInvite && (
              <div className="space-y-4">
                {inviteSent ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                    If that email is in our system, you&apos;ll receive a sign-in link shortly. Check your inbox.
                  </div>
                ) : (
                  <>
                    {inviteError && (
                      <div className="text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-lg">
                        {inviteError}
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Email</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1875F2] transition"
                        autoComplete="email"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleResendInvite}
                      disabled={inviteLoading}
                      className="w-full bg-[#1875F2] hover:bg-[#1461CE] text-white rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors"
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
                  ← Back to sign in
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center">
          <p className="text-xs text-slate-400">
            Need help?{" "}
            <a
              href="mailto:hello@bluuhq.com"
              className="text-slate-500 hover:text-[#1875F2] underline underline-offset-2 transition-colors"
            >
              Email hello@bluuhq.com
            </a>
          </p>
        </div>
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
