"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const LOGO =
  "https://mlgepubil2mw.i.optimole.com/w:742/h:157/q:mauto/g:sm/f:best/https://bluuhq.com/wp-content/uploads/2026/05/cropped-bluuhq.png";

const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  website: z.string().url("Enter a valid URL (include https://)").optional().or(z.literal("")),
  howHeard: z.string().min(1, "Please select an option"),
  agreedToTerms: z.boolean().refine((v) => v === true, "You must agree to the affiliate terms"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

function AffiliateRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { agreedToTerms: false },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/affiliates/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          website: data.website || "",
          howHeard: data.howHeard,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((body as { error?: string }).error ?? "Registration failed. Please try again.");
      }
      router.push("/affiliate-login?registered=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(150deg, #0a0a1a 0%, #0f2460 100%)" }}
      >
        <div className="relative z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="BluuHQ" className="h-9 brightness-0 invert" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="w-10 h-1 rounded-full bg-white/30" />
          <h2 className="text-white text-3xl font-bold leading-snug">
            Join the Bluu<br />Affiliate Program
          </h2>
          <ul className="space-y-3 text-sm text-white/65">
            {[
              "Earn 30% recurring commissions",
              "No cap — earn forever per referral",
              "60-day cookie attribution window",
              "Monthly payouts from $50",
              "Real-time dashboard from day one",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/30 text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex flex-col bg-white overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 lg:px-12">
          <div className="lg:hidden mb-8 self-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="BluuHQ" className="h-7" />
          </div>

          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
              <p className="text-sm text-slate-500">Free to join. Takes 60 seconds.</p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Full name</label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="Jane Smith"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  autoComplete="email"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Min. 8 characters"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  autoComplete="new-password"
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Confirm password</label>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Your website <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  {...register("website")}
                  type="url"
                  placeholder="https://yoursite.com"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">How did you hear about us?</label>
                <select
                  {...register("howHeard")}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">Select an option</option>
                  <option value="social_media">Social media</option>
                  <option value="search">Search engine</option>
                  <option value="friend_colleague">Friend or colleague</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="bluu_customer">I&apos;m a Bluu customer</option>
                  <option value="other">Other</option>
                </select>
                {errors.howHeard && <p className="text-xs text-destructive">{errors.howHeard.message}</p>}
              </div>

              <div className="flex items-start gap-2.5">
                <input
                  {...register("agreedToTerms")}
                  type="checkbox"
                  id="terms"
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm text-slate-600">
                  I agree to the{" "}
                  <a href="/affiliates/terms" target="_blank" className="text-[#1875F2] underline underline-offset-2 hover:text-[#1461CE]">
                    affiliate terms
                  </a>
                </label>
              </div>
              {errors.agreedToTerms && <p className="text-xs text-destructive">{errors.agreedToTerms.message}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1875F2] hover:bg-[#1461CE] text-white rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors"
              >
                {loading ? "Creating account…" : "Create affiliate account"}
              </button>
            </form>

            <p className="text-sm text-slate-500 text-center">
              Already have an account?{" "}
              <Link href="/affiliate-login" className="text-[#1875F2] font-medium hover:underline">
                Sign in
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

export default function AffiliateRegisterPage() {
  return (
    <Suspense>
      <AffiliateRegisterForm />
    </Suspense>
  );
}
