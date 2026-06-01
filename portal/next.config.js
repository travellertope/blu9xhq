/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "";
let r2Hostname = "";
try {
  r2Hostname = r2PublicUrl ? new URL(r2PublicUrl).hostname : "";
} catch {
  // env var not set or invalid — skip
}

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/",
        destination: "/portal-login",
        permanent: false,
      },
    ];
  },

  images: {
    remotePatterns: [
      ...(r2Hostname
        ? [{ protocol: "https", hostname: r2Hostname }]
        : []),
    ],
  },
};

module.exports = nextConfig;
