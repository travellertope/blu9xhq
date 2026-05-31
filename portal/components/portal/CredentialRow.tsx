"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

interface Props {
  label: string;
  subscriptionId: number;
  fieldIndex: number;
}

const CLEAR_AFTER_MS = 30_000;

export default function CredentialRow({ label, subscriptionId, fieldIndex }: Props) {
  const [value, setValue] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function clearValue() {
    setValue(null);
    setSecondsLeft(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countRef.current) clearInterval(countRef.current);
  }

  useEffect(() => () => clearValue(), []);

  async function fetchValue(action: "reveal" | "copy") {
    setError(null);
    if (action === "reveal") setRevealing(true);
    else setCopying(true);

    try {
      const res = await fetch(`/api/portal/credentials/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId, fieldIndex }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed");
        return;
      }

      if (action === "copy") {
        await navigator.clipboard.writeText(data.value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        clearValue();
        setValue(data.value);
        setSecondsLeft(Math.ceil(CLEAR_AFTER_MS / 1000));

        timerRef.current = setTimeout(clearValue, CLEAR_AFTER_MS);
        countRef.current = setInterval(() => {
          setSecondsLeft((s) => {
            if (s <= 1) {
              if (countRef.current) clearInterval(countRef.current);
              return 0;
            }
            return s - 1;
          });
        }, 1000);
      }
    } catch {
      setError("Network error");
    } finally {
      setRevealing(false);
      setCopying(false);
    }
  }

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0 gap-3">
      <span className="text-sm font-medium text-muted-foreground w-36 shrink-0">{label}</span>

      <div className="flex-1 font-mono text-sm truncate">
        {value ? (
          <span>
            {value}
            {secondsLeft > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({secondsLeft}s)</span>
            )}
          </span>
        ) : (
          <span className="text-muted-foreground tracking-widest">••••••••</span>
        )}
      </div>

      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => (value ? clearValue() : fetchValue("reveal"))}
          disabled={revealing}
          aria-label={value ? "Hide" : "Reveal"}
          className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-50"
        >
          {value ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button
          onClick={() => fetchValue("copy")}
          disabled={copying}
          aria-label="Copy to clipboard"
          className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-50"
        >
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
        </button>
      </div>

      {error && (
        <span className="text-xs text-destructive ml-2 shrink-0">{error}</span>
      )}
    </div>
  );
}
