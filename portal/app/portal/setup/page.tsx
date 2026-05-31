"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type Step = 1 | 2 | 3;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
    { label: "Special character", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const strengthLabel =
    score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong";
  const strengthColor =
    score <= 1
      ? "bg-red-400"
      : score === 2
      ? "bg-amber-400"
      : score === 3
      ? "bg-blue-400"
      : "bg-green-500";

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= score ? strengthColor : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${score <= 1 ? "text-red-500" : score < 4 ? "text-amber-600" : "text-green-600"}`}>
        {strengthLabel}
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map((c) => (
          <span key={c.label} className={`text-xs ${c.ok ? "text-green-600" : "text-slate-400"}`}>
            {c.ok ? "✓" : "·"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to portal if setup is already complete
  useEffect(() => {
    fetch("/api/portal/me")
      .then((r) => r.json())
      .then((d) => { if (d.setupComplete === true) router.replace("/portal"); })
      .catch(() => undefined);
  }, [router]);

  // Step 1
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  async function handlePasswordStep() {
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error ?? "Failed to set password");
      }
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileStep() {
    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() || undefined }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error ?? "Failed to update profile");
      }
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    setLoading(true);
    setError(null);
    try {
      await fetch("/api/portal/profile/setup-complete", {
        method: "PATCH",
      });
    } catch {
      // Non-blocking — proceed regardless
    } finally {
      setLoading(false);
    }
    router.replace("/portal");
  }

  const steps: { n: Step; label: string }[] = [
    { n: 1, label: "Set Password" },
    { n: 2, label: "Your Details" },
    { n: 3, label: "All Set!" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Welcome to BluuHQ</h1>
          <p className="text-slate-500 text-sm mt-1">
            Let&apos;s get your account set up — it&apos;ll only take a minute.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {steps.map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  n < step
                    ? "bg-green-500 text-white"
                    : n === step
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {n < step ? "✓" : n}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  n === step ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {label}
              </span>
              {n < 3 && (
                <div className={`h-px w-6 ${n < step ? "bg-green-400" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6 pb-6">
            {error && (
              <div className="mb-4 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
                {error}
              </div>
            )}

            {/* Step 1: Set password */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                  />
                  <PasswordStrength password={password} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={handlePasswordStep}
                  disabled={loading || !password || !confirmPassword}
                >
                  {loading ? "Saving…" : "Continue"}
                </Button>
              </div>
            )}

            {/* Step 2: Profile details */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="first-name">First Name *</Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Smith"
                      autoComplete="family-name"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    Phone{" "}
                    <span className="text-slate-400 font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    autoComplete="tel"
                  />
                </div>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleProfileStep}
                  disabled={loading || !firstName.trim()}
                >
                  {loading ? "Saving…" : "Continue"}
                </Button>
              </div>
            )}

            {/* Step 3: All set */}
            {step === 3 && (
              <div className="space-y-6 text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-green-600 text-3xl">✓</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">You&apos;re all set!</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Your portal is ready. Here&apos;s what you can do:
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left">
                  {[
                    { label: "View Subscriptions", href: "/portal/subscriptions", desc: "Your services" },
                    { label: "View Invoices", href: "/portal/invoices", desc: "Billing history" },
                    { label: "View Files", href: "/portal/files", desc: "Shared documents" },
                    { label: "Your Profile", href: "/portal/profile", desc: "Account settings" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="border rounded-lg p-3 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <p className="font-medium text-sm text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </Link>
                  ))}
                </div>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  {loading ? "Setting up…" : "Go to Dashboard"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
