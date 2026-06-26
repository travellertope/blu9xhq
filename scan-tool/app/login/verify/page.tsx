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

    signIn("magic-link", { email, token, redirect: false }).then(async (res) => {
      if (!res?.ok) {
        setError(
          res?.error === "CredentialsSignin"
            ? "That link is invalid or expired."
            : `Sign-in failed (${res?.error || "unknown error"}).`
        );
        return;
      }

      // signIn() resolving "ok" only means the credentials were accepted —
      // it doesn't guarantee the session cookie was actually stored by the
      // browser (e.g. cookie domain/secure mismatches). Confirm a session
      // exists before navigating into the middleware-protected dashboard,
      // otherwise the user gets silently bounced back to /login with no
      // explanation.
      const session = await fetch("/api/auth/session").then((r) => r.json());
      if (!session?.user) {
        setError("Signed in, but the session didn't persist. Check that cookies are enabled and try again.");
        return;
      }

      router.push("/dashboard");
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
