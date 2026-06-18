"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-extrabold text-ink mb-2">Sign in</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter the email you used for your scan and we&apos;ll send you a sign-in link.
        </p>

        {status === "sent" ? (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
            Check your inbox — we sent a sign-in link to {email}.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-lg bg-blue-600 text-white py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send sign-in link"}
            </button>
            {status === "error" && (
              <p className="text-sm text-red-600">Something went wrong. Try again.</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
