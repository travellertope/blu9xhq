import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import SessionProvider from "@/components/shared/SessionProvider";
import NavigationProgress from "@/components/shared/NavigationProgress";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className={`${inter.variable} font-sans antialiased h-full`}>
        <NavigationProgress />
        <SessionProvider>{children}</SessionProvider>
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
