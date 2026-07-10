"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff, Copy, Loader2 } from "lucide-react";

interface CredentialRowProps {
  subscriptionId: number;
  fieldLabel: string;
}

const REVEAL_TIMEOUT = 30; // seconds

export default function CredentialRow({
  subscriptionId,
  fieldLabel,
}: CredentialRowProps) {
  const [revealedValue, setRevealedValue] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [revealLoading, setRevealLoading] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCountdown() {
    setCountdown(REVEAL_TIMEOUT);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setRevealedValue(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function hideValue() {
    if (timerRef.current) clearInterval(timerRef.current);
    setRevealedValue(null);
    setCountdown(0);
  }

  async function handleReveal() {
    setRevealLoading(true);
    try {
      const res = await fetch("/api/portal/credentials/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId, fieldLabel }),
      });
      if (res.status === 429) {
        toast.error("Please wait before revealing again");
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(data.error ?? "Failed to reveal credential");
        return;
      }
      const data = (await res.json()) as { value: string };
      setRevealedValue(data.value);
      if (timerRef.current) clearInterval(timerRef.current);
      startCountdown();
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setRevealLoading(false);
    }
  }

  async function handleCopy() {
    setCopyLoading(true);
    try {
      const res = await fetch("/api/portal/credentials/copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId, fieldLabel }),
      });
      if (res.status === 429) {
        toast.error("Please wait before copying again");
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(data.error ?? "Failed to copy credential");
        return;
      }
      const data = (await res.json()) as { value: string };

      // Try Clipboard API first, fallback to execCommand
      try {
        await navigator.clipboard.writeText(data.value);
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = data.value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setCopyLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-md bg-slate-50 border border-slate-100">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 mb-0.5">{fieldLabel}</p>
        <div className="font-mono text-sm text-slate-800 truncate">
          {revealedValue ? (
            <span className="break-all">{revealedValue}</span>
          ) : (
            <span className="tracking-widest text-slate-400">••••••••••••</span>
          )}
        </div>
        {countdown > 0 && (
          <p className="text-xs text-amber-600 mt-0.5">
            Hiding in {countdown}s
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {revealedValue ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-slate-500"
            onClick={hideValue}
          >
            <EyeOff className="h-3.5 w-3.5 mr-1" />
            Hide
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={handleReveal}
            disabled={revealLoading}
          >
            {revealLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 mr-1" />
                Reveal
              </>
            )}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={handleCopy}
          disabled={copyLoading}
        >
          {copyLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
