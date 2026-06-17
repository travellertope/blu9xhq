import type { Metadata } from "next";
import "./marketing.css";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "Bluu HQ — AI Visibility & Content Operations",
  description:
    "See if AI search tools and Google can actually find your brand. Run a free 2-minute scan for your AI visibility, site health, and content gaps.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
