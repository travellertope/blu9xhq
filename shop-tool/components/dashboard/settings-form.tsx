"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { THEMES, FONT_PAIRINGS, type ShopThemeId } from "@/lib/theme";
import { getPlanLimits } from "@/lib/planLimits";
import ThemeThumbnail from "@/components/dashboard/theme-thumbnail";
import type { Shop } from "@/types";

export default function SettingsForm({ shop }: { shop: Shop }) {
  const router = useRouter();
  const limits = getPlanLimits(shop.plan);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(shop.name);
  const [tagline, setTagline] = useState(shop.tagline ?? "");
  const [whatsapp, setWhatsapp] = useState(shop.whatsapp_number);
  const [currency, setCurrency] = useState(shop.currency);
  const [deliveryInfo, setDeliveryInfo] = useState(shop.delivery_info ?? "");
  const [instagramUrl, setInstagramUrl] = useState(shop.instagram_url ?? "");
  const [tiktokUrl, setTiktokUrl] = useState(shop.tiktok_url ?? "");
  const [facebookUrl, setFacebookUrl] = useState(shop.facebook_url ?? "");
  const [xUrl, setXUrl] = useState(shop.x_url ?? "");
  const [themeId, setThemeId] = useState<ShopThemeId>((shop.theme_id as ShopThemeId) || "minimal");
  const [accentColor, setAccentColor] = useState(shop.accent_color ?? "");
  const [fontId, setFontId] = useState(shop.font_id || "inter");
  const [customDomain, setCustomDomain] = useState(shop.custom_domain ?? "");
  const [logoUrl, setLogoUrl] = useState(shop.logo_url);
  const [coverUrl, setCoverUrl] = useState(shop.cover_url);
  const [uploadingKind, setUploadingKind] = useState<"logo" | "cover" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleImageUpload(kind: "logo" | "cover", file: File) {
    setUploadingKind(kind);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", kind);
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      if (!res.ok) throw new Error("Photo upload failed");
      const body = await res.json();
      if (kind === "logo") setLogoUrl(body.url);
      else setCoverUrl(body.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setUploadingKind(null);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/shops", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tagline: tagline || null,
          whatsapp_number: whatsapp,
          currency,
          delivery_info: deliveryInfo || null,
          logo_url: logoUrl,
          cover_url: coverUrl,
          instagram_url: instagramUrl || null,
          tiktok_url: tiktokUrl || null,
          facebook_url: facebookUrl || null,
          x_url: xUrl || null,
          theme_id: themeId,
          accent_color: accentColor || null,
          font_id: fontId,
          custom_domain: limits.customDomain ? customDomain.trim().toLowerCase() || null : undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Couldn't save changes");
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="max-w-sm mx-auto space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink">Shop settings</h1>
        <a href="/dashboard/billing" className="text-sm font-semibold text-blue hover:underline">
          Billing →
        </a>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {saved && (
        <div className="rounded-lg bg-green/10 border border-green/20 px-4 py-3 text-sm text-green">Saved.</div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Logo</Label>
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="mt-1.5 w-full aspect-square rounded-full border-2 border-dashed border-line bg-white flex items-center justify-center overflow-hidden relative"
            >
              {logoUrl ? (
                <Image src={logoUrl} alt="" fill className="object-cover" sizes="100px" />
              ) : (
                <span className="text-ink-soft text-xs">{uploadingKind === "logo" ? "…" : "Add"}</span>
              )}
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload("logo", e.target.files[0])}
            />
          </div>
          <div>
            <Label>Cover photo</Label>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="mt-1.5 w-full aspect-square rounded-site border-2 border-dashed border-line bg-white flex items-center justify-center overflow-hidden relative"
            >
              {coverUrl ? (
                <Image src={coverUrl} alt="" fill className="object-cover" sizes="100px" />
              ) : (
                <span className="text-ink-soft text-xs">{uploadingKind === "cover" ? "…" : "Add"}</span>
              )}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload("cover", e.target.files[0])}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Shop name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Optional" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp number</Label>
          <Input id="whatsapp" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency code</Label>
          <Input
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            maxLength={3}
            placeholder="NGN"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="delivery">Delivery / pickup info</Label>
          <textarea
            id="delivery"
            value={deliveryInfo}
            onChange={(e) => setDeliveryInfo(e.target.value)}
            rows={3}
            placeholder="e.g. Free pickup in Lekki, delivery ₦2,000 within Lagos"
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-3 pt-2 border-t border-line">
          <Label>Social links</Label>
          <Input
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            type="url"
            placeholder="Instagram URL"
          />
          <Input
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            type="url"
            placeholder="TikTok URL"
          />
          <Input
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            type="url"
            placeholder="Facebook URL"
          />
          <Input value={xUrl} onChange={(e) => setXUrl(e.target.value)} type="url" placeholder="X (Twitter) URL" />
        </div>

        <div className="space-y-3 pt-2 border-t border-line">
          <div className="flex items-center justify-between">
            <Label>Storefront look</Label>
            {(!limits.customBranding || limits.themes.length < THEMES.length) && (
              <a href="/dashboard/billing" className="text-xs font-semibold text-blue hover:underline">
                Upgrade to unlock all
              </a>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-ink-soft">Layout theme</p>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map((t) => {
                const locked = !limits.themes.includes(t.id);
                return (
                  <button
                    type="button"
                    key={t.id}
                    disabled={locked}
                    onClick={() => setThemeId(t.id)}
                    className={`text-left rounded-md border p-2 space-y-1.5 ${
                      locked
                        ? "border-line opacity-50 cursor-not-allowed"
                        : themeId === t.id
                          ? "border-blue bg-blue-soft"
                          : "border-line"
                    }`}
                  >
                    <ThemeThumbnail themeId={t.id} />
                    <div>
                      <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
                        {t.label}
                        {locked && (
                          <span className="text-[9px] font-bold uppercase tracking-wide text-blue bg-blue-soft rounded-full px-1.5 py-0.5">
                            Starter+
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-ink-soft leading-snug">{t.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-ink-soft">
              Accent color {!limits.customBranding && <span className="text-blue">— Starter+</span>}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor || "#2F5FE0"}
                onChange={(e) => setAccentColor(e.target.value)}
                disabled={!limits.customBranding}
                className="h-9 w-12 rounded border border-line cursor-pointer bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Accent color"
              />
              <Input
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                disabled={!limits.customBranding}
                placeholder="#2F5FE0 (default)"
                className="flex-1"
              />
              {accentColor && limits.customBranding && (
                <button
                  type="button"
                  onClick={() => setAccentColor("")}
                  className="text-xs text-ink-soft shrink-0"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-ink-soft">
              Font pairing {!limits.customBranding && <span className="text-blue">— Starter+</span>}
            </p>
            <select
              value={fontId}
              onChange={(e) => setFontId(e.target.value)}
              disabled={!limits.customBranding}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {Object.entries(FONT_PAIRINGS).map(([id, pairing]) => (
                <option key={id} value={id}>
                  {pairing.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-line">
          <Label>
            Custom domain {!limits.customDomain && <span className="text-blue">— Starter+</span>}
          </Label>
          <Input
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            disabled={!limits.customDomain}
            placeholder="shop.yourbusiness.com"
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-ink-soft">
            Point your domain&apos;s CNAME at shop.bluuhq.com, then enter it here. It can take a few
            minutes to start working after saving.
          </p>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <button onClick={handleSignOut} className="w-full text-center text-sm text-ink-soft py-2">
        Sign out
      </button>
    </div>
  );
}
