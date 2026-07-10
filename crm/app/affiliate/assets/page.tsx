"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { useBluuSession } from "@/hooks/useBluuSession";

function CopyBlock({ label, content }: { label: string; content: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => undefined);
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between bg-slate-50 border-b px-4 py-2">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-700 transition-colors font-medium"
        >
          {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="text-xs text-slate-700 p-4 whitespace-pre-wrap leading-relaxed overflow-x-auto bg-white">
        {content}
      </pre>
    </div>
  );
}

export default function AssetsPage() {
  const { user: session } = useBluuSession();
  const code = (session as any)?.affiliateCode ?? "YOURCODE";
  const link = `https://bluuhq.com/?ref=${code}`;
  const scanLink = `https://scan.bluuhq.com/?ref=${code}`;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Marketing assets</h1>
        <p className="text-sm text-slate-500 mt-1">Ready-to-use copy for email, social, and direct outreach. Just copy, personalise, and send.</p>
      </div>

      {/* Email copy */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Email copy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CopyBlock
            label="Cold intro — Scan Tool"
            content={`Subject: Have you checked how AI sees your brand?

Hey [Name],

Quick one — there's a free tool called the Bluu Scan Tool that checks how discoverable your brand is to AI models like ChatGPT and Perplexity.

Most businesses have no idea what AI says about them when people ask for recommendations. This tool shows you exactly where you stand.

Try it free here: ${scanLink}

[Your name]`}
          />
          <CopyBlock
            label="Warm intro — all Bluu services"
            content={`Subject: A team I've been referring clients to

Hey [Name],

I've been meaning to introduce you to the Bluu team. They do web development, hosting & management, content production, and AI systems integration — basically everything I can't handle myself.

I've found them to be the right fit for clients who need things done properly without the agency overhead.

Their site: ${link}

Happy to make a proper intro if it's useful.

[Your name]`}
          />
        </CardContent>
      </Card>

      {/* Social copy */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Social copy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CopyBlock
            label="LinkedIn — Scan Tool"
            content={`Most businesses have no idea how AI describes them when someone asks for a recommendation.

I ran my own brand through the Bluu Scan Tool and the results were eye-opening.

It checks how discoverable you are across AI models and tells you exactly what to fix.

Worth 2 minutes of your time: ${scanLink}

#AI #Marketing #BrandStrategy`}
          />
          <CopyBlock
            label="LinkedIn — general Bluu"
            content={`Looking for a team that actually delivers on web development, AI integration, and content?

I've been recommending Bluu to clients for a while now. They're the rare agency that can handle the full stack — from building your site to integrating AI into your existing systems.

→ ${link}

If you're currently weighing up who to work with for any of this, worth a look.`}
          />
          <CopyBlock
            label="Twitter / X — Scan Tool"
            content={`Just ran my brand through this AI visibility scanner

It tells you how AI models perceive and recommend you — most people are invisible and don't know it

Free scan here: ${scanLink}`}
          />
        </CardContent>
      </Card>

      {/* Key messages */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Key messages (mix and match)</CardTitle>
        </CardHeader>
        <CardContent>
          <CopyBlock
            label="Bullet points"
            content={`• The Bluu Scan Tool shows you how AI models like ChatGPT see your brand — and how to improve it
• Bluu builds websites and mobile apps that actually work for the business, not just look good
• Their hosting & management means your site is looked after by humans who understand it
• They integrate AI into existing business systems — without rebuilding from scratch
• Their content operations team produces everything: articles, social, email, video scripts

All at: ${link}`}
          />
        </CardContent>
      </Card>

      {/* Banner sizes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Banner assets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Banner images and branded visuals are coming soon. In the meantime, you can use the text assets above or{" "}
            <a href="mailto:hello@bluuhq.com" className="text-blue-600 hover:underline">
              email hello@bluuhq.com
            </a>{" "}
            to request custom assets.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
