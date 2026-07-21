import Image from "next/image";
import type { ShopThemeId } from "@/lib/theme";
import type { Shop } from "@/types";
import SocialLinks from "@/components/storefront/social-links";

function Avatar({ shop, className }: { shop: Shop; className: string }) {
  return (
    <div
      className={`rounded-full border-4 border-white bg-[var(--shop-accent)] overflow-hidden relative flex items-center justify-center ${className}`}
    >
      {shop.logo_url ? (
        <Image src={shop.logo_url} alt={shop.name} fill className="object-cover" />
      ) : (
        <span className="shop-font-heading text-2xl font-extrabold text-white">
          {shop.name.trim().charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default function ShopHeader({ shop, themeId }: { shop: Shop; themeId: ShopThemeId }) {
  if (themeId === "boutique") {
    return (
      <header className="relative">
        <div className="h-40 sm:h-56 w-full relative bg-gradient-to-br from-blue to-navy">
          {shop.cover_url && <Image src={shop.cover_url} alt="" fill className="object-cover" priority />}
        </div>
        <div className="max-w-site mx-auto px-4 pb-6 flex flex-col items-center text-center">
          <Avatar shop={shop} className="-mt-12 w-24 h-24" />
          <div className="mt-4">
            <h1 className="shop-font-heading text-2xl font-bold text-ink">{shop.name}</h1>
            {shop.tagline && <p className="text-sm text-ink-soft mt-1 max-w-sm">{shop.tagline}</p>}
            <div className="flex justify-center">
              <SocialLinks shop={shop} />
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (themeId === "market") {
    return (
      <header className="border-b border-line">
        <div className="max-w-site mx-auto px-4 py-3 flex items-center gap-3">
          <Avatar shop={shop} className="w-12 h-12 -mt-0 shrink-0 border-2" />
          <div className="min-w-0">
            <h1 className="shop-font-heading text-base font-bold text-ink truncate">{shop.name}</h1>
            {shop.tagline && <p className="text-xs text-ink-soft truncate">{shop.tagline}</p>}
          </div>
          <div className="ml-auto shrink-0">
            <SocialLinks shop={shop} />
          </div>
        </div>
      </header>
    );
  }

  if (themeId === "gallery") {
    return (
      <header>
        <div className="h-48 sm:h-64 w-full relative bg-gradient-to-br from-blue to-navy">
          {shop.cover_url && <Image src={shop.cover_url} alt="" fill className="object-cover" priority />}
          {/* Scrim behind the overlaid name — needed for legibility over any
              cover photo, not just the default gradient. */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 max-w-site mx-auto px-4 pb-4">
            <h1 className="shop-font-heading text-2xl sm:text-3xl font-extrabold text-white">{shop.name}</h1>
          </div>
        </div>
        <div className="max-w-site mx-auto px-4 py-3 flex items-center gap-3">
          {shop.tagline && <p className="flex-1 min-w-0 text-sm text-ink-soft truncate">{shop.tagline}</p>}
          <div className="shrink-0 ml-auto">
            <SocialLinks shop={shop} />
          </div>
        </div>
      </header>
    );
  }

  if (themeId === "studio") {
    return (
      <header className="relative">
        <div className="h-28 sm:h-36 w-full relative bg-ink">
          {shop.cover_url && <Image src={shop.cover_url} alt="" fill className="object-cover" priority />}
        </div>
        <div className="max-w-site mx-auto px-4 pb-4">
          {/* Square, ink-colored avatar (not the shared circular accent one) —
              Studio keeps the accent color reserved for actions only. */}
          <div className="-mt-8 w-20 h-20 rounded-md border-4 border-white bg-ink overflow-hidden relative flex items-center justify-center">
            {shop.logo_url ? (
              <Image src={shop.logo_url} alt={shop.name} fill className="object-cover" />
            ) : (
              <span className="shop-font-heading text-2xl font-extrabold text-white">
                {shop.name.trim().charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="mt-3">
            <h1 className="shop-font-heading text-xl font-extrabold text-ink uppercase tracking-wide">
              {shop.name}
            </h1>
            {shop.tagline && <p className="text-sm text-ink-soft mt-0.5">{shop.tagline}</p>}
            <SocialLinks shop={shop} />
          </div>
        </div>
      </header>
    );
  }

  // minimal (default) — also used by "list", whose distinguishing feature
  // is entirely in the product listing below, not the header.
  return (
    <header className="relative">
      <div className="h-28 sm:h-36 w-full relative bg-gradient-to-br from-blue to-navy">
        {shop.cover_url && <Image src={shop.cover_url} alt="" fill className="object-cover" priority />}
      </div>
      <div className="max-w-site mx-auto px-4 pb-4">
        {/* Only the avatar overlaps the cover — its own row, fixed height,
            so a long shop name/tagline can never push it (or itself) back
            up into the image. */}
        <Avatar shop={shop} className="-mt-8 w-20 h-20" />
        <div className="mt-3">
          <h1 className="shop-font-heading text-xl font-extrabold text-ink">{shop.name}</h1>
          {shop.tagline && <p className="text-sm text-ink-soft mt-0.5">{shop.tagline}</p>}
          <SocialLinks shop={shop} />
        </div>
      </div>
    </header>
  );
}
