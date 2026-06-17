"use client";

import { useState } from "react";
import Link from "next/link";

const services = [
  { href: "/content-ops", label: "Content Ops", desc: "Research, writing, publishing, reporting" },
  { href: "/services/web-mobile-dev", label: "Web & App Dev", desc: "Sites and apps, built from scratch" },
  { href: "/services/web-manage", label: "Web Management", desc: "Ongoing updates & fixes" },
  { href: "/services/hosting", label: "Hosting", desc: "Infrastructure that's actually maintained" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/92 backdrop-blur-sm border-b border-line">
      <div className="max-w-site mx-auto px-7 flex items-center justify-between h-[72px]">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-[19px]">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M13 1L24 7.5V18.5L13 25L2 18.5V7.5L13 1Z" stroke="#2F5FE0" strokeWidth="1.8" />
            <circle cx="13" cy="13" r="4.5" fill="#2F5FE0" />
          </svg>
          Bluu<span className="text-blue">HQ</span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-ink-soft">
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button className="py-1.5 px-0.5 border-b-2 border-transparent hover:text-ink">
              Services &#9662;
            </button>
            {servicesOpen && (
              <div className="absolute top-full left-0 mt-3.5 bg-white border border-line rounded-xl shadow-[0_18px_40px_-12px_rgba(14,26,46,0.18)] min-w-[230px] p-2 z-50">
                {services.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="block px-3 py-2.5 rounded-lg font-semibold text-ink hover:bg-bg-soft"
                  >
                    {s.label}
                    <span className="block font-normal text-xs text-ink-soft mt-0.5">{s.desc}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/industries" className="py-1.5 px-0.5 border-b-2 border-transparent hover:text-ink">Industries</Link>
          <Link href="/pricing" className="py-1.5 px-0.5 border-b-2 border-transparent hover:text-ink">Pricing</Link>
          <Link href="/insights" className="py-1.5 px-0.5 border-b-2 border-transparent hover:text-ink">Insights</Link>
          <Link href="#faq" className="py-1.5 px-0.5 border-b-2 border-transparent hover:text-ink">FAQs</Link>
        </div>

        <div className="flex items-center gap-3.5">
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-[10px] text-[13px] font-bold border border-line text-ink hover:border-blue hover:text-blue transition-colors"
          >
            Let&apos;s talk
          </Link>
          <Link
            href="#top"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-[10px] text-[13px] font-bold bg-blue text-white hover:bg-blue-dark hover:shadow-[0_10px_24px_-8px_rgba(47,95,224,0.55)] transition-all"
          >
            Run free scan
          </Link>
          <button
            className="md:hidden p-1.5 bg-transparent border-none cursor-pointer"
            aria-label="Menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg width="22" height="22" viewBox="0 0 22 22">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="#13181F" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-white px-7 py-4 flex flex-col gap-3">
          {services.map((s) => (
            <Link key={s.href} href={s.href} className="font-semibold text-sm text-ink py-1" onClick={() => setMobileOpen(false)}>
              {s.label}
            </Link>
          ))}
          <Link href="/industries" className="font-semibold text-sm text-ink py-1" onClick={() => setMobileOpen(false)}>Industries</Link>
          <Link href="/pricing" className="font-semibold text-sm text-ink py-1" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <Link href="/insights" className="font-semibold text-sm text-ink py-1" onClick={() => setMobileOpen(false)}>Insights</Link>
          <Link href="#faq" className="font-semibold text-sm text-ink py-1" onClick={() => setMobileOpen(false)}>FAQs</Link>
        </div>
      )}
    </nav>
  );
}
