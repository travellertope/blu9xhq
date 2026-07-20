"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Shop } from "@/types";

export default function SettingsForm({ shop }: { shop: Shop }) {
  const router = useRouter();
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
      <h1 className="text-lg font-bold text-ink">Shop settings</h1>

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
