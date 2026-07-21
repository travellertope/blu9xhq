"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { trackEvent } from "@/lib/analytics";
import { formatMoney } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import BuyNowButton from "@/components/buy-now-button";
import type { ShopThemeId } from "@/lib/theme";
import type { Product } from "@/types";

const CARD_CLASSES: Record<ShopThemeId, string> = {
  minimal: "bg-white border border-line rounded-site overflow-hidden",
  boutique: "bg-white rounded-2xl overflow-hidden shadow-sm",
  market: "bg-white border border-line rounded-md overflow-hidden",
};

const IMAGE_ASPECT: Record<ShopThemeId, string> = {
  minimal: "aspect-square",
  boutique: "aspect-[4/5]",
  market: "aspect-square",
};

const BODY_PADDING: Record<ShopThemeId, string> = {
  minimal: "p-3",
  boutique: "p-4",
  market: "p-2",
};

export default function ProductCard({
  product,
  shopSlug,
  shopId,
  shopName,
  whatsappNumber,
  currency,
  themeId,
}: {
  product: Product;
  shopSlug: string;
  shopId: string;
  shopName: string;
  whatsappNumber: string;
  currency: string;
  themeId: ShopThemeId;
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
    <div className={CARD_CLASSES[themeId]}>
      <Link
        href={`/${shopSlug}/product/${product.id}`}
        className={`block ${IMAGE_ASPECT[themeId]} bg-bg-soft relative`}
      >
        {image ? (
          <Image src={image} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-soft text-sm">No photo</div>
        )}
      </Link>
      <div className={BODY_PADDING[themeId]}>
        <Link href={`/${shopSlug}/product/${product.id}`}>
          <h3 className={`text-sm font-semibold text-ink truncate ${themeId === "market" ? "text-xs" : ""}`}>
            {product.name}
          </h3>
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
          <div className="flex gap-1.5 mt-2">
            <Button size="sm" className="flex-1" onClick={handleQuickAdd}>
              Add to cart
            </Button>
            <BuyNowButton
              compact
              shopId={shopId}
              shopName={shopName}
              whatsappNumber={whatsappNumber}
              currency={currency}
              product={{ id: product.id, name: product.name, price: product.price, image: image ?? null }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
