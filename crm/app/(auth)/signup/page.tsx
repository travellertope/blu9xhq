"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// EMERGENCY DISABLE: see /api/auth/signup/route.ts — core data routes are not
// yet tenant-scoped, so new signups would see every other tenant's data.
const SIGNUPS_DISABLED = true;

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export default function SignupPage() {
  const router = useRouter();

  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug]               = useState("");
  const [slugEdited, setSlugEdited]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  // Auto-derive slug from company name unless user has manually edited it
  useEffect(() => {
    if (!slugEdited) setSlug(toSlug(companyName));
  }, [companyName, slugEdited]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Create tenant + user
      const signupRes = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, companyName, slug }),
      });
      const signupData = await signupRes.json();
      if (!signupRes.ok) {
        setError(signupData.error ?? "Signup failed");
        return;
      }

      // 2. Sign in to get session cookies
      const signinRes = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const signinData = await signinRes.json();
      if (!signinRes.ok) {
        setError(signinData.error ?? "Account created but sign-in failed — please sign in manually.");
        return;
      }

      router.replace("/admin");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const crmDomain = "crm.bluuhq.com";

  if (SIGNUPS_DISABLED) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center">
            <Image src="/logo.png" alt="BluuHQ" width={120} height={36} priority className="object-contain" />
          </div>
          <Card>
            <CardContent className="p-6 space-y-3 text-center">
              <h1 className="text-xl font-bold text-slate-900">Signups temporarily unavailable</h1>
              <p className="text-sm text-slate-500">
                We&apos;re not accepting new accounts right now. Please check back soon, or email{" "}
                <a href="mailto:hello@bluuhq.com" className="text-blue-600 hover:underline">hello@bluuhq.com</a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Image src="/logo.png" alt="BluuHQ" width={120} height={36} priority className="object-contain" />
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900">Create your CRM account</h1>
              <p className="text-sm text-slate-500">Free forever. No credit card required.</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    placeholder="Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jane@agency.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="companyName">Company / agency name</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Agency"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">Your CRM URL</Label>
                <div className="flex items-center rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <span className="pl-3 text-sm text-slate-400 shrink-0">{crmDomain}/</span>
                  <input
                    id="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlugEdited(true);
                      setSlug(toSlug(e.target.value) || toSlug(companyName));
                    }}
                    className="flex-1 bg-transparent px-2 py-2 text-sm outline-none min-w-0"
                    placeholder="acme-agency"
                    required
                    pattern="[a-z0-9][a-z0-9\-]{0,38}[a-z0-9]?"
                    title="Lowercase letters, numbers and hyphens only"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account…" : "Create free account"}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/admin-login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400">
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
