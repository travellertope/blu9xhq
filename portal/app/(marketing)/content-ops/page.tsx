import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Content Ops — Your Content Operation, Running Every Month | Bluu HQ",
  description:
    "Bluu HQ handles your research, content, publishing, and reporting — so your brand shows up consistently while you focus on running the business.",
};

const problemCards = [
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    title: "No strategic foundation",
    desc: "You are producing content without knowing what your competitors are publishing, what your audience actually responds to, or what is shifting in your market. You are guessing.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
    title: "Content without consistency",
    desc: "Posts go out, nothing comes back. No consistent schedule, no compounding effect, no clear narrative. Content without a system is just noise with extra steps.",
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "No one owns the result",
    desc: "Content gets written but not published. Campaigns get started but not finished. Without a dedicated team running the operation, everything defaults to the bottom of the priority list.",
  },
];

const solutionFeatures = [
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Research & intelligence",
    items: [
      "Weekly competitor monitoring.",
      "Audience insight reports.",
      "Trend analysis for your niche.",
    ],
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: "Content that earns attention",
    items: [
      "Long-form pieces, social content, newsletters, and case studies.",
      "Written for your audience, reviewed for quality before anything goes out.",
    ],
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Published across every channel",
    items: [
      "We schedule and publish to your website, social platforms, and newsletter.",
      "One piece of content repurposed intelligently across every format.",
    ],
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Accountable monthly outcomes",
    items: [
      "A performance report every month — what worked, what did not, what changes.",
      "No vanity metrics. A clear picture of what your content is doing — and how it is performing in search and AI discovery.",
    ],
  },
];

const industries = [
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: "Tech & SaaS startups",
    desc: "You are building the product, managing the team, and closing deals. Content keeps getting pushed to next week. We become your content team — research, writing, publishing, and reporting — so your brand keeps moving even when you cannot give it attention.",
    href: "/industries/tech-saas",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: "Agencies & consultants",
    desc: "You know content drives inbound. You tell your clients that every week. But your own publishing is inconsistent and your pipeline reflects it. We run your content operation so you can focus on client work.",
    href: "/industries/agencies",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: "E-commerce & DTC brands",
    desc: "Building a brand from scratch means managing content, social, email, and ads with one person's bandwidth. We give you a structured content operation so every channel is covered, every week.",
    href: "/industries/ecommerce",
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
      </svg>
    ),
    title: "Professional services firms",
    desc: "Your expertise wins clients. But if that expertise is not being published consistently, the people who need it most will never find it. We turn your knowledge into a steady stream of trust-building content.",
    href: "/industries/professional-services",
  },
];

export default function ContentOpsPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-site mx-auto px-7 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue bg-blue-soft px-3 py-1.5 rounded-full mb-4">
              Content Operations
            </span>
            <h1 className="font-display text-[36px] md:text-[46px] font-extrabold leading-[1.12] tracking-tight">
              Your content operation.
              <br />
              <span className="text-blue">Running. Every month.</span>
            </h1>
            <p className="mt-5 max-w-[520px] text-ink-soft text-[17px] leading-relaxed">
              Bluu HQ handles your research, content, publishing, and reporting
              — so your brand shows up consistently while you focus on running
              the business.
            </p>
            <div className="flex flex-wrap gap-3.5 mt-8">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] text-sm font-bold bg-blue text-white hover:bg-blue-dark hover:shadow-[0_10px_24px_-8px_rgba(47,95,224,0.55)] transition-all"
              >
                Let&apos;s talk
              </Link>
              <Link
                href="#solution"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] text-sm font-bold bg-white text-ink border border-line hover:border-blue hover:text-blue transition-colors"
              >
                See What&apos;s Included
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80"
              alt="A modern, focused workspace"
              className="rounded-[14px] shadow-[0_30px_60px_-24px_rgba(14,26,46,0.25)]"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ── Problem ───────────────────────────────────────────────── */}
      <section className="mkt-section bg-bg-soft">
        <div className="max-w-site mx-auto px-7">
          <div className="text-center max-w-[640px] mx-auto mb-14">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue bg-blue-soft px-3 py-1.5 rounded-full mb-4">
              The Problem
            </span>
            <h2 className="font-display text-[30px] md:text-[38px] font-extrabold leading-tight">
              Inconsistency is costing you clients.
            </h2>
            <p className="text-ink-soft text-[17px] leading-relaxed mt-4">
              Most growing teams are producing content when they can, not when
              they should — with no strategy behind it, no one accountable for
              it, and no clear picture of whether it&apos;s working.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {problemCards.map((card) => (
              <div
                key={card.title}
                className="bg-white border border-line rounded-[14px] p-7 border-t-[3px] border-t-blue"
              >
                <div className="w-[42px] h-[42px] rounded-[10px] bg-blue-soft flex items-center justify-center mb-4 text-blue">
                  {card.icon}
                </div>
                <h3 className="font-display text-lg font-bold mb-2.5">
                  {card.title}
                </h3>
                <p className="text-ink-soft text-sm leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solution ──────────────────────────────────────────────── */}
      <section className="mkt-section" id="solution">
        <div className="max-w-site mx-auto px-7">
          <div className="text-center max-w-[640px] mx-auto mb-14">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue bg-blue-soft px-3 py-1.5 rounded-full mb-4">
              The Solution
            </span>
            <h2 className="font-display text-[30px] md:text-[38px] font-extrabold leading-tight">
              One retainer. Everything running.
            </h2>
            <p className="text-ink-soft text-[17px] leading-relaxed mt-4">
              We handle research, content creation, publishing, and reporting in
              one connected monthly retainer — so your brand shows up
              consistently, across every channel, without you having to manage
              it.
            </p>
          </div>

          <div className="bg-white border border-line rounded-[14px] shadow-[0_16px_36px_-20px_rgba(14,26,46,0.10)] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr]">
              <div className="bg-navy text-white p-8 lg:p-10 flex flex-col justify-center rounded-[14px]">
                <h3 className="font-display text-xl font-bold mb-4">
                  The complete content operation
                </h3>
                <p className="text-[#C7D2E3] text-sm leading-relaxed mb-6">
                  Instead of briefing three different suppliers and chasing
                  deliverables across four different tools, Bluu runs your entire
                  content operation in one seamless monthly engagement. Research
                  informs content. Content gets published. Results get reported.
                  Every month, without fail. Every piece built to SEO and AI
                  crawl standard from the first draft.
                </p>
                <Link
                  href="/pricing"
                  className="text-blue font-bold text-sm hover:underline"
                >
                  See what&apos;s included &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 bg-line">
                {solutionFeatures.map((feature) => (
                  <div
                    key={feature.title}
                    className="bg-white p-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-soft flex items-center justify-center text-blue flex-none">
                        {feature.icon}
                      </div>
                      <h4 className="font-display text-[15px] font-bold">
                        {feature.title}
                      </h4>
                    </div>
                    <ul className="space-y-2">
                      {feature.items.map((item) => (
                        <li
                          key={item}
                          className="text-ink-soft text-[13px] leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-blue/30"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonial ───────────────────────────────────────────── */}
      <section className="mkt-section bg-bg-soft">
        <div className="max-w-site mx-auto px-7">
          <div className="max-w-[800px] mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-line flex items-center justify-center flex-none">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9FB0C9" strokeWidth="1.25">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <blockquote>
              <p className="text-[17px] md:text-lg leading-relaxed text-ink italic">
                &ldquo;Bluu took the content operation completely off our plate.
                Within three months we were publishing consistently and our
                inbound pipeline started moving again. It is not a vendor
                relationship — it feels like having a dedicated team inside the
                business.&rdquo;
              </p>
              <footer className="mt-4">
                <cite className="not-italic font-bold text-ink block">
                  Sarah Mitchell
                </cite>
                <span className="text-ink-soft text-sm">
                  VP of Marketing, Clairen Software
                </span>
              </footer>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ── Who We Serve ──────────────────────────────────────────── */}
      <section className="mkt-section">
        <div className="max-w-site mx-auto px-7">
          <div className="text-center max-w-[640px] mx-auto mb-14">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue bg-blue-soft px-3 py-1.5 rounded-full mb-4">
              Who We Serve
            </span>
            <h2 className="font-display text-[30px] md:text-[38px] font-extrabold leading-tight">
              Built for teams who have outgrown doing content themselves.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {industries.map((ind) => (
              <article
                key={ind.title}
                className="bg-white border border-line rounded-[14px] p-7 border-l-4 border-l-blue"
              >
                <div className="w-[42px] h-[42px] rounded-[10px] bg-blue-soft flex items-center justify-center mb-4 text-blue">
                  {ind.icon}
                </div>
                <h3 className="font-display text-[17px] font-bold mb-2">
                  {ind.title}
                </h3>
                <p className="text-ink-soft text-sm leading-relaxed mb-3.5">
                  {ind.desc}
                </p>
                <Link
                  href={ind.href}
                  className="text-[13.5px] font-bold text-blue hover:underline"
                >
                  Learn more &rarr;
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="cta-gradient py-22 text-center">
        <div className="max-w-site mx-auto px-7 max-w-[640px]">
          <h2 className="font-display text-[28px] md:text-[34px] font-extrabold leading-[1.2]">
            Ready to hand off your content operation for good?
          </h2>
          <p className="text-ink-soft text-[17px] leading-relaxed mt-4">
            15 minutes. No pitch, no pressure — just an honest conversation to
            see if Bluu is the right fit for where your business is right now.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-[10px] text-sm font-bold bg-blue text-white hover:bg-blue-dark hover:shadow-[0_10px_24px_-8px_rgba(47,95,224,0.55)] transition-all mt-7"
          >
            Let&apos;s talk
          </Link>
          <p className="mt-4 text-[13px] text-ink-soft">
            Limited monthly capacity.
          </p>
        </div>
      </section>
    </>
  );
}
