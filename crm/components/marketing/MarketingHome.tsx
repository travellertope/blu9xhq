"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Check,
  Users,
  LayoutDashboard,
  Receipt,
  FolderOpen,
  Mail,
  LifeBuoy,
  Globe,
  Share2,
} from "lucide-react";
import { PLAN_DETAILS } from "@/lib/stripe-products";
import { PLAN_LIMITS, type TenantPlan } from "@/lib/planLimits";

const PLAN_ORDER: TenantPlan[] = ["free", "starter", "pro", "agency"];

const PLAN_FEATURES: Record<TenantPlan, string[]> = {
  free: [
    "Up to 5 clients",
    "1 team member",
    "100 MB file storage",
    "Branded client portal",
    "Community support",
  ],
  starter: [
    "Up to 25 clients",
    "5 team members",
    "1 GB file storage",
    "Email sequences & automated follow-ups",
    "White-label custom domain",
  ],
  pro: [
    "Up to 100 clients",
    "15 team members",
    "10 GB file storage",
    "Everything in Starter",
    "AI-powered client health insights",
  ],
  agency: [
    "Unlimited clients & team members",
    "Unlimited file storage",
    "Everything in Pro",
    "Built-in affiliate / referral program",
    "Priority support",
  ],
};

const FEATURES = [
  {
    icon: Users,
    title: "Clients & services",
    body: "Track every client, service, and project in one CRM built for agency work.",
  },
  {
    icon: LayoutDashboard,
    title: "Client portal",
    body: "Give clients their own branded portal for invoices, files, and support — no separate login system to manage.",
  },
  {
    icon: Receipt,
    title: "Invoicing & billing",
    body: "Send invoices and collect payments without leaving the CRM.",
  },
  {
    icon: FolderOpen,
    title: "File sharing",
    body: "Share and organize client files in the same place you manage the relationship.",
  },
  {
    icon: Mail,
    title: "Sequences & follow-ups",
    body: "Automate onboarding, reminders, and check-ins so nothing falls through the cracks.",
  },
  {
    icon: LifeBuoy,
    title: "Support tickets",
    body: "Handle client requests through a shared ticket queue instead of a scattered inbox.",
  },
  {
    icon: Globe,
    title: "White-label domain",
    body: "Put your own domain on the portal your clients see — not ours.",
  },
  {
    icon: Share2,
    title: "Affiliate program",
    body: "Turn clients and partners into referral partners with built-in tracking and payouts.",
  },
];

const FAQS = [
  {
    q: "Is BluuCRM really free forever?",
    a: "Yes — the Free plan stays free for up to 5 clients, 1 team member, and the full client portal. No credit card required to sign up.",
  },
  {
    q: "Can my clients log in without setting up their own account?",
    a: "Yes. Clients get a magic-link sign-in to their own portal — they never have to create or manage a password.",
  },
  {
    q: "What does white-label mean here?",
    a: "On Starter and above, you can point your own custom domain at your client portal, so your clients see your brand, not BluuHQ's.",
  },
  {
    q: "How does the affiliate program work?",
    a: "Affiliates earn recurring commission for referring customers to BluuCRM, BluuAudit, and other BluuHQ services — tracked automatically through a referral link.",
  },
];

function formatStorage(mb: number): string {
  if (!Number.isFinite(mb)) return "Unlimited";
  if (mb >= 1000) return `${mb / 1000} GB`;
  return `${mb} MB`;
}

export default function MarketingHome() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b border-slate-200">
        <div className="max-w-site mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-1 font-extrabold text-lg">
            Bluu<span className="text-primary">HQ</span>
            <span className="text-slate-400 font-medium text-sm ml-1">/ crm</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/admin-login"
              className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors hidden sm:inline-block"
            >
              Log in
            </Link>
            <Button asChild size="sm">
              <Link href="/signup">Create free account</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-slate-50/60">
        <div className="max-w-site mx-auto px-6 py-20 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto">
            Run your agency&apos;s clients, projects, and portal — all in one place.
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-xl mx-auto">
            BluuCRM unifies client relationships, project management, invoicing, and a
            branded client portal so freelancers and agencies stop stitching tools together.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">Create free account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/admin-login">Log in</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-slate-400">Free forever for your first 5 clients. No credit card required.</p>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="max-w-site mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-sm font-semibold text-primary uppercase tracking-wide">What&apos;s inside</span>
          <h2 className="font-display text-3xl font-extrabold mt-2">Everything client work needs, none of the sprawl.</h2>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="border-slate-200">
              <CardContent className="pt-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Trust ──────────────────────────────────────────────── */}
      <div className="border-y border-slate-200 bg-slate-50/60">
        <div className="max-w-site mx-auto px-6 py-6 text-center">
          <p className="text-sm text-slate-500">
            Built and run by BluuHQ — we manage our own clients, invoices, and affiliate program on BluuCRM.
          </p>
        </div>
      </div>

      {/* ── Pricing ────────────────────────────────────────────── */}
      <section className="max-w-site mx-auto px-6 py-20" id="pricing">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-sm font-semibold text-primary uppercase tracking-wide">Pricing</span>
          <h2 className="font-display text-3xl font-extrabold mt-2">Start free. Upgrade when your client list grows.</h2>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${!annual ? "text-slate-900" : "text-slate-400"}`}>Monthly</span>
          <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Toggle annual pricing" />
          <span className={`text-sm font-medium ${annual ? "text-slate-900" : "text-slate-400"}`}>
            Annual <span className="text-primary">(save ~17%)</span>
          </span>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLAN_ORDER.map((plan) => {
            const details = PLAN_DETAILS[plan];
            const price = annual ? details.annualUsd : details.monthlyUsd;
            const isAgency = plan === "agency";
            return (
              <Card key={plan} className={isAgency ? "border-primary shadow-md" : "border-slate-200"}>
                <CardContent className="pt-6 flex flex-col h-full">
                  <h3 className="font-semibold">{details.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 min-h-[2.5rem]">{details.description}</p>
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold">${price}</span>
                    <span className="text-sm text-slate-400">
                      {price === 0 ? "" : annual ? "/yr" : "/mo"}
                    </span>
                  </div>
                  <ul className="mt-5 space-y-2.5 flex-1">
                    {PLAN_FEATURES[plan].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="mt-6" variant={isAgency ? "default" : "outline"}>
                    <Link href="/signup">{plan === "free" ? "Create free account" : "Get started"}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          Storage limits: Free {formatStorage(PLAN_LIMITS.free.fileStorageMB)} · Starter{" "}
          {formatStorage(PLAN_LIMITS.starter.fileStorageMB)} · Pro {formatStorage(PLAN_LIMITS.pro.fileStorageMB)} · Agency{" "}
          {formatStorage(PLAN_LIMITS.agency.fileStorageMB)}
        </p>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-slate-50/60">
        <div className="max-w-site mx-auto px-6 py-20 max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold text-center">Questions worth answering up front.</h2>
          <div className="mt-10 space-y-3">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group rounded-lg border border-slate-200 bg-white px-5 py-4">
                <summary className="cursor-pointer list-none flex items-center justify-between font-semibold text-sm">
                  {q}
                  <span className="text-slate-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="mt-2.5 text-sm text-slate-500">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────── */}
      <section className="max-w-site mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-3xl font-extrabold">Ready to get your client work out of spreadsheets?</h2>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Create free account</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="https://bluuhq.com/contact">Talk to us</Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-slate-900 text-slate-400 py-10">
        <div className="max-w-site mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 font-extrabold text-white">
            Bluu<span className="text-primary">HQ</span>
            <span className="text-slate-500 font-medium text-sm ml-1">/ crm</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="https://bluuhq.com" className="hover:text-white transition-colors">bluuhq.com</Link>
            <Link href="https://scan.bluuhq.com" className="hover:text-white transition-colors">BluuAudit</Link>
            <Link href="/affiliate-register" className="hover:text-white transition-colors">Become an affiliate</Link>
          </div>
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} BluuHQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
