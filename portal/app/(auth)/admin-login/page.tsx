"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Suspense } from "react";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const [error, setError] = useState<string | null>(
    callbackError === "CredentialsSignin"
      ? "Login failed — check your WordPress username and password."
      : callbackError
      ? `Auth error: ${callbackError}`
      : null
  );
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    setDebugInfo(null);

    const result = await signIn("admin-credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
    });

    setLoading(false);

    if (!result) {
      setError("No response from auth server — check NEXTAUTH_SECRET is set.");
      return;
    }

    if (result.error) {
      // Show the raw error code so we can diagnose
      setError(`Sign-in failed (${result.error}). Check your WordPress credentials and that the BluuHQ plugin is active.`);
      setDebugInfo(`Status: ${result.status} | Error: ${result.error} | URL: ${result.url ?? "—"}`);
      return;
    }

    router.replace("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8 border rounded-lg shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">BluuHQ Admin</h1>
          <p className="text-sm text-muted-foreground">Sign in with your WordPress admin account</p>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded space-y-1">
            <p>{error}</p>
            {debugInfo && (
              <p className="text-xs font-mono opacity-70">{debugInfo}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Username</label>
            <input
              {...register("username")}
              className="w-full border rounded px-3 py-2 text-sm bg-background"
              autoComplete="username"
            />
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              {...register("password")}
              type="password"
              className="w-full border rounded px-3 py-2 text-sm bg-background"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Client?{" "}
          <a href="/portal-login" className="underline">
            Go to client portal
          </a>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
