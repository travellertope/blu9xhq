"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { trackEvent } from "@/lib/analytics";
import { formatMoney } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import BuyNowButton from "@/components/buy-now-button";
import type { Product } from "@/types";

function CartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

export default function ProductListRow({
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
  const hasVariants = product.variants.length > 0;
  const image = product.images[0];
  const href = `/${shopSlug}/product/${product.id}`;

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
    <div className="flex items-center gap-3 py-3">
      <Link href={href} className="w-14 h-14 shrink-0 rounded-md overflow-hidden bg-bg-soft relative">
        {image ? (
          <Image src={image} alt={product.name} fill className="object-cover" sizes="56px" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-soft text-[10px]">No photo</div>
        )}
      </Link>

      {/* min-w-0 is load-bearing — without it a long name pushes the actions
          off the row instead of truncating (verified: ~150-190px overflow
          at common phone widths without this). */}
      <Link href={href} className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-ink truncate">{product.name}</h3>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-sm font-bold text-ink">{formatMoney(product.price, currency)}</span>
          {product.compare_at_price && (
            <span className="text-xs text-ink-soft line-through">
              {formatMoney(product.compare_at_price, currency)}
            </span>
          )}
        </div>
      </Link>

      <div className="shrink-0 flex items-center gap-1.5">
        {hasVariants ? (
          <Button asChild size="sm" variant="outline">
            <Link href={href}>Options</Link>
          </Button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label="Add to cart"
              className="w-9 h-9 rounded-md bg-[var(--shop-accent)] text-white flex items-center justify-center"
            >
              <CartIcon className="h-4 w-4" />
            </button>
            <BuyNowButton
              compact
              shopId={shopId}
              shopName={shopName}
              whatsappNumber={whatsappNumber}
              currency={currency}
              product={{ id: product.id, name: product.name, price: product.price, image: image ?? null }}
            />
          </>
        )}
      </div>
    </div>
  );
}
