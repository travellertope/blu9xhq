"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[GlobalError]", error);
    }
  }, [error]);

  const router = useRouter();
  const isPortal =
    typeof window !== "undefined" && window.location.pathname.startsWith("/portal");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="text-amber-400" size={48} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-slate-500 mb-6">
          Our team has been notified. You can try again or head back to the dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={reset}>
            Try again
          </Button>
          <Button onClick={() => router.push(isPortal ? "/portal" : "/admin")}>
            Go to Dashboard
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && error?.message && (
          <p className="mt-6 text-xs text-slate-400 font-mono bg-slate-100 rounded p-3 text-left break-all">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
