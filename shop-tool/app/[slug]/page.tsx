import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AnalyticsTracker from "@/components/analytics-tracker";
import CartDrawer from "@/components/cart-drawer";
import StorefrontContent from "@/components/storefront/storefront-content";
import type { Category, Product, Shop } from "@/types";

async function getShopData(slug: string) {
  const supabase = createSupabaseServerClient();

  const { data: shop } = await supabase.from("shops").select("*").eq("slug", slug).eq("active", true).maybeSingle();

  if (!shop) return null;

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").eq("shop_id", shop.id).order("sort_order"),
    supabase
      .from("products")
      .select("*")
      .eq("shop_id", shop.id)
      .eq("active", true)
      .order("sort_order"),
  ]);

  return {
    shop: shop as Shop,
    categories: (categories ?? []) as Category[],
    products: (products ?? []) as Product[],
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getShopData(params.slug);
  if (!data) return {};
  return {
    title: data.shop.name,
    description: data.shop.tagline ?? `Shop ${data.shop.name}'s catalog — order straight to WhatsApp.`,
  };
}

export default async function StorefrontPage({ params }: { params: { slug: string } }) {
  const data = await getShopData(params.slug);
  if (!data) notFound();

  const { shop, categories, products } = data;

  return (
    <div className="min-h-screen bg-white">
      <AnalyticsTracker shopId={shop.id} />

      <header className="relative">
        {shop.cover_url && (
          <div className="h-32 sm:h-44 w-full relative bg-bg-soft">
            <Image src={shop.cover_url} alt="" fill className="object-cover" priority />
          </div>
        )}
        <div className="max-w-site mx-auto px-4 -mt-8 relative flex items-end gap-4 pb-4">
          <div className="w-20 h-20 rounded-full border-4 border-white bg-bg-soft overflow-hidden flex-shrink-0 relative">
            {shop.logo_url && <Image src={shop.logo_url} alt={shop.name} fill className="object-cover" />}
          </div>
          <div className="pb-1">
            <h1 className="font-display text-xl font-extrabold text-ink">{shop.name}</h1>
            {shop.tagline && <p className="text-sm text-ink-soft">{shop.tagline}</p>}
          </div>
        </div>
      </header>

      <main className="max-w-site mx-auto px-4 py-6">
        <StorefrontContent
          products={products}
          categories={categories}
          shopSlug={shop.slug}
          shopId={shop.id}
          currency={shop.currency}
        />
      </main>

      <CartDrawer
        shopId={shop.id}
        shopSlug={shop.slug}
        shopName={shop.name}
        whatsappNumber={shop.whatsapp_number}
        currency={shop.currency}
      />

      {!shop.branding_hidden && (
        <footer className="text-center py-6 text-xs text-ink-soft">
          Powered by <span className="font-semibold text-blue">BluuShop</span>
        </footer>
      )}
    </div>
  );
}
