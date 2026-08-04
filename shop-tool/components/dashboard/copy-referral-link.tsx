"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CopyReferralLink({ link, code }: { link: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — the link is
      // still visible in the input below for a manual copy.
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center rounded-md border border-input bg-background">
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="flex-1 bg-transparent px-3 py-2 text-sm outline-none min-w-0 text-ink"
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleCopy}
          className="shrink-0 mr-1"
        >
          {copied ? "Copied ✓" : "Copy"}
        </Button>
      </div>
      <p className="text-xs text-ink-soft">Your code: {code}</p>
    </div>
  );
}
