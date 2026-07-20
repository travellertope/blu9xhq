/** @type {import('next').NextConfig} */

const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "";
let r2Hostname = "";
try {
  r2Hostname = r2PublicUrl ? new URL(r2PublicUrl).hostname : "";
} catch {
  // env var not set or invalid — skip
}

const nextConfig = {
  images: {
    remotePatterns: [
      ...(r2Hostname ? [{ protocol: "https", hostname: r2Hostname }] : []),
    ],
  },
};

module.exports = nextConfig;
