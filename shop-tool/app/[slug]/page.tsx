import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AnalyticsTracker from "@/components/analytics-tracker";
import CartDrawer from "@/components/cart-drawer";
import StorefrontContent from "@/components/storefront/storefront-content";
import ShopHeader from "@/components/storefront/shop-header";
import { shopThemeStyle, type ShopThemeId } from "@/lib/theme";
import type { Category, DeliveryZone, Product, Shop } from "@/types";

async function getShopData(slug: string) {
  const supabase = createSupabaseServerClient();

  const { data: shop } = await supabase.from("shops").select("*").eq("slug", slug).eq("active", true).maybeSingle();

  if (!shop) return null;

  const [{ data: categories }, { data: products }, { data: deliveryZones }] = await Promise.all([
    supabase.from("categories").select("*").eq("shop_id", shop.id).order("sort_order"),
    supabase
      .from("products")
      .select("*")
      .eq("shop_id", shop.id)
      .eq("active", true)
      .order("sort_order"),
    supabase.from("delivery_zones").select("*").eq("shop_id", shop.id).order("sort_order"),
  ]);

  return {
    shop: shop as Shop,
    categories: (categories ?? []) as Category[],
    products: (products ?? []) as Product[],
    deliveryZones: (deliveryZones ?? []) as DeliveryZone[],
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

  const { shop, categories, products, deliveryZones } = data;
  const themeId = (shop.theme_id as ShopThemeId) || "minimal";

  return (
    <div className="min-h-screen bg-white shop-font-body" style={shopThemeStyle(shop.accent_color, shop.font_id)}>
      <AnalyticsTracker shopId={shop.id} />

      <ShopHeader shop={shop} themeId={themeId} />

      <main className="max-w-site mx-auto px-4 py-6">
        <StorefrontContent
          products={products}
          categories={categories}
          shopSlug={shop.slug}
          shopId={shop.id}
          currency={shop.currency}
          themeId={themeId}
        />
      </main>

      <CartDrawer
        shopId={shop.id}
        shopSlug={shop.slug}
        shopName={shop.name}
        whatsappNumber={shop.whatsapp_number}
        currency={shop.currency}
        deliveryZones={deliveryZones}
      />

      {!shop.branding_hidden && (
        <footer className="text-center py-6 text-xs text-ink-soft">
          Powered by{" "}
          <Link href="/" className="font-semibold text-blue hover:underline">
            BluuShop
          </Link>
        </footer>
      )}
    </div>
  );
}
