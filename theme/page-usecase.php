<?php
/**
 * Template Name: Use Case Page
 * Template Post Type: page
 *
 * Content auto-loads from slug. ACF fields override when filled.
 *
 * @package bluu-interactive
 */

$gf           = function_exists( 'get_field' );
$current_slug = get_post_field( 'post_name', get_the_ID() );

// ── Slug-based content library ────────────────────────────────────────────────
$uc_content = array(
    'competitor-intelligence' => array(
        'hero_tag'           => 'Use case — Tech & SaaS startups',
        'hero_headline'      => 'Know what your competitors are doing. Every week. Without lifting a finger.',
        'hero_sub'           => 'Most SaaS founders track competitors reactively — noticing a pricing change months late or missing a campaign that shifted the conversation in their category. Bluu makes competitor intelligence a weekly constant, not an occasional panic.',
        'situation_body'     => 'You\'re building a product in a competitive category and you know your competitors are moving — adjusting their messaging, launching new features, running content campaigns. But keeping track of it all is a full-time job, and you have an actual full-time job. So competitor monitoring either doesn\'t happen, or it happens in a rushed, irregular way that gives you an incomplete picture.',
        'pains'              => array(
            array( 'title' => 'You\'re always a step behind', 'body' => 'By the time you notice a competitor\'s new positioning or campaign, they\'ve already had weeks of impact. Reactive awareness is not a strategy.' ),
            array( 'title' => 'Research takes time you don\'t have', 'body' => 'Manually checking competitor websites, social profiles, and content takes hours. It always gets deprioritised when sprints and sales calls take over.' ),
            array( 'title' => 'No one is accountable for it', 'body' => 'Without a dedicated process, competitor intelligence is everyone\'s job and no one\'s job. It happens randomly and produces no useful output.' ),
        ),
        'approach_body'      => 'We set up a structured weekly monitoring process across your top competitors — tracking their content output, messaging changes, new feature announcements, social activity, and positioning shifts. Everything is synthesised into a clean weekly digest you can read in five minutes and act on immediately.',
        'steps'              => array(
            array( 'num' => '01', 'title' => 'Define your competitor set', 'body' => 'We work with you to identify the 3–5 competitors worth watching closely — direct competitors, category leaders, and emerging challengers relevant to your market.' ),
            array( 'num' => '02', 'title' => 'Weekly monitoring across all channels', 'body' => 'Every week we track competitor websites, blog output, LinkedIn, X, newsletters, and product pages for meaningful changes in content, messaging, or positioning.' ),
            array( 'num' => '03', 'title' => 'Synthesise into a weekly digest', 'body' => 'Raw monitoring data becomes a structured, readable digest — what changed, what it means, and whether it requires a response from your team.' ),
            array( 'num' => '04', 'title' => 'Quarterly positioning review', 'body' => 'Every quarter we produce a deeper analysis of how the competitive landscape has shifted and what it means for your content and messaging strategy.' ),
        ),
        'deliverables_intro' => 'Every week and every quarter, you receive structured intelligence that makes your content and positioning decisions faster and better informed.',
        'deliverables'       => array(
            array( 'name' => 'Weekly competitor digest', 'detail' => 'A clean, structured summary of everything that changed across your competitor set in the past seven days. Delivered every Monday morning.' ),
            array( 'name' => 'Messaging change alerts', 'detail' => 'Immediate notification when a competitor makes a significant positioning or messaging shift that warrants a strategic response.' ),
            array( 'name' => 'Content output tracking', 'detail' => 'A log of what competitors are publishing — topics, formats, frequency — so you can see gaps and opportunities in your category\'s content landscape.' ),
            array( 'name' => 'Quarterly landscape analysis', 'detail' => 'A deeper quarterly report on how the competitive landscape is shifting, with recommendations for your content and messaging strategy.' ),
        ),
        'cadence'            => 'Weekly digest delivered every Monday. Quarterly analysis delivered at the end of each quarter. All included in your monthly retainer.',
        'fit_statements'     => array(
            'You are a SaaS founder or growth lead in a competitive category where messaging and positioning matter as much as the product itself.',
            'You have tried to track competitors manually but it is inconsistent and always gets pushed aside when other priorities take over.',
            'You want to make content and positioning decisions based on real market intelligence, not gut feel and occasional browsing.',
            'You are between seed and Series B and competing with companies that have more resources — staying informed is how you stay competitive.',
        ),
        'not_fit'            => 'This use case is less relevant if you are in an early, uncrowded market with no meaningful competitors yet — competitor intelligence works best when there is an active competitive landscape to monitor.',
        'related'            => array(
            array( 'title' => 'Founder brand building', 'url' => '/industries/tech-saas/founder-brand', 'desc' => 'Use what you learn about competitors to sharpen your own founder content and positioning on LinkedIn.' ),
            array( 'title' => 'Product launch content', 'url' => '/industries/tech-saas/product-launch-content', 'desc' => 'Intelligence about competitor launches informs how you position and time your own product announcements.' ),
            array( 'title' => 'Content repurposing engine', 'url' => '/industries/tech-saas/content-repurposing', 'desc' => 'Turn competitor insights into original content that fills the gaps your monitoring has identified.' ),
        ),
        'cta_heading'        => 'Stop finding out what your competitors did last month.',
        'cta_sub'            => 'Book a 15-minute Discovery Call to see if competitor intelligence is the right starting point for your retainer. No pitch — just an honest conversation.',
    ),
    'founder-brand' => array(
        'hero_tag'           => 'Use case — Tech & SaaS startups',
        'hero_headline'      => 'Your name should be as well-known as your product.',
        'hero_sub'           => 'For SaaS founders, a strong personal brand is one of the most effective and underused growth channels. It builds trust before a sales call happens, attracts talent, and compounds in value over time. Most founders know this. Very few are publishing consistently enough to see the results.',
        'situation_body'     => 'You know you should be posting on LinkedIn. You have things to say — opinions on your market, hard-won lessons, perspectives that your audience would find valuable. But between product, sales, and team, it never makes it to the top of the list. When you do post, it is infrequent and inconsistent. The compounding effect never kicks in because there is no consistent engine behind it.',
        'pains'              => array(
            array( 'title' => 'Good intentions, no consistency', 'body' => 'You post when you have time, which is not often enough to build an audience or establish authority. Inconsistency is invisible in the short term and very visible over six months.' ),
            array( 'title' => 'Hard to write about yourself', 'body' => 'Most founders find it genuinely difficult to articulate their own perspective in a way that feels natural and not self-promotional. The blank page problem is real.' ),
            array( 'title' => 'The pipeline cost of invisibility', 'body' => 'Every inbound lead that could have come from your personal brand is instead coming from cold outreach or referrals. That is a slower, more expensive way to grow.' ),
        ),
        'approach_body'      => 'We build a consistent content engine for your personal brand — starting with understanding your voice, perspective, and the topics where you have genuine authority. Then we produce content in your voice, on a consistent schedule, that positions you as a credible, interesting voice in your category. You review and approve. We handle everything else.',
        'steps'              => array(
            array( 'num' => '01', 'title' => 'Voice and perspective audit', 'body' => 'We start with a structured conversation to understand how you think, what you believe, and where you have genuine expertise — so the content sounds like you, not like a ghostwriter.' ),
            array( 'num' => '02', 'title' => 'Monthly content calendar', 'body' => 'We build a monthly calendar of topics — a mix of opinion, insight, behind-the-scenes, and category commentary — drawn from your perspective and what is relevant in your market.' ),
            array( 'num' => '03', 'title' => 'Content written in your voice', 'body' => 'Every post is written to sound like you — your language, your opinions, your level of directness. You review each piece before it goes anywhere.' ),
            array( 'num' => '04', 'title' => 'Published on your schedule', 'body' => 'We publish directly to LinkedIn and any other platforms on the agreed schedule — consistently, without you having to remember or chase it.' ),
        ),
        'deliverables_intro' => 'A consistent, founder-led content presence that builds over time without taking hours from your week.',
        'deliverables'       => array(
            array( 'name' => '8–12 LinkedIn posts per month', 'detail' => 'A mix of opinion pieces, market commentary, lessons learned, and product perspective — all written in your voice and reviewed before publishing.' ),
            array( 'name' => 'Monthly content calendar', 'detail' => 'A planned calendar of topics for the month ahead, shared with you at the start of each month for input and approval.' ),
            array( 'name' => 'Long-form LinkedIn articles', 'detail' => 'One longer-form piece per month — a detailed opinion, industry analysis, or founder lesson that demonstrates depth and earns shares.' ),
            array( 'name' => 'Performance summary', 'detail' => 'Monthly overview of what performed well, what topics generated engagement, and what to double down on in the coming month.' ),
        ),
        'cadence'            => 'Posting 2–3 times per week on LinkedIn. Monthly calendar shared at the start of each month. All included in your monthly retainer.',
        'fit_statements'     => array(
            'You are a SaaS founder who believes in personal brand as a growth channel but has not been able to publish consistently due to time constraints.',
            'You have genuine opinions and expertise in your category that would be valuable to your audience — you just need someone to help you articulate and publish them.',
            'You are comfortable reviewing and approving content before it goes live — you want to stay in control of your voice without doing the writing yourself.',
            'You are at a stage where inbound matters — where a stronger personal brand would meaningfully support hiring, partnerships, or sales conversations.',
        ),
        'not_fit'            => 'This use case requires a minimum of one monthly conversation to capture your perspective and ensure the content stays authentic. If you are not able to commit even one hour per month, the content will not sound like you.',
        'related'            => array(
            array( 'title' => 'Competitor intelligence', 'url' => '/industries/tech-saas/competitor-intelligence', 'desc' => 'Know what your competitors are saying so your personal brand content fills the gaps and differentiates your perspective.' ),
            array( 'title' => 'Content repurposing engine', 'url' => '/industries/tech-saas/content-repurposing', 'desc' => 'Turn your LinkedIn articles and long-form posts into assets across email, blog, and social.' ),
            array( 'title' => 'Product launch content', 'url' => '/industries/tech-saas/product-launch-content', 'desc' => 'Your founder brand is the most powerful channel for announcing new products and features to an engaged audience.' ),
        ),
        'cta_heading'        => 'Your audience is waiting. They just don\'t know you exist yet.',
        'cta_sub'            => 'Book a 15-minute Discovery Call to talk through what a founder brand programme would look like for your specific situation. Honest, no pressure.',
    ),
    'content-repurposing' => array(
        'hero_tag'           => 'Use case — Tech & SaaS startups',
        'hero_headline'      => 'Write it once. Publish it everywhere.',
        'hero_sub'           => 'Most SaaS teams produce a piece of content and publish it once. That is one instance of value from something that could reach your audience seven different ways. Bluu turns every long-form piece into a full suite of channel-specific assets — so your best thinking gets the reach it deserves.',
        'situation_body'     => 'You produce content — blog posts, long-form LinkedIn articles, the occasional newsletter — but the process stops at publication. There is no system for turning that content into social posts, email sections, short-form threads, or video scripts. Each piece of content does its job once and then gets forgotten. That is a significant waste of the thinking and effort that went into creating it.',
        'pains'              => array(
            array( 'title' => 'One publish, one moment of reach', 'body' => 'A blog post that could reach your LinkedIn audience as a series of posts, your email list as a newsletter section, and X as a thread instead gets read once and archived.' ),
            array( 'title' => 'No system, no consistency', 'body' => 'Repurposing requires a deliberate process. Without one, it only happens when someone has spare time — which is never.' ),
            array( 'title' => 'Different channels need different formats', 'body' => 'What works on LinkedIn does not work on X. What works in a blog does not work in an email. Repurposing requires genuine adaptation, not copy-paste.' ),
        ),
        'approach_body'      => 'We treat every piece of long-form content as a source asset and build a systematic repurposing process around it. Each piece is adapted — not just copied — into channel-specific formats that match the platform\'s native style and your audience\'s behaviour on each channel. The result is that one well-researched piece becomes six to eight distinct assets published across your channels in the same week.',
        'steps'              => array(
            array( 'num' => '01', 'title' => 'Source content review', 'body' => 'Each month we review the long-form pieces being produced and identify the highest-value ideas and arguments worth amplifying across channels.' ),
            array( 'num' => '02', 'title' => 'Channel-by-channel adaptation', 'body' => 'We adapt the core content into LinkedIn posts, an X/Twitter thread, an email newsletter section, social captions, and a short video script — each written for that platform\'s format and tone.' ),
            array( 'num' => '03', 'title' => 'Scheduled and published', 'body' => 'All repurposed assets are scheduled and published across your channels in the same week as the source content — so the message reinforces itself across touchpoints simultaneously.' ),
            array( 'num' => '04', 'title' => 'Monthly asset report', 'body' => 'A summary each month of all assets produced, where they were published, and which formats drove the most engagement — so we sharpen the repurposing approach over time.' ),
        ),
        'deliverables_intro' => 'For every long-form piece in your retainer, you receive a full suite of channel-specific assets published in the same week.',
        'deliverables'       => array(
            array( 'name' => 'LinkedIn post series (3–4 posts)', 'detail' => 'The core ideas from the long-form piece broken into standalone LinkedIn posts — each complete in itself, not just excerpts.' ),
            array( 'name' => 'X/Twitter thread', 'detail' => 'A structured thread pulling the key argument or framework from the original piece into X\'s native format.' ),
            array( 'name' => 'Email newsletter section', 'detail' => 'A summary and commentary version adapted for your newsletter — conversational, tighter, with a link back to the full piece.' ),
            array( 'name' => 'Short-form social captions', 'detail' => '3–5 short captions adapted for Instagram or other visual platforms, each framing a single idea from the source content.' ),
            array( 'name' => 'Video/audio script outline', 'detail' => 'A short script or talking points document if you produce video or podcast content — so the same ideas translate into spoken format.' ),
        ),
        'cadence'            => 'Repurposing begins within 48 hours of source content completion. All channel assets published within the same week. Included in your monthly retainer.',
        'fit_statements'     => array(
            'You are producing long-form content — blog posts, LinkedIn articles, founder essays — but only getting one moment of reach from each piece.',
            'You are active on multiple channels but your content presence is inconsistent because creating separate content for each platform is too time-consuming.',
            'You want your best thinking to reach the widest possible audience without having to write six separate pieces of content every week.',
        ),
        'not_fit'            => 'The repurposing engine works best when there is a consistent supply of source content to work from. If you are not yet producing long-form content regularly, the Content Creation use case is the better starting point.',
        'related'            => array(
            array( 'title' => 'Founder brand building', 'url' => '/industries/tech-saas/founder-brand', 'desc' => 'Founder content is the best source material for the repurposing engine — your personal perspective travels well across channels.' ),
            array( 'title' => 'Product launch content', 'url' => '/industries/tech-saas/product-launch-content', 'desc' => 'Launch content needs maximum reach — the repurposing engine ensures your announcement lands on every relevant channel simultaneously.' ),
            array( 'title' => 'Competitor intelligence', 'url' => '/industries/tech-saas/competitor-intelligence', 'desc' => 'Intelligence about content gaps in your category informs which long-form pieces are worth creating and repurposing most aggressively.' ),
        ),
        'cta_heading'        => 'Your content is working harder than you think. It could work harder still.',
        'cta_sub'            => 'Book a 15-minute Discovery Call to see how the repurposing engine would work for your specific content and channels. No pitch — just a practical conversation.',
    ),
    'product-launch-content' => array(
        'hero_tag'           => 'Use case — Tech & SaaS startups',
        'hero_headline'      => 'Your launch deserves more than a single tweet and a blog post.',
        'hero_sub'           => 'Most SaaS product launches are under-communicated. Engineering ships the feature, someone writes a quick post, a few people notice. The actual value of what you built never reaches the people who need to hear about it. Bluu produces a complete launch content package so every release gets the attention it deserves.',
        'situation_body'     => 'You are shipping features and updates regularly, but the content side of each launch is an afterthought. There is no dedicated content plan for releases — it gets handled reactively, usually by the founder or a developer who is already stretched. The result is launches that underperform their potential because the communication is thin, rushed, or missing entirely from key channels.',
        'pains'              => array(
            array( 'title' => 'Engineering ships — content scrambles', 'body' => 'The product team ships on schedule. The content team — often just one person — scrambles to produce something. It is reactive by design and produces reactive results.' ),
            array( 'title' => 'Single-channel announcements', 'body' => 'A blog post and a tweet is not a launch strategy. Most of your potential audience will miss an announcement that only appears on one channel, once.' ),
            array( 'title' => 'Features explained to engineers, not buyers', 'body' => 'Launch copy written by product teams often explains what the feature does technically rather than what problem it solves commercially. The wrong audience understands it.' ),
        ),
        'approach_body'      => 'We treat every significant product launch or feature release as a content campaign, not a single post. We work with you ahead of the launch to understand what you\'re releasing and why it matters to your customers, then we produce a complete content package — across all your channels — that is ready to deploy on launch day.',
        'steps'              => array(
            array( 'num' => '01', 'title' => 'Pre-launch briefing', 'body' => 'Two weeks before launch, we run a structured briefing to understand the feature, the target customer, the core benefit, and how it is positioned against alternatives.' ),
            array( 'num' => '02', 'title' => 'Full content package production', 'body' => 'We produce the complete content package: announcement blog post, email to your list, LinkedIn posts for the company and founder pages, X thread, and social captions — all framed around customer benefit, not technical features.' ),
            array( 'num' => '03', 'title' => 'Staggered publishing plan', 'body' => 'We produce a publishing schedule that staggers the announcement across channels over launch week — so the message builds momentum rather than disappearing in a single day.' ),
            array( 'num' => '04', 'title' => 'Post-launch follow-up content', 'body' => 'One week after launch, we produce follow-up content — a customer perspective piece, a deeper feature explainer, or a data update — to sustain the conversation beyond the initial announcement.' ),
        ),
        'deliverables_intro' => 'A complete, channel-ready content package for every significant launch — produced in advance and ready to deploy on the day.',
        'deliverables'       => array(
            array( 'name' => 'Announcement blog post', 'detail' => 'A full-length blog post announcing the launch — benefit-led, not feature-led, written for your target customer.' ),
            array( 'name' => 'Email announcement', 'detail' => 'A launch email to your subscriber list with a clear subject line, concise announcement, and a strong call to action.' ),
            array( 'name' => 'LinkedIn post series (company + founder)', 'detail' => 'Two LinkedIn posts — one for the company page and one for the founder — each framed differently to avoid repetition.' ),
            array( 'name' => 'X/Twitter launch thread', 'detail' => 'A structured thread that walks through what the feature does, why it matters, and how to start using it.' ),
            array( 'name' => 'Short-form social captions', 'detail' => '3–5 captions for Instagram and other visual platforms, each highlighting a different angle of the launch.' ),
            array( 'name' => 'Post-launch follow-up piece', 'detail' => 'A second blog post or LinkedIn article published one week after launch to sustain the conversation with a new angle or early results.' ),
        ),
        'cadence'            => 'Full package delivered 3–5 days before launch date. Post-launch piece delivered 7 days after. Included in your monthly retainer for planned launches.',
        'fit_statements'     => array(
            'You are shipping product updates or new features regularly and want each release to be properly communicated to your audience across all channels.',
            'You have a growing audience — email list, LinkedIn following, or social community — that you want to activate properly around launches, not just notify.',
            'You find that launch content always gets done at the last minute and never reaches its potential because there is not enough time to do it properly.',
            'You want your launches to feel like events, not afterthoughts — with multi-channel coverage that builds anticipation and sustains momentum.',
        ),
        'not_fit'            => 'This use case works best with at least two weeks notice before a launch date. Last-minute requests produce last-minute results — the full value of a launch content package requires proper preparation time.',
        'related'            => array(
            array( 'title' => 'Content repurposing engine', 'url' => '/industries/tech-saas/content-repurposing', 'desc' => 'After the launch, the repurposing engine keeps the content working across channels well beyond the initial announcement week.' ),
            array( 'title' => 'Founder brand building', 'url' => '/industries/tech-saas/founder-brand', 'desc' => 'The founder\'s personal channel is the most authentic place to announce a new product — we integrate launch content into the founder brand programme.' ),
            array( 'title' => 'Competitor intelligence', 'url' => '/industries/tech-saas/competitor-intelligence', 'desc' => 'Knowing what competitors are launching and how they are positioning informs how you differentiate your own announcements.' ),
        ),
        'cta_heading'        => 'Your next launch should reach every person it is relevant to.',
        'cta_sub'            => 'Book a 15-minute Discovery Call to talk through what a launch content programme would look like for your release cadence. Honest, practical, no pressure.',
    ),
    'own-brand-content' => array(
        'hero_tag'           => 'Use case — Agencies & consultants',
        'hero_headline'      => 'Client work is not an excuse for ignoring your own brand.',
        'hero_sub'           => 'Every agency and consultant knows that consistent content drives inbound. Most produce nothing for themselves because client work always wins. Bluu runs your own brand content operation — research, writing, and publishing — so your pipeline keeps moving even when you are flat out delivering for clients.',
        'situation_body'     => 'You advise clients on content and marketing. You know better than most that consistent publishing builds authority and drives inbound enquiries. But your own brand is an afterthought — posts go up when you have a spare moment, which is rarely. When a client project ends and you need new business, you are starting from zero each time because there is no content engine running in the background.',
        'pains'              => array(
            array( 'title' => 'The cobbler with no shoes', 'body' => 'You do this for clients and you know it works. Somehow it never gets applied to your own business. The irony is not lost on you — or on your prospects.' ),
            array( 'title' => 'Feast and famine pipeline', 'body' => 'When you are busy, content stops. When projects end, you scramble for new clients. A consistent content operation breaks this cycle by keeping your brand visible throughout.' ),
            array( 'title' => 'Referrals are not a growth strategy', 'body' => 'Referrals are valuable but unreliable. Content gives people who have never met you a reason to reach out — it is referrals that scale.' ),
        ),
        'approach_body'      => 'We become your own brand content team — handling the research, writing, and publishing that you know you should be doing but never get to. We start by understanding your positioning, your audience, and the topics where you have genuine authority. Then we build a consistent monthly content operation that keeps your brand visible and your pipeline warm, regardless of how busy you are with clients.',
        'steps'              => array(
            array( 'num' => '01', 'title' => 'Brand and audience audit', 'body' => 'We start by understanding your positioning, target clients, and the content topics that would be most valuable to your specific audience — so everything we produce is purposeful, not generic.' ),
            array( 'num' => '02', 'title' => 'Monthly content calendar', 'body' => 'Each month we produce a content plan covering your blog, LinkedIn, newsletter, and any other active channels — giving you visibility and input before anything is written.' ),
            array( 'num' => '03', 'title' => 'Content written and published', 'body' => 'We write the content, you review and approve, and we handle publishing. No chasing. No last-minute scrambles. Everything goes out on the planned schedule.' ),
            array( 'num' => '04', 'title' => 'Monthly performance review', 'body' => 'A monthly summary of what performed, what generated enquiries or conversations, and what we optimise for the following month.' ),
        ),
        'deliverables_intro' => 'A fully managed own-brand content operation that keeps your business visible while you focus on clients.',
        'deliverables'       => array(
            array( 'name' => '4–8 long-form pieces per month', 'detail' => 'Blog posts, LinkedIn articles, or thought leadership pieces — a consistent volume of substantive content that builds authority over time.' ),
            array( 'name' => 'Social content across all active channels', 'detail' => 'Short-form posts, repurposed from long-form pieces, published consistently across LinkedIn, X, and any other channels you use.' ),
            array( 'name' => 'Monthly newsletter', 'detail' => 'A regular email to your subscriber list — written, formatted, and sent by Bluu — keeping you in front of warm prospects and existing clients.' ),
            array( 'name' => 'Monthly intelligence digest', 'detail' => 'A monthly summary of what is happening in your market and category — so your content stays relevant and informed, not generic.' ),
        ),
        'cadence'            => 'Content published on a consistent weekly schedule. Newsletter sent monthly. Intelligence digest delivered at the start of each month. All included in your retainer.',
        'fit_statements'     => array(
            'You run an agency or consultancy and know that your own content should be generating inbound — but client delivery always takes priority.',
            'You have gone through the feast-and-famine cycle and want a consistent content engine running in the background regardless of how busy you are.',
            'You have opinions, expertise, and perspectives worth publishing — you just need someone to turn them into consistent output without taking hours from your week.',
            'You want to be less dependent on referrals and build a content-driven inbound channel that works for you over time.',
        ),
        'not_fit'            => 'This use case works best when you can commit to a monthly 45-minute conversation so we can stay close to your positioning and the topics that matter to your audience. Without that input, the content becomes generic over time.',
        'related'            => array(
            array( 'title' => 'Thought leadership publishing', 'url' => '/industries/agencies-consultants/thought-leadership', 'desc' => 'Elevate beyond regular content with structured thought leadership that positions you as a leading voice in your category.' ),
            array( 'title' => 'New service launch content', 'url' => '/industries/agencies-consultants/service-launch', 'desc' => 'When you launch a new service or reposition your offering, your own brand content operation is the most powerful channel to announce it through.' ),
            array( 'title' => 'White-label content production', 'url' => '/industries/agencies-consultants/white-label-production', 'desc' => 'While we run your own brand, we can also handle content production for your clients under your name.' ),
        ),
        'cta_heading'        => 'Your next client is already looking for someone like you. Are they finding you?',
        'cta_sub'            => 'Book a 15-minute Discovery Call to talk through what a consistent own-brand content operation would look like for your agency or practice.',
    ),
    'thought-leadership' => array(
        'hero_tag'           => 'Use case — Agencies & consultants',
        'hero_headline'      => 'You have expertise worth publishing. It should not stay in your head.',
        'hero_sub'           => 'Thought leadership is not about writing long articles for their own sake. It is about consistently putting your perspective in front of the people who make decisions about who to hire. Bluu turns your knowledge and opinions into a structured publishing programme that builds your authority without demanding your time.',
        'situation_body'     => 'You have been in your field long enough to have real opinions — about where the market is going, what most people get wrong, what actually works and what does not. Clients pay you precisely because of that expertise. But almost none of it is published. You are a well-kept secret to anyone who has not already met you.',
        'pains'              => array(
            array( 'title' => 'Expertise without a platform', 'body' => 'Deep knowledge that never gets published is knowledge that only benefits your existing clients. Thought leadership turns that expertise into a discovery channel.' ),
            array( 'title' => 'Hard to prioritise writing', 'body' => 'Writing long-form content takes time, mental energy, and a clear process. Without dedicated time and support, it always gets displaced by client work.' ),
            array( 'title' => 'Sporadic publishing has no compound effect', 'body' => 'Publishing one article every few months builds nothing. Thought leadership requires consistent volume to build the association between your name and your area of expertise.' ),
        ),
        'approach_body'      => 'We build a structured thought leadership programme around your genuine expertise — starting with understanding what you know that others do not, what you believe that is worth arguing for, and what your target clients need to hear. Then we turn that into a consistent monthly output of articles, commentary, and analysis published under your name.',
        'steps'              => array(
            array( 'num' => '01', 'title' => 'Expertise and positioning interview', 'body' => 'We start with a structured conversation to map your genuine areas of expertise, your strongest opinions, and the arguments you want to be known for — so the content reflects your actual thinking.' ),
            array( 'num' => '02', 'title' => 'Monthly topic planning', 'body' => 'Each month we plan a set of topics drawn from your perspective, what is current in your field, and what your target clients are grappling with — giving you input before anything is written.' ),
            array( 'num' => '03', 'title' => 'Long-form articles written in your voice', 'body' => 'We write substantive articles that carry your argument and reflect your thinking — not generic industry content, but specific, opinionated pieces that establish a clear point of view.' ),
            array( 'num' => '04', 'title' => 'Published and distributed', 'body' => 'Each piece is published on your blog or LinkedIn, distributed to your newsletter list, and repurposed into short-form social posts — so every piece of thinking reaches the widest relevant audience.' ),
        ),
        'deliverables_intro' => 'A consistent programme of published thought leadership that builds your authority and visibility over time.',
        'deliverables'       => array(
            array( 'name' => '2–4 long-form articles per month', 'detail' => 'Substantive, opinionated articles of 800–1,500 words — published under your name, in your voice, reflecting your genuine expertise.' ),
            array( 'name' => 'LinkedIn articles and post series', 'detail' => 'Long-form articles published natively on LinkedIn for maximum reach, plus a series of posts pulling key arguments from each piece.' ),
            array( 'name' => 'Newsletter inclusion', 'detail' => 'Each article featured in your monthly newsletter — keeping your subscriber list engaged with your thinking and directing them to the full piece.' ),
            array( 'name' => 'Market commentary pieces', 'detail' => 'Short, timely commentary on relevant industry news or developments — published quickly to demonstrate that you are paying attention and have an opinion worth reading.' ),
        ),
        'cadence'            => 'Articles published on a consistent schedule throughout the month. Market commentary published within 48 hours of relevant developments. All included in your retainer.',
        'fit_statements'     => array(
            'You are a principal, partner, or senior consultant with genuine expertise and opinions — and you want to be known for them beyond your existing client relationships.',
            'You want to build a reputation as a leading voice in your field rather than one of many generalists competing on price and availability.',
            'You are comfortable being opinionated — you have points of view worth arguing for, and you want a platform that lets those arguments reach the right audience consistently.',
        ),
        'not_fit'            => 'Thought leadership requires genuine expertise and real opinions. If you are looking for generic industry content that says nothing controversial or specific, this use case is not the right fit — that kind of content builds nothing.',
        'related'            => array(
            array( 'title' => 'Own brand content operation', 'url' => '/industries/agencies-consultants/own-brand-content', 'desc' => 'Thought leadership sits within a broader own-brand content operation — the two work together to build a complete content presence.' ),
            array( 'title' => 'New service launch content', 'url' => '/industries/agencies-consultants/service-launch', 'desc' => 'Established thought leadership makes launching a new service significantly easier — the audience already trusts your expertise.' ),
            array( 'title' => 'White-label content production', 'url' => '/industries/agencies-consultants/white-label-production', 'desc' => 'While we build your thought leadership, we can also handle client content production under your agency\'s name.' ),
        ),
        'cta_heading'        => 'The people who should be hiring you don\'t know you exist yet.',
        'cta_sub'            => 'Book a 15-minute Discovery Call to talk through what a thought leadership programme would look like for your specific expertise and audience.',
    ),
    'white-label-production' => array(
        'hero_tag'           => 'Use case — Agencies & consultants',
        'hero_headline'      => 'Scale your content offering without scaling your team.',
        'hero_sub'           => 'You have clients who need consistent content and a team that is already at capacity. Bluu acts as your invisible production partner — writing, researching, and producing content under your agency\'s name so you can take on more work, deliver more value, and grow without the overhead of additional hires.',
        'situation_body'     => 'You run an agency that offers content as part of your service. Demand is there — clients want more — but your team is stretched and hiring is slow, expensive, and risky at the volume you need. You are either turning down work, overpromising and scrambling, or delivering below the standard you want your name attached to. There is a better way.',
        'pains'              => array(
            array( 'title' => 'Capacity limits growth', 'body' => 'Every new client who needs content puts pressure on your existing team. At some point you are choosing between growth and quality, and neither option feels right.' ),
            array( 'title' => 'Hiring is slow and expensive', 'body' => 'A full-time content hire takes months to onboard and costs significantly more than outsourced production. For overflow work, it is not the right solution.' ),
            array( 'title' => 'Quality must stay consistent', 'body' => 'Your name is on every piece of content that goes to clients. The quality of what a production partner produces reflects directly on your agency. It has to be right.' ),
        ),
        'approach_body'      => 'We work as a white-label production partner — producing content for your clients under your agency\'s name, to your brief, at your quality standard. You manage the client relationship. We handle the research, writing, and first-draft production. You review and deliver. No attribution to Bluu. No visible seams. Just a reliable production resource that scales with your client load.',
        'steps'              => array(
            array( 'num' => '01', 'title' => 'Agency and client onboarding', 'body' => 'We start with a structured onboarding to understand your agency\'s quality standards, your clients\' brand voices, and the briefing process we will follow together.' ),
            array( 'num' => '02', 'title' => 'Brief-led production', 'body' => 'For every piece of work, you provide a brief. We research, write, and return a first draft to your agreed turnaround timeline — typically 48–72 hours for standard content.' ),
            array( 'num' => '03', 'title' => 'Review and refinement', 'body' => 'You review the draft, provide feedback, and we refine until it meets your standard. The final piece goes to your client under your name — we are invisible throughout.' ),
            array( 'num' => '04', 'title' => 'Flexible volume', 'body' => 'Volume scales up or down with your client load. Busier months, we produce more. Quieter periods, the commitment adjusts. No fixed headcount, no redundancy risk.' ),
        ),
        'deliverables_intro' => 'A reliable white-label production resource that delivers quality first drafts to your brief, on time, every time.',
        'deliverables'       => array(
            array( 'name' => 'Brief-to-draft production', 'detail' => 'Blog posts, LinkedIn articles, social captions, email newsletters, and case studies — produced to your brief within agreed turnaround times.' ),
            array( 'name' => 'Research and intelligence', 'detail' => 'Where the brief requires background research, we handle it — so drafts arrive informed and ready to refine, not requiring you to supply all the raw material.' ),
            array( 'name' => 'Consistent brand voice adherence', 'detail' => 'We maintain voice and style guides for each client so every piece is consistent with their established tone — no resetting with each new piece.' ),
            array( 'name' => 'Flexible volume and turnaround', 'detail' => 'Standard turnaround of 48–72 hours for most content. Rush turnarounds available by arrangement. Volume scales to your monthly client load.' ),
        ),
        'cadence'            => 'Turnaround times agreed at onboarding. Standard: 48–72 hours from brief. Rush: same-day or next-day by arrangement. Volume discussed monthly.',
        'fit_statements'     => array(
            'You run an agency that offers content services and you have more demand than your current team can comfortably handle at quality.',
            'You want to scale output without the commitment, cost, and risk of additional full-time hires.',
            'You can provide clear, structured briefs and are comfortable managing a production review process — you want a reliable production partner, not another managed service.',
            'Quality is non-negotiable for you — your name is on the work and it needs to be right before it goes to clients.',
        ),
        'not_fit'            => 'White-label production works best with well-structured briefs. If your briefing process is currently ad hoc or your quality bar is not yet clearly defined, the output will reflect that — we recommend establishing your brief template first.',
        'related'            => array(
            array( 'title' => 'Own brand content operation', 'url' => '/industries/agencies-consultants/own-brand-content', 'desc' => 'While Bluu handles client content production, we can also run your own brand content so neither gets neglected.' ),
            array( 'title' => 'New service launch content', 'url' => '/industries/agencies-consultants/service-launch', 'desc' => 'If you are expanding your content offering to clients, a service launch content package helps you communicate the new capability to your existing base.' ),
            array( 'title' => 'Thought leadership publishing', 'url' => '/industries/agencies-consultants/thought-leadership', 'desc' => 'Build your agency\'s own reputation for expertise while Bluu handles client production in the background.' ),
        ),
        'cta_heading'        => 'Take on more work. Deliver the same quality. Keep your name on it.',
        'cta_sub'            => 'Book a 15-minute Discovery Call to talk through whether white-label production is the right arrangement for your agency\'s current situation.',
    ),
    'service-launch' => array(
        'hero_tag'           => 'Use case — Agencies & consultants',
        'hero_headline'      => 'A new service is only as strong as the story you tell about it.',
        'hero_sub'           => 'You have developed a new offering — a new service line, a productised retainer, or a repositioned practice. Now you need to communicate it clearly to your existing clients and credibly to new prospects. Bluu produces the complete content package so your launch lands with the weight it deserves.',
        'situation_body'     => 'You have done the hard work of developing a new service or repositioning your practice. But communicating a new offering is its own challenge — one that most agencies and consultants underinvest in. A new service page and a LinkedIn post is not a launch strategy. If the people who should be hiring you do not understand what you now do and why it is right for them, the launch quietly disappears.',
        'pains'              => array(
            array( 'title' => 'Positioning is harder than building', 'body' => 'Articulating what a new service is, who it is for, and why it is different from what competitors offer requires real craft. Most agencies write their own service pages and undersell themselves.' ),
            array( 'title' => 'Existing clients hear about it last', 'body' => 'The people most likely to buy a new service from you are your existing clients. Without a deliberate communication plan, they find out accidentally or not at all.' ),
            array( 'title' => 'One channel is not a launch', 'body' => 'A single LinkedIn post announcing a new service reaches a fraction of your relevant audience once. A proper launch communicates across every channel your prospects use, multiple times, with consistent messaging.' ),
        ),
        'approach_body'      => 'We treat your service launch as a content campaign — starting with a deep understanding of the new offering, who it is for, and how to position it compellingly against the alternatives. Then we produce a complete launch content package covering every relevant channel, from your website to your existing client email list to LinkedIn.',
        'steps'              => array(
            array( 'num' => '01', 'title' => 'Positioning and messaging brief', 'body' => 'We start with a structured briefing to understand the new service, its target client, its core benefit, and how it is positioned — this becomes the foundation for every piece of content we produce.' ),
            array( 'num' => '02', 'title' => 'Website and page copy', 'body' => 'New service page copy written to convert — clear on who it is for, what they get, and why Bluu is the right choice. Ready to hand to your developer.' ),
            array( 'num' => '03', 'title' => 'Full channel launch package', 'body' => 'Email announcement to existing clients, LinkedIn posts for company and personal pages, blog post announcing the launch, and social captions — all produced with consistent messaging.' ),
            array( 'num' => '04', 'title' => 'Post-launch sustain content', 'body' => 'Two to three pieces of content in the month following launch — a deeper explainer, a use case or scenario piece, and a follow-up LinkedIn article — to sustain momentum beyond the initial announcement.' ),
        ),
        'deliverables_intro' => 'A complete content package to launch and sustain awareness of your new service across every relevant channel.',
        'deliverables'       => array(
            array( 'name' => 'Service page copy', 'detail' => 'Full web copy for the new service page — positioning, benefits, who it is for, what is included, and a clear CTA. Developer-ready.' ),
            array( 'name' => 'Launch email to existing clients', 'detail' => 'A personal, direct email announcing the new service to your existing client base — framed as a natural evolution, not a sales pitch.' ),
            array( 'name' => 'LinkedIn launch content', 'detail' => 'Company page announcement plus a personal post from the principal — each framed differently, together creating consistent coverage.' ),
            array( 'name' => 'Launch blog post', 'detail' => 'A full-length blog post explaining why you developed this service, who it is for, and what makes it different — useful for SEO and for sharing with prospects.' ),
            array( 'name' => 'Post-launch sustain pieces', 'detail' => '2–3 follow-up pieces in the month after launch — a use case piece, a deeper explainer, and a LinkedIn article from the principal — to sustain the conversation.' ),
        ),
        'cadence'            => 'Launch package delivered 5 days before go-live date. Post-launch pieces delivered across the 30 days following launch. Available as a standalone engagement or within a retainer.',
        'fit_statements'     => array(
            'You are launching a new service line, productising an existing offering, or significantly repositioning your practice and need the content to communicate it properly.',
            'You have existing clients who should know about the new service and prospects who need to understand it clearly before they will consider hiring you.',
            'You want the launch to feel deliberate and well-communicated — not a quiet update to a website page that nobody notices.',
        ),
        'not_fit'            => 'This use case requires that the new service is clearly defined before we begin. If you are still working out what the offering is or who it is for, the positioning work needs to happen first — we can support that conversation, but the content comes after the clarity.',
        'related'            => array(
            array( 'title' => 'Own brand content operation', 'url' => '/industries/agencies-consultants/own-brand-content', 'desc' => 'After the launch, a consistent own-brand content operation sustains awareness of the new service over time.' ),
            array( 'title' => 'Thought leadership publishing', 'url' => '/industries/agencies-consultants/thought-leadership', 'desc' => 'Establishing yourself as a thought leader in the area your new service covers is the most powerful long-term complement to a launch.' ),
            array( 'title' => 'White-label content production', 'url' => '/industries/agencies-consultants/white-label-production', 'desc' => 'If the new service includes content production for clients, white-label production gives you the capacity to deliver it without additional hires.' ),
        ),
        'cta_heading'        => 'You built something worth talking about. Let\'s make sure people hear about it.',
        'cta_sub'            => 'Book a 15-minute Discovery Call to talk through your new service and what a launch content package would cover for your specific situation.',
    ),
    'brand-storytelling' => array(
        'hero_tag'           => 'Use case — E-commerce & DTC brands',
        'hero_headline'      => 'Products get you the first sale. Your story keeps customers coming back.',
        'hero_sub'           => 'In a crowded DTC market, the brands that win long-term are the ones with a clear, consistent narrative that customers connect with beyond the product itself. Bluu builds and runs the editorial engine that keeps your brand story alive across every channel, every month.',
        'situation_body'     => 'You have a product people love but a content presence that does not reflect the brand you are building. Blog posts are irregular. Social content is product-heavy and transactional. Your email list gets newsletters when you remember to send them. The result is a brand that is harder to love than it should be — and customers who buy once but do not come back because there is nothing drawing them in between purchases.',
        'pains'              => array(
            array( 'title' => 'Transactional content builds no loyalty', 'body' => 'Discount codes and product announcements drive short-term sales. They build no emotional connection and no reason to return other than needing the product again.' ),
            array( 'title' => 'Inconsistent publishing undermines brand trust', 'body' => 'A brand that goes quiet for weeks and then sends a burst of content feels unreliable. Consistency signals that you are a real brand, not a side project.' ),
            array( 'title' => 'No narrative thread across channels', 'body' => 'Blog, email, and social all say different things and feel like they come from different brands. A strong editorial strategy creates a consistent voice and narrative wherever customers encounter you.' ),
        ),
        'approach_body'      => 'We build a consistent editorial engine for your brand — rooted in your brand voice, your values, and the story that connects your product to your customers\' lives. Every piece of content, from a blog post to an email subject line, is part of a coherent narrative that builds over time into genuine brand equity.',
        'steps'              => array(
            array( 'num' => '01', 'title' => 'Brand voice and story audit', 'body' => 'We begin by understanding your brand deeply — your origin, your values, your customer, and the story you want to be known for — so every piece of content reflects who you actually are.' ),
            array( 'num' => '02', 'title' => 'Monthly editorial calendar', 'body' => 'Each month we plan a content calendar that balances brand storytelling, product focus, customer education, and seasonal relevance — giving you a clear picture of the month\'s content before it is written.' ),
            array( 'num' => '03', 'title' => 'Content written and published', 'body' => 'Blog posts, email newsletters, and social captions — all written to your brand voice and published on schedule. Nothing waits for you to find the time.' ),
            array( 'num' => '04', 'title' => 'Performance review and optimisation', 'body' => 'Monthly review of what drove engagement, traffic, and sales — so the editorial direction evolves based on what your specific audience responds to.' ),
        ),
        'deliverables_intro' => 'A consistent, on-brand content presence across blog, email, and social — produced and published every month without you having to manage it.',
        'deliverables'       => array(
            array( 'name' => '4–6 blog posts per month', 'detail' => 'Brand storytelling, product education, lifestyle content, and behind-the-scenes pieces — a mix that builds connection and drives organic discovery.' ),
            array( 'name' => 'Monthly email newsletter', 'detail' => 'A brand-led newsletter that goes beyond promotions — keeping subscribers engaged with your story and giving them reasons to open every time.' ),
            array( 'name' => 'Social content calendar', 'detail' => 'Captions and post copy for Instagram, Facebook, and any other active social channels — consistent in voice and narrative across all platforms.' ),
            array( 'name' => 'Monthly performance report', 'detail' => 'What content drove traffic, email opens, and engagement — with clear recommendations for the following month\'s editorial direction.' ),
        ),
        'cadence'            => 'Published on a consistent weekly schedule. Newsletter sent monthly. Performance report delivered at the end of each month. All included in your retainer.',
        'fit_statements'     => array(
            'You have a DTC or e-commerce brand with a clear identity and you want content that builds on that identity rather than just promoting products.',
            'You have a customer base worth nurturing and you want a consistent content presence that keeps them engaged between purchases.',
            'You are currently producing content inconsistently or not at all and want a reliable editorial engine you do not have to manage yourself.',
        ),
        'not_fit'            => 'Brand storytelling works best when you have a clear sense of who your brand is and who your customer is. If you are still defining your brand identity, that groundwork needs to come first — we can have that conversation at the Discovery Call.',
        'related'            => array(
            array( 'title' => 'Email newsletter programme', 'url' => '/industries/ecommerce-dtc/email-newsletter', 'desc' => 'A dedicated email programme that goes deeper than what is included in the brand storytelling retainer.' ),
            array( 'title' => 'Product & collection content', 'url' => '/industries/ecommerce-dtc/product-content', 'desc' => 'Launch-specific content for new drops and collections — a natural complement to ongoing brand storytelling.' ),
            array( 'title' => 'Market & trend intelligence', 'url' => '/industries/ecommerce-dtc/market-intelligence', 'desc' => 'Stay ahead of category trends so your editorial content remains relevant and timely.' ),
        ),
        'cta_heading'        => 'Your brand has a story. It should be telling it every day.',
        'cta_sub'            => 'Book a 15-minute Discovery Call to talk through your brand and what a consistent editorial programme would look like for your specific audience and channels.',
    ),
    'product-content' => array(
        'hero_tag'           => 'Use case — E-commerce & DTC brands',
        'hero_headline'      => 'Every new drop deserves copy that does the product justice.',
        'hero_sub'           => 'Product descriptions that convert, collection launch copy that builds anticipation, and social assets that make people stop scrolling — Bluu produces the full content package for every new product or collection so launches land properly and products sell at the rate they deserve.',
        'situation_body'     => 'You are launching new products and collections regularly, but the content side of each launch is always last-minute. Product descriptions get written quickly by whoever is available. Launch copy varies in quality and voice. Social assets are created in a rush. The result is products that look great but are let down by the words around them — and launches that underperform because the communication does not match the quality of what is being sold.',
        'pains'              => array(
            array( 'title' => 'Products undersold by weak copy', 'body' => 'A poorly written product description fails a great product. Copy that leads with specifications rather than desire costs you sales that the product would otherwise win.' ),
            array( 'title' => 'Inconsistent voice across product lines', 'body' => 'When different people write different products, the brand voice fractures. Customers notice even when they cannot articulate why something feels off.' ),
            array( 'title' => 'Launch content always rushed', 'body' => 'Great products deserve more than a last-minute caption and a hurried email. Rushed launch content is one of the most common reasons a new collection underperforms its potential.' ),
        ),
        'approach_body'      => 'We work ahead of your launch calendar — understanding each product or collection, the customer it is made for, and the desire it is trying to fulfil. Then we produce the complete content package for each launch: product page copy, collection landing page copy, email announcement, and social assets — all in your brand voice, all ready before the launch date.',
        'steps'              => array(
            array( 'num' => '01', 'title' => 'Pre-launch product brief', 'body' => 'Two weeks before launch, you share product details, photography direction, and any positioning notes. We ask questions to understand the story behind the product and who it is made for.' ),
            array( 'num' => '02', 'title' => 'Product and collection copy', 'body' => 'Full product descriptions for every SKU — desire-led, benefit-forward, and optimised for both conversion and search. Plus collection landing page copy that sets the narrative context for the full range.' ),
            array( 'num' => '03', 'title' => 'Launch email and social assets', 'body' => 'Announcement email to your list and a set of social captions for the launch window — all consistent with the product copy and the wider brand voice.' ),
            array( 'num' => '04', 'title' => 'Post-launch sustain content', 'body' => 'Ongoing social content and a follow-up email in the weeks after launch to sustain visibility beyond the initial drop window.' ),
        ),
        'deliverables_intro' => 'A complete content package for every product launch or collection drop — ready before the launch date, consistent in voice throughout.',
        'deliverables'       => array(
            array( 'name' => 'Product descriptions', 'detail' => 'Individual product copy for every SKU in the collection — desire-led, conversion-focused, and consistent in tone across the range.' ),
            array( 'name' => 'Collection landing page copy', 'detail' => 'Narrative copy for the collection page — the story behind the range, the aesthetic, and the customer it is made for.' ),
            array( 'name' => 'Launch email', 'detail' => 'An announcement email to your list with a compelling subject line, preview text, and body copy that drives click-throughs.' ),
            array( 'name' => 'Social launch captions', 'detail' => '5–8 captions for the launch window — a mix of tones and angles so your feed does not feel repetitive across the launch period.' ),
            array( 'name' => 'Post-launch content', 'detail' => 'Follow-up email and ongoing social captions for the 2–3 weeks following launch to sustain awareness and drive late conversions.' ),
        ),
        'cadence'            => 'Full launch package delivered 3–5 days before launch date. Post-launch content delivered on a rolling schedule. Available within a retainer or as a standalone launch package.',
        'fit_statements'     => array(
            'You launch new products or collections regularly and the content side of each launch is consistently under-resourced and last-minute.',
            'You have a clear brand voice but product copy across your site is inconsistent because different people have written it at different times.',
            'You want your products to be sold by words that match their quality — and you do not have the internal resource to produce that consistently for every launch.',
        ),
        'not_fit'            => 'This use case requires a minimum two-week lead time before each launch date. Same-week requests will not produce the quality of work your products deserve.',
        'related'            => array(
            array( 'title' => 'Brand storytelling & editorial', 'url' => '/industries/ecommerce-dtc/brand-storytelling', 'desc' => 'Product launch content works best within a consistent brand narrative — the editorial programme provides the context that makes launches land harder.' ),
            array( 'title' => 'Email newsletter programme', 'url' => '/industries/ecommerce-dtc/email-newsletter', 'desc' => 'Your email list is your most valuable launch channel — a dedicated newsletter programme maximises the impact of every drop.' ),
            array( 'title' => 'Market & trend intelligence', 'url' => '/industries/ecommerce-dtc/market-intelligence', 'desc' => 'Stay ahead of category and aesthetic trends so product launches feel timely and relevant, not reactive.' ),
        ),
        'cta_heading'        => 'Your products deserve copy as good as the products themselves.',
        'cta_sub'            => 'Book a 15-minute Discovery Call to talk through your launch calendar and what a product content programme would cover for your brand.',
    ),
    'email-newsletter' => array(
        'hero_tag'           => 'Use case — E-commerce & DTC brands',
        'hero_headline'      => 'Your email list is your most valuable asset. Most brands barely use it.',
        'hero_sub'           => 'An engaged email list outperforms every paid channel for retention and repeat purchase. But most DTC brands send promotional emails when they have something to sell and nothing in between. Bluu builds and runs a consistent newsletter programme that keeps your subscribers engaged, loyal, and buying — not just when you have a sale on.',
        'situation_body'     => 'Your email list is growing but your email programme is not. You send promotional emails around launches and sales, and go quiet in between. Subscribers have no reason to open unless there is a discount code inside. Open rates are declining because people have learned that your emails are only worth opening when you are selling something. The potential of your list — as a loyalty engine, a community, and a revenue channel — is almost entirely unrealised.',
        'pains'              => array(
            array( 'title' => 'Promotional emails train subscribers to wait for discounts', 'body' => 'When every email is a sales email, subscribers learn to open only when they want to buy. They stop engaging with you as a brand and start treating you as a coupon source.' ),
            array( 'title' => 'Irregular sending destroys deliverability and engagement', 'body' => 'Long gaps between emails lower deliverability scores and train subscribers to forget you. When you do send, open rates are low because the habit of opening your emails never formed.' ),
            array( 'title' => 'Email is your highest-ROI channel — and you are underinvesting in it', 'body' => 'Email consistently outperforms social and paid for DTC brands in retention and lifetime value. A properly run newsletter programme is one of the highest-return investments a DTC brand can make.' ),
        ),
        'approach_body'      => 'We build a consistent newsletter programme that gives your subscribers a reason to open every email — not just the ones with a discount code. A mix of brand storytelling, product education, behind-the-scenes content, and curated picks, sent on a reliable weekly or fortnightly schedule that trains subscribers to look forward to hearing from you.',
        'steps'              => array(
            array( 'num' => '01', 'title' => 'Email strategy and cadence planning', 'body' => 'We establish the right sending cadence for your audience, the mix of content types that suit your brand, and the overall editorial direction for the newsletter programme.' ),
            array( 'num' => '02', 'title' => 'Monthly content calendar', 'body' => 'A planned calendar of newsletter topics for the month ahead — balancing brand content, product focus, and any launches or seasonal moments — shared with you before writing begins.' ),
            array( 'num' => '03', 'title' => 'Written, designed, and sent', 'body' => 'Each newsletter is written, structured, and sent via your email platform on the agreed schedule. You review and approve before it goes to your list.' ),
            array( 'num' => '04', 'title' => 'Performance tracking and optimisation', 'body' => 'Monthly review of open rates, click rates, and revenue attribution — with specific recommendations for subject line approach, content mix, and send timing based on your audience\'s behaviour.' ),
        ),
        'deliverables_intro' => 'A fully managed email newsletter programme that builds a loyal, engaged subscriber base over time.',
        'deliverables'       => array(
            array( 'name' => 'Weekly or fortnightly newsletter', 'detail' => 'A full newsletter written, structured, and sent on the agreed schedule — a mix of brand content and product focus that gives subscribers a genuine reason to open.' ),
            array( 'name' => 'Subject line and preview text optimisation', 'detail' => 'Every email includes a tested subject line and preview text combination — the two most important factors in open rate — written to stand out in a busy inbox.' ),
            array( 'name' => 'Monthly editorial calendar', 'detail' => 'A planned month of newsletter content shared with you at the start of each month for review and input before anything is written.' ),
            array( 'name' => 'Monthly performance report', 'detail' => 'Open rate, click rate, and revenue data with clear recommendations for improving performance in the following month.' ),
        ),
        'cadence'            => 'Weekly or fortnightly sending schedule agreed at onboarding. Each newsletter reviewed and approved by you before sending. All included in your retainer.',
        'fit_statements'     => array(
            'You have an email list of at least 500 subscribers that you are currently under-using — sending only promotional emails or nothing at all between launches.',
            'You want to build a genuine relationship with your subscribers rather than treating them as a discount-code distribution list.',
            'You understand that email is a long-term retention channel and you are ready to invest in it consistently rather than treating it as a last-minute promotional tool.',
        ),
        'not_fit'            => 'An email programme requires a minimum list size to be meaningful. If you have fewer than 500 subscribers, the priority should be growing your list — we can advise on how to do that, but the newsletter investment makes most sense once you have an audience worth writing for.',
        'related'            => array(
            array( 'title' => 'Brand storytelling & editorial', 'url' => '/industries/ecommerce-dtc/brand-storytelling', 'desc' => 'The email newsletter is one channel within a broader brand editorial programme — the two work together to create a complete content presence.' ),
            array( 'title' => 'Product & collection content', 'url' => '/industries/ecommerce-dtc/product-content', 'desc' => 'Product launches are the natural hook for specific newsletter editions — the two use cases complement each other directly.' ),
            array( 'title' => 'Market & trend intelligence', 'url' => '/industries/ecommerce-dtc/market-intelligence', 'desc' => 'Category intelligence keeps your newsletter content relevant and timely — an informed newsletter is a more interesting newsletter.' ),
        ),
        'cta_heading'        => 'Your subscribers signed up because they wanted to hear from you. Give them something worth reading.',
        'cta_sub'            => 'Book a 15-minute Discovery Call to talk through your current email programme and what a properly run newsletter could do for your retention and revenue.',
    ),
    'market-intelligence' => array(
        'hero_tag'           => 'Use case — E-commerce & DTC brands',
        'hero_headline'      => 'The best DTC brands do not follow trends. They see them coming.',
        'hero_sub'           => 'In a fast-moving consumer market, the brands that win are the ones with the best intelligence — about where aesthetics are moving, what competitors are doing, and what their audience is talking about. Bluu monitors your category continuously and surfaces what matters before it becomes obvious.',
        'situation_body'     => 'You are tracking your category by feel — checking Instagram when you have time, noticing competitor campaigns after they have run for weeks, and occasionally Googling what is trending in your space. It is better than nothing but it is not intelligence. By the time you act on what you notice, the moment has usually passed. Monitoring your category properly requires time and a system — neither of which most DTC brands have.',
        'pains'              => array(
            array( 'title' => 'Reactive to trends rather than ahead of them', 'body' => 'Noticing a trend when it is already everywhere means you are a follower. The brands building authority are the ones that respond early when trends are still building.' ),
            array( 'title' => 'Competitor moves go unnoticed', 'body' => 'Pricing changes, new product lines, new brand positioning — without systematic monitoring, you find out too late to respond strategically.' ),
            array( 'title' => 'Audience signals buried in noise', 'body' => 'Your audience tells you what they want in comments, reviews, and social conversations. Without a process for surfacing and synthesising those signals, they disappear into the feed.' ),
        ),
        'approach_body'      => 'We set up a continuous monitoring process across your category — tracking competitor activity, emerging trends on social platforms, search behaviour shifts, and audience conversations relevant to your brand. Everything is synthesised into a weekly intelligence digest you can read in five minutes and use to make better decisions about content, product, and positioning.',
        'steps'              => array(
            array( 'num' => '01', 'title' => 'Category and competitor mapping', 'body' => 'We begin by mapping your category — key competitors, adjacent brands, trend-setting accounts, and the platforms and communities where your audience spends time.' ),
            array( 'num' => '02', 'title' => 'Continuous monitoring', 'body' => 'Weekly monitoring across Instagram, TikTok, Pinterest, Reddit, competitor websites, and search trends — tracking what is emerging, what is shifting, and what your competitors are doing.' ),
            array( 'num' => '03', 'title' => 'Weekly intelligence digest', 'body' => 'A clean, readable digest delivered every Monday — three to five things that matter from the past week, why they matter, and what you might do about them.' ),
            array( 'num' => '04', 'title' => 'Quarterly trend report', 'body' => 'A deeper quarterly analysis of where your category is heading — useful for product planning, content strategy, and brand positioning decisions.' ),
        ),
        'deliverables_intro' => 'Structured, actionable intelligence about your category delivered weekly — so you are always informed and never caught off guard.',
        'deliverables'       => array(
            array( 'name' => 'Weekly intelligence digest', 'detail' => 'Delivered every Monday — what changed in your category last week, what competitors did, and what audience signals surfaced that are worth paying attention to.' ),
            array( 'name' => 'Trend alerts', 'detail' => 'Immediate notification when something significant breaks in your category — a viral moment, a competitor campaign, or an emerging aesthetic that is building fast.' ),
            array( 'name' => 'Competitor activity monitoring', 'detail' => 'Regular tracking of your top three to five competitors — new products, pricing changes, campaign activity, and messaging shifts.' ),
            array( 'name' => 'Quarterly trend report', 'detail' => 'A deeper analysis of macro trends in your category delivered quarterly — useful for product development and content strategy planning.' ),
        ),
        'cadence'            => 'Weekly digest every Monday. Trend alerts within 24 hours of significant events. Quarterly report at end of each quarter. All included in your retainer.',
        'fit_statements'     => array(
            'You are in a trend-sensitive category where being early matters — fashion, beauty, food, wellness, lifestyle, or any consumer market driven by aesthetics and culture.',
            'You are currently tracking your category by feel and want a systematic, reliable process that surfaces what matters without you having to spend hours doing it.',
            'You want to make content and product decisions based on real market intelligence rather than gut feel and occasional browsing.',
        ),
        'not_fit'            => 'Market intelligence is most valuable in categories that move fast. If you are in a stable, slow-moving category, the weekly cadence may produce less actionable signal — the quarterly report is likely more relevant in that case.',
        'related'            => array(
            array( 'title' => 'Brand storytelling & editorial', 'url' => '/industries/ecommerce-dtc/brand-storytelling', 'desc' => 'Intelligence about what is trending in your category directly informs your editorial calendar — the two use cases work naturally together.' ),
            array( 'title' => 'Product & collection content', 'url' => '/industries/ecommerce-dtc/product-content', 'desc' => 'Trend intelligence helps you time and position product launches to align with where the category is moving.' ),
            array( 'title' => 'Email newsletter programme', 'url' => '/industries/ecommerce-dtc/email-newsletter', 'desc' => 'Curated trend intelligence makes for genuinely interesting newsletter content — something worth reading beyond promotions.' ),
        ),
        'cta_heading'        => 'Stop finding out what happened in your category last month.',
        'cta_sub'            => 'Book a 15-minute Discovery Call to talk through your category and what a weekly intelligence programme would cover for your brand.',
    ),
    'expert-commentary' => array(
        'hero_tag'           => 'Use case — Professional services',
        'hero_headline'      => 'Your clients pay for your expertise. Your prospects should be able to find it.',
        'hero_sub'           => 'Market commentary, regulatory insight, and professional opinion — published consistently under your name — is how professional services firms build trust with people who have not met them yet. Bluu structures and publishes your expertise so it reaches the people who need to hire someone exactly like you.',
        'situation_body'     => 'You have deep expertise in your field. You follow market developments closely, understand regulatory changes before most people, and have formed opinions that your clients find genuinely valuable. None of that is visible to anyone who is not already a client. Your expertise is invisible to the market — and invisibility is expensive when you are competing for work with firms that look identical from the outside.',
        'pains'              => array(
            array( 'title' => 'Expertise that cannot be found cannot be trusted', 'body' => 'Prospective clients looking for a specialist in your area search online before they ask for referrals. If you have no published commentary or opinion, you simply do not appear as an option.' ),
            array( 'title' => 'Your competitors are publishing — you are not', 'body' => 'The firms building consistent visibility in your category are the ones that will be top of mind when mandates come around. Being absent from the conversation has a cost.' ),
            array( 'title' => 'Writing takes time partners do not have', 'body' => 'The billable hour pressure is real. Every hour spent writing commentary is an hour not spent on client work. Without a system that removes the writing burden, it simply does not happen.' ),
        ),
        'approach_body'      => 'We build a structured expert commentary programme around your genuine expertise — monitoring the developments in your field that are worth commenting on and working with you to articulate your perspective clearly and publishably. You contribute the insight. We do the structuring, writing, and publishing.',
        'steps'              => array(
            array( 'num' => '01', 'title' => 'Expertise and focus area mapping', 'body' => 'We begin by mapping the specific areas where you have authority, the developments you follow most closely, and the audience you want to reach — so the commentary programme is targeted, not generic.' ),
            array( 'num' => '02', 'title' => 'Market monitoring', 'body' => 'We monitor the developments in your field — regulatory changes, market shifts, notable transactions or cases, industry debate — and identify what is worth commenting on and when.' ),
            array( 'num' => '03', 'title' => 'Commentary written around your perspective', 'body' => 'We draft commentary pieces that carry your genuine perspective — specific, opinionated, and professionally credible. You review and approve before anything is published.' ),
            array( 'num' => '04', 'title' => 'Published and distributed', 'body' => 'Each piece is published on your website and LinkedIn, distributed to your newsletter list, and repurposed into short-form posts — reaching clients, referral sources, and prospects simultaneously.' ),
        ),
        'deliverables_intro' => 'A consistent programme of published expert commentary that builds your visibility and authority in your field over time.',
        'deliverables'       => array(
            array( 'name' => '2–4 commentary pieces per month', 'detail' => 'Professionally written commentary on relevant developments in your field — carrying your specific perspective and published under your name.' ),
            array( 'name' => 'LinkedIn posts and articles', 'detail' => 'Each commentary piece adapted for LinkedIn — both as a native article and as a series of posts that reach different parts of your network.' ),
            array( 'name' => 'Newsletter distribution', 'detail' => 'Commentary featured in your regular newsletter — keeping clients and referral sources informed of your perspective on what is happening in their sector.' ),
            array( 'name' => 'Timely development alerts', 'detail' => 'When a significant development in your field breaks, we alert you and can turn around a commentary piece within 24–48 hours so you can respond while it is still current.' ),
        ),
        'cadence'            => 'Regular pieces published 2–4 times per month. Timely commentary within 24–48 hours of relevant developments. All included in your retainer.',
        'fit_statements'     => array(
            'You are a partner, principal, or senior advisor with genuine expertise in a specific area of law, finance, consulting, or another professional field.',
            'You follow developments in your field closely and have formed perspectives worth sharing — you just have not built the habit or the infrastructure to publish them.',
            'You want to be known as a voice in your field, not just a practitioner — and you understand that consistent publishing over time is how that reputation is built.',
        ),
        'not_fit'            => 'Expert commentary requires genuine expertise and real opinions. A programme that publishes generic industry summaries builds nothing — the value comes from your specific perspective. If you are not yet sure what that perspective is, the first conversation with us is where we help you find it.',
        'related'            => array(
            array( 'title' => 'Client education content', 'url' => '/industries/professional-services/client-education', 'desc' => 'Commentary establishes your authority — client education content deepens the relationship with the audience you have built through that authority.' ),
            array( 'title' => 'LinkedIn authority programme', 'url' => '/industries/professional-services/linkedin-authority', 'desc' => 'Expert commentary is the core content for a LinkedIn authority programme — the two use cases are closely linked.' ),
            array( 'title' => 'Referral & trust content', 'url' => '/industries/professional-services/referral-trust-content', 'desc' => 'Published commentary is the foundation for referral trust — it gives existing clients something credible to share when recommending you.' ),
        ),
        'cta_heading'        => 'Your expertise built your practice. Now let it build your reputation.',
        'cta_sub'            => 'Book a 15-minute Discovery Call to talk through your area of expertise and what a structured commentary programme would look like for your practice.',
    ),
    'client-education' => array(
        'hero_tag'           => 'Use case — Professional services',
        'hero_headline'      => 'The firm that educates its clients is the firm its clients trust most.',
        'hero_sub'           => 'Client education content — guides, explainers, and newsletters that help clients navigate complexity — is the most trust-building content a professional services firm can produce. It demonstrates expertise without selling. It builds relationships before a mandate exists. And it keeps you relevant to clients in between engagements. Bluu produces it consistently so you never have to find the time.',
        'situation_body'     => 'Your clients are navigating complexity in your area of expertise every day. They have questions. They face regulatory changes, market shifts, and business decisions they need guidance on. Most of that guidance is available to your existing clients — but prospects cannot access it, and even existing clients only hear from you when there is a live matter. Client education content changes that by making your expertise accessible, regular, and proactively valuable.',
        'pains'              => array(
            array( 'title' => 'Prospects cannot verify your expertise until they hire you', 'body' => 'Without published educational content, a prospect has no way to assess your depth of knowledge before they engage. Referrals help, but education content lets prospects self-qualify before they even reach out.' ),
            array( 'title' => 'Existing clients forget you between matters', 'body' => 'If clients only hear from you when there is a live engagement, you are invisible the rest of the time. Education content keeps you present and valuable — and first in mind when the next need arises.' ),
            array( 'title' => 'Generic content demonstrates nothing', 'body' => 'A newsletter that summarises industry news shows that you read the same things everyone else reads. Education content that explains what it means for your specific client\'s situation shows genuine expertise.' ),
        ),
        'approach_body'      => 'We build a client education content programme rooted in the questions your clients actually ask and the decisions they genuinely face. Content that simplifies complexity, explains changes, and helps clients make better decisions — without being a sales pitch. Written with your expertise, structured by Bluu, distributed to clients and prospects on a regular schedule.',
        'steps'              => array(
            array( 'num' => '01', 'title' => 'Client question and topic mapping', 'body' => 'We start by cataloguing the questions your clients ask most often, the decisions they find hardest, and the areas where they most need guidance — this becomes the content roadmap.' ),
            array( 'num' => '02', 'title' => 'Guides and explainers', 'body' => 'Structured educational pieces on specific topics — regulatory changes, process explanations, decision frameworks — that clients can reference and share. Written to be accessible without being simplified.' ),
            array( 'num' => '03', 'title' => 'Regular client newsletter', 'body' => 'A consistent newsletter that distils what is relevant in your sector into something clients can read in five minutes and act on — combining educational content with timely commentary.' ),
            array( 'num' => '04', 'title' => 'Distribution to clients and prospects', 'body' => 'Content published on your website for organic discovery, distributed to your client list by email, and shared on LinkedIn — reaching active clients, lapsed clients, and new prospects simultaneously.' ),
        ),
        'deliverables_intro' => 'A consistent educational content programme that demonstrates your expertise to prospects and deepens relationships with existing clients.',
        'deliverables'       => array(
            array( 'name' => 'Monthly client guide or explainer', 'detail' => 'A structured, professionally written guide or explainer on a topic relevant to your clients — suitable for sharing and referencing as a resource.' ),
            array( 'name' => 'Monthly client newsletter', 'detail' => 'A regular newsletter combining educational content, timely commentary, and firm updates — keeping you present and valuable to your client list between engagements.' ),
            array( 'name' => 'LinkedIn educational posts', 'detail' => 'Educational content adapted for LinkedIn — reaching prospects and referral sources who are not on your email list.' ),
            array( 'name' => 'Website resource library', 'detail' => 'Each guide and explainer published to a resources section of your website — building a searchable library of expertise that drives organic discovery over time.' ),
        ),
        'cadence'            => 'One guide or explainer per month. Newsletter monthly. LinkedIn posts weekly. All included in your retainer.',
        'fit_statements'     => array(
            'You work in a complex field where clients regularly face decisions that require guidance — law, finance, tax, compliance, strategy, or any professional services area where expertise genuinely matters.',
            'You want to be proactively valuable to clients between engagements rather than only present when there is a live matter.',
            'You want prospects to be able to verify your expertise before they engage you — and to self-qualify as the right kind of client based on what they read.',
        ),
        'not_fit'            => 'Client education content needs to be specific and genuinely useful to your clients\' situation. A programme that produces generic content will not differentiate you from the dozens of other firms sending similar newsletters. The specificity of your expertise is the differentiator — and we need access to that expertise to make the content work.',
        'related'            => array(
            array( 'title' => 'Expert commentary & opinion', 'url' => '/industries/professional-services/expert-commentary', 'desc' => 'Commentary establishes your authority on current developments — education content deepens client relationships with more evergreen guidance and frameworks.' ),
            array( 'title' => 'Referral & trust content', 'url' => '/industries/professional-services/referral-trust-content', 'desc' => 'Education content is one of the most shareable forms of referral content — clients send useful guides to peers, which is warm introduction at scale.' ),
            array( 'title' => 'LinkedIn authority programme', 'url' => '/industries/professional-services/linkedin-authority', 'desc' => 'Educational content distributed through LinkedIn reaches prospects who are not yet on your email list — the two use cases work together to build complete visibility.' ),
        ),
        'cta_heading'        => 'Your expertise is your best business development tool. Most firms leave it in their heads.',
        'cta_sub'            => 'Book a 15-minute Discovery Call to talk through the questions your clients ask most often and what a client education programme would look like for your practice.',
    ),
    'referral-trust-content' => array(
        'hero_tag'           => 'Use case — Professional services',
        'hero_headline'      => 'Referrals are your best clients. Content is how you earn more of them.',
        'hero_sub'           => 'Most professional services firms are almost entirely dependent on referrals — and most do nothing to systematically nurture the relationships and reputation that produce them. Bluu produces content that reinforces trust with existing clients, keeps your name present with referral sources, and gives people who want to recommend you something credible and specific to share.',
        'situation_body'     => 'Your best clients came from referrals. Your best future clients will probably come from referrals too. But most firms treat referrals as something that happens to them rather than something they actively cultivate. There is no systematic way of staying present with referral sources, reinforcing your credibility with existing clients, or making it easy for people who want to recommend you to do so effectively and specifically.',
        'pains'              => array(
            array( 'title' => 'Out of sight, out of mind', 'body' => 'A referral source who has not heard from you in six months is significantly less likely to think of you when a relevant opportunity arises. Presence is maintained by consistent, valuable communication.' ),
            array( 'title' => 'Referrers do not know how to describe what you do', 'body' => 'Even clients who trust you completely often struggle to describe what you do to someone who might benefit from it. Content gives them the language and the evidence to make a warm, specific recommendation.' ),
            array( 'title' => 'Trust erodes between engagements without reinforcement', 'body' => 'Trust built during an engagement fades if there is no communication between matters. Clients who were highly satisfied two years ago may now be uncertain whether you are still the right choice for a new need.' ),
        ),
        'approach_body'      => 'We produce content specifically designed to keep you present and credible with the people most likely to refer you — existing clients, former clients, and professional contacts in adjacent fields. Content that reinforces your expertise, demonstrates your approach, and gives people who want to recommend you something specific and credible to share.',
        'steps'              => array(
            array( 'num' => '01', 'title' => 'Referral source and audience mapping', 'body' => 'We identify the specific people and communities that send you your best work — existing clients, professional contacts, trade associations — and design content to stay relevant to each group.' ),
            array( 'num' => '02', 'title' => 'Client relationship content', 'body' => 'Regular content designed for your existing client base — updates, insights, and educational pieces that keep you valuable and present between engagements.' ),
            array( 'num' => '03', 'title' => 'Shareable expertise pieces', 'body' => 'Guides, opinion pieces, and commentary that your referral sources can share with confidence — content that does the recommendation work for them by demonstrating your expertise clearly and credibly.' ),
            array( 'num' => '04', 'title' => 'Milestone and relationship touchpoints', 'body' => 'Content and communications for meaningful moments — anniversary of an engagement, a relevant regulatory development affecting a specific client, recognition of a client milestone — that signal genuine relationship investment.' ),
        ),
        'deliverables_intro' => 'A consistent programme of content and communications designed to nurture referral relationships and reinforce trust with existing clients.',
        'deliverables'       => array(
            array( 'name' => 'Monthly client newsletter', 'detail' => 'A regular, substantive newsletter to your client and contact list — keeping you present and valuable to the people most likely to refer you.' ),
            array( 'name' => 'Shareable expertise pieces', 'detail' => '2–3 pieces per month designed to be forwarded — guides, opinion pieces, and commentary that your referral sources can share as a recommendation by proxy.' ),
            array( 'name' => 'LinkedIn content for referral sources', 'detail' => 'Regular LinkedIn posts and articles that reach your professional network — the accountants, bankers, and fellow advisors who refer clients in your direction.' ),
            array( 'name' => 'Relationship touchpoint communications', 'detail' => 'Templated but personalised communications for key relationship moments — thoughtful, professional, and designed to strengthen the connection rather than feel like a mailshot.' ),
        ),
        'cadence'            => 'Newsletter monthly. Shareable content 2–3 times per month. LinkedIn posts weekly. Relationship touchpoints as occasions arise. All included in your retainer.',
        'fit_statements'     => array(
            'You are a professional services firm that relies significantly on referrals and wants to be more systematic about nurturing the relationships that produce them.',
            'You have a strong client base that trusts you and you want to maintain and deepen that trust between engagements rather than only being present when there is active work.',
            'You want to make it easier for people who respect your work to recommend you — by giving them something specific, credible, and shareable to pass on.',
        ),
        'not_fit'            => 'Referral content works best when you already have a strong existing client base and an active professional network. If you are in the early stages of building those relationships, the client education and LinkedIn authority use cases may be a more appropriate starting point.',
        'related'            => array(
            array( 'title' => 'Client education content', 'url' => '/industries/professional-services/client-education', 'desc' => 'Education content and referral content overlap significantly — both are designed to be valuable to existing clients and shareable with their networks.' ),
            array( 'title' => 'Expert commentary & opinion', 'url' => '/industries/professional-services/expert-commentary', 'desc' => 'Published commentary is some of the most credible content a referral source can share — it demonstrates your active engagement with your field.' ),
            array( 'title' => 'LinkedIn authority programme', 'url' => '/industries/professional-services/linkedin-authority', 'desc' => 'LinkedIn is where many professional referral relationships are maintained and strengthened — a consistent LinkedIn presence reinforces your referral network.' ),
        ),
        'cta_heading'        => 'The people who should be sending you work are waiting to be reminded you exist.',
        'cta_sub'            => 'Book a 15-minute Discovery Call to talk through your referral relationships and what a systematic trust content programme would look like for your practice.',
    ),
    'linkedin-authority' => array(
        'hero_tag'           => 'Use case — Professional services',
        'hero_headline'      => 'LinkedIn is where your next client is deciding who to hire. Are you showing up?',
        'hero_sub'           => 'For professional services professionals, LinkedIn is not optional — it is where decision-makers and referral sources spend time evaluating expertise, building impressions, and making decisions about who to trust with serious work. A consistent, credible LinkedIn presence is one of the highest-ROI business development investments a partner or principal can make. Bluu builds and runs it.',
        'situation_body'     => 'Your LinkedIn profile exists. You connect with people after meetings and occasionally like posts from people in your network. But you are not publishing — not consistently enough to build the association between your name and your area of expertise that creates top-of-mind awareness when mandates arise. Your profile is a digital business card in a world where your competitors are using theirs as a business development engine.',
        'pains'              => array(
            array( 'title' => 'Profiles without content build no authority', 'body' => 'A LinkedIn profile with no regular publishing is a static page. It tells people who you are but nothing about how you think — and thinking is what professional services clients are actually buying.' ),
            array( 'title' => 'Sporadic posting creates no compound effect', 'body' => 'Posting a few times and then going quiet for months builds nothing. Authority on LinkedIn is built through consistent presence over time — the algorithm rewards regularity and so do readers.' ),
            array( 'title' => 'Not knowing what to say', 'body' => 'The blank page problem is particularly acute on LinkedIn where the professional context creates pressure to say something worthy of your position. Without a content framework, most people post nothing rather than risk posting something that misses.' ),
        ),
        'approach_body'      => 'We build a structured LinkedIn publishing programme for you — starting with understanding your expertise, your network, and the impression you want to create. Then we produce a consistent stream of content in your voice — commentary, opinion, client education, and professional insight — published on a regular schedule that builds your authority over time.',
        'steps'              => array(
            array( 'num' => '01', 'title' => 'LinkedIn audit and strategy', 'body' => 'We review your current LinkedIn profile and presence, understand your target audience and goals, and build a content strategy tailored to your specific expertise and the clients you want to attract.' ),
            array( 'num' => '02', 'title' => 'Monthly content plan', 'body' => 'Each month we plan a set of posts and articles covering your key topics — a mix of timely commentary, professional opinion, client-facing education, and genuine personal perspective — shared with you before writing begins.' ),
            array( 'num' => '03', 'title' => 'Content written in your voice', 'body' => 'Every post is written to sound like you — your language, your level of formality, your opinions. You review and approve each piece before it goes live.' ),
            array( 'num' => '04', 'title' => 'Published on a consistent schedule', 'body' => 'Posts published 3–4 times per week, articles once or twice a month — on a consistent schedule that the algorithm rewards and your network comes to expect.' ),
        ),
        'deliverables_intro' => 'A consistent, professionally managed LinkedIn presence that builds your authority and visibility with the people who hire and refer professional services firms.',
        'deliverables'       => array(
            array( 'name' => '12–16 LinkedIn posts per month', 'detail' => 'A consistent stream of posts — a mix of professional opinion, market commentary, client education, and genuine personal perspective — published 3–4 times per week.' ),
            array( 'name' => '1–2 LinkedIn articles per month', 'detail' => 'Longer-form pieces published natively on LinkedIn — substantive enough to demonstrate depth and worth sharing with your network and clients.' ),
            array( 'name' => 'Monthly content calendar', 'detail' => 'A planned month of topics shared at the start of each month — giving you visibility and input before anything is written.' ),
            array( 'name' => 'Monthly performance review', 'detail' => 'What posts performed, what topics drove the most engagement, and what to double down on in the coming month — with specific recommendations based on your audience\'s behaviour.' ),
        ),
        'cadence'            => 'Posts published 3–4 times per week. Articles once or twice per month. Monthly performance review at the end of each month. All included in your retainer.',
        'fit_statements'     => array(
            'You are a partner, principal, senior advisor, or specialist in your field with genuine expertise worth sharing — and you understand that LinkedIn is where your target audience spends professional time.',
            'You want to build a visible, authoritative presence on LinkedIn but have not been able to post consistently due to the time and effort it requires.',
            'You are comfortable with a review process — you want to stay in control of what goes out under your name without doing the writing yourself.',
            'You are playing a long game — you understand that LinkedIn authority is built over months and years, not weeks, and you are ready to invest in that consistently.',
        ),
        'not_fit'            => 'The LinkedIn authority programme requires a minimum of one monthly conversation to capture your perspective and ensure the content stays authentically yours. Without that input, the posts become generic — and generic professional services content on LinkedIn is visible only in how quickly it gets scrolled past.',
        'related'            => array(
            array( 'title' => 'Expert commentary & opinion', 'url' => '/industries/professional-services/expert-commentary', 'desc' => 'Expert commentary is the core content type for a LinkedIn authority programme — the two use cases are natural partners.' ),
            array( 'title' => 'Client education content', 'url' => '/industries/professional-services/client-education', 'desc' => 'Educational content distributed through LinkedIn reaches prospects who are not yet on your email list or in your direct network.' ),
            array( 'title' => 'Referral & trust content', 'url' => '/industries/professional-services/referral-trust-content', 'desc' => 'A consistent LinkedIn presence reinforces trust with your existing network and gives referral sources something credible to share and reference.' ),
        ),
        'cta_heading'        => 'Your next client is already on LinkedIn. They just have not found you yet.',
        'cta_sub'            => 'Book a 15-minute Discovery Call to talk through your LinkedIn goals and what a structured authority programme would look like for your practice and expertise.',
    ),
);

// Resolve slug to content
$d = isset( $uc_content[ $current_slug ] ) ? $uc_content[ $current_slug ] : reset( $uc_content );

// Hero
$hero_tag  = ( $gf ? get_field( 'uc_hero_tag' )         : '' ) ?: ( $d['hero_tag'] ?? '' );
$hero_hl   = ( $gf ? get_field( 'uc_hero_headline' )    : '' ) ?: ( $d['hero_headline'] ?? '' );
$hero_sub  = ( $gf ? get_field( 'uc_hero_subheadline' ) : '' ) ?: ( $d['hero_sub'] ?? '' );
$hero_cta  = ( $gf ? get_field( 'uc_hero_cta_label' )   : '' ) ?: 'Book a Discovery Call';
$hero_url  = ( $gf ? get_field( 'uc_hero_cta_url' )     : '' ) ?: home_url( '/contact' );
$hero_img  = $gf ? get_field( 'uc_hero_image' ) : null;
if ( ! empty( $hero_img ) ) {
    $hero_img_src = is_array( $hero_img ) ? esc_url( $hero_img['url'] ) : esc_url( $hero_img );
    $hero_img_alt = is_array( $hero_img ) ? esc_attr( $hero_img['alt'] ) : '';
} else {
    $hero_img_src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80';
    $hero_img_alt = 'Analytics and strategy';
}

// Situation / pain
$situation_body = ( $gf ? get_field( 'uc_situation_body' ) : '' ) ?: ( $d['situation_body'] ?? '' );
$pains = array();
for ( $i = 1; $i <= 3; $i++ ) {
    $t = ( $gf ? get_field( "uc_pain_title_$i" ) : '' );
    $b = ( $gf ? get_field( "uc_pain_body_$i" )  : '' );
    if ( $t || $b ) $pains[] = array( 'title' => $t, 'body' => $b );
}
if ( empty( $pains ) ) $pains = $d['pains'] ?? array();

// Approach
$approach_body = ( $gf ? get_field( 'uc_approach_body' ) : '' ) ?: ( $d['approach_body'] ?? '' );
$steps = array();
for ( $i = 1; $i <= 4; $i++ ) {
    $n = ( $gf ? get_field( "uc_step_number_$i" ) : '' );
    $t = ( $gf ? get_field( "uc_step_title_$i" )  : '' );
    $b = ( $gf ? get_field( "uc_step_body_$i" )   : '' );
    if ( $t || $b ) $steps[] = array( 'num' => $n ?: $i, 'title' => $t, 'body' => $b );
}
if ( empty( $steps ) ) $steps = $d['steps'] ?? array();

// Deliverables
$deliverables_intro = ( $gf ? get_field( 'uc_deliverables_intro' ) : '' ) ?: ( $d['deliverables_intro'] ?? '' );
$deliverables = ( $gf ? get_field( 'uc_deliverables' ) : array() ) ?: ( $d['deliverables'] ?? array() );
$cadence = ( $gf ? get_field( 'uc_cadence' ) : '' ) ?: ( $d['cadence'] ?? '' );

// Who it's for
$fit_statements = array();
for ( $i = 1; $i <= 4; $i++ ) {
    $s = ( $gf ? get_field( "uc_fit_statement_$i" ) : '' );
    if ( $s ) $fit_statements[] = $s;
}
if ( empty( $fit_statements ) ) $fit_statements = $d['fit_statements'] ?? array();
$not_fit = ( $gf ? get_field( 'uc_not_fit_note' ) : '' ) ?: ( $d['not_fit'] ?? '' );

// Related
$related_raw = ( $gf ? get_field( 'uc_related' ) : array() ) ?: array();
$related = array();
if ( ! empty( $related_raw ) ) {
    foreach ( $related_raw as $r ) {
        $related[] = array( 'title' => $r['uc_related_title'] ?? '', 'url' => $r['uc_related_url'] ?? '', 'desc' => $r['uc_related_description'] ?? '' );
    }
}
if ( empty( $related ) ) $related = $d['related'] ?? array();

// CTA
$cta_heading = ( $gf ? get_field( 'uc_cta_heading' )       : '' ) ?: ( $d['cta_heading'] ?? 'Ready to get started?' );
$cta_sub     = ( $gf ? get_field( 'uc_cta_subtext' )        : '' ) ?: ( $d['cta_sub'] ?? '' );
$cta_p_label = ( $gf ? get_field( 'uc_cta_primary_label' )  : '' ) ?: 'Book a Discovery Call';
$cta_p_url   = ( $gf ? get_field( 'uc_cta_primary_url' )    : '' ) ?: home_url( '/contact' );
$cta_s_label = ( $gf ? get_field( 'uc_cta_secondary_label' ): '' ) ?: 'See pricing';
$cta_s_url   = ( $gf ? get_field( 'uc_cta_secondary_url' )  : '' ) ?: home_url( '/pricing' );

get_header();
?>

<!-- ── Hero ─────────────────────────────────────────────────────────────────── -->
<section class="industry-pg-hero" aria-label="<?php esc_attr_e( 'Use case hero', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="industry-pg-hero__inner">
            <div class="industry-pg-hero__content animate-on-scroll">
                <div class="industry-pg-hero__tag"><?php echo esc_html( $hero_tag ); ?></div>
                <h1 class="industry-pg-hero__headline"><?php echo esc_html( $hero_hl ); ?></h1>
                <p class="industry-pg-hero__sub"><?php echo esc_html( $hero_sub ); ?></p>
                <div class="industry-pg-hero__cta">
                    <a href="<?php echo esc_url( $hero_url ); ?>" class="btn-primary btn-primary--large">
                        <?php echo esc_html( $hero_cta ); ?>
                    </a>
                    <a href="<?php echo esc_url( home_url( '/pricing' ) ); ?>" class="industry-btn-outline--cta">
                        <?php esc_html_e( 'See pricing', 'bluu-interactive' ); ?>
                    </a>
                </div>
            </div>
            <div class="industry-pg-hero__image">
                <img src="<?php echo ; ?>" alt="<?php echo ; ?>" loading="eager" decoding="async">
            </div>
        </div>
    </div>
</section>

<!-- ── Situation ────────────────────────────────────────────────────────────── -->
<section class="industry-situation" aria-label="<?php esc_attr_e( 'The situation', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="industry-situation__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'The situation', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php esc_html_e( 'The situation', 'bluu-interactive' ); ?></h2>
            <?php if ( $situation_body ) : ?>
                <p class="industry-section-body"><?php echo esc_html( $situation_body ); ?></p>
            <?php endif; ?>
        </div>
        <?php if ( ! empty( $pains ) ) : ?>
        <div class="industry-pain-grid">
            <?php foreach ( $pains as $pain ) : ?>
                <div class="industry-pain-card animate-on-scroll">
                    <h3 class="industry-pain-card__title"><?php echo esc_html( $pain['title'] ); ?></h3>
                    <p class="industry-pain-card__body"><?php echo esc_html( $pain['body'] ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
    </div>
</section>

<!-- ── Approach ─────────────────────────────────────────────────────────────── -->
<section class="industry-approach" aria-label="<?php esc_attr_e( 'How we approach this', 'bluu-interactive' ); ?>">
    <div class="container">
        <div style="max-width:800px;margin:0 auto" class="animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'Our approach', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php esc_html_e( 'How Bluu approaches this', 'bluu-interactive' ); ?></h2>
            <?php if ( $approach_body ) : ?>
                <p class="industry-section-body" style="margin-bottom:var(--space-8)"><?php echo esc_html( $approach_body ); ?></p>
            <?php endif; ?>
        </div>
        <?php if ( ! empty( $steps ) ) : ?>
        <div class="industry-steps" style="max-width:800px;margin:0 auto">
            <?php foreach ( $steps as $step ) : ?>
                <div class="industry-step animate-on-scroll">
                    <div class="industry-step__num"><?php echo esc_html( $step['num'] ); ?></div>
                    <div>
                        <div class="industry-step__title"><?php echo esc_html( $step['title'] ); ?></div>
                        <p class="industry-step__body"><?php echo esc_html( $step['body'] ); ?></p>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
    </div>
</section>

<!-- ── Deliverables ──────────────────────────────────────────────────────────── -->
<section class="uc-deliverables" aria-label="<?php esc_attr_e( 'What you get', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="uc-deliverables__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'What you receive', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php esc_html_e( 'What you get', 'bluu-interactive' ); ?></h2>
            <?php if ( $deliverables_intro ) : ?>
                <p class="industry-section-body"><?php echo esc_html( $deliverables_intro ); ?></p>
            <?php endif; ?>
        </div>
        <?php if ( ! empty( $deliverables ) ) : ?>
        <div class="uc-deliverables__grid">
            <?php foreach ( $deliverables as $item ) :
                $name   = isset( $item['uc_deliverable_name'] )   ? $item['uc_deliverable_name']   : ( $item['name'] ?? '' );
                $detail = isset( $item['uc_deliverable_detail'] ) ? $item['uc_deliverable_detail'] : ( $item['detail'] ?? '' );
            ?>
                <div class="uc-deliverable-card animate-on-scroll">
                    <div class="uc-deliverable-card__name"><?php echo esc_html( $name ); ?></div>
                    <p class="uc-deliverable-card__detail"><?php echo esc_html( $detail ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>
        <?php if ( $cadence ) : ?>
        <p class="uc-cadence animate-on-scroll"><?php echo esc_html( $cadence ); ?></p>
        <?php endif; ?>
    </div>
</section>

<!-- ── Who it's for ──────────────────────────────────────────────────────────── -->
<section class="industry-fit" aria-label="<?php esc_attr_e( 'Who this is for', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="industry-fit__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'Right fit', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php esc_html_e( 'Who this is right for', 'bluu-interactive' ); ?></h2>
        </div>
        <div class="industry-fit__grid">
            <?php foreach ( $fit_statements as $stmt ) : ?>
                <div class="industry-fit-item animate-on-scroll">
                    <svg class="industry-fit-item__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                    <p class="industry-fit-item__text"><?php echo esc_html( $stmt ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
        <?php if ( $not_fit ) : ?>
        <p class="industry-fit__not-fit"><?php echo esc_html( $not_fit ); ?></p>
        <?php endif; ?>
    </div>
</section>

<!-- ── Related Use Cases ────────────────────────────────────────────────────── -->
<?php if ( ! empty( $related ) ) : ?>
<section class="industry-related" aria-label="<?php esc_attr_e( 'Related use cases', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="industry-related__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'Keep exploring', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php esc_html_e( 'Related use cases', 'bluu-interactive' ); ?></h2>
        </div>
        <div class="industry-related__grid">
            <?php foreach ( $related as $rel ) : ?>
                <a href="<?php echo esc_url( home_url( $rel['url'] ) ); ?>" class="industry-related-card animate-on-scroll">
                    <div class="industry-related-card__title"><?php echo esc_html( $rel['title'] ); ?></div>
                    <p class="industry-related-card__desc"><?php echo esc_html( $rel['desc'] ); ?></p>
                    <span class="industry-related-card__arrow"><?php esc_html_e( 'See this use case', 'bluu-interactive' ); ?> &rarr;</span>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- ── CTA ───────────────────────────────────────────────────────────────────── -->
<section class="industry-pg-cta" aria-label="<?php esc_attr_e( 'Call to action', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="animate-on-scroll">
            <h2 class="industry-pg-cta__headline"><?php echo esc_html( $cta_heading ); ?></h2>
            <p class="industry-pg-cta__sub"><?php echo esc_html( $cta_sub ); ?></p>
            <div class="industry-pg-cta__buttons">
                <a href="<?php echo esc_url( $cta_p_url ); ?>" class="btn-primary btn-primary--large btn-primary--white">
                    <?php echo esc_html( $cta_p_label ); ?>
                </a>
                <a href="<?php echo esc_url( $cta_s_url ); ?>" class="industry-btn-outline--cta">
                    <?php echo esc_html( $cta_s_label ); ?>
                </a>
            </div>
            <p style="margin-top:var(--space-5);font-size:var(--font-size-sm);color:rgba(255,255,255,0.6);">
                <?php esc_html_e( 'Free 15-minute call. No commitment required.', 'bluu-interactive' ); ?>
            </p>
        </div>
    </div>
</section>

<?php get_footer(); ?>
