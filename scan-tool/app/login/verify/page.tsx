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
  const [error, setError] = useState(false);

  useEffect(() => {
    const email = params.get("email");
    const token = params.get("token");
    if (!email || !token) {
      setError(true);
      return;
    }

    signIn("magic-link", { email, token, redirect: false }).then((res) => {
      if (res?.ok) {
        router.push("/dashboard");
      } else {
        setError(true);
      }
    });
  }, [params, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-ink font-semibold mb-2">That link is invalid or expired.</p>
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
