import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import SessionProvider from "@/components/shared/SessionProvider";
import NavigationProgress from "@/components/shared/NavigationProgress";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["500", "700", "800"],
});

export const metadata: Metadata = {
  title: "BluuHQ Portal",
  description: "BluuHQ CRM & Client Portal",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable} font-sans antialiased`}>
        <NavigationProgress />
        <SessionProvider>{children}</SessionProvider>
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
