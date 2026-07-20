import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AnalyticsTracker from "@/components/analytics-tracker";
import CartDrawer from "@/components/cart-drawer";
import ProductDetail from "@/components/storefront/product-detail";
import type { DeliveryZone, Product, Shop } from "@/types";

async function getData(slug: string, productId: string) {
  const supabase = createSupabaseServerClient();

  const { data: shop } = await supabase.from("shops").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  if (!shop) return null;

  const [{ data: product }, { data: deliveryZones }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("shop_id", shop.id)
      .eq("active", true)
      .maybeSingle(),
    supabase.from("delivery_zones").select("*").eq("shop_id", shop.id).order("sort_order"),
  ]);

  if (!product) return null;

  return {
    shop: shop as Shop,
    product: product as Product,
    deliveryZones: (deliveryZones ?? []) as DeliveryZone[],
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string; id: string };
}): Promise<Metadata> {
  const data = await getData(params.slug, params.id);
  if (!data) return {};
  return { title: `${data.product.name} — ${data.shop.name}` };
}

export default async function ProductPage({ params }: { params: { slug: string; id: string } }) {
  const data = await getData(params.slug, params.id);
  if (!data) notFound();

  const { shop, product, deliveryZones } = data;
  const image = product.images[0];

  return (
    <div className="min-h-screen bg-white">
      <AnalyticsTracker shopId={shop.id} productId={product.id} />

      <header className="border-b border-line">
        <div className="max-w-site mx-auto px-4 h-14 flex items-center">
          <Link href={`/${shop.slug}`} className="text-sm font-semibold text-ink-soft hover:text-ink">
            ← {shop.name}
          </Link>
        </div>
      </header>

      <main className="max-w-site mx-auto px-4 py-6 grid sm:grid-cols-2 gap-8">
        <div className="aspect-square bg-bg-soft rounded-site overflow-hidden relative">
          {image ? (
            <Image src={image} alt={product.name} fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-soft text-sm">No photo</div>
          )}
        </div>

        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink mb-2">{product.name}</h1>
          {product.description && <p className="text-ink-soft mb-4 leading-relaxed">{product.description}</p>}
          <ProductDetail product={product} shopSlug={shop.slug} shopId={shop.id} currency={shop.currency} />
        </div>
      </main>

      <CartDrawer
        shopId={shop.id}
        shopSlug={shop.slug}
        shopName={shop.name}
        whatsappNumber={shop.whatsapp_number}
        currency={shop.currency}
        deliveryZones={deliveryZones}
      />
    </div>
  );
}
