import type { Metadata } from "next";
import { Inter, Manrope, Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["500", "700", "800"],
});
// Loaded for shop storefronts' font-pairing option — see lib/theme.ts.
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["600", "700"],
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "BluuShop — Free storefronts with WhatsApp checkout",
  description:
    "Build a free online catalog from your phone. Customers browse and add to cart, then checkout straight to your WhatsApp — no payment processor needed.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${manrope.variable} ${playfair.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        {children}
        <Toaster richColors position="top-center" closeButton />
      </body>
    </html>
  );
}
