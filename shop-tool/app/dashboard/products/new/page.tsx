import { getMyShop } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import NewProductForm from "@/components/dashboard/new-product-form";
import type { Category } from "@/types";

export default async function NewProductPage() {
  const shop = await getMyShop();
  if (!shop) return null;

  const supabase = createSupabaseServerClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("shop_id", shop.id)
    .order("sort_order");

  return <NewProductForm categories={(categories ?? []) as Category[]} />;
}
