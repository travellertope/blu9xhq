"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart";
import { trackEvent } from "@/lib/analytics";
import { formatMoney } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import BuyNowButton from "@/components/buy-now-button";
import type { Product } from "@/types";

export default function ProductDetail({
  product,
  shopSlug,
  shopId,
  shopName,
  whatsappNumber,
  currency,
}: {
  product: Product;
  shopSlug: string;
  shopId: string;
  shopName: string;
  whatsappNumber: string;
  currency: string;
}) {
  const { add } = useCart(shopSlug);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  const missingSelection = useMemo(
    () => product.variants.some((v) => !selection[v.name]),
    [product.variants, selection]
  );

  function handleAdd() {
    add({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? null,
      qty: 1,
      variant: product.variants.length > 0 ? selection : null,
    });
    trackEvent(shopId, "add_to_cart", product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div>
      {product.variants.map((variant) => (
        <div key={variant.name} className="mb-4">
          <p className="text-sm font-semibold text-ink mb-1.5">{variant.name}</p>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => {
              const isSelected = selection[variant.name] === option;
              return (
                <button
                  key={option}
                  onClick={() => setSelection((prev) => ({ ...prev, [variant.name]: option }))}
                  className={`text-sm font-medium px-3 py-1.5 rounded-full border ${
                    isSelected
                      ? "bg-[var(--shop-accent)] text-white border-[var(--shop-accent)]"
                      : "border-line text-ink-soft"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-xl font-bold text-ink mb-1">{formatMoney(product.price, currency)}</p>
      {product.compare_at_price && (
        <p className="text-sm text-ink-soft line-through mb-3">{formatMoney(product.compare_at_price, currency)}</p>
      )}

      <div className="space-y-2">
        <Button size="lg" className="w-full" disabled={missingSelection} onClick={handleAdd}>
          {added ? "Added ✓" : "Add to cart"}
        </Button>
        <BuyNowButton
          shopId={shopId}
          shopName={shopName}
          whatsappNumber={whatsappNumber}
          currency={currency}
          product={{ id: product.id, name: product.name, price: product.price, image: product.images[0] ?? null }}
          variant={product.variants.length > 0 ? selection : null}
          disabled={missingSelection}
        />
      </div>
    </div>
  );
}
