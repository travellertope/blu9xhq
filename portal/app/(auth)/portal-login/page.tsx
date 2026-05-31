"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const passwordSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
const magicSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
type PasswordFormData = z.infer<typeof passwordSchema>;
type MagicFormData = z.infer<typeof magicSchema>;

export default function PortalLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });
  const magicForm = useForm<MagicFormData>({
    resolver: zodResolver(magicSchema),
  });

  async function onPasswordSubmit(data: PasswordFormData) {
    setLoading(true);
    setError(null);
    const result = await signIn("client-credentials", {
      username: data.email,
      password: data.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.replace("/portal");
  }

  async function onMagicSubmit(data: MagicFormData) {
    setLoading(true);
    setError(null);
    const result = await signIn("email", {
      email: data.email,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Could not send magic link. Please try again.");
      return;
    }
    setMagicSent(true);
  }

  if (magicSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-sm text-center space-y-3 p-8">
          <h2 className="text-xl font-semibold">Check your inbox</h2>
          <p className="text-sm text-muted-foreground">
            We sent a secure login link to your email. The link expires in 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 p-8 border rounded-lg shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Client Portal</h1>
          <p className="text-sm text-muted-foreground">Sign in to your BluuHQ portal</p>
        </div>

        {/* Mode toggle */}
        <div className="flex border rounded overflow-hidden text-sm">
          <button
            onClick={() => setMode("password")}
            className={`flex-1 py-2 font-medium transition-colors ${
              mode === "password" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setMode("magic")}
            className={`flex-1 py-2 font-medium transition-colors ${
              mode === "magic" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            Magic Link
          </button>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {mode === "password" ? (
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input
                {...passwordForm.register("email")}
                type="email"
                className="w-full border rounded px-3 py-2 text-sm bg-background"
              />
              {passwordForm.formState.errors.email && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <input
                {...passwordForm.register("password")}
                type="password"
                className="w-full border rounded px-3 py-2 text-sm bg-background"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : (
          <form onSubmit={magicForm.handleSubmit(onMagicSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <input
                {...magicForm.register("email")}
                type="email"
                className="w-full border rounded px-3 py-2 text-sm bg-background"
              />
              {magicForm.formState.errors.email && (
                <p className="text-xs text-destructive">{magicForm.formState.errors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
