"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

/** For a signed-in user who hasn't finished creating a shop yet. */
export default function CreateShopForm({ referralCode }: { referralCode?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slugEdited) setSlug(toSlug(name));
  }, [name, slugEdited]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, whatsapp_number: whatsapp, referral_code: referralCode }),
    });

    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Couldn't create your shop — try again.");
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <div className="min-h-screen bg-bg-soft flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center font-extrabold text-lg">
          Bluu<span className="text-blue">Shop</span>
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-ink">One more step</h1>
              <p className="text-sm text-ink-soft">Tell us about your shop.</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Shop name</Label>
                <Input
                  id="name"
                  placeholder="Ada's Fashion House"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">Your shop link</Label>
                <div className="flex items-center rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                  <span className="pl-3 text-sm text-ink-soft shrink-0">shop.bluuhq.com/</span>
                  <input
                    id="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlugEdited(true);
                      setSlug(toSlug(e.target.value) || toSlug(name));
                    }}
                    className="flex-1 bg-transparent px-2 py-2 text-sm outline-none min-w-0"
                    placeholder="adas-fashion-house"
                    required
                    pattern="[a-z0-9][a-z0-9\-]{0,38}[a-z0-9]?"
                    title="Lowercase letters, numbers and hyphens only"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="whatsapp">WhatsApp number</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  placeholder="+2348012345678"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                />
                <p className="text-xs text-ink-soft">Include your country code — this is where orders land.</p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating…" : "Create free shop"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
