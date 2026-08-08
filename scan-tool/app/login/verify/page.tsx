"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VerifyInner />
    </Suspense>
  );
}

function VerifyFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <p className="text-gray-500 text-sm">Signing you in…</p>
    </main>
  );
}

function VerifyInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const email = params.get("email");
    const token = params.get("token");
    if (!email || !token) {
      setError("This sign-in link is missing required information.");
      return;
    }

    signIn("magic-link", { email, token, redirect: false })
      .then(async (res) => {
        if (!res?.ok) {
          const reason = res?.error === "CredentialsSignin"
            ? "That link is invalid or expired."
            : `Sign-in failed (${res?.error || "unknown error"}).`;
          console.error("[verify] signIn failed:", res?.error, res?.status);
          setError(reason);
          return;
        }

        // Confirm the session cookie was actually stored before navigating —
        // signIn returning ok only means credentials were accepted, not that
        // the cookie persisted (domain/secure mismatches can silently drop it).
        let session: { user?: unknown } = {};
        try {
          session = await fetch("/api/auth/session", { credentials: "same-origin" }).then((r) => r.json());
        } catch (e) {
          console.error("[verify] session check threw:", e);
          setError("Could not confirm sign-in. Please try again.");
          return;
        }

        if (!session?.user) {
          console.error("[verify] session empty after signIn ok:", session);
          setError("Signed in, but the session didn't persist — check that cookies are enabled in your browser and try again.");
          return;
        }

        router.push("/dashboard");
      })
      .catch((e) => {
        console.error("[verify] signIn threw:", e);
        setError("Something went wrong during sign-in. Please try again.");
      });
  }, [params, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-ink font-semibold mb-2">{error}</p>
            <a href="/login" className="text-blue-600 text-sm font-medium">
              Request a new sign-in link →
            </a>
          </>
        ) : (
          <p className="text-gray-500 text-sm">Signing you in…</p>
        )}
      </div>
    </main>
  );
}
