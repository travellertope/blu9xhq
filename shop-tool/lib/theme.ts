import type { CSSProperties } from "react";

export type ShopThemeId = "minimal" | "boutique" | "market" | "gallery" | "studio" | "list";

export const THEMES: { id: ShopThemeId; label: string; description: string }[] = [
  { id: "minimal", label: "Minimal", description: "Clean grid, lets your photos do the talking." },
  { id: "list", label: "List", description: "A scannable menu of thumbnail, name, and price — great for a short catalog or food menu." },
  { id: "boutique", label: "Boutique", description: "Spacious and editorial — great for a curated catalog." },
  { id: "market", label: "Market", description: "Dense grid built for browsing lots of items fast." },
  { id: "gallery", label: "Gallery", description: "Full-bleed photos and generous whitespace — a lookbook, not a catalog." },
  { id: "studio", label: "Studio", description: "Monochrome and graphic, with your accent color as the only pop." },
];

/** Themes whose grid is narrow enough (at some real breakpoint) that a
 *  full "Add to cart" label next to Buy Now doesn't reliably fit — measured
 *  against real card widths down to a 320px viewport, not guessed. Boutique
 *  is the one grid theme wide enough to keep the full label; List isn't a
 *  grid at all but uses the same compact actions for row-height consistency. */
export const COMPACT_ACTION_THEMES: ShopThemeId[] = ["minimal", "market", "gallery", "studio", "list"];

export const FONT_PAIRINGS: Record<string, { label: string; heading: string; body: string }> = {
  inter: { label: "Modern (default)", heading: "var(--font-manrope)", body: "var(--font-inter)" },
  playfair: { label: "Elegant", heading: "var(--font-playfair)", body: "var(--font-inter)" },
  "space-grotesk": { label: "Bold", heading: "var(--font-space-grotesk)", body: "var(--font-inter)" },
  manrope: { label: "Clean", heading: "var(--font-manrope)", body: "var(--font-manrope)" },
};

const DEFAULT_ACCENT = "#2F5FE0";

/** Converts a #rrggbb (or #rgb) hex color to an "H S% L%" triplet, the format
 *  shadcn's CSS variables expect for hsl(var(--primary)) to work. */
export function hexToHslTriplet(hex: string): string {
  const clean = hex.replace("#", "");
  const normalized = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const bigint = parseInt(normalized, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** CSS custom properties driving a shop's storefront look — accent color
 *  (both as a raw hex for arbitrary-value Tailwind classes and as an HSL
 *  triplet for shadcn's --primary) and its font pairing. Spread onto the
 *  storefront's top-level wrapper so every descendant inherits it. */
export function shopThemeStyle(accentColor: string | null, fontId: string): CSSProperties {
  const hex = accentColor || DEFAULT_ACCENT;
  const pairing = FONT_PAIRINGS[fontId] ?? FONT_PAIRINGS.inter;
  return {
    "--shop-accent": hex,
    "--primary": hexToHslTriplet(hex),
    "--shop-heading-font": pairing.heading,
    "--shop-body-font": pairing.body,
  } as CSSProperties;
}
