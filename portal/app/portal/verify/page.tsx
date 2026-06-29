"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      return;
    }

    signIn("magic-link", { email, token, redirect: false })
      .then(async (result) => {
        if (!result?.ok || result.error) {
          setErrorMessage(
            result?.error === "CredentialsSignin"
              ? "This link has expired or is invalid."
              : `Sign-in failed (${result?.error || "unknown error"}).`
          );
          setStatus("error");
          return;
        }

        // signIn() resolving "ok" only means the credentials were accepted —
        // it doesn't guarantee the session cookie was actually stored by the
        // browser (e.g. cookie domain/secure mismatches). Confirm a session
        // exists before navigating into the middleware-protected portal,
        // otherwise the user gets silently bounced back to /portal-login
        // with no explanation.
        const session = await fetch("/api/auth/session").then((r) => r.json());
        if (!session?.user) {
          setErrorMessage("Signed in, but the session didn't persist. Check that cookies are enabled and try again.");
          setStatus("error");
          return;
        }

        setStatus("success");
        try {
          const me = await fetch("/api/portal/me").then((r) => r.json());
          router.replace(me.setupComplete === false ? "/portal/setup" : "/portal");
        } catch {
          router.replace("/portal");
        }
      })
      .catch(() => {
        setErrorMessage("Something went wrong while signing you in.");
        setStatus("error");
      });
  }, [token, email, router]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-[#1875F2] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Verifying your link…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <div className="text-center space-y-4 max-w-sm p-8">
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-600 text-xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Link Expired</h1>
          <p className="text-slate-500 text-sm">
            {errorMessage ?? "This link has expired or is invalid. Request a new one from the login page."}
          </p>
          <Link
            href="/portal-login"
            className="inline-block bg-[#1875F2] hover:bg-[#1461CE] text-white rounded-md px-6 py-2 text-sm font-medium transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
      <div className="text-center space-y-4">
        <div className="h-10 w-10 border-4 border-[#1875F2] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-600 font-medium">Signing you in…</p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
          <div className="h-10 w-10 border-4 border-[#1875F2] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
