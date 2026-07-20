import type { Shop } from "@/types";

const ICONS = {
  instagram: (
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  ),
  facebook: (
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 011.141.195v3.325a8.623 8.623 0 00-.653-.036 26.805 26.805 0 00-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 00-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 1.848-.287 1.379-.297 1.437h-2.949v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647z" />
  ),
  x: (
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  ),
  tiktok: (
    <path d="M16.6 5.82a4.278 4.278 0 01-3.14-1.39V15.6a5.29 5.29 0 11-4.55-5.24v2.6a2.7 2.7 0 102.7 2.7V.02h2.55a4.28 4.28 0 001.44 3.22 4.26 4.26 0 003.4 1.9v2.63a6.9 6.9 0 01-2.4-.65z" />
  ),
};

const PLATFORMS: { key: keyof typeof ICONS; field: keyof Shop; label: string }[] = [
  { key: "instagram", field: "instagram_url", label: "Instagram" },
  { key: "tiktok", field: "tiktok_url", label: "TikTok" },
  { key: "facebook", field: "facebook_url", label: "Facebook" },
  { key: "x", field: "x_url", label: "X" },
];

export default function SocialLinks({ shop }: { shop: Shop }) {
  const active = PLATFORMS.filter(({ field }) => shop[field]);
  if (active.length === 0) return null;

  return (
    <div className="mt-3 flex items-center gap-2">
      {active.map(({ key, field, label }) => (
        <a
          key={key}
          href={shop[field] as string}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${shop.name} on ${label}`}
          className="w-8 h-8 rounded-full bg-bg-soft flex items-center justify-center text-ink-soft hover:text-[var(--shop-accent)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {ICONS[key]}
          </svg>
        </a>
      ))}
    </div>
  );
}
