"use client";

import { useBluuSession } from "@/hooks/useBluuSession";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy, ExternalLink } from "lucide-react";

const PRODUCTS = [
  { id: "scan",    label: "BluuAudit",               base: "https://bluuhq.com/audit" },
  { id: "portal",  label: "BluuCRM (Client Portal)", base: "https://crm.bluuhq.com/signup" },
  { id: "shop",    label: "BluuShop",                base: "https://bluuhq.com/shop" },
  { id: "main",    label: "bluuhq.com (all products)", base: "https://bluuhq.com" },
  { id: "hosting", label: "Hosting & Management",   base: "https://bluuhq.com/hosting" },
  { id: "content", label: "Content Operations",     base: "https://bluuhq.com/what-we-produce" },
  { id: "web",     label: "Web / Mobile Dev",       base: "https://bluuhq.com/web-development" },
  { id: "ai",      label: "AI Systems Integration", base: "https://bluuhq.com/ai-integration" },
];

function CopyableLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => undefined);
  }

  return (
    <div className="flex items-center gap-2 bg-slate-50 border rounded-lg px-3 py-2">
      <span className="flex-1 text-sm font-mono text-slate-700 truncate">{url}</span>
      <button
        onClick={copy}
        className="shrink-0 flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied!" : "Copy"}
      </button>
      <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-slate-400 hover:text-blue-600 transition-colors">
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

export default function LinksPage() {
  const { user: session } = useBluuSession();
  const affiliateCode = (session as any)?.affiliateCode ?? "";

  const links = PRODUCTS.map((p) => ({
    ...p,
    url: affiliateCode ? `${p.base}?ref=${affiliateCode}` : p.base,
  }));

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Referral links</h1>
        <p className="text-sm text-slate-500 mt-1">Share these links — anyone who signs up within 60 days is credited to you.</p>
      </div>

      {!affiliateCode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
          Your affiliate code is being set up. Links will appear here shortly.
        </div>
      )}

      {/* Affiliate code chip */}
      {affiliateCode && (
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <p className="text-xs text-blue-500 font-medium">Your code</p>
            <p className="text-lg font-bold text-blue-800 tracking-widest">{affiliateCode}</p>
          </div>
          <p className="text-sm text-slate-500">
            You can also add <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">?ref={affiliateCode}</code> to any Bluu URL manually.
          </p>
        </div>
      )}

      {/* Links by product */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Links by product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {links.map((link) => (
            <div key={link.id}>
              <p className="text-sm font-medium text-slate-700 mb-1.5">{link.label}</p>
              <CopyableLink url={link.url} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sharing tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {[
              "BluuAudit is the easiest first share — it's free to try and self-serve.",
              "For services (web dev, AI integration), a warm intro email converts far better than a cold link.",
              "Add your referral link to your email signature for passive, ongoing traffic.",
              "Share your link in the bio of any social profiles where you discuss business or marketing.",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="mt-0.5 text-blue-400 shrink-0">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
