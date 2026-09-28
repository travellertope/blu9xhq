"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsTabBar } from "@/components/admin/SettingsTabBar";
import { planAllows, type TenantPlan } from "@/lib/planLimits";

const DEFAULT_PORTAL_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://portal.bluuhq.com";

const HOSTNAME_RE = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

const schema = z.object({
  logoUrl:      z.string().url("Enter a valid URL").optional().or(z.literal("")),
  accentColour: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a 6-digit hex colour"),
  customDomain: z.string().toLowerCase().regex(HOSTNAME_RE, "Enter a valid domain, e.g. portal.yourcompany.com").optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

export default function BrandingPage() {
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("#2F5FE0");
  const [portalUrl, setPortalUrl] = useState(`${DEFAULT_PORTAL_URL}/portal-login`);
  const [copied, setCopied] = useState(false);
  const [canWhiteLabel, setCanWhiteLabel] = useState(false);

  const colourPickerRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { logoUrl: "", accentColour: "#2F5FE0" },
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
          setCanWhiteLabel(planAllows(d.plan as TenantPlan, "whiteLabel"));
          if (d.customDomain) {
            setPortalUrl(`https://${d.customDomain}/portal-login`);
          }
        }
      })
      .catch(() => undefined);
  }, [reset]);

  function copyPortalLink() {
    navigator.clipboard.writeText(portalUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function onSubmit(data: FormData) {
    setLoading(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoUrl:      data.logoUrl || "",
          accentColour: data.accentColour,
          ...(canWhiteLabel ? { customDomain: data.customDomain || "" } : {}),
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
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure BluuHQ portal options</p>
      </div>

      <SettingsTabBar active="branding" />

      <div>
        <h2 className="text-lg font-semibold text-slate-900">Branding</h2>
        <p className="text-sm text-slate-500 mt-1">Customise your logo and accent colour. Changes appear immediately in the sidebar.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client portal link</CardTitle>
          <CardDescription>Share this URL with your clients so they can log in to their portal.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={portalUrl}
              className="flex-1 border border-slate-200 rounded-md px-3 py-2 text-sm bg-slate-50 text-slate-600 font-mono cursor-default select-all"
            />
            <button
              type="button"
              onClick={copyPortalLink}
              className="shrink-0 border border-slate-200 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 border border-slate-200 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Open ↗
            </a>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {!portalUrl.includes(DEFAULT_PORTAL_URL)
              ? "Using your custom domain."
              : canWhiteLabel
                ? "Set a custom domain in the White-label settings below to use your own branded URL."
                : "Upgrade to a paid plan to use your own custom domain."}
          </p>
        </CardContent>
      </Card>

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
                <button
                  type="button"
                  onClick={() => colourPickerRef.current?.click()}
                  className="h-9 w-9 rounded-md border shrink-0 cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-slate-300 transition-all"
                  style={{ backgroundColor: preview }}
                  title="Pick a colour"
                />
                <input
                  ref={colourPickerRef}
                  type="color"
                  value={preview}
                  onChange={(e) => {
                    setValue("accentColour", e.target.value, { shouldValidate: true });
                  }}
                  className="sr-only"
                  aria-hidden
                  tabIndex={-1}
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

            {canWhiteLabel && (
              <div className="space-y-1.5">
                <Label htmlFor="customDomain">Custom domain <span className="text-slate-400 font-normal">(optional)</span></Label>
                <Input
                  id="customDomain"
                  {...register("customDomain")}
                  type="text"
                  placeholder="portal.yourcompany.com"
                  className="font-mono"
                />
                <p className="text-xs text-slate-400">
                  Point a CNAME record for this domain to <span className="font-mono">portal.bluuhq.com</span>, then enter the domain here.
                </p>
                {errors.customDomain && <p className="text-xs text-destructive">{errors.customDomain.message}</p>}
              </div>
            )}

            <Button type="submit" disabled={loading} style={{ backgroundColor: preview }}>
              {loading ? "Saving…" : "Save branding"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
