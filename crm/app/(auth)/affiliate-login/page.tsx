"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const LOGO =
  "https://mlgepubil2mw.i.optimole.com/w:742/h:157/q:mauto/g:sm/f:best/https://bluuhq.com/wp-content/uploads/2026/05/cropped-bluuhq.png";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

function AffiliateLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  const registered = searchParams.get("registered");

  const [error, setError] = useState<string | null>(
    callbackError ? "Sign-in failed — please check your credentials." : null
  );
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Incorrect email or password.");
      return;
    }
    router.replace("/affiliate");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden"
        style={{
          background: "linear-gradient(150deg, #0a0a1a 0%, #0f2460 100%)",
        }}
      >
        <div className="relative z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="BluuHQ" className="h-9 brightness-0 invert" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="w-10 h-1 rounded-full bg-white/30" />
          <h2 className="text-white text-4xl font-bold leading-snug">
            Your affiliate<br />dashboard awaits.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Track clicks, conversions, and earnings. Get paid every month your referrals stay with Bluu.
          </p>
          <div className="flex gap-6 pt-2">
            {[
              { v: "30%", l: "Commission" },
              { v: "60d", l: "Cookie window" },
              { v: "∞", l: "No cap" },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl font-bold text-white">{s.v}</div>
                <div className="text-xs text-white/50 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 lg:px-16">
          <div className="lg:hidden mb-8 self-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="BluuHQ" className="h-7" />
          </div>

          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-800">Affiliate sign in</h1>
              <p className="text-sm text-slate-500">Sign in to your affiliate dashboard</p>
            </div>

            {registered && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
                Account created! Sign in with your new credentials below.
              </div>
            )}

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
                  placeholder="you@example.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  autoComplete="email"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  autoComplete="current-password"
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1875F2] hover:bg-[#1461CE] text-white rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="text-sm text-slate-500 text-center">
              Not an affiliate yet?{" "}
              <Link href="/affiliate-register" className="text-[#1875F2] font-medium hover:underline">
                Join free
              </Link>
            </p>
          </div>
        </div>

        <div className="px-8 pb-8 text-center">
          <p className="text-xs text-slate-400">
            Need help?{" "}
            <a href="mailto:hello@bluuhq.com" className="text-slate-500 hover:text-[#1875F2] underline underline-offset-2">
              Email hello@bluuhq.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AffiliateLoginPage() {
  return (
    <Suspense>
      <AffiliateLoginForm />
    </Suspense>
  );
}
