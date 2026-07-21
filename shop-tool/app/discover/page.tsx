import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Shop } from "@/types";

export const metadata: Metadata = {
  title: "Discover shops — BluuShop",
  description: "Storefronts built with BluuShop, open for browsing and WhatsApp checkout.",
};

async function getListedShops(): Promise<Shop[]> {
  const supabase = createSupabaseServerClient();

  const { data: shops } = await supabase
    .from("shops")
    .select("*")
    .eq("active", true)
    .eq("directory_opt_in", true)
    .order("created_at", { ascending: false });

  if (!shops || shops.length === 0) return [];

  // Quality bar: a listed shop needs at least one live product, so the
  // directory never shows an empty storefront as someone's first
  // impression of BluuShop.
  const { data: products } = await supabase
    .from("products")
    .select("shop_id")
    .eq("active", true)
    .in("shop_id", shops.map((s) => s.id));

  const shopIdsWithProducts = new Set((products ?? []).map((p) => p.shop_id));
  return (shops as Shop[]).filter((s) => shopIdsWithProducts.has(s.id));
}

export default async function DiscoverPage() {
  const shops = await getListedShops();

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line">
        <div className="max-w-site mx-auto px-7 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-1 font-extrabold text-lg">
            Bluu<span className="text-blue">Shop</span>
          </Link>
          <Link href="/login" className="text-sm font-semibold text-ink-soft hover:text-ink transition-colors">
            Log in
          </Link>
        </div>
      </header>

      <section className="max-w-site mx-auto px-7 py-12">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-ink">Discover shops</h1>
        <p className="mt-2 text-ink-soft max-w-xl">
          Storefronts built with BluuShop — browse the catalog, then checkout straight to WhatsApp.
        </p>

        {shops.length === 0 ? (
          <p className="text-center text-ink-soft py-24">No shops listed yet — check back soon.</p>
        ) : (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {shops.map((shop) => (
              <Link
                key={shop.id}
                href={`/${shop.slug}`}
                className="bg-white border border-line rounded-site overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="aspect-[3/2] bg-gradient-to-br from-blue to-navy relative">
                  {shop.cover_url && <Image src={shop.cover_url} alt="" fill className="object-cover" />}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue overflow-hidden relative shrink-0 flex items-center justify-center">
                      {shop.logo_url ? (
                        <Image src={shop.logo_url} alt="" fill className="object-cover" />
                      ) : (
                        <span className="text-xs font-extrabold text-white">
                          {shop.name.trim().charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm font-bold text-ink truncate">{shop.name}</h2>
                  </div>
                  {shop.tagline && <p className="text-xs text-ink-soft mt-1.5 line-clamp-2">{shop.tagline}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
