"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/product-card";
import ProductListRow from "@/components/storefront/product-list-row";
import type { ShopThemeId } from "@/lib/theme";
import type { Category, Product } from "@/types";

type GridThemeId = Exclude<ShopThemeId, "list">;

const GRID_CLASSES: Record<GridThemeId, string> = {
  minimal: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4",
  boutique: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
  market: "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2",
  gallery: "grid grid-cols-2 lg:grid-cols-3 gap-8",
  studio: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4",
};

export default function StorefrontContent({
  products,
  categories,
  shopSlug,
  shopId,
  shopName,
  whatsappNumber,
  currency,
  themeId,
}: {
  products: Product[];
  categories: Category[];
  shopSlug: string;
  shopId: string;
  shopName: string;
  whatsappNumber: string;
  currency: string;
  themeId: ShopThemeId;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(
    () => (selected ? products.filter((p) => p.category_id === selected) : products),
    [products, selected]
  );

  // Studio is deliberately monochrome — the accent color is reserved for the
  // cart/Buy Now actions, so its active pill is ink, not the shop's accent.
  const activePillClass =
    themeId === "studio"
      ? "bg-ink text-white border-ink"
      : "bg-[var(--shop-accent)] text-white border-[var(--shop-accent)]";

  return (
    <div className={themeId === "list" ? "max-w-2xl mx-auto" : ""}>
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
          <button
            onClick={() => setSelected(null)}
            className={`shrink-0 text-sm font-medium px-3 py-1.5 rounded-full border ${
              selected === null ? activePillClass : "border-line text-ink-soft"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelected(cat.id)}
              className={`shrink-0 text-sm font-medium px-3 py-1.5 rounded-full border ${
                selected === cat.id ? activePillClass : "border-line text-ink-soft"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-ink-soft py-16">No products here yet.</p>
      ) : themeId === "list" ? (
        <div className="divide-y divide-line">
          {filtered.map((product) => (
            <ProductListRow
              key={product.id}
              product={product}
              shopSlug={shopSlug}
              shopId={shopId}
              shopName={shopName}
              whatsappNumber={whatsappNumber}
              currency={currency}
            />
          ))}
        </div>
      ) : (
        <div className={GRID_CLASSES[themeId]}>
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              shopSlug={shopSlug}
              shopId={shopId}
              shopName={shopName}
              whatsappNumber={whatsappNumber}
              currency={currency}
              themeId={themeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
