import Link from "next/link";
import { getMyShop } from "@/lib/auth";
import { getPlanLimits, getEffectivePlan } from "@/lib/planLimits";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProductRow from "@/components/dashboard/product-row";
import CategoriesManager from "@/components/dashboard/categories-manager";
import { Button } from "@/components/ui/button";
import type { Category, Product } from "@/types";

export default async function ProductsPage() {
  const shop = await getMyShop();
  if (!shop) return null; // layout already redirects

  const supabase = createSupabaseServerClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("shop_id", shop.id).order("sort_order"),
    supabase.from("categories").select("*").eq("shop_id", shop.id).order("sort_order"),
  ]);

  const { maxProducts } = getPlanLimits(getEffectivePlan(shop));
  const productCount = products?.length ?? 0;
  const atLimit = productCount >= maxProducts;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-ink">Products</h1>
          {Number.isFinite(maxProducts) && (
            <p className="text-xs text-ink-soft">
              {productCount} / {maxProducts} used
            </p>
          )}
        </div>
        <Button asChild size="sm">
          <Link href={atLimit ? "/dashboard/billing" : "/dashboard/products/new"}>
            {atLimit ? "Upgrade to add more" : "+ Add product"}
          </Link>
        </Button>
      </div>

      <CategoriesManager initialCategories={(categories ?? []) as Category[]} />

      {!products || products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-ink-soft mb-4">No products yet — add your first one.</p>
          <Button asChild>
            <Link href="/dashboard/products/new">+ Add product</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(products as Product[]).map((product) => (
            <ProductRow key={product.id} product={product} currency={shop.currency} />
          ))}
        </div>
      )}
    </div>
  );
}
