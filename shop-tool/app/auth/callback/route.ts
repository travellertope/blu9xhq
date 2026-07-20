import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/utils";

/** Exchanges the magic-link code for a session, then routes based on onboarding state. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.exchangeCodeForSession(code);

  if (!data.user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: existingShop } = await supabase
    .from("shops")
    .select("slug")
    .eq("owner_user_id", data.user.id)
    .maybeSingle();

  if (existingShop) {
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // First sign-in from the /create form — the shop details rode along as
  // user_metadata on signInWithOtp. Create the shop now so there's no
  // separate "finish setting up" step after clicking the email link.
  const meta = data.user.user_metadata ?? {};
  const pendingName = typeof meta.pending_shop_name === "string" ? meta.pending_shop_name : "";
  const pendingWhatsapp =
    typeof meta.pending_whatsapp_number === "string" ? meta.pending_whatsapp_number : "";

  if (!pendingName || !pendingWhatsapp) {
    // Came in through plain /login with no shop yet — let them fill in details signed-in.
    return NextResponse.redirect(`${origin}/create`);
  }

  const baseSlug =
    typeof meta.pending_shop_slug === "string" && meta.pending_shop_slug
      ? meta.pending_shop_slug
      : toSlug(pendingName);

  for (const slug of [baseSlug, `${baseSlug}-${data.user.id.slice(0, 4)}`]) {
    const { error: insertError } = await supabase.from("shops").insert({
      owner_user_id: data.user.id,
      slug,
      name: pendingName,
      whatsapp_number: pendingWhatsapp,
    });

    if (!insertError) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
    // Unique-violation on slug — try the fallback with a short suffix; any
    // other error means something's actually wrong, so stop and let the
    // owner sort it out from the create form instead of looping forever.
    if (insertError.code !== "23505") break;
  }

  return NextResponse.redirect(`${origin}/create`);
}
