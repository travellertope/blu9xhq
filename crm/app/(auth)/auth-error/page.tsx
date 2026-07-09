"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const message =
    error === "CredentialsSignin"
      ? "Incorrect email or password."
      : error === "SessionRequired"
      ? "You need to sign in to access that page."
      : "Authentication failed. Please try again.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8 border rounded-lg shadow-sm text-center">
        <div className="space-y-1">
          <h1 className="text-xl font-bold">Sign-in error</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <div className="flex flex-col gap-2">
          <a
            href="/portal-login"
            className="w-full bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium"
          >
            Back to client portal
          </a>
          <a
            href="/admin-login"
            className="w-full border rounded px-4 py-2 text-sm font-medium text-muted-foreground"
          >
            Admin login
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
