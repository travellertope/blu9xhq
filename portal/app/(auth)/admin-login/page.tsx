"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const LOGO =
  "https://mlgepubil2mw.i.optimole.com/w:742/h:157/q:mauto/g:sm/f:best/https://bluuhq.com/wp-content/uploads/2026/05/cropped-bluuhq.png";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const [error, setError] = useState<string | null>(
    callbackError === "CredentialsSignin"
      ? "Login failed — check your WordPress username and password."
      : callbackError
      ? `Auth error: ${callbackError}`
      : null
  );
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    const result = await signIn("admin-credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
    });

    setLoading(false);

    if (!result) {
      setError("No response from auth server — check NEXTAUTH_SECRET is set.");
      return;
    }

    if (result.error) {
      setError(`Sign-in failed (${result.error}). Check your WordPress credentials and that the BluuHQ plugin is active.`);
      setDebugInfo(`Status: ${result.status} | Error: ${result.error} | URL: ${result.url ?? "—"}`);
      return;
    }

    router.replace("/admin");
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left: image + brand panel ──────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&auto=format&fit=crop&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(150deg, rgba(8,40,90,0.95) 0%, rgba(14,80,180,0.82) 100%)",
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
            Manage clients.<br />Drive results.
          </h2>
          <p className="text-white/65 text-sm leading-relaxed max-w-xs">
            Your command centre for clients, subscriptions, invoices, and team operations.
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
              <h1 className="text-2xl font-bold text-slate-800">Admin sign in</h1>
              <p className="text-sm text-slate-500">Sign in with your WordPress admin account</p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-lg space-y-1">
                <p>{error}</p>
                {debugInfo && (
                  <p className="text-xs font-mono opacity-60">{debugInfo}</p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Username</label>
                <input
                  {...register("username")}
                  placeholder="wp-username"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1875F2] focus:border-transparent transition"
                  autoComplete="username"
                />
                {errors.username && (
                  <p className="text-xs text-destructive">{errors.username.message}</p>
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
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center">
          <p className="text-xs text-slate-400">
            Client?{" "}
            <a
              href="/portal-login"
              className="text-slate-500 hover:text-[#1875F2] underline underline-offset-2 transition-colors"
            >
              Go to client portal
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
