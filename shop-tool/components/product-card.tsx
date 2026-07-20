"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { trackEvent } from "@/lib/analytics";
import { formatMoney } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

export default function ProductCard({
  product,
  shopSlug,
  shopId,
  currency,
}: {
  product: Product;
  shopSlug: string;
  shopId: string;
  currency: string;
}) {
  const { add } = useCart(shopSlug);
  const hasVariants = product.variants.length > 0;
  const image = product.images[0];

  function handleQuickAdd() {
    add({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: image ?? null,
      qty: 1,
      variant: null,
    });
    trackEvent(shopId, "add_to_cart", product.id);
  }

  return (
    <div className="bg-white border border-line rounded-site overflow-hidden">
      <Link href={`/${shopSlug}/product/${product.id}`} className="block aspect-square bg-bg-soft relative">
        {image ? (
          <Image src={image} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-soft text-sm">No photo</div>
        )}
      </Link>
      <div className="p-3">
        <Link href={`/${shopSlug}/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-ink truncate">{product.name}</h3>
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-bold text-ink">{formatMoney(product.price, currency)}</span>
          {product.compare_at_price && (
            <span className="text-xs text-ink-soft line-through">
              {formatMoney(product.compare_at_price, currency)}
            </span>
          )}
        </div>
        {hasVariants ? (
          <Button asChild size="sm" variant="outline" className="w-full mt-2">
            <Link href={`/${shopSlug}/product/${product.id}`}>View options</Link>
          </Button>
        ) : (
          <Button size="sm" className="w-full mt-2" onClick={handleQuickAdd}>
            Add to cart
          </Button>
        )}
      </div>
    </div>
  );
}
