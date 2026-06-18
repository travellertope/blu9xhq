import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { AuthSessionProvider } from "@/components/session-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["500", "700", "800"],
});

export const metadata: Metadata = {
  title: "AI Visibility Scan | Bluu HQ",
  description:
    "See if AI search tools and Google can actually find your brand. Check your AI visibility, site health, and content gaps.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${manrope.variable} font-sans antialiased bg-white text-ink`}
      >
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
