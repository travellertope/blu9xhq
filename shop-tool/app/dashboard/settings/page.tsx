import Link from "next/link";
import { getMyShop } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SettingsForm from "@/components/dashboard/settings-form";
import DeliveryZonesManager from "@/components/dashboard/delivery-zones-manager";
import ReviewsManager from "@/components/dashboard/reviews-manager";
import type { DeliveryZone, ShopReview } from "@/types";

export default async function SettingsPage() {
  const shop = await getMyShop();
  if (!shop) return null;

  const supabase = createSupabaseServerClient();
  const [{ data: zones }, { data: reviews }] = await Promise.all([
    supabase.from("delivery_zones").select("*").eq("shop_id", shop.id).order("sort_order"),
    supabase.from("shop_reviews").select("*").eq("shop_id", shop.id).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="max-w-sm mx-auto pb-8">
      <Link
        href="/dashboard/referrals"
        className="flex items-center justify-between bg-blue-soft border border-blue/20 rounded-lg p-4 mb-5 text-sm font-semibold text-blue"
      >
        Refer a shop, earn free Starter →
      </Link>
      <SettingsForm shop={shop} />
      <div className="mt-5">
        <DeliveryZonesManager currency={shop.currency} initialZones={(zones ?? []) as DeliveryZone[]} />
      </div>
      <div className="mt-5">
        <ReviewsManager initialReviews={(reviews ?? []) as ShopReview[]} />
      </div>
    </div>
  );
}
