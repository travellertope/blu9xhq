"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const HOSTNAME_RE = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

const schema = z.object({
  logoUrl:      z.string().url("Enter a valid URL").optional().or(z.literal("")),
  accentColour: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a 6-digit hex colour"),
  customDomain: z.string().regex(HOSTNAME_RE, "Enter a valid domain, e.g. crm.yourcompany.com").optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

export default function BrandingPage() {
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("#2F5FE0");

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { logoUrl: "", accentColour: "#2F5FE0", customDomain: "" },
  });

  const watchedAccent = watch("accentColour");
  useEffect(() => {
    if (/^#[0-9a-fA-F]{6}$/.test(watchedAccent ?? "")) setPreview(watchedAccent!);
  }, [watchedAccent]);

  useEffect(() => {
    fetch("/api/admin/settings/branding")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) {
          reset({ logoUrl: d.logoUrl ?? "", accentColour: d.accentColour ?? "#2F5FE0", customDomain: d.customDomain ?? "" });
          setPreview(d.accentColour ?? "#2F5FE0");
        }
      })
      .catch(() => undefined);
  }, [reset]);

  async function onSubmit(data: FormData) {
    setLoading(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoUrl:      data.logoUrl || null,
          accentColour: data.accentColour,
          customDomain: data.customDomain || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((body as { error?: string }).error ?? "Save failed");
      setSaved(true);
      // Reload to apply new branding in the sidebar
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Branding</h1>
        <p className="text-sm text-slate-500 mt-1">Customise your logo and accent colour. Changes appear immediately in the sidebar.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>White-label settings</CardTitle>
          <CardDescription>Visible to your team inside the CRM admin.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-lg">{error}</div>
          )}
          {saved && (
            <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 px-3 py-2.5 rounded-lg">Branding saved — reloading…</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="logoUrl">Logo URL <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Input
                id="logoUrl"
                {...register("logoUrl")}
                type="url"
                placeholder="https://yoursite.com/logo.png"
              />
              <p className="text-xs text-slate-400">Use a PNG or SVG. Ideal size: 220 × 60 px.</p>
              {errors.logoUrl && <p className="text-xs text-destructive">{errors.logoUrl.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="accentColour">Accent colour</Label>
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-md border shrink-0"
                  style={{ backgroundColor: preview }}
                />
                <Input
                  id="accentColour"
                  {...register("accentColour")}
                  placeholder="#2F5FE0"
                  className="font-mono max-w-[160px]"
                  maxLength={7}
                />
              </div>
              <p className="text-xs text-slate-400">Used for active nav items and buttons.</p>
              {errors.accentColour && <p className="text-xs text-destructive">{errors.accentColour.message}</p>}
            </div>

            <Button type="submit" disabled={loading} style={{ backgroundColor: preview }}>
              {loading ? "Saving…" : "Save branding"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
