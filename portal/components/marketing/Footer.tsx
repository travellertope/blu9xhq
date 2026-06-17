import Link from "next/link";

const footerSections = [
  {
    title: "Services",
    links: [
      { label: "Content Ops", href: "/content-ops" },
      { label: "Web & App Dev", href: "/services/web-mobile-dev" },
      { label: "Web Management", href: "/services/web-manage" },
      { label: "Hosting", href: "/services/hosting" },
    ],
  },
  {
    title: "Industries",
    links: [
      { label: "Tech & SaaS", href: "/industries/tech-saas" },
      { label: "Agencies & Consultants", href: "/industries/agencies" },
      { label: "E-commerce & DTC", href: "/industries/ecommerce" },
      { label: "Professional Services", href: "/industries/professional-services" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Insights", href: "/insights" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "FAQs", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
      { label: "Let's talk", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-[#9FB0C9] pt-16 pb-7">
      <div className="max-w-site mx-auto px-7">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-8 pb-10 border-b border-navy-soft">
          <div>
            <div className="text-white font-extrabold text-lg flex items-center gap-2.5 mb-3.5">
              <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                <path d="M13 1L24 7.5V18.5L13 25L2 18.5V7.5L13 1Z" stroke="#7FA0FF" strokeWidth="1.8" />
                <circle cx="13" cy="13" r="4.5" fill="#7FA0FF" />
              </svg>
              Bluu<span className="text-[#7FA0FF]">HQ</span>
            </div>
            <p className="text-[13.5px] leading-relaxed max-w-[220px] text-[#7E8FA8]">
              Your content, your site, your visibility — running, every month.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs tracking-wider uppercase text-[#6F84A3] mb-4 font-bold">
                {section.title}
              </h4>
              {section.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm mb-2.5 text-[#C7D2E3] hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-6 text-[13px] flex-wrap gap-3">
          <span>&copy; {new Date().getFullYear()} Bluu HQ. All rights reserved.</span>
          <div className="flex gap-2.5">
            <a
              href="#"
              aria-label="LinkedIn"
              className="w-[34px] h-[34px] rounded-lg bg-navy-soft flex items-center justify-center hover:bg-blue/20 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#C7D2E3">
                <path d="M0 1.5A1.5 1.5 0 011.5 0h13A1.5 1.5 0 0116 1.5v13a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 010 14.5v-13zM4.7 6.1H2.4v7h2.3v-7zM3.6 5.1c.8 0 1.3-.5 1.3-1.2 0-.7-.5-1.2-1.3-1.2-.7 0-1.2.5-1.2 1.2 0 .7.5 1.2 1.2 1.2zM13.6 13.1v-3.9c0-2.1-1.1-3-2.6-3-1.2 0-1.7.6-2 1.1v-.9H6.7v7h2.3V9.3c0-.5 0-1 .6-1.4.1-.1.4-.3.9-.3.7 0 1 .5 1 1.3v3.2h2.1z" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="X"
              className="w-[34px] h-[34px] rounded-lg bg-navy-soft flex items-center justify-center hover:bg-blue/20 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="#C7D2E3">
                <path d="M11 0h2.6L8.3 6.1 14 13h-4.5L6 8.4 1.8 13H-.8l5.7-6.5L-.5 0H4l3.5 4.3L11 0z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
