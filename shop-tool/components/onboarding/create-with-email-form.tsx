"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import VerifyCodeForm from "@/components/onboarding/verify-code-form";

/**
 * Shop details + email in one step, for a visitor who isn't signed in yet.
 * The shop name/WhatsApp number ride along as Supabase auth user_metadata
 * on signInWithOtp, so completing sign-in (link or code) can create the
 * shop immediately — no separate "finish setting up" step.
 */
export default function CreateWithEmailForm({ referralCode }: { referralCode?: string }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slugEdited) setSlug(toSlug(name));
  }, [name, slugEdited]);

  async function sendCode() {
    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          pending_shop_name: name,
          pending_shop_slug: slug,
          pending_whatsapp_number: whatsapp,
          ...(referralCode ? { pending_referral_code: referralCode } : {}),
        },
      },
    });
    return { error: signInError?.message };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await sendCode();

    setLoading(false);
    if (signInError) {
      setError(signInError);
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-bg-soft flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center font-extrabold text-lg">
          Bluu<span className="text-blue">Shop</span>
        </div>

        <Card>
          <CardContent className="p-6 space-y-5">
            {sent ? (
              <VerifyCodeForm email={email} onResend={sendCode} />
            ) : (
              <>
                <div className="space-y-1">
                  <h1 className="text-xl font-bold text-ink">Create your free shop</h1>
                  <p className="text-sm text-ink-soft">Free forever. No credit card required.</p>
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

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@business.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending…" : "Create free shop"}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        {!sent && (
          <p className="text-center text-sm text-ink-soft">
            Already have a shop? <a href="/login" className="text-blue font-medium hover:underline">Log in</a>
          </p>
        )}
      </div>
    </div>
  );
}
