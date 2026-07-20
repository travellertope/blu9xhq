/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // scan.bluuhq.com is the old domain — send everything to audit.bluuhq.com
      // permanently so existing links/bookmarks don't dead-end.
      {
        source: "/:path*",
        has: [{ type: "host", value: "scan.bluuhq.com" }],
        destination: "https://audit.bluuhq.com/:path*",
        statusCode: 301,
      },
    ];
  },
};

module.exports = nextConfig;
