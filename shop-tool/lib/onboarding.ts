import type { SupabaseClient, User } from "@supabase/supabase-js";
import { toSlug } from "@/lib/utils";
import type { Database } from "@/types/supabase";

/**
 * Shared by the magic-link callback and the OTP-code verification path —
 * whichever way someone completes sign-in, the outcome should be the same.
 *
 * If the user already has a shop, does nothing. Otherwise, looks for the
 * pending_shop_name/pending_whatsapp_number stashed as user_metadata by
 * /create's signInWithOtp call and creates the shop from it, so there's no
 * separate "finish setting up" step after verifying.
 */
export async function completePendingShopSetup(
  supabase: SupabaseClient<Database>,
  user: User
): Promise<{ redirectTo: "/dashboard" | "/create" }> {
  const { data: existingShop } = await supabase
    .from("shops")
    .select("slug")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (existingShop) {
    return { redirectTo: "/dashboard" };
  }

  const meta = user.user_metadata ?? {};
  const pendingName = typeof meta.pending_shop_name === "string" ? meta.pending_shop_name : "";
  const pendingWhatsapp =
    typeof meta.pending_whatsapp_number === "string" ? meta.pending_whatsapp_number : "";

  if (!pendingName || !pendingWhatsapp) {
    // No stashed details — came in through plain /login with no shop yet.
    return { redirectTo: "/create" };
  }

  const baseSlug =
    typeof meta.pending_shop_slug === "string" && meta.pending_shop_slug
      ? meta.pending_shop_slug
      : toSlug(pendingName);

  for (const slug of [baseSlug, `${baseSlug}-${user.id.slice(0, 4)}`]) {
    const { error: insertError } = await supabase.from("shops").insert({
      owner_user_id: user.id,
      slug,
      name: pendingName,
      whatsapp_number: pendingWhatsapp,
    });

    if (!insertError) return { redirectTo: "/dashboard" };
    // Unique-violation on slug — retry once with a short suffix; any other
    // error means something's actually wrong, so stop rather than loop.
    if (insertError.code !== "23505") break;
  }

  return { redirectTo: "/create" };
}
