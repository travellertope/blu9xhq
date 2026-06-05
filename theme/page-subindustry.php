<?php
/**
 * Template Name: Sub-industry / Use Case Page
 * Template Post Type: page
 *
 * Content auto-loads from slug. ACF fields override when filled.
 *
 * @package bluu-interactive
 */

$gf           = function_exists( 'get_field' );
$current_slug = get_post_field( 'post_name', get_the_ID() );

// ── Slug-based content library ────────────────────────────────────────────────
$si_content = array(
    'seed-series-a' => array(
        'hero_tag'    => 'Tech & SaaS — Seed to Series A founders',
        'hero_headline' => 'You are building the company. Content should not be your problem too.',
        'hero_sub'    => 'Between product, hiring, fundraising, and sales, content is always the thing that gets pushed to next sprint. At seed to Series A stage, your brand needs to be moving even when you cannot give it attention. Bluu runs the content operation so it does not depend on you finding the time.',
        'hero_cta'    => "Let's talk",
        'hero_url'    => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'This is for SaaS founders between pre-seed and Series A — typically 2 to 15 people — where the founding team is still doing most things and content is the lowest priority despite being strategically important.',
        'who_items'   => array(
            'You are building a B2B SaaS product in a competitive category and you know that visibility and positioning matter as much as the product itself.',
            'You have no dedicated content resource and no realistic plans to hire one in the next six months — but content is falling further behind every week.',
            'You or a co-founder have things worth saying — market opinions, product perspectives, hard-won lessons — but no system for saying them consistently.',
            'You want competitor intelligence but have never had a structured way to get it without spending hours doing it yourself.',
        ),
        'pain_heading' => 'The early-stage content problem',
        'pain_body'   => 'At seed to Series A, content is caught between being critically important and completely deprioritised. You know your competitors are publishing. You know your founder LinkedIn should be more active. You know a weekly competitor digest would make your product and GTM decisions better. None of it happens consistently because everything else is on fire.',
        'pains'       => array(
            array( 'title' => 'Fundraising narrative has no content amplification', 'body' => 'Your investor pitch deck tells a compelling story. Almost none of that narrative is visible to the market — it lives in a PDF that only people you have already met ever see.' ),
            array( 'title' => 'Competitors are building authority you are not', 'body' => 'While you are heads-down building, competitors are publishing consistently. By the time you surface for air, they have six months of compounding content advantage working against you.' ),
            array( 'title' => 'Every sprint deprioritises content', 'body' => 'Content never makes it into the sprint because there is always something more urgent. A content operation that runs independently of your sprint cycle is the only solution that actually works at this stage.' ),
        ),
        'uc_heading'  => 'Where most seed to Series A founders start',
        'uc_intro'    => 'Most early-stage SaaS retainers combine competitor intelligence with founder brand content — the two use cases that deliver the most visible impact fastest with the least input required from the founding team.',
        'use_cases'   => array(
            array( 'title' => 'Competitor intelligence', 'why' => 'At this stage, knowing what competitors are saying and doing is directly actionable for positioning, GTM, and product decisions. A weekly digest that arrives without you asking for it is high value for almost zero effort.', 'url' => '/industries/tech-saas/competitor-intelligence', 'cta' => 'See this use case' ),
            array( 'title' => 'Founder brand building', 'why' => 'Your personal LinkedIn is your most credible distribution channel at this stage. A consistent presence builds trust with future customers, investors, and potential hires — all audiences you are actively trying to reach.', 'url' => '/industries/tech-saas/founder-brand', 'cta' => 'See this use case' ),
            array( 'title' => 'Content repurposing engine', 'why' => 'If you are producing any content at all — even occasional LinkedIn posts — the repurposing engine ensures each piece reaches your full audience across every channel rather than being seen once and forgotten.', 'url' => '/industries/tech-saas/content-repurposing', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works at this stage',
        'fit_body'    => 'Bluu is designed to run with minimal input from founders. A single monthly conversation is enough to keep the content relevant and in your voice. Everything else — research, writing, publishing, reporting — is handled. No briefing overhead, no project management, no chasing. For a founding team already at capacity, that is the only model that actually works.',
        'fit_proof'   => "Retainers for early-stage SaaS teams start at \$1,500 per month — less than a junior hire's first month salary, with no onboarding time and no management overhead. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.",
        'cta_heading' => 'Your content should be working while you are in product reviews.',
        'cta_sub'     => '— we will tell you honestly whether Bluu makes sense for your stage and what starting would look like.',
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'b2b-saas-growth' => array(
        'hero_tag'    => 'Tech & SaaS — B2B SaaS growth teams',
        'hero_headline' => 'You have the team. You still need the system.',
        'hero_sub'    => 'Post product-market-fit SaaS companies often have a marketer or two — but content is still reactive, inconsistent, and siloed from what is happening in the market. Bluu provides the research intelligence and content engine that turns scattered output into a coherent, compounding brand presence.',
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'B2B SaaS companies between 10 and 40 people, post product-market-fit, with at least one marketing hire — but no structured content system that produces consistent output informed by real market intelligence.',
        'who_items'   => array(
            'You have a marketing function but content output is still inconsistent — driven by whoever has bandwidth rather than a structured editorial calendar.',
            'Your team is focused on demand generation and paid channels, and brand content gets what is left over — which is usually not much.',
            'You want to outpublish competitors who have bigger teams — and you know that research-informed content is how you do that efficiently.',
            'You are producing content but not repurposing it — each piece does its job once and then gets forgotten rather than working across every channel.',
        ),
        'pain_heading' => 'The growth-stage content gap',
        'pain_body'   => 'At growth stage the content problem shifts. You are no longer doing nothing — but what you are doing is not systematic. Publishing is inconsistent. Competitor monitoring is ad hoc. The repurposing never happens. The result is a brand that feels less polished and less present than your product and team deserve.',
        'pains'       => array(
            array( 'title' => 'Marketing bandwidth goes to campaigns not brand', 'body' => "Your marketing team is running paid, managing events, and supporting sales. Content that builds long-term brand authority is always the next quarter's priority." ),
            array( 'title' => 'No intelligence layer under the content', 'body' => 'Content is produced based on internal ideas rather than what is actually happening in the market. Without competitor and audience intelligence, it is hard to know if you are talking about what your buyers care about.' ),
            array( 'title' => 'Each piece of content is a one-time event', 'body' => 'A blog post goes out, a LinkedIn post goes up, and that is the end of it. No repurposing, no cross-channel amplification, no compounding. You are working harder than the output justifies.' ),
        ),
        'uc_heading'  => 'The use cases growth teams get the most from',
        'uc_intro'    => 'Growth-stage SaaS teams typically benefit most from adding intelligence and repurposing to whatever content they are already producing — getting more from the same effort.',
        'use_cases'   => array(
            array( 'title' => 'Competitor intelligence', 'why' => 'A weekly competitor digest gives your marketing team a structured intelligence layer they can use to sharpen messaging, identify gaps, and inform the editorial calendar without spending hours doing the research themselves.', 'url' => '/industries/tech-saas/competitor-intelligence', 'cta' => 'See this use case' ),
            array( 'title' => 'Content repurposing engine', 'why' => 'Every long-form piece your team produces should be working across six to eight formats and channels, not just one. The repurposing engine multiplies the reach of your existing content output without adding proportional effort.', 'url' => '/industries/tech-saas/content-repurposing', 'cta' => 'See this use case' ),
            array( 'title' => 'Product launch content', 'why' => 'Growth-stage companies ship frequently. A structured launch content package ensures every release gets proper multi-channel coverage rather than a rushed blog post and tweet on the day.', 'url' => '/industries/tech-saas/product-launch-content', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'How Bluu works alongside your existing team',
        'fit_body'    => 'Bluu is not a replacement for your marketing team — it is the intelligence and production layer that makes your team more effective. We handle the research, the repurposing, and the production so your team can focus on strategy, campaigns, and the work that requires deep product and customer knowledge. The two work together, not in competition.',
        'fit_proof'   => 'Most growth-stage retainers sit at $2,500 per month — a fraction of the cost of an additional hire, with no ramp time and a system that starts producing from day one. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.',
        'cta_heading' => 'Your competitors are publishing more than you. That gap compounds.',
        'cta_sub'     => 'to talk through where the content gaps are and what closing them would look like with Bluu.',
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'no-code-ai-startups' => array(
        'hero_tag'    => 'Tech & SaaS — No-code & AI tool startups',
        'hero_headline' => 'In your category, the brand that educates fastest wins.',
        'hero_sub'    => 'No-code and AI tool categories are defined by content. The companies that establish themselves as educators and thought leaders in an emerging space are the ones that attract the most users, the most press, and the most inbound — while others are still figuring out their messaging. Bluu runs the content engine that gets you there.',
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'No-code and AI tool startups — typically 1 to 8 people, product-led growth, operating in fast-moving categories where content and community are the primary acquisition channels.',
        'who_items'   => array(
            'You are building in a category that is moving fast — where what people believe about the space is as important as what your product actually does.',
            'Your primary growth channel is education and word of mouth — you need a consistent content presence to feed that engine rather than relying on sporadic posts.',
            'You are watching competitors publish tutorials, opinion pieces, and trend commentary while you are heads-down building — and you know that visibility gap has a cost.',
            'You want trend monitoring as much as content production — knowing where the category is heading is as valuable as talking about where you are now.',
        ),
        'pain_heading' => 'The no-code and AI startup content challenge',
        'pain_body'   => 'In fast-moving categories, the window to establish category authority is short. The tools that people learn to associate with a particular outcome or workflow early are the ones that become defaults. Content is how that association gets built — and most startups in this space are underinvesting in it while their category is still being defined.',
        'pains'       => array(
            array( 'title' => 'The category is being defined without your voice in it', 'body' => 'Someone is writing the narrative of your category right now. If it is not you, it is a competitor or a journalist who may not be telling the story you want told.' ),
            array( 'title' => 'Trend velocity outpaces your publishing cadence', 'body' => 'In AI and no-code categories, what matters changes week to week. A content operation that responds to trends in real time is worth significantly more than one that publishes on a slow, planned schedule.' ),
            array( 'title' => 'Technical founders undersell the non-technical value', 'body' => 'The people most likely to become your best customers often do not speak the language your founders use naturally. Content that translates technical capability into accessible value is the bridge that acquisition depends on.' ),
        ),
        'uc_heading'  => 'The use cases that matter most in fast-moving categories',
        'uc_intro'    => 'For no-code and AI startups, the combination of trend intelligence and founder brand content is particularly powerful — staying ahead of what is happening in your category while building the personal authority that makes people trust your perspective on it.',
        'use_cases'   => array(
            array( 'title' => 'Founder brand building', 'why' => 'In emerging categories, people follow founders as much as products. A consistent founder presence that educates, opines, and engages is one of the most efficient growth channels available to an early-stage startup in a hot space.', 'url' => '/industries/tech-saas/founder-brand', 'cta' => 'See this use case' ),
            array( 'title' => 'Competitor intelligence', 'why' => 'In no-code and AI categories, the competitive landscape changes monthly. Weekly intelligence on what competitors are building, saying, and positioning ensures you are always responding to the current state of the market, not the one from six months ago.', 'url' => '/industries/tech-saas/competitor-intelligence', 'cta' => 'See this use case' ),
            array( 'title' => 'Content repurposing engine', 'why' => 'Educational content performs best when it reaches people on the platform they prefer. A single tutorial or opinion piece should become a LinkedIn post, an X thread, a newsletter section, and a short video script — the repurposing engine makes that happen without additional effort.', 'url' => '/industries/tech-saas/content-repurposing', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works for fast-moving categories',
        'fit_body'    => "Bluu's research-led approach is particularly well suited to categories that change quickly. We monitor your space continuously — what competitors are saying, what trends are emerging, what your audience is talking about — and that intelligence feeds directly into the content we produce. The result is content that feels timely and relevant rather than generic and planned six weeks in advance.",
        'fit_proof'   => 'Retainers start at $1,500 per month. Most no-code and AI startups we work with begin with a combination of founder brand content and competitor intelligence — the two use cases that deliver visible impact fastest. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.',
        'cta_heading' => 'Your category is being defined right now. Be part of the conversation.',
        'cta_sub'     => 'to talk through where your category is heading and how Bluu can help you get ahead of it.',
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'developer-tools' => array(
        'hero_tag'    => 'Tech & SaaS — Developer tools & infrastructure',
        'hero_headline' => 'You speak in code. Your buyers speak in outcomes. We bridge that gap.',
        'hero_sub'    => 'Developer tools companies face a content challenge that most agencies do not understand — you need to be technically credible enough to earn developer trust while being commercially clear enough to win budget approval from buyers who have never written a line of code. Bluu produces content that does both.',
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'Developer tools and infrastructure companies — typically 5 to 30 people — where the founding team has deep technical expertise but limited capacity or comfort with the commercial and editorial content that drives top-of-funnel awareness and buyer confidence.',
        'who_items'   => array(
            'You have technical founders who can write documentation fluently but find thought leadership, positioning content, and buyer-facing copy difficult to prioritise or produce.',
            'You are selling to a dual audience — developers who evaluate on technical merit and buyers or managers who approve on commercial value — and your content currently serves one but not the other.',
            'You are building in a competitive infrastructure or tooling space and you want to establish a content presence that demonstrates genuine technical depth, not marketing gloss.',
            'You know your competitors are building developer communities and publishing technical content — and you want to be part of that conversation, not absent from it.',
        ),
        'pain_heading' => 'The developer tools content challenge',
        'pain_body'   => 'Developer tools companies have a content problem with two distinct layers. The technical layer — developer docs, tutorials, technical blog posts — is often handled reasonably well by the engineering team. The commercial layer — positioning content, thought leadership, buyer-facing case studies — almost never gets the attention it needs, because the people who could write it are building product, and the people who should be championing it do not understand it well enough.',
        'pains'       => array(
            array( 'title' => 'Technical depth without commercial translation', 'body' => 'Your product solves a real, significant problem. Your content explains how it works technically without clearly articulating the business impact for the buyer who holds the budget.' ),
            array( 'title' => 'Developer credibility requires consistency', 'body' => 'Developer audiences are sceptical of marketing. Earning their trust requires consistent, technically credible content published over time — not a burst of posts around a launch.' ),
            array( 'title' => 'Competitor monitoring is completely informal', 'body' => 'In fast-moving infrastructure and tooling categories, competitors pivot messaging quickly. Without a structured monitoring process, you are always reacting rather than positioning proactively.' ),
        ),
        'uc_heading'  => 'The most valuable use cases for developer tools companies',
        'uc_intro'    => 'For developer tools companies the highest-impact starting point is usually a combination of competitor intelligence — to stay ahead of how the space is positioning — and founder brand content that earns technical credibility with the developer audience.',
        'use_cases'   => array(
            array( 'title' => 'Competitor intelligence', 'why' => 'Infrastructure and tooling categories move fast. Knowing how competitors are positioning their technical capabilities, what their developer communities are talking about, and how their messaging is evolving is essential for staying ahead rather than reactive.', 'url' => '/industries/tech-saas/competitor-intelligence', 'cta' => 'See this use case' ),
            array( 'title' => 'Founder brand building', 'why' => "In developer tools categories, the founder's personal credibility and technical perspective is one of the most powerful brand assets available. A consistent LinkedIn and technical blog presence builds the kind of trust that marketing alone cannot manufacture.", 'url' => '/industries/tech-saas/founder-brand', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works for developer tools companies',
        'fit_body'    => "Bluu's research-first approach means we understand your competitive landscape before we write a single word. We work with your technical team to understand what you are building and why it matters, then we translate that into content that earns developer credibility while winning commercial confidence. We do not produce generic marketing copy dressed up in technical language — that is worse than nothing in a developer audience.",
        'fit_proof'   => 'Retainers for developer tools companies typically start at $2,000 per month given the research depth required. The first engagement usually focuses on competitive intelligence and founder content before expanding to broader content production. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.',
        'cta_heading' => 'Your technical depth deserves content that matches it.',
        'cta_sub'     => 'to talk through your audience, your category, and what a content programme would look like for your specific situation.',
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'marketing-consultants' => array(
        'hero_tag'    => 'Agencies & consultants — Marketing & growth consultants',
        'hero_headline' => 'You tell clients content builds pipeline. Yours should too.',
        'hero_sub'    => 'Marketing and growth consultants understand content ROI better than almost any other audience. Which makes the gap between what you advise and what you practice particularly costly. Bluu runs your own content operation so that gap closes — and your inbound reflects the expertise you are already selling.',
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'Independent marketing and growth consultants — typically solo or 2 to 5 people — who advise clients on content strategy, brand building, and demand generation while chronically underinvesting in their own brand content.',
        'who_items'   => array(
            'You advise clients on content and marketing strategy and you know from experience that consistent publishing builds authority and inbound pipeline.',
            'Your own publishing is inconsistent — you post when you have time, which means you post infrequently and your pipeline reflects the gaps.',
            'You win clients primarily through referrals and you want to build a content-driven inbound channel that works in parallel and reduces your dependence on any single referral source.',
            'The irony of not applying your own advice to your own business is not lost on you — you just need someone to take the execution off your plate.',
        ),
        'pain_heading' => "The consultant's content contradiction",
        'pain_body'   => "Marketing consultants occupy a uniquely uncomfortable position. You build content strategies for clients, oversee their execution, and track their results — all while your own LinkedIn, newsletter, and blog sit largely idle. Every day your own content is absent is a day you are proving the wrong thing about what you sell.",
        'pains'       => array(
            array( 'title' => 'Client work always outranks own brand', 'body' => 'Every hour spent on client deliverables is an hour not spent on your own brand. Without a structure that runs independently of client cycles, your content will always come second.' ),
            array( 'title' => 'Referrals are fragile at scale', 'body' => 'Referrals produce your best clients but they are unreliable and uncontrollable. A content engine builds a parallel inbound channel that does not depend on someone else remembering to mention your name.' ),
            array( 'title' => 'The credibility gap is visible', 'body' => 'Prospects who find you through referrals often check your LinkedIn before they respond. An inactive profile undermines the warm introduction before the first conversation has happened.' ),
        ),
        'uc_heading'  => 'Where marketing consultants start with Bluu',
        'uc_intro'    => 'For marketing consultants the most impactful starting point is almost always their own brand content operation — turning the expertise they already have into a consistent published presence that works while they are delivering for clients.',
        'use_cases'   => array(
            array( 'title' => 'Own brand content operation', 'why' => 'The full content engine for your own practice — research, writing, and publishing across LinkedIn, newsletter, and blog — running consistently in the background regardless of how busy client work gets.', 'url' => '/industries/agencies-consultants/own-brand-content', 'cta' => 'See this use case' ),
            array( 'title' => 'Thought leadership publishing', 'why' => 'You have opinions about marketing and growth that are worth publishing — perspectives shaped by real client experience that your target audience cannot get from a generic agency blog. Structured thought leadership turns that expertise into a visible public presence.', 'url' => '/industries/agencies-consultants/thought-leadership', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works for marketing consultants specifically',
        'fit_body'    => "Working with a content partner who understands your field is essential — you will immediately know if the content is generic or uninformed. Bluu's research-led approach means we monitor your market, understand your positioning, and produce content that reflects genuine expertise rather than surface-level marketing commentary. The monthly strategy conversation keeps everything sharp and specific to your audience.",
        'fit_proof'   => 'Retainers for marketing consultants typically start at $1,500 per month for own brand content and scale to $2,500 with a full thought leadership programme. Most start with the lighter option and expand once they see the pipeline impact. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.',
        'cta_heading' => 'Practice what you preach. Starting this month.',
        'cta_sub'     => 'and we will be direct about whether Bluu is the right fit for your practice and what your content operation could look like.',
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'branding-design-studios' => array(
        'hero_tag'    => 'Agencies & consultants — Branding & design studios',
        'hero_headline' => 'Your work is extraordinary. The words around it should be too.',
        'hero_sub'    => 'Branding and design studios are among the most visually compelling businesses in any market — and among the worst at written content. The portfolio is beautiful, the case studies are nonexistent, the LinkedIn is sporadic, and the newsletter has not gone out since last year. Bluu provides the written content engine that gives your visual work the context and reach it deserves.',
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'Branding studios and design agencies — typically 2 to 8 people — who do exceptional visual and brand work but have never built a consistent written content presence to match it.',
        'who_items'   => array(
            'You have a portfolio that genuinely stands out — but it is primarily visible to clients you have already worked with and people those clients have recommended you to.',
            'Your studio has a distinctive voice and perspective on brand, design, and creative strategy — but it exists in conversations and pitches, not published content.',
            'You win work primarily through referrals and you want a written content presence that works in parallel — making you discoverable and credible to people who have not been directly recommended to you.',
            'You have started a blog, newsletter, or LinkedIn presence at some point but it has been inconsistent because client work always takes priority.',
        ),
        'pain_heading' => 'The design studio written content problem',
        'pain_body'   => 'Design studios live in the visual. Writing — specifically the strategic, consistent, long-form writing that builds brand authority — is a different skill set, a different mode of thinking, and a different type of time investment. Most studios try to do it themselves and find it slow, difficult, and quickly deprioritised. The result is a studio that looks exceptional in person and invisible online.',
        'pains'       => array(
            array( 'title' => 'Portfolio without a narrative is just a gallery', 'body' => 'Beautiful work without written context — the thinking behind it, the problem it solved, the outcome it produced — gives prospects no way to assess whether you understand their kind of challenge.' ),
            array( 'title' => 'LinkedIn is visual but needs words to reach people', 'body' => 'Design studios are well positioned on Instagram but underperform on LinkedIn — where their B2B clients actually make decisions. LinkedIn requires consistent written content to build reach, and most studios have neither the habit nor the capacity for it.' ),
            array( 'title' => "The cobbler's studio has no shoes", 'body' => "You build brands for clients — brand voice, brand narrative, brand presence. Your own studio's written brand is an afterthought. That contradiction is visible to every sophisticated prospect who looks." ),
        ),
        'uc_heading'  => 'Where branding studios get the most from Bluu',
        'uc_intro'    => 'For design studios the highest-impact combination is own brand content — LinkedIn, newsletter, and blog — paired with thought leadership that articulates their perspective on brand, design, and creative strategy.',
        'use_cases'   => array(
            array( 'title' => 'Own brand content operation', 'why' => "A consistent written content presence — LinkedIn posts, newsletter, and blog — that gives your studio a voice as distinctive as your visual work. Written in your studio's tone, published on your schedule, without your team having to do it.", 'url' => '/industries/agencies-consultants/own-brand-content', 'cta' => 'See this use case' ),
            array( 'title' => 'Thought leadership publishing', 'why' => 'Your studio has a genuine point of view on brand strategy, design, and what makes brands work commercially. Publishing that perspective consistently is how you attract clients who are looking for strategic thinking, not just execution.', 'url' => '/industries/agencies-consultants/thought-leadership', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works for design studios',
        'fit_body'    => "Bluu's approach to brand voice is meticulous — we spend real time understanding how your studio thinks, talks, and what it believes before we write a word. The result is content that sounds like the smartest, most articulate version of your studio's perspective, not a generic agency blog. For a studio where visual distinctiveness is everything, written content that feels generic is worse than nothing.",
        'fit_proof'   => 'Retainers for design studios typically start at $1,500 per month and are built around a core of LinkedIn and newsletter content. Case study writing is available as an add-on — a natural complement once the content engine is running. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.',
        'cta_heading' => 'Your portfolio deserves an audience bigger than your existing network.',
        'cta_sub'     => "to talk through your studio's voice and what a consistent written content presence would look like alongside your visual work.",
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'pr-communications' => array(
        'hero_tag'    => 'Agencies & consultants — PR & communications firms',
        'hero_headline' => 'You place clients in publications. When did you last appear in one yourself?',
        'hero_sub'    => 'PR and communications firms write compelling narratives for clients every single day — and produce almost nothing for their own brand. The expertise is there. The opinions are there. The time is not. Bluu runs the content operation that closes the gap between what you do for clients and what you do for yourself.',
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'PR and communications agencies and consultancies — typically 3 to 10 people — that produce expert communications for clients daily but have never built a consistent content presence under their own name.',
        'who_items'   => array(
            "You spend your working days writing press releases, opinion pieces, and media pitches for clients — and almost none of that output appears anywhere under your own firm's name.",
            "Your firm has a genuine perspective on communications, reputation management, media relations, and narrative strategy — perspectives built from years of real client experience.",
            'You win clients primarily through referrals and reputation — but your online presence does not reflect the calibre of the work you actually do.',
            'You have started a newsletter or LinkedIn presence at some point but it has not survived contact with a busy campaign season.',
        ),
        'pain_heading' => 'The PR firm content paradox',
        'pain_body'   => 'PR firms exist to build visibility and authority for their clients. The paradox is that most have built almost none for themselves. They are the most qualified businesses in any market to understand the value of consistent, well-placed content — and among the least consistent practitioners of it. The reason is always the same: client work consumes every available hour.',
        'pains'       => array(
            array( 'title' => 'Expertise without a platform', 'body' => 'Your firm has decades of combined experience in reputation management, media relations, and communications strategy. Almost none of it is published. That expertise is invisible to any prospect who has not already been referred to you.' ),
            array( 'title' => 'The market cannot verify your authority', 'body' => 'Prospects evaluating PR firms want to see evidence of strategic thinking and communications expertise before they engage. An absent content presence forces them to rely entirely on word of mouth — a fragile dependency.' ),
            array( 'title' => 'Client campaigns leave no time for own brand', 'body' => 'Campaign seasons consume everything. Between client deadlines, media cycles, and account management, own-brand content is always the first thing that gets pushed. It has been getting pushed for years.' ),
        ),
        'uc_heading'  => 'Where PR firms start with Bluu',
        'uc_intro'    => 'For PR and communications firms the most natural starting point is thought leadership — turning the expertise and perspective that exists inside the firm into consistent published opinion that builds the authority the firm is uniquely qualified to have.',
        'use_cases'   => array(
            array( 'title' => 'Thought leadership publishing', 'why' => 'Your firm has genuine expertise in communications, reputation, and narrative strategy. Published thought leadership — regular articles on what works in PR, commentary on reputation management, opinion on media and communications trends — builds the authority that your client roster alone cannot establish publicly.', 'url' => '/industries/agencies-consultants/thought-leadership', 'cta' => 'See this use case' ),
            array( 'title' => 'Own brand content operation', 'why' => "A full content operation for your own firm — LinkedIn, newsletter, and blog — running consistently in the background while you run campaigns for clients. Content that demonstrates the same strategic thinking you bring to client work, applied to your own brand for once.", 'url' => '/industries/agencies-consultants/own-brand-content', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works for PR and communications firms',
        'fit_body'    => "PR firms have a higher quality bar for written content than almost any other industry — you know immediately when something is generic, off-message, or poorly crafted. Bluu's writing standard is built around that expectation. We spend time understanding your firm's voice and perspective before we produce a word, and every piece is reviewed by you before it goes anywhere. The output should feel like your best account director wrote it on a good day.",
        'fit_proof'   => 'Retainers for PR and communications firms typically start at $1,500 to $2,000 per month depending on volume. Most start with thought leadership and expand to a full own-brand content operation once the editorial rhythm is established. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.',
        'cta_heading' => 'You build visibility for clients. It is time to build some for yourself.',
        'cta_sub'     => 'We will have an honest conversation about whether Bluu makes sense for your firm right now.',
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'strategy-consultants' => array(
        'hero_tag'    => 'Agencies & consultants — Boutique strategy consultants',
        'hero_headline' => 'One referral source drying up could cut your pipeline in half. Content is the insurance.',
        'hero_sub'    => 'Boutique strategy consultants win almost entirely through referrals — and most know that this is both a strength and a vulnerability. Content is the one growth channel that builds in parallel to referrals, works while you are delivering, and compounds over time. Bluu builds and runs it so you never have to choose between delivery and business development.',
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'Boutique strategy consultancies and solo strategic advisors — typically 1 to 4 people — who win high-ticket engagements through relationships and reputation but have never built a content engine to complement and eventually reduce their dependence on those channels.',
        'who_items'   => array(
            'You run a boutique practice that advises senior leaders and organisations on strategy, transformation, or specialist challenges — and you win almost entirely through referrals and existing relationships.',
            'You have thought seriously about what would happen to your pipeline if one or two key referral relationships changed — and the answer is uncomfortable.',
            'You have genuine intellectual frameworks, methodologies, and perspectives that distinguish how you think about strategy from how others do — and none of it is published.',
            'You have considered writing a book, a newsletter, or building a LinkedIn presence for years but it has never survived contact with the next client engagement.',
        ),
        'pain_heading' => 'The referral dependency trap',
        'pain_body'   => 'Referral-dependent businesses have a common trajectory: a period of abundance when relationships are active and work flows consistently, followed by a dry spell when key contacts change roles, retire, or simply stop referring. Content is the only way to build a pipeline that does not depend on someone else\'s memory and generosity. Most strategy consultants know this. Almost none have built it.',
        'pains'       => array(
            array( 'title' => "All pipeline is in other people's hands", 'body' => 'When your entire pipeline depends on referrals, you have no control over its timing or volume. A bad quarter is not something you can actively fix — you can only wait and hope the next referral comes through.' ),
            array( 'title' => 'Expertise without visibility is wasted potential', 'body' => 'Strategy consultants with 20 years of experience have frameworks, perspectives, and opinions that organisations would pay well to access. Almost none of it exists in a form that someone outside their existing network can find.' ),
            array( 'title' => 'Content always loses to delivery', 'body' => 'Every time you intend to write the article, record the podcast, or post on LinkedIn, a client deliverable takes priority. Without a system that runs independently of your availability, content will always come last.' ),
        ),
        'uc_heading'  => 'Where strategy consultants start with Bluu',
        'uc_intro'    => 'For strategy consultants the most valuable starting point is almost always thought leadership — publishing the frameworks and perspectives that distinguish your approach and building the visibility that generates inbound enquiries from people who have never been directly referred to you.',
        'use_cases'   => array(
            array( 'title' => 'Thought leadership publishing', 'why' => 'Your strategic frameworks, your perspective on organisational change, your view on what most consulting engagements get wrong — published consistently, these build the intellectual authority that attracts high-quality inbound rather than waiting for the next warm introduction.', 'url' => '/industries/agencies-consultants/thought-leadership', 'cta' => 'See this use case' ),
            array( 'title' => 'Own brand content operation', 'why' => 'A full content engine for your practice — LinkedIn, newsletter, long-form articles — running consistently in the background while you deliver for clients. The pipeline channel that works even when you cannot.', 'url' => '/industries/agencies-consultants/own-brand-content', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works for strategy consultants',
        'fit_body'    => "Strategy consultants have a very specific quality bar — content that sounds generic, that oversimplifies, or that lacks genuine intellectual substance is worse for their reputation than no content at all. Bluu's approach starts with depth — a proper understanding of your frameworks, your thinking, and what makes your perspective genuinely distinctive before we write a word. The result is content that your clients and peers would recognise as yours.",
        'fit_proof'   => "Retainers for strategy consultants typically start at \$2,000 per month given the intellectual depth required. Most start with a thought leadership programme and a monthly intelligence digest to keep the content informed by what is happening in their clients' sectors. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.",
        'cta_heading' => 'Your best thinking deserves an audience beyond your current network.',
        'cta_sub'     => 'An honest conversation about whether Bluu makes sense for your practice and what building a content engine would look like from where you are now.',
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'recruitment-consultants' => array(
        'hero_tag'    => 'Agencies & consultants — Recruitment & talent consultants',
        'hero_headline' => 'Every recruiter looks the same on LinkedIn. Content is how the best ones stand out.',
        'hero_sub'    => 'Recruitment is one of the most competitive professional service categories on LinkedIn — and one of the most homogeneous. Market commentary, salary data, hiring trend analysis, and genuine talent market perspective are the tools that separate the specialists from the generalists. Bluu produces that content consistently so you build the authority others are still claiming without evidence.',
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'Independent recruitment consultants and boutique talent agencies — typically solo to 6 people — operating in specialist niches where genuine market knowledge and visible authority meaningfully influence which recruiter a client chooses.',
        'who_items'   => array(
            'You specialise in a specific function, seniority level, or industry sector — and you have genuine market intelligence that generalist recruiters do not have.',
            'You know that clients choose recruiters they trust and respect as market experts — and that building that reputation requires consistent public presence, not just good placements.',
            'You are active on LinkedIn but your posting is inconsistent and you know that inconsistency undermines the authority you are trying to build.',
            'You want to attract better quality inbound from both clients and candidates — the kind of inbound that comes to you because they have read your content and already trust your market knowledge.',
        ),
        'pain_heading' => 'The recruitment visibility challenge',
        'pain_body'   => 'Recruitment is a trust business — clients and candidates choose the consultant they believe understands the market best and will deliver. The problem is that demonstrating that understanding publicly, consistently, and convincingly requires a content infrastructure that most recruiters have never built. The result is a market where almost everyone looks the same from the outside and differentiation happens only in conversation.',
        'pains'       => array(
            array( 'title' => 'Market expertise that cannot be verified', 'body' => 'You know more about your talent market than most. That knowledge is invisible to any client or candidate who finds you through LinkedIn, a search, or a cold introduction — they have no way to verify it before they decide to engage.' ),
            array( 'title' => 'Competing on personality alone is exhausting', 'body' => 'Relationship-driven sales is necessary in recruitment but not sufficient for scale. Content allows your market perspective to reach people you have never spoken to — at scale, continuously, without additional effort.' ),
            array( 'title' => 'The LinkedIn posting trap', 'body' => 'Many recruiters post on LinkedIn in bursts — usually around a candidate placement or a role they are filling — and then go quiet. That pattern signals availability rather than authority and trains your network to tune you out.' ),
        ),
        'uc_heading'  => 'Where recruitment consultants start with Bluu',
        'uc_intro'    => 'For recruitment consultants the highest-impact starting point is almost always own brand content with a specific focus on market commentary and talent intelligence — the content types that build specialist authority fastest in this sector.',
        'use_cases'   => array(
            array( 'title' => 'Own brand content operation', 'why' => 'A consistent content presence built specifically for a recruitment audience — salary market updates, hiring trend commentary, talent availability insights, and candidate market analysis. The content that demonstrates specialist knowledge rather than just announcing job vacancies.', 'url' => '/industries/agencies-consultants/own-brand-content', 'cta' => 'See this use case' ),
            array( 'title' => 'Thought leadership publishing', 'why' => 'Published perspective on where your talent market is heading — structured articles, quarterly market reports, and opinion pieces on hiring trends — builds the kind of specialist authority that makes clients call you before they post a role.', 'url' => '/industries/agencies-consultants/thought-leadership', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works for recruitment consultants',
        'fit_body'    => "Bluu produces content that sounds like a genuine market expert, not a recruiter trying to sound like one. We monitor your specific talent market — what is moving, what is changing, what your target audience is discussing — and use that intelligence to produce commentary that reflects real market knowledge. The result is content that attracts the clients and candidates you want rather than the ones who were already going to call you.",
        'fit_proof'   => 'Retainers for recruitment consultants typically start at $1,500 per month covering LinkedIn content, a monthly market commentary newsletter, and quarterly market reports. Most see meaningful inbound improvement within 90 days of consistent publishing. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.',
        'cta_heading' => 'Stop looking like every other recruiter in your niche.',
        'cta_sub'     => 'and we will be honest about whether Bluu makes sense for your specific market and practice.',
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'business-coaches' => array(
        'hero_tag'    => 'Agencies & consultants — Business coaches & advisors',
        'hero_headline' => 'Your content is your proof of expertise. If it is sporadic, so is your pipeline.',
        'hero_sub'    => 'For business coaches and advisors, every piece of content is a direct client touchpoint — a demonstration of how you think, what you believe, and whether your perspective is worth paying for. Bluu runs the content operation that keeps that demonstration consistent every week, not just when you find a spare hour.',
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'Business coaches and advisors — almost always solo — for whom content is the primary pipeline channel and whose publishing is currently too inconsistent to build the audience and authority their expertise deserves.',
        'who_items'   => array(
            'You are a business coach or advisor whose clients find you primarily through LinkedIn, referrals from people who follow your content, or recommendations from people who have read your work.',
            'You know from experience that the weeks you publish consistently are the weeks you get the most inbound — and you know equally well that your publishing is not consistent enough.',
            'You have things worth saying — frameworks, lessons, perspectives, opinions on business and leadership — but the blank page problem and the time constraint combine to keep most of it unpublished.',
            'You want to build an audience that generates inbound consistently rather than relying on how recently you published something or who you happened to meet at an event.',
        ),
        'pain_heading' => 'The coach content cycle',
        'pain_body'   => 'Business coaches live and die by their content pipeline in a way that almost no other professional does. A good month of publishing produces enquiries. A quiet month produces silence. The problem is that the months spent coaching clients intensively are usually the months when content suffers most — creating an inverse relationship between delivery and pipeline that is as predictable as it is frustrating.',
        'pains'       => array(
            array( 'title' => 'Delivery and pipeline compete for the same hours', 'body' => 'The hours you spend coaching are hours you are not publishing. The hours you spend publishing are hours you are not coaching. Without a system that decouples content from your personal availability, the cycle continues indefinitely.' ),
            array( 'title' => 'The audience you have built is inconsistently served', 'body' => 'You have built an audience of people who are interested in your perspective. Inconsistent publishing trains them to stop expecting you — and when they stop expecting you, they stop thinking of you when they need what you offer.' ),
            array( 'title' => 'Sporadic quality is worse than consistent good', 'body' => 'A great piece published once every six weeks builds less authority than a good piece published every week. Consistency is more important than perfection in building an audience that trusts and buys from you.' ),
        ),
        'uc_heading'  => 'Where business coaches start with Bluu',
        'uc_intro'    => 'For business coaches the entire content operation — LinkedIn, newsletter, and long-form content — needs to run consistently and independently of coaching availability. That is what the own brand operation delivers.',
        'use_cases'   => array(
            array( 'title' => 'Own brand content operation', 'why' => 'A fully managed content engine for your coaching practice — LinkedIn posts, newsletter, and long-form articles — written in your voice, published on your schedule, running whether you are in back-to-back sessions or on holiday. The pipeline channel that never takes a week off.', 'url' => '/industries/agencies-consultants/own-brand-content', 'cta' => 'See this use case' ),
            array( 'title' => 'Thought leadership publishing', 'why' => 'Your coaching frameworks, your perspective on leadership and business, your honest takes on what organisations get wrong — published consistently, these attract the clients who are already aligned with how you think before the first conversation happens.', 'url' => '/industries/agencies-consultants/thought-leadership', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works for business coaches',
        'fit_body'    => "For coaches, the voice and authenticity of the content is everything — generic business advice under your name actively damages your brand with the sophisticated clients you want to attract. Bluu spends real time understanding how you think, what frameworks you use, and what your genuine perspective is before producing anything. The content we produce should feel like you had a great writing day, not like something produced by a content factory.",
        'fit_proof'   => 'Retainers for business coaches typically start at $1,500 per month covering LinkedIn content and a monthly newsletter. The monthly strategy conversation is the only consistent time commitment required from you — everything else is handled. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.',
        'cta_heading' => 'Your next client is reading content right now. It should be yours.',
        'cta_sub'     => 'to talk about your practice, your audience, and what a consistent content engine would change about your pipeline.',
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'paid-media-agencies' => array(
        'hero_tag'    => 'Agencies & consultants — Performance & paid media agencies',
        'hero_headline' => 'Paid channels get results. Organic content compounds. You need both.',
        'hero_sub'    => 'Performance agencies are built around paid channels — and they are increasingly aware that clients want organic content as part of the mix. Bluu provides the research-led organic content engine that complements your paid expertise without requiring you to build a content team from scratch.',
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'Performance and paid media agencies — typically 3 to 15 people — that are actively diversifying into organic content services for clients or want to build their own organic presence to reduce dependence on paid channels for their own marketing.',
        'who_items'   => array(
            'You run a paid media agency that is being asked by clients to add organic content to the engagement — and you want to deliver it without building an internal content team.',
            "You have noticed that your own agency's inbound relies heavily on paid channels and you want to build an organic content presence that works in parallel.",
            'You are expanding your service offering and want a reliable white-label content partner who can deliver organic content under your name for clients.',
            'You want a specialist partner who understands organic content performance — not just a freelancer who writes to brief without thinking about reach or compounding.',
        ),
        'pain_heading' => 'The organic gap in a paid-first agency',
        'pain_body'   => "Paid media agencies understand performance intimately — CPCs, ROAS, attribution models. Organic content is a different discipline with different timelines and different metrics. Most paid agencies either avoid it entirely or attempt it with the wrong framework and wonder why the results do not look like paid channel results. The solution is a specialist content partner who understands the organic playbook as well as you understand paid.",
        'pains'       => array(
            array( 'title' => 'Clients increasingly want organic alongside paid', 'body' => 'Budget-conscious clients are asking for organic content as a complement to paid spend. Saying you do not offer it risks losing the relationship to a full-service agency.' ),
            array( 'title' => 'Organic requires different expertise and different patience', 'body' => 'Organic content does not produce the short-term attribution data that paid does. Building the internal capability and client expectations for organic is a significant shift for a paid-first agency.' ),
            array( 'title' => 'Your own agency content is almost entirely absent', 'body' => 'Performance agencies almost universally underinvest in their own organic content — preferring to spend on paid for their own marketing. The irony is not lost on sophisticated clients who notice.' ),
        ),
        'uc_heading'  => 'The most relevant use cases for performance agencies',
        'uc_intro'    => 'For paid media agencies the most natural entry points are white-label production for client organic content and own brand content that builds their organic presence independently of paid spend.',
        'use_cases'   => array(
            array( 'title' => 'White-label content production', 'why' => "Bluu produces organic content for your clients under your agency's name — blog posts, social content, newsletters — so you can add organic to client engagements without building an internal content team.", 'url' => '/industries/agencies-consultants/white-label-production', 'cta' => 'See this use case' ),
            array( 'title' => 'Own brand content operation', 'why' => 'Building an organic content presence for your own agency demonstrates to clients that you understand and believe in organic — and reduces your own marketing dependency on paid channels over time.', 'url' => '/industries/agencies-consultants/own-brand-content', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works for performance agencies expanding into organic',
        'fit_body'    => "Bluu's research-led approach means we bring the same data-informed discipline to organic content that your team brings to paid — monitoring what is working in your clients' categories, what competitors are publishing, and what audience signals indicate about content appetite. Organic content managed with a performance agency mindset produces better results and more credible reporting than content produced on instinct.",
        'fit_proof'   => 'White-label arrangements for performance agencies are scoped based on client volume and content type. Own brand retainers start at $1,500 per month. Reach out to discuss a structure that fits your client base. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.',
        'cta_heading' => 'Add organic to your offering without adding headcount.',
        'cta_sub'     => 'to talk through whether a white-label arrangement or own brand content programme makes more sense for your agency right now.',
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'full-service-agencies' => array(
        'hero_tag'    => 'Agencies & consultants — Full-service digital agencies',
        'hero_headline' => 'More client demand than content capacity. Bluu is the overflow partner.',
        'hero_sub'    => 'Full-service digital agencies often have more content demand from clients than their internal team can comfortably handle at quality. Bluu operates as a white-label production partner — reliable, invisible, and calibrated to your quality standard — so you can take on more work without the risk and cost of additional hires.',
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'Full-service digital agencies — typically 10 to 30 people — that include content production as part of their client offering and periodically have more demand than their team can serve without compromising quality or burning out.',
        'who_items'   => array(
            'You run a full-service agency that offers content as part of client retainers and your internal content team is at or near capacity.',
            'You have turned down new content work or delivered below your usual standard because of capacity constraints — and you want a reliable overflow option that does not require a permanent hire.',
            'You need a production partner who can work to your brief, at your quality standard, without attribution — so client relationships stay entirely yours.',
            'You are confident in your briefing process and quality review system — you want a production resource, not another agency to manage.',
        ),
        'pain_heading' => 'The full-service agency capacity constraint',
        'pain_body'   => 'Full-service agencies with content in their offering face a recurring capacity challenge — client demand is lumpy, team capacity is fixed, and the choice between turning down work and overloading the team is never a good one. Freelancers introduce quality and reliability risk. Permanent hires are expensive and slow to onboard. A specialist white-label partner who works to your brief is the middle ground most agencies have not fully explored.',
        'pains'       => array(
            array( 'title' => 'Turning down work is expensive', 'body' => 'Every piece of content work you cannot take on is revenue left on the table — and potentially a client relationship that migrates to someone who can serve them more fully.' ),
            array( 'title' => 'Freelancers are unreliable at scale', 'body' => 'Ad-hoc freelancers solve the immediate problem but introduce quality inconsistency, availability uncertainty, and briefing overhead that can cost more than they save.' ),
            array( 'title' => 'Permanent hires are the wrong solution for variable demand', 'body' => 'Hiring to meet peak demand means carrying cost during quiet periods. A production partner that scales with your client load is structurally more efficient.' ),
        ),
        'uc_heading'  => 'The most relevant use case for full-service agencies',
        'uc_intro'    => 'For full-service agencies the primary relationship with Bluu is white-label production — a reliable overflow content resource that works to your brief under your name.',
        'use_cases'   => array(
            array( 'title' => 'White-label content production', 'why' => "Brief-to-draft production for your client content needs — blog posts, LinkedIn articles, newsletters, and social captions — delivered to your timeline, at your quality standard, with no Bluu attribution. You manage the client. We handle the writing.", 'url' => '/industries/agencies-consultants/white-label-production', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works as a white-label partner for full-service agencies',
        'fit_body'    => "Bluu's brief-led production process is designed for agencies — we work from your brief, return structured first drafts, incorporate feedback cleanly, and deliver to agreed timelines. We maintain voice and style guides for each of your clients so there is no reset with each new piece. The arrangement is structured to be as low-friction as possible for your team — we are a production resource, not a relationship you need to manage.",
        'fit_proof'   => 'White-label arrangements are scoped based on monthly volume and content types. Standard turnaround is 48 to 72 hours from brief. Rush turnarounds available. Reach out to discuss a structure that fits your current client load. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.',
        'cta_heading' => 'Take on more work. Deliver the same standard. Keep your name on it.',
        'cta_sub'     => "to talk through your agency's content volume and what a white-label production arrangement would look like.",
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'emerging-dtc-brands' => array(
        'hero_tag'    => 'E-commerce & DTC — Emerging DTC product brands',
        'hero_headline' => "Building a brand from scratch means everything competes for one person's time. Content should not be the thing that loses.",
        'hero_sub'    => 'Early-stage DTC brands are building product, managing supply chain, running ads, and trying to maintain a brand content presence — usually with one or two people. Something always falls behind. Bluu gives you a structured content engine so the brand narrative keeps moving even while everything else demands your attention.',
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'Emerging DTC and direct-to-consumer product brands — typically 2 to 12 people — that are building a brand with a clear identity and growing audience but do not yet have the resources for a dedicated content team.',
        'who_items'   => array(
            'You have a physical or digital product with a genuine brand identity and you want content that builds on that identity rather than just promoting products transactionally.',
            'You are managing content, social, email, and potentially ads with one or two people — and something is always being neglected because there is not enough bandwidth for all of it.',
            'You have a growing customer base that you want to engage and retain between purchases — not just email when you have something to sell.',
            'You want to build organic discovery alongside your paid channels so your growth is not entirely dependent on ad spend.',
        ),
        'pain_heading' => 'The emerging DTC bandwidth problem',
        'pain_body'   => "Early-stage DTC brands face a content challenge that is fundamentally a resource problem. There is too much to do and not enough people to do it well. The result is reactive content — posts that go up when someone has time, emails that go out when there is something to sell, and a brand narrative that exists in the founder's head but almost nowhere else publicly.",
        'pains'       => array(
            array( 'title' => 'Content is reactive rather than strategic', 'body' => 'Posts go up around launches and promotions and then the feed goes quiet. There is no consistent editorial presence between commercial moments — and that silence undermines the brand between purchase occasions.' ),
            array( 'title' => 'Email list underperforms its potential', 'body' => 'An email list built on product announcements and discount codes produces subscribers who open only when they want to buy. A genuine brand email programme produces subscribers who look forward to hearing from you.' ),
            array( 'title' => 'Organic is deprioritised in favour of paid', 'body' => 'When bandwidth is limited, paid channels feel more controllable and attributable than organic content. The result is a brand that stops growing the moment the ad spend stops.' ),
        ),
        'uc_heading'  => 'Where emerging DTC brands start with Bluu',
        'uc_intro'    => 'For emerging DTC brands the most impactful starting point is brand storytelling — building the consistent editorial presence that gives customers a reason to follow and return beyond promotions.',
        'use_cases'   => array(
            array( 'title' => 'Brand storytelling & editorial', 'why' => 'A consistent editorial programme — blog, social, and email — rooted in your brand narrative rather than your promotional calendar. The content that builds the brand relationship that drives repeat purchase and word of mouth.', 'url' => '/industries/ecommerce-dtc/brand-storytelling', 'cta' => 'See this use case' ),
            array( 'title' => 'Email newsletter programme', 'why' => 'Your email list is your most valuable owned channel and the highest-ROI investment for a DTC brand focused on retention. A brand-led newsletter programme that goes beyond promotions is how you turn subscribers into loyal customers.', 'url' => '/industries/ecommerce-dtc/email-newsletter', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works for emerging DTC brands',
        'fit_body'    => "Bluu's content operation is built to run with minimal founder input — a monthly conversation and brand brief at the start is enough to keep the content authentic and on-brand. For a founder who is doing ten other things at the same time, that is the only model that actually works. The content does not stop because you are heads-down on a product launch or dealing with a supply chain issue.",
        'fit_proof'   => 'Retainers for emerging DTC brands typically start at $1,500 per month covering brand editorial content and email. The retainer is designed to feel like hiring a part-time brand content director rather than an agency relationship. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.',
        'cta_heading' => 'Your brand has a story. It should not have to wait for you to find time to tell it.',
        'cta_sub'     => 'to talk about your brand and what a consistent content engine would look like for where you are right now.',
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'subscription-lifestyle' => array(
        'hero_tag'    => 'E-commerce & DTC — Subscription box & lifestyle brands',
        'hero_headline' => 'Subscribers stay for the community and content as much as the product.',
        'hero_sub'    => 'Subscription brands know better than anyone that retention is the metric that matters. And the brands with the best retention are the ones where subscribers feel part of something — a community, a lifestyle, a narrative that the product is part of but not all of. Bluu runs the content engine that builds and maintains that connection every month.',
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'Subscription box and lifestyle brands — typically 3 to 15 people — where subscriber retention is the core commercial metric and content is a key lever for keeping subscribers engaged between deliveries.',
        'who_items'   => array(
            'You run a subscription brand where the product delivery is not the only touchpoint that matters — you want subscribers to feel connected to the brand between boxes or deliveries.',
            'Your email list and social following is your most valuable asset and you know you are underusing it — sending primarily around deliveries and promotions rather than building an ongoing relationship.',
            'You are aware that your churn rate is influenced by how engaged subscribers feel with your brand beyond the product — and you want a content programme that actively works on that engagement.',
            'You want to build an editorial presence that attracts new subscribers organically rather than relying entirely on paid acquisition.',
        ),
        'pain_heading' => 'The subscription brand content gap',
        'pain_body'   => 'Subscription brands have a unique content opportunity — a base of subscribers who have already committed financially and who are therefore pre-disposed to engage with brand content. Most are not capitalising on it. The newsletter goes out around the box delivery. Social content is product-heavy. There is no ongoing editorial programme building the community feeling that is the real driver of retention and referral.',
        'pains'       => array(
            array( 'title' => 'Content that arrives with the box feels transactional', 'body' => 'Emailing subscribers only when a delivery is happening or a promotion is running trains them to associate your communications with transactions rather than community. Churn follows.' ),
            array( 'title' => 'The gap between deliveries is a retention risk', 'body' => 'The weeks between deliveries are when subscribers are most likely to question whether the subscription is worth continuing. Content that keeps the brand present and engaging during that gap actively reduces that risk.' ),
            array( 'title' => 'Word of mouth requires something worth talking about', 'body' => 'Subscribers who feel part of a community and a lifestyle talk about it. Subscribers who are just receiving a monthly package do not. The content programme is what creates the community feeling that drives referral.' ),
        ),
        'uc_heading'  => 'The use cases that drive retention for subscription brands',
        'uc_intro'    => 'For subscription brands the highest-impact combination is a brand editorial programme that builds community feeling, paired with a dedicated email newsletter programme that maintains engagement between deliveries.',
        'use_cases'   => array(
            array( 'title' => 'Brand storytelling & editorial', 'why' => 'A consistent editorial programme across blog and social that builds the lifestyle and community narrative around your subscription — giving subscribers something to follow, share, and feel part of beyond the monthly product delivery.', 'url' => '/industries/ecommerce-dtc/brand-storytelling', 'cta' => 'See this use case' ),
            array( 'title' => 'Email newsletter programme', 'why' => 'A regular subscriber newsletter that goes beyond delivery notifications — community content, behind-the-scenes, curated picks, and brand storytelling that keeps subscribers engaged and reminded why they subscribed in the first place.', 'url' => '/industries/ecommerce-dtc/email-newsletter', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works for subscription and lifestyle brands',
        'fit_body'    => "Bluu's editorial approach is built around brand narrative rather than promotional calendars — which is exactly what subscription brands need. We understand the difference between content that sells and content that builds loyalty, and the editorial programmes we produce are designed to do the latter consistently. Retention is a content problem as much as a product problem, and we treat it that way.",
        'fit_proof'   => 'Retainers for subscription brands typically start at $1,500 to $2,000 per month covering brand editorial and email. The investment is best measured against subscriber retention improvement rather than direct attribution — community and content impact on churn over 90 to 180 days. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.',
        'cta_heading' => 'Your subscribers are more engaged than your content gives them credit for. Meet them there.',
        'cta_sub'     => 'to talk about your subscription model and what a retention-focused content programme would look like.',
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'marketplaces-platforms' => array(
        'hero_tag'    => 'E-commerce & DTC — Marketplaces & platform businesses',
        'hero_headline' => "Two audiences, one team's bandwidth. There is only one solution.",
        'hero_sub'    => "Marketplace and platform businesses face a content challenge that single-sided businesses do not — they need to attract and engage both sides of their market simultaneously with content that often needs to feel entirely different to each audience. Bluu builds and runs a content operation that speaks to both coherently, without requiring you to double your team.",
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'Two-sided marketplace and platform businesses — typically 5 to 25 people — where content needs to serve both a supply-side and demand-side audience with genuinely different needs, language, and motivations.',
        'who_items'   => array(
            'You operate a two-sided marketplace or platform where both the supply side and the demand side require regular, relevant content to stay engaged with your platform.',
            'You are currently producing content reactively for one side of your market — usually the demand side — while the supply side is largely neglected or served with generic platform updates.',
            'You want to build an organic content presence for both audiences that drives platform growth without being entirely dependent on paid acquisition.',
            'You have a small team that cannot realistically produce high-quality, consistent content for two distinct audiences simultaneously.',
        ),
        'pain_heading' => 'The two-sided content challenge',
        'pain_body'   => "Marketplaces face a content complexity that single-sided businesses do not. The messaging, tone, and value proposition for the supply side of a marketplace is often fundamentally different from what resonates with the demand side. Producing coherent, consistent content for both with one team's bandwidth means one audience is almost always underserved. Usually it is the supply side — which eventually affects the demand side quality and creates a slow-moving liquidity problem.",
        'pains'       => array(
            array( 'title' => 'Supply side neglected, platform quality suffers', 'body' => "Marketplace quality depends on supply-side engagement and retention. Content that keeps supply-side participants informed, valued, and active is as important as demand-side marketing — and almost always receives less attention." ),
            array( 'title' => 'One team cannot write for two audiences at once', 'body' => "The language, pain points, and motivations of a marketplace's supply side and demand side are often entirely different. Expecting one content person to serve both audiences coherently is unrealistic." ),
            array( 'title' => 'Platform updates are not content', 'body' => 'Most platforms communicate with supply-side participants primarily through feature updates and policy changes. Content that actually builds their success on the platform — education, best practices, community — is almost entirely absent.' ),
        ),
        'uc_heading'  => 'The most relevant use cases for marketplace businesses',
        'uc_intro'    => "For marketplace businesses the most impactful starting point is usually brand storytelling that serves both audiences — complemented by market intelligence that informs both sides of the platform's strategic content decisions.",
        'use_cases'   => array(
            array( 'title' => 'Brand storytelling & editorial', 'why' => "A structured editorial programme that covers both sides of your market — content that builds the demand side's trust in the platform while simultaneously educating and supporting the supply side's success on it.", 'url' => '/industries/ecommerce-dtc/brand-storytelling', 'cta' => 'See this use case' ),
            array( 'title' => 'Market & trend intelligence', 'why' => 'Marketplace businesses need to understand what is happening on both sides of their market simultaneously. Competitor platforms, supply-side behaviour shifts, demand-side trend changes — weekly intelligence that informs both your content and your product decisions.', 'url' => '/industries/ecommerce-dtc/market-intelligence', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works for two-sided platforms',
        'fit_body'    => "Bluu's research-led approach is particularly valuable for marketplace businesses where understanding both sides of the market is essential before producing content for either. We build a clear picture of both audiences before writing a word — their different motivations, their different language, and the content that will move each of them — and we produce content for both coherently within a single retainer.",
        'fit_proof'   => 'Retainers for marketplace businesses typically start at $2,000 to $2,500 per month given the dual-audience complexity. The investment is designed to serve both sides of the platform rather than requiring two separate content engagements. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.',
        'cta_heading' => 'Both sides of your market deserve better content than they are getting.',
        'cta_sub'     => "to talk through your platform's two audiences and what a content operation that serves both would look like.",
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'financial-advisors' => array(
        'hero_tag'    => 'Professional services — Independent financial advisors',
        'hero_headline' => 'Your clients chose you because they trust your judgement. Content is how prospects find that judgement before they meet you.',
        'hero_sub'    => 'Independent financial advisors and wealth managers win clients through trust — and trust is built through demonstrated expertise over time. Market commentary, client education, and a consistent LinkedIn presence are the content tools that build that trust with people who have not yet met you. Bluu produces them consistently so you never have to find the time.',
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'Independent financial advisors and wealth managers — typically solo or small team — who serve high-net-worth or professional clients and want to build a content presence that reflects their expertise and attracts the right kind of new client.',
        'who_items'   => array(
            'You are an independent advisor or wealth manager who follows markets closely, forms genuine views on economic developments, and communicates that perspective well — but only to clients you already have.',
            'You win new clients primarily through referrals and you want a content presence that reinforces your credibility with referral sources and gives them something specific to point prospects to.',
            'You want prospects to be able to find evidence of your expertise and judgement before they agree to an introductory conversation — not just a website with your credentials.',
            'You are aware that compliance considerations shape what financial advisors can publish — and you want a content partner who understands those constraints.',
        ),
        'pain_heading' => 'The financial advisor visibility problem',
        'pain_body'   => 'Independent financial advisors operate in a high-trust, high-stakes category where the decision to engage takes months and the relationship often lasts decades. Content that demonstrates genuine expertise and sound judgement over time is one of the most powerful ways to build the trust that converts a prospect into a long-term client. Almost no independent advisors have built a consistent content programme to leverage it.',
        'pains'       => array(
            array( 'title' => 'Market views that only clients hear', 'body' => "You form well-considered views on market conditions, economic developments, and portfolio implications. Those views are shared in client reviews and go no further. Published consistently, they would attract prospects who think the same way and want that kind of adviser." ),
            array( 'title' => 'Compliance concerns silence the content', 'body' => 'Financial advisors are often cautious about publishing content due to regulatory requirements. The result is silence — when in practice, educational and commentary content produced carefully is both compliant and highly valuable for building trust.' ),
            array( 'title' => 'Referrers cannot describe your differentiation', 'body' => 'Even satisfied clients who want to refer you often struggle to articulate what makes you different from other advisors. Published content gives them specific, credible language to use when recommending you.' ),
        ),
        'uc_heading'  => 'Where financial advisors start with Bluu',
        'uc_intro'    => 'For financial advisors the most impactful starting point is expert commentary on market conditions combined with client education content — the two types that build trust most effectively with both existing clients and prospective ones.',
        'use_cases'   => array(
            array( 'title' => 'Expert commentary & opinion', 'why' => "Regular, measured commentary on market developments, economic conditions, and what they mean for clients' financial positions — published consistently and compliantly under your name, building the evidence of expertise that prospects need before they will consider working with you.", 'url' => '/industries/professional-services/expert-commentary', 'cta' => 'See this use case' ),
            array( 'title' => 'Client education content', 'why' => 'Guides and explainers that help clients and prospects navigate financial decisions — tax planning considerations, investment principles, retirement planning frameworks — demonstrating your expertise without giving specific advice, and building trust before the first conversation.', 'url' => '/industries/professional-services/client-education', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works for financial advisors',
        'fit_body'    => "Bluu understands that financial content requires careful calibration — educational without crossing into specific advice, opinionated without making claims that create compliance exposure. Every piece we produce is reviewed by you before it goes anywhere, and our approach is to produce content that demonstrates your expertise and judgement rather than content that makes specific recommendations. The compliance checkpoint is yours — we make it as easy as possible.",
        'fit_proof'   => 'Retainers for financial advisors typically start at $1,500 to $2,000 per month covering market commentary and client education content. LinkedIn publishing is available as part of the retainer for advisors who want to build their professional network presence alongside the editorial programme. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.',
        'cta_heading' => 'Your market perspective is worth publishing. Your future clients are looking for exactly that.',
        'cta_sub'     => 'to talk through your practice and what a compliant, consistent content programme would look like for your specific situation.',
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'boutique-law-firms' => array(
        'hero_tag'    => 'Professional services — Boutique law firms',
        'hero_headline' => 'You know more about your area of law than most. Very few people outside your current clients know that.',
        'hero_sub'    => 'Boutique law firms and specialist solicitors have a genuine expertise advantage over generalist practices. That advantage is almost entirely invisible to anyone who has not already been referred to them. Legal commentary, client education content, and a consistent LinkedIn presence are the tools that make that expertise findable — and Bluu produces them without the billable hour pressure taking over.',
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'Boutique law firms and specialist solicitors — typically 2 to 15 partners — who operate in specialist practice areas and want to build a content presence that demonstrates their expertise to the clients and referral sources who are actively looking for exactly what they do.',
        'who_items'   => array(
            'You practice in a specialist area of law — employment, IP, commercial property, corporate M&A, family, or another niche — where genuine expertise distinguishes you from generalist firms.',
            'You follow regulatory and case law developments in your area closely and form views on their commercial implications for clients — but those views rarely make it into published form.',
            'You win work primarily through referrals from other professionals and you want a content presence that reinforces those referrals and helps referrers explain specifically why you are the right choice.',
            'You know that a LinkedIn presence for the firm\'s key partners would be valuable for business development but the billable hour pressure means it never gets the attention it deserves.',
        ),
        'pain_heading' => 'The boutique law firm content challenge',
        'pain_body'   => 'Boutique law firms face a content challenge with two distinct obstacles. The first is time — every hour spent writing is an hour not billed, and in a firm that runs on utilisation, that calculation never resolves in favour of content. The second is confidence — legal publishing requires care, and most firms either produce nothing or produce generic, overly cautious content that demonstrates no genuine expertise. Neither approach builds the authority that drives new instructions.',
        'pains'       => array(
            array( 'title' => 'Billable hour pressure silences content production', 'body' => 'Content is always the thing that gives way to client work. It has been giving way for years. Without a system that produces content independently of fee-earner time, nothing changes.' ),
            array( 'title' => 'Generic legal content builds no authority', 'body' => 'Law firm blogs that summarise legislation without commentary or opinion are almost valueless for business development. They demonstrate that you read the same things as everyone else, not that you understand the implications better.' ),
            array( 'title' => 'Referrers cannot differentiate you clearly', 'body' => 'Even the most loyal referral sources often struggle to explain clearly why one boutique law firm is better than another for a particular type of matter. Published commentary and education content gives them the evidence and the language to make a specific, confident recommendation.' ),
        ),
        'uc_heading'  => 'Where boutique law firms start with Bluu',
        'uc_intro'    => 'For boutique law firms the most impactful starting point is legal commentary combined with client education guides — content that demonstrates specialist expertise to both prospective clients and the accountants, bankers, and other professionals who refer matters.',
        'use_cases'   => array(
            array( 'title' => 'Expert commentary & opinion', 'why' => 'Timely legal commentary on regulatory changes, significant cases, and market developments in your practice area — published consistently and specifically enough to demonstrate genuine expertise rather than generic awareness.', 'url' => '/industries/professional-services/expert-commentary', 'cta' => 'See this use case' ),
            array( 'title' => 'Client education content', 'why' => 'Practical guides and explainers that help clients navigate the legal landscape in your practice area — content that demonstrates expertise without giving specific advice, builds trust before a matter exists, and gives referrers something credible to share.', 'url' => '/industries/professional-services/client-education', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works for boutique law firms',
        'fit_body'    => "Legal content requires a particular combination of accuracy, accessibility, and genuine insight — and most content agencies lack the discipline to produce all three simultaneously. Bluu's approach is to work closely with your fee-earners to extract the genuine expert perspective and then produce content that reflects that perspective clearly and compliantly. Every piece is reviewed by you before publication and the process is designed to take as little of your fee-earner time as possible.",
        'fit_proof'   => 'Retainers for boutique law firms typically start at $1,500 to $2,000 per month covering commentary and client education content. LinkedIn publishing for key partners is available as an addition. The monthly time commitment from fee-earners is typically one 45-minute conversation. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.',
        'cta_heading' => 'Your expertise in your area of law is a genuine competitive advantage. Very few people can find it.',
        'cta_sub'     => 'to talk through your practice area and what a consistent legal commentary programme would look like for your firm.',
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
    'management-consultancies' => array(
        'hero_tag'    => 'Professional services — Management & strategy consultancies',
        'hero_headline' => 'Published thinking is the credential that wins new clients. Most consultancies leave theirs unpublished.',
        'hero_sub'    => 'Management and strategy consultancies win work because of how they think — their frameworks, their perspective, their intellectual rigour. Almost none of that thinking is visible publicly. The firms that publish their perspective consistently build a compounding authority advantage over firms that rely entirely on reputation and referral. Bluu produces that published thinking so it does not have to wait for a consultant to find the time.',
        'hero_cta'    => "Let's talk", 'hero_url' => '/contact',
        'who_heading' => 'Exactly who this is built for',
        'who_body'    => 'Boutique management and strategy consultancies — typically 2 to 10 consultants — where intellectual rigour and distinctive strategic frameworks are the primary differentiator from generalist or larger competitors, and where published thinking would meaningfully accelerate trust-building with prospective clients.',
        'who_items'   => array(
            'You run or work in a boutique consultancy that serves organisations on strategy, transformation, change management, or another management challenge where the quality of thinking is what clients are buying.',
            'Your firm has developed frameworks, methodologies, and perspectives that genuinely distinguish how you approach problems — and almost none of that intellectual capital is published externally.',
            'You win new engagements primarily through referrals and reputation, and you are aware that the firms building a public intellectual presence are gaining an advantage that compounds over time.',
            'You have tried to build a publishing programme — a newsletter, a blog, a LinkedIn presence — but it has never survived contact with the next client engagement or proposal deadline.',
        ),
        'pain_heading' => 'The management consultancy publishing paradox',
        'pain_body'   => 'Management consultancies advise organisations on strategy and change — often including recommendations about how to build thought leadership and market authority. They almost universally neglect to apply this thinking to their own firm. The result is a highly capable practice that is invisible to the market beyond its existing network, winning work reactively from referrals rather than proactively from a published intellectual presence that attracts the right clients.',
        'pains'       => array(
            array( 'title' => 'Intellectual capital locked inside the firm', 'body' => 'Your frameworks, your perspectives on organisational dynamics, your views on what most transformation programmes get wrong — this thinking is genuinely valuable and is currently available only to clients who have already hired you.' ),
            array( 'title' => 'Referral dependency at the wrong stage of growth', 'body' => 'Referrals are excellent quality but poor volume. A published intellectual presence creates an inbound channel that brings in clients who have already been exposed to your thinking and are pre-sold on your approach before the first conversation.' ),
            array( 'title' => 'Delivery consumes all available writing capacity', 'body' => 'Consulting engagements are intellectually intensive. The same minds that could produce compelling published thinking are producing client deliverables instead. Without a system that extracts and publishes that thinking with minimal consultant time, it stays internal.' ),
        ),
        'uc_heading'  => 'Where management consultancies start with Bluu',
        'uc_intro'    => "For management consultancies the most valuable starting point is almost always thought leadership — structured articles and perspectives that make the firm's intellectual frameworks and strategic views visible to the market beyond its existing referral network.",
        'use_cases'   => array(
            array( 'title' => 'Thought leadership publishing', 'why' => "Structured long-form articles, frameworks published as accessible essays, and strategic commentary on management and organisational challenges — produced with your consultants' input and published consistently under the firm's name. The intellectual presence that most boutique consultancies have always intended to build but never quite managed to.", 'url' => '/industries/agencies-consultants/thought-leadership', 'cta' => 'See this use case' ),
            array( 'title' => 'LinkedIn authority programme', 'why' => "A consistent LinkedIn presence for the firm's senior partners and principals — publishing the strategic perspectives and management insights that demonstrate how your firm thinks. LinkedIn is where the HR directors, CEOs, and transformation leads who commission consultancy work spend professional time.", 'url' => '/industries/professional-services/linkedin-authority', 'cta' => 'See this use case' ),
        ),
        'fit_heading' => 'Why Bluu works for management consultancies',
        'fit_body'    => "Management consultancies require a content partner who can engage with genuinely complex strategic thinking — not just organise it into publishable form, but challenge it, sharpen it, and make it accessible to a senior business audience without losing the intellectual rigour. Bluu's approach starts with deep briefings with your consultants, works iteratively through drafts, and produces content that your clients would recognise as reflecting how you actually think — not a simplified marketing version of it.",
        'fit_proof'   => 'Retainers for management consultancies typically start at $2,000 to $2,500 per month given the depth and intellectual standards required. Most start with a thought leadership programme for one or two partners and expand as the publishing rhythm is established and the results become visible. All content is structured for search and AI discovery from the first draft — built to SEO and AI crawl standard as a baseline, not an upgrade.',
        'cta_heading' => 'Your best thinking should be working harder than your referral relationships.',
        'cta_sub'     => "to talk through your firm's intellectual frameworks and what a structured thought leadership programme would look like for your practice.",
        'cta_p_label' => "Let's talk", 'cta_p_url' => '/contact', 'cta_s_label' => 'See pricing', 'cta_s_url' => '/pricing',
    ),
);

// ── Resolve content: ACF overrides slug defaults ──────────────────────────────
$d = isset( $si_content[ $current_slug ] ) ? $si_content[ $current_slug ] : reset( $si_content );

// Breadcrumb — derive parent industry from hero_tag "{Industry} — {Sub-industry}"
$_tag_parts      = explode( ' — ', $d['hero_tag'] ?? '', 2 );
$_ind_name_raw   = $_tag_parts[0] ?? '';
$_si_name_raw    = $_tag_parts[1] ?? get_the_title();
$_ind_url_map    = array(
    'Tech & SaaS'            => '/industries/tech-saas',
    'Agencies & consultants' => '/industries/agencies-consultants',
    'E-commerce & DTC'       => '/industries/ecommerce-dtc',
    'Professional services'  => '/industries/professional-services',
);
$_ind_url = isset( $_ind_url_map[ $_ind_name_raw ] ) ? home_url( $_ind_url_map[ $_ind_name_raw ] ) : home_url( '/industries' );

$hero_tag    = ( $gf ? get_field( 'si_hero_tag' )         : '' ) ?: ( $d['hero_tag']    ?? 'Use case' );
$hero_hl     = ( $gf ? get_field( 'si_hero_headline' )    : '' ) ?: ( $d['hero_headline'] ?? get_the_title() );
$hero_sub    = ( $gf ? get_field( 'si_hero_subheadline' ) : '' ) ?: ( $d['hero_sub']   ?? '' );
$hero_cta    = ( $gf ? get_field( 'si_hero_cta_label' )   : '' ) ?: ( $d['hero_cta']   ?? "Let's talk" );
$hero_url    = ( $gf ? get_field( 'si_hero_cta_url' )     : '' ) ?: home_url( $d['hero_url'] ?? '/contact' );

$hero_img = $gf ? get_field( 'si_hero_image' ) : null;
if ( ! empty( $hero_img ) ) {
    $hero_img_src = is_array( $hero_img ) ? esc_url( $hero_img['url'] ) : esc_url( $hero_img );
    $hero_img_alt = is_array( $hero_img ) ? esc_attr( $hero_img['alt'] ) : '';
} else {
    $hero_img_src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';
    $hero_img_alt = '';
}

$who_heading = ( $gf ? get_field( 'si_who_heading' ) : '' ) ?: ( $d['who_heading'] ?? 'Who this is built for' );
$who_body    = ( $gf ? get_field( 'si_who_body' )    : '' ) ?: ( $d['who_body']    ?? '' );
$who_items   = array_values( array_filter( array(
    ( $gf ? get_field( 'si_who_item_1' ) : '' ) ?: '',
    ( $gf ? get_field( 'si_who_item_2' ) : '' ) ?: '',
    ( $gf ? get_field( 'si_who_item_3' ) : '' ) ?: '',
    ( $gf ? get_field( 'si_who_item_4' ) : '' ) ?: '',
) ) );
if ( empty( $who_items ) ) $who_items = $d['who_items'] ?? array();

$pain_heading = ( $gf ? get_field( 'si_pain_heading' ) : '' ) ?: ( $d['pain_heading'] ?? 'The challenge' );
$pain_body    = ( $gf ? get_field( 'si_pain_body' )    : '' ) ?: ( $d['pain_body']    ?? '' );
$pains_acf = array_values( array_filter( array(
    array( 'title' => ( $gf ? get_field( 'si_pain_1_title' ) : '' ) ?: '', 'body' => ( $gf ? get_field( 'si_pain_1_body' ) : '' ) ?: '' ),
    array( 'title' => ( $gf ? get_field( 'si_pain_2_title' ) : '' ) ?: '', 'body' => ( $gf ? get_field( 'si_pain_2_body' ) : '' ) ?: '' ),
    array( 'title' => ( $gf ? get_field( 'si_pain_3_title' ) : '' ) ?: '', 'body' => ( $gf ? get_field( 'si_pain_3_body' ) : '' ) ?: '' ),
), function( $p ) { return ! empty( $p['title'] ); } ) );
$pains = ! empty( $pains_acf ) ? $pains_acf : ( $d['pains'] ?? array() );

$uc_heading = ( $gf ? get_field( 'si_usecases_heading' ) : '' ) ?: ( $d['uc_heading'] ?? 'Where to start' );
$uc_intro   = ( $gf ? get_field( 'si_usecases_intro' )   : '' ) ?: ( $d['uc_intro']   ?? '' );
$uc_list_acf = ( $gf ? get_field( 'si_use_cases' ) : array() ) ?: array();
$uc_list = ! empty( $uc_list_acf ) ? $uc_list_acf : array_map( function( $uc ) {
    return array( 'si_uc_title' => $uc['title'], 'si_uc_why' => $uc['why'], 'si_uc_url' => $uc['url'], 'si_uc_cta' => $uc['cta'] );
}, $d['use_cases'] ?? array() );

$fit_heading = ( $gf ? get_field( 'si_fit_heading' ) : '' ) ?: ( $d['fit_heading'] ?? 'Why Bluu works here' );
$fit_body    = ( $gf ? get_field( 'si_fit_body' )    : '' ) ?: ( $d['fit_body']    ?? '' );
$fit_proof   = ( $gf ? get_field( 'si_fit_proof' )   : '' ) ?: ( $d['fit_proof']   ?? '' );

$cta_heading = ( $gf ? get_field( 'si_cta_heading' )         : '' ) ?: ( $d['cta_heading'] ?? 'Ready to get started?' );
$cta_sub     = ( $gf ? get_field( 'si_cta_subtext' )         : '' ) ?: ( $d['cta_sub']     ?? 'No pitch, no pressure.' );
$cta_p_label = ( $gf ? get_field( 'si_cta_primary_label' )   : '' ) ?: ( $d['cta_p_label'] ?? "Let's talk" );
$cta_p_url   = ( $gf ? get_field( 'si_cta_primary_url' )     : '' ) ?: home_url( $d['cta_p_url'] ?? '/contact' );
$cta_s_label = ( $gf ? get_field( 'si_cta_secondary_label' ) : '' ) ?: ( $d['cta_s_label'] ?? 'See pricing' );
$cta_s_url   = ( $gf ? get_field( 'si_cta_secondary_url' )   : '' ) ?: home_url( $d['cta_s_url'] ?? '/pricing' );

get_header();
?>

<!-- ── Hero ──────────────────────────────────────────────────────────────────── -->
<section class="industry-pg-hero" aria-label="<?php esc_attr_e( 'Page hero', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="industry-pg-hero__inner">

            <div class="industry-pg-hero__content animate-on-scroll">
                <nav class="industry-pg-hero__tag industry-pg-hero__breadcrumb" aria-label="Breadcrumb">
                    <a href="<?php echo esc_url( home_url( '/industries' ) ); ?>">Industries</a>
                    <span aria-hidden="true"> / </span>
                    <a href="<?php echo esc_url( $_ind_url ); ?>"><?php echo esc_html( $_ind_name_raw ); ?></a>
                    <span aria-hidden="true"> / </span>
                    <span><?php echo esc_html( $_si_name_raw ); ?></span>
                </nav>
                <h1 class="industry-pg-hero__headline"><?php echo esc_html( $hero_hl ); ?></h1>
                <?php if ( $hero_sub ) : ?>
                    <p class="industry-pg-hero__sub"><?php echo bluu_text( $hero_sub ); ?></p>
                <?php endif; ?>
                <div class="industry-pg-hero__cta">
                    <a href="<?php echo esc_url( $hero_url ); ?>" class="btn-primary btn-primary--large">
                        <?php echo esc_html( $hero_cta ); ?>
                    </a>
                    <a href="<?php echo esc_url( home_url( '/pricing' ) ); ?>" class="btn-outline btn-outline--large industry-btn-outline">
                        <?php esc_html_e( 'See pricing', 'bluu-interactive' ); ?>
                    </a>
                </div>
            </div>

            <div class="industry-pg-hero__image">
                <img src="<?php echo esc_url( $hero_img_src ); ?>" alt="<?php echo esc_attr( $hero_img_alt ); ?>" loading="eager" decoding="async">
            </div>

        </div>
    </div>
</section>

<!-- ── Who this is for ───────────────────────────────────────────────────────── -->
<?php if ( $who_items ) : ?>
<section class="si-who" aria-label="<?php esc_attr_e( 'Who this is for', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="si-who__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'Right fit', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php echo esc_html( $who_heading ); ?></h2>
            <?php if ( $who_body ) : ?>
                <p class="industry-section-body"><?php echo esc_html( $who_body ); ?></p>
            <?php endif; ?>
        </div>
        <div class="si-who__grid">
            <?php foreach ( $who_items as $item ) : ?>
                <div class="si-who-item animate-on-scroll">
                    <div class="si-who-item__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                    </div>
                    <p class="si-who-item__text"><?php echo esc_html( $item ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- ── Pain ──────────────────────────────────────────────────────────────────── -->
<?php if ( $pains ) : ?>
<section class="si-pain" aria-label="<?php esc_attr_e( 'The challenge', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="si-pain__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'The problem', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php echo esc_html( $pain_heading ); ?></h2>
            <?php if ( $pain_body ) : ?>
                <p class="industry-section-body"><?php echo esc_html( $pain_body ); ?></p>
            <?php endif; ?>
        </div>
        <div class="industry-pain-grid">
            <?php foreach ( $pains as $pain ) : ?>
                <div class="industry-pain-card animate-on-scroll">
                    <h3 class="industry-pain-card__title"><?php echo esc_html( $pain['title'] ); ?></h3>
                    <p class="industry-pain-card__body"><?php echo esc_html( $pain['body'] ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- ── Use Cases ─────────────────────────────────────────────────────────────── -->
<?php if ( $uc_list ) : ?>
<section class="si-usecases" aria-label="<?php esc_attr_e( 'Use cases', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="si-usecases__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'Where to start', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php echo esc_html( $uc_heading ); ?></h2>
            <?php if ( $uc_intro ) : ?>
                <p class="industry-section-body"><?php echo esc_html( $uc_intro ); ?></p>
            <?php endif; ?>
        </div>
        <div class="si-usecases__grid">
            <?php foreach ( $uc_list as $uc ) : ?>
                <div class="si-uc-card animate-on-scroll">
                    <h3 class="si-uc-card__title"><?php echo esc_html( $uc['si_uc_title'] ?? $uc['title'] ?? '' ); ?></h3>
                    <p class="si-uc-card__why"><?php echo esc_html( $uc['si_uc_why'] ?? $uc['why'] ?? '' ); ?></p>
                    <?php $uc_url = $uc['si_uc_url'] ?? $uc['url'] ?? ''; if ( $uc_url ) : ?>
                        <a href="<?php echo esc_url( home_url( $uc_url ) ); ?>" class="si-uc-card__link">
                            <?php echo esc_html( $uc['si_uc_cta'] ?? $uc['cta'] ?? 'See this use case' ); ?> →
                        </a>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- ── Why Bluu fits ─────────────────────────────────────────────────────────── -->
<?php if ( $fit_body ) : ?>
<section class="si-fit" aria-label="<?php esc_attr_e( 'Why Bluu fits', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="si-fit__inner animate-on-scroll">
            <div class="si-fit__content">
                <span class="industry-section-badge" style="color:#7eb8ff;"><?php esc_html_e( 'The Bluu approach', 'bluu-interactive' ); ?></span>
                <h2 class="industry-section-heading" style="color:#fff;"><?php echo esc_html( $fit_heading ); ?></h2>
                <p class="si-fit__body"><?php echo esc_html( $fit_body ); ?></p>
            </div>
            <?php if ( $fit_proof ) : ?>
                <div class="si-fit__proof">
                    <div class="si-fit__proof-label"><?php esc_html_e( 'Investment', 'bluu-interactive' ); ?></div>
                    <p class="si-fit__proof-text"><?php echo bluu_text( $fit_proof ); ?></p>
                    <a href="<?php echo esc_url( home_url( '/pricing' ) ); ?>" class="si-fit__proof-link">
                        <?php esc_html_e( 'See full pricing →', 'bluu-interactive' ); ?>
                    </a>
                </div>
            <?php endif; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- ── Closing CTA ───────────────────────────────────────────────────────────── -->
<section class="industry-pg-cta" aria-label="<?php esc_attr_e( 'Call to action', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="animate-on-scroll">
            <h2 class="industry-pg-cta__headline"><?php echo esc_html( $cta_heading ); ?></h2>
            <p class="industry-pg-cta__sub"><?php echo esc_html( $cta_sub ); ?></p>
            <div class="industry-pg-cta__buttons">
                <a href="<?php echo esc_url( $cta_p_url ); ?>" class="btn-primary btn-primary--large btn-primary--white">
                    <?php echo esc_html( $cta_p_label ); ?>
                </a>
                <a href="<?php echo esc_url( $cta_s_url ); ?>" class="btn-outline btn-outline--large industry-btn-outline--cta">
                    <?php echo esc_html( $cta_s_label ); ?>
                </a>
            </div>
            <p class="industry-pg-cta__note"><?php esc_html_e( 'Free 15-minute call. No commitment required.', 'bluu-interactive' ); ?></p>
        </div>
    </div>
</section>

<?php get_footer(); ?>
