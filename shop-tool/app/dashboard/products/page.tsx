import Link from "next/link";
import { getMyShop } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProductRow from "@/components/dashboard/product-row";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

export default async function ProductsPage() {
  const shop = await getMyShop();
  if (!shop) return null; // layout already redirects

  const supabase = createSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", shop.id)
    .order("sort_order");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink">Products</h1>
        <Button asChild size="sm">
          <Link href="/dashboard/products/new">+ Add product</Link>
        </Button>
      </div>

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
