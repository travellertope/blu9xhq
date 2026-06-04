import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What Bluu Produces — Content Types & Deliverables",
  description:
    "From research-led blog posts to weekly competitor digests, LinkedIn posts to full case studies — here is every content type Bluu produces for clients across all retainer tiers.",
};

const BRAND_BLUE = "#1560EF";

const sections = [
  {
    number: "01",
    title: "Research and intelligence",
    intro:
      "The foundation of everything Bluu produces. Before a word is written, the intelligence is gathered.",
    rows: [
      {
        deliverable: "Competitor content digest",
        description:
          "Weekly or monthly summary of what competitors are publishing, what is performing, and what gaps they are leaving",
      },
      {
        deliverable: "Leading signal report",
        description:
          "Job posting analysis, review pattern monitoring, pricing page changes, and LinkedIn engagement anomalies — the signals that reveal where competitors are going before they announce it",
      },
      {
        deliverable: "Audience pain research",
        description:
          "Real language and real frustrations pulled from Reddit, LinkedIn, Quora, and community forums — the intelligence that makes content feel written for a specific reader",
      },
      {
        deliverable: "Keyword and trend intelligence brief",
        description:
          "Keyword clusters by search intent stage, People Also Ask questions, AI discovery patterns, and trending topics in your category",
      },
      {
        deliverable: "Market pulse report",
        description:
          "Deep research into any market, topic, or competitor landscape — on-demand category intelligence",
      },
      {
        deliverable: "Monthly performance report",
        description:
          "Traffic, engagement, inbound signals, keyword movement, and content-attributed conversations — structured to inform next month's decisions",
      },
    ],
  },
  {
    number: "02",
    title: "Long-form written content",
    intro:
      "The core of the content operation. Every long-form piece is research-led, audience-specific, and built to rank in both traditional search and AI-powered discovery tools.",
    rows: [
      {
        deliverable: "Blog posts",
        description:
          "Research-led, structured for discovery, 800–2,500 words depending on topic and intent stage",
      },
      {
        deliverable: "LinkedIn articles",
        description:
          "Long-form argument written natively for LinkedIn's feed behaviour — shorter and more direct than a blog post, structured for the platform",
      },
      {
        deliverable: "Cornerstone / pillar content",
        description:
          "The definitive piece in a content territory — 1,500–2,500+ words, built to be the reference point every other piece links back to",
      },
      {
        deliverable: "Thought leadership pieces",
        description:
          "Founder or leadership voice — opinion grounded in evidence, structured to earn authority rather than assert it",
      },
      {
        deliverable: "White papers and research reports",
        description:
          "Long-form category intelligence documents — original synthesis of market data, audience research, and competitive landscape",
      },
      {
        deliverable: "Case studies",
        description:
          "Client interview, narrative write-up, PDF format, and six repurposed assets — the full case study production cycle",
      },
      {
        deliverable: "Customer spotlights",
        description:
          "Success story written from the customer's perspective — designed for sales use and social proof",
      },
    ],
  },
  {
    number: "03",
    title: "Short-form and social content",
    intro:
      "Every long-form piece produces a set of short-form assets. These are not summaries — they are adaptations written for the mindset of each specific channel.",
    rows: [
      {
        deliverable: "LinkedIn Post A — Sharp observation",
        description:
          "The core tension or counterintuitive insight from the post, written to stop the scroll in the first sentence",
      },
      {
        deliverable: "LinkedIn Post B — Practical breakdown",
        description:
          "The framework, how-to, or numbered list from the post — written to earn saves",
      },
      {
        deliverable: "LinkedIn Post C — Standalone provocation",
        description:
          "A complete argument that works without the link — designed to earn shares from people who have never visited the blog",
      },
      {
        deliverable: "X / Twitter thread",
        description:
          "The post's argument broken into 6–8 sequential posts, each a complete thought, the final post linking to the full piece",
      },
      {
        deliverable: "X / Twitter single post",
        description:
          "A single sharp observation or data point adapted for X's conversational, opinion-forward culture",
      },
      {
        deliverable: "Instagram caption",
        description:
          "Short, single-idea caption designed to work against an image and draw the audience toward the thinking behind it",
      },
      {
        deliverable: "Video / audio script",
        description:
          "Talking points that extract the key argument from a long-form piece in a format suitable for a 2–3 minute video or podcast segment",
      },
    ],
  },
  {
    number: "04",
    title: "Email and newsletter content",
    intro:
      "The highest-quality attention channel available to a B2B brand. Bluu writes, formats, and sends newsletters via the client's existing email platform.",
    rows: [
      {
        deliverable: "Email newsletter",
        description:
          "Written, formatted, and scheduled — a curated editorial product that earns the subscriber's attention rather than broadcasting to them",
      },
      {
        deliverable: "Newsletter section",
        description:
          "A stand-alone curated section for clients who manage their own newsletter but want Bluu to contribute a regular editorial slot",
      },
      {
        deliverable: "Email sequences",
        description:
          "Onboarding, nurture, and re-engagement sequences — written in the brand's voice, structured to move the reader toward a specific decision",
      },
      {
        deliverable: "Promotional email copy",
        description:
          "Campaign-specific email copy for product launches, event invitations, or time-sensitive offers",
      },
    ],
  },
  {
    number: "05",
    title: "Website and page content",
    intro:
      "Every page Bluu produces is structured for discovery — written to rank, written to convert, and built with the right metadata from the first draft.",
    rows: [
      {
        deliverable: "Homepage copy",
        description:
          "Full homepage narrative — hero headline, sub-headline, problem section, solution section, social proof, and CTA",
      },
      {
        deliverable: "Industry hub pages",
        description:
          "Category-level pages targeting a broad industry audience — the top of the industry content architecture",
      },
      {
        deliverable: "Sub-industry pages",
        description:
          "Specific pages targeting a defined sub-audience within a broader industry — the depth layer of the content architecture",
      },
      {
        deliverable: "Use case / scenario pages",
        description:
          "Targeted pages written for a specific buyer in a specific situation — the highest-converting page type in most B2B content architectures",
      },
      {
        deliverable: "About page copy",
        description:
          "Brand story and mission — written to build trust with the specific audience the business serves",
      },
      {
        deliverable: "Landing page copy",
        description:
          "Campaign-specific pages built for a single conversion action",
      },
      {
        deliverable: "FAQ sections",
        description:
          "Questions the audience is already asking, answered directly — built to rank for People Also Ask queries and to be cited by AI",
      },
      {
        deliverable: "SEO titles and meta descriptions",
        description:
          "Written for every page — under character limits, keyword-inclusive, outcome-led",
      },
    ],
  },
  {
    number: "06",
    title: "Visual and repurposed assets",
    intro:
      "Content that travels beyond the blog and the feed — shareable, visual, and built to earn attention in formats beyond text.",
    rows: [
      {
        deliverable: "Instagram infographics",
        description:
          "4:5 format, branded, structured for the feed — data, frameworks, or comparison content visualised in Bluu's design system",
      },
      {
        deliverable: "Pull quote cards",
        description:
          "The sharpest sentence from each long-form piece, formatted as a shareable image asset",
      },
      {
        deliverable: "Presentation decks",
        description:
          "Narrative structure and copy for pitch decks, investor presentations, or client-facing slide decks",
      },
      {
        deliverable: "Podcast show notes",
        description:
          "Structured summaries of podcast episodes — formatted for search discovery and listener reference",
      },
    ],
  },
  {
    number: "07",
    title: "Sales and commercial content",
    intro:
      "Content that directly supports the sales process — from awareness through to conversion.",
    rows: [
      {
        deliverable: "Ad copy and campaign content",
        description:
          "Copy for paid social, display, and search campaigns — written to convert the specific audience segment targeted",
      },
      {
        deliverable: "Sales deck narrative",
        description:
          "The story and copy behind a sales presentation — structured to move a prospect from interest to decision",
      },
      {
        deliverable: "Cold outreach copy",
        description:
          "LinkedIn and email outreach sequences — written in a voice that earns a response rather than triggering a delete",
      },
      {
        deliverable: "Product one-pagers",
        description:
          "Single-page commercial documents — the full product or service story in a format designed for sales conversations",
      },
    ],
  },
];

const repurposedAssets = [
  "LinkedIn Post A — sharp observation",
  "LinkedIn Post B — practical breakdown",
  "LinkedIn Post C — standalone provocation",
  "Email newsletter section",
  "X / Twitter thread (6–8 posts)",
  "Instagram caption",
  "Pull quote card",
  "Video / audio script excerpt",
  "FAQ entry or knowledge base addition",
];

const standards = [
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="8" stroke={BRAND_BLUE} strokeWidth="1.5" />
        <path
          d="M7 10l2 2 4-4"
          stroke={BRAND_BLUE}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Structured for discovery",
    body: "Every deliverable is built to be found in both traditional search and AI-powered discovery tools — Perplexity, ChatGPT, Google AI Overviews. Direct answers. Named sources. Clean structure. No padding.",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 10c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4z"
          stroke={BRAND_BLUE}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Human review before anything publishes",
    body: "Every piece is reviewed by a human strategist before it goes anywhere. Research-informed, editorially sound, and on-brand — not a raw AI output with your logo on it.",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="5"
          width="14"
          height="10"
          rx="1.5"
          stroke={BRAND_BLUE}
          strokeWidth="1.5"
        />
        <path
          d="M7 9h6M7 12h4"
          stroke={BRAND_BLUE}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Brand voice alignment",
    body: "Every piece is written in your brand's voice — not Bluu's voice, not a generic agency voice. The brief captures the voice. Every deliverable reflects it.",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 10a6 6 0 1 1 12 0A6 6 0 0 1 4 10z"
          stroke={BRAND_BLUE}
          strokeWidth="1.5"
        />
        <path
          d="M10 7v3l2 2"
          stroke={BRAND_BLUE}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Built from real intelligence",
    body: "Nothing Bluu produces is based on internal assumption. Every piece is informed by real audience research, real competitor intelligence, and real keyword and trend data gathered before a word is written.",
  },
];

export default function WhatWeProducePage() {
  return (
    <>
      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-slate-200 md:hidden">
        <Link
          href="/contact"
          className="flex items-center justify-center w-full py-3 px-6 rounded-md text-white text-sm font-medium transition-colors"
          style={{ backgroundColor: BRAND_BLUE }}
        >
          Book a Discovery Call
        </Link>
      </div>

      <div className="min-h-screen bg-white text-slate-900">
        {/* Nav bar placeholder — matches portal nav height */}
        <header className="border-b border-slate-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
          <span className="font-semibold text-slate-900 tracking-tight">
            Bluu
          </span>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <Link href="/industries" className="hover:text-slate-900 transition-colors">
              Industries
            </Link>
            <Link href="/pricing" className="hover:text-slate-900 transition-colors">
              Pricing
            </Link>
            <Link href="/blog" className="hover:text-slate-900 transition-colors">
              Blog
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-md text-white text-sm font-medium transition-colors"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              Book a call
            </Link>
          </nav>
        </header>

        <main className="max-w-6xl mx-auto px-6 pb-32 md:pb-20">
          {/* Hero */}
          <section className="py-16 md:py-24 max-w-3xl">
            <p
              className="text-sm font-medium mb-4 uppercase tracking-wide"
              style={{ color: BRAND_BLUE }}
            >
              Every deliverable. Every format.
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5 text-slate-900">
              One retainer. Everything your content operation needs.
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Bluu produces content across every channel your audience uses —
              written, structured for discovery, and repurposed into every format
              that earns attention. Here is the complete list of what we build for
              clients.
            </p>
          </section>

          {/* Intro */}
          <section className="mb-16 max-w-3xl">
            <p className="text-base text-slate-700 leading-relaxed">
              Most content agencies produce blog posts and call it a content
              operation. Bluu produces the full stack — from the intelligence that
              informs every piece, to the long-form content that builds authority,
              to the repurposed assets that distribute it across every channel
              your audience is actually on.
            </p>
            <p className="text-base text-slate-700 leading-relaxed mt-4">
              Every deliverable is research-led. Every piece is structured for
              discovery in both search and AI tools. Nothing is produced without
              a brief grounded in real audience intelligence and real competitive
              context.
            </p>
          </section>

          {/* Content sections 01–07 */}
          <div className="space-y-10">
            {sections.map((section) => (
              <section
                key={section.number}
                className="rounded-lg border border-slate-100 overflow-hidden"
                style={{ borderLeftWidth: "4px", borderLeftColor: BRAND_BLUE }}
              >
                <div className="bg-slate-50 px-6 py-5 border-b border-slate-100">
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: BRAND_BLUE }}
                  >
                    {section.number}
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">
                    {section.title}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {section.intro}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-6 py-3 w-64">
                          Deliverable
                        </th>
                        <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-6 py-3">
                          What it is
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row, i) => (
                        <tr
                          key={i}
                          className={
                            i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                          }
                        >
                          <td className="px-6 py-4 font-medium text-slate-900 align-top">
                            {row.deliverable}
                          </td>
                          <td className="px-6 py-4 text-slate-600 leading-relaxed align-top">
                            {row.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>

          {/* How repurposing works */}
          <section className="mt-16 pt-16 border-t border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              How repurposing works
            </h2>
            <p className="text-slate-600 mb-8 max-w-2xl">
              Every long-form piece Bluu produces comes with a full set of
              repurposed assets. The thinking happens once. The content works
              across every channel.
            </p>

            <div className="rounded-lg border border-slate-100 overflow-hidden">
              <div
                className="px-6 py-4 border-b border-slate-100"
                style={{ borderLeftWidth: "4px", borderLeftColor: BRAND_BLUE }}
              >
                <p className="text-sm font-semibold text-slate-900">
                  One blog post becomes:
                </p>
              </div>
              <ol className="divide-y divide-slate-100">
                {repurposedAssets.map((asset, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 px-6 py-4 bg-white hover:bg-slate-50/50 transition-colors"
                  >
                    <span
                      className="text-xs font-bold mt-0.5 w-5 shrink-0 text-right"
                      style={{ color: BRAND_BLUE }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700">{asset}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="mt-6 text-sm text-slate-600 max-w-2xl">
              That is nine assets from one piece of research. Not copy-pasted.
              Adapted — written for the mindset of each channel's audience, in
              the format that earns attention on that specific platform.
            </p>
          </section>

          {/* What every deliverable includes */}
          <section className="mt-16 pt-16 border-t border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              What every deliverable includes as standard
            </h2>
            <p className="text-slate-600 mb-10 max-w-2xl">
              Regardless of format or channel, every piece of content Bluu
              produces includes the following.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {standards.map((item, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-100 p-6"
                >
                  <div className="mb-3">{item.icon}</div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mt-16 pt-16 border-t border-slate-100">
            <div className="rounded-lg border border-slate-100 p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 max-w-lg">
                Not sure which content types your operation needs?
              </h2>
              <p className="text-slate-600 mb-8 max-w-xl">
                Most clients start with two or three deliverable types and expand
                as the operation matures. Book a 15-minute Discovery Call and we
                will tell you exactly which content types would have the most
                impact for your specific audience, stage, and channels.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 rounded-md text-white text-sm font-medium transition-colors"
                style={{ backgroundColor: BRAND_BLUE }}
              >
                Book a Discovery Call
              </Link>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
