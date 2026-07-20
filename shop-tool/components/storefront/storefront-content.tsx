"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/product-card";
import type { Category, Product } from "@/types";

export default function StorefrontContent({
  products,
  categories,
  shopSlug,
  shopId,
  currency,
}: {
  products: Product[];
  categories: Category[];
  shopSlug: string;
  shopId: string;
  currency: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(
    () => (selected ? products.filter((p) => p.category_id === selected) : products),
    [products, selected]
  );

  return (
    <div>
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
          <button
            onClick={() => setSelected(null)}
            className={`shrink-0 text-sm font-medium px-3 py-1.5 rounded-full border ${
              selected === null ? "bg-blue text-white border-blue" : "border-line text-ink-soft"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelected(cat.id)}
              className={`shrink-0 text-sm font-medium px-3 py-1.5 rounded-full border ${
                selected === cat.id ? "bg-blue text-white border-blue" : "border-line text-ink-soft"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-ink-soft py-16">No products here yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              shopSlug={shopSlug}
              shopId={shopId}
              currency={currency}
            />
          ))}
        </div>
      )}
    </div>
  );
}
