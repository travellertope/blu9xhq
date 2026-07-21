"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { trackEvent } from "@/lib/analytics";
import { formatMoney } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import BuyNowButton from "@/components/buy-now-button";
import { COMPACT_ACTION_THEMES, type ShopThemeId } from "@/lib/theme";
import type { Product } from "@/types";

type GridThemeId = Exclude<ShopThemeId, "list">;

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

const CARD_CLASSES: Record<GridThemeId, string> = {
  minimal: "bg-white border border-line rounded-site overflow-hidden",
  boutique: "bg-white rounded-2xl overflow-hidden shadow-sm",
  market: "bg-white border border-line rounded-md overflow-hidden",
  gallery: "", // no card box at all — just an image and a caption, gallery-wall style
  studio: "bg-white border-2 border-ink rounded-none overflow-hidden",
};

const IMAGE_ASPECT: Record<GridThemeId, string> = {
  minimal: "aspect-square",
  boutique: "aspect-[4/5]",
  market: "aspect-square",
  gallery: "aspect-[3/4] rounded-md overflow-hidden",
  studio: "aspect-square",
};

const BODY_PADDING: Record<GridThemeId, string> = {
  minimal: "p-3",
  boutique: "p-4",
  market: "p-2",
  gallery: "pt-3", // no side/bottom padding — there's no box to pad
  studio: "p-3",
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
  themeId: GridThemeId;
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
          <h3
            className={`text-sm font-semibold text-ink truncate ${
              themeId === "market" ? "text-xs" : themeId === "studio" ? "text-xs uppercase tracking-wide" : ""
            }`}
          >
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
            <Link href={`/${shopSlug}/product/${product.id}`}>
              {/* Market's columns are narrow enough that "View options" needs
                  shortening too — verified against real card widths down to
                  320px; every other theme's full-width variant button has
                  room for the long form. */}
              {themeId === "market" ? "Options" : "View options"}
            </Link>
          </Button>
        ) : (
          <div className="flex gap-1.5 mt-2">
            {COMPACT_ACTION_THEMES.includes(themeId) ? (
              // "Add to cart" text + a compact WhatsApp button don't reliably
              // fit side by side at these themes' grid widths — measured
              // against real card widths down to a 320px viewport, not
              // guessed. Boutique is the one grid wide enough to keep the
              // full label.
              <button
                type="button"
                onClick={handleQuickAdd}
                aria-label="Add to cart"
                className="flex-1 h-9 rounded-md bg-[var(--shop-accent)] text-white flex items-center justify-center"
              >
                <CartIcon className="h-4 w-4" />
              </button>
            ) : (
              <Button size="sm" className="flex-1" onClick={handleQuickAdd}>
                Add to cart
              </Button>
            )}
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
