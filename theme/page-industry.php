<?php
/**
 * Template Name: Industry Page
 * Template Post Type: page
 *
 * @package bluu-interactive
 */

$gf = function_exists( 'get_field' );

// Slug-based content fallback for all 4 industry pages
$current_slug = get_post_field( 'post_name', get_the_ID() );

$ind_content = array(

    'tech-saas' => array(
        'hero_tag'          => 'Industry — Tech & SaaS startups',
        'hero_headline'     => 'You are building the product. We run the content.',
        'hero_sub'          => 'SaaS founders are pulled in every direction. Content is always the thing that gets pushed to next week — and next week never comes. Bluu becomes your content team: research, writing, publishing, and results tracking handled every month without you having to manage it.',
        'pain_heading'      => 'The content problem every SaaS founder recognises',
        'pain_points'       => array(
            array( 'title' => 'No competitor visibility',   'body' => 'By the time you notice a competitor\'s new positioning or campaign, they have had weeks of impact. Reactive awareness is not a competitive advantage.' ),
            array( 'title' => 'Inconsistent publishing',    'body' => 'Posts go up when someone has time. Months pass between pieces. The compounding effect of consistent content never kicks in because there is no consistent engine behind it.' ),
            array( 'title' => 'Founder brand invisible',    'body' => 'Your name and perspective should be building trust with your target market every week. Instead you are writing product documentation and replying to investor updates.' ),
        ),
        'sol_heading'       => 'What the retainer covers for SaaS teams',
        'sol_items'         => array(
            array( 'title' => 'Weekly competitor intelligence',    'body' => 'A structured weekly digest monitoring your top competitors — content output, messaging shifts, new feature announcements, and positioning changes. Delivered every Monday.' ),
            array( 'title' => 'Founder brand content',             'body' => 'Consistent LinkedIn content written in your voice — opinion, market commentary, product perspective, and lessons learned. Published on your schedule.' ),
            array( 'title' => 'Long-form content and repurposing', 'body' => 'Blog posts, LinkedIn articles, and newsletter content — each piece repurposed across every channel so your best thinking reaches the widest possible audience.' ),
            array( 'title' => 'Product launch content packages',   'body' => 'A complete content package for every significant launch or feature release — blog post, email, LinkedIn posts, X thread, and social captions — ready before the launch date.' ),
            array( 'title' => 'Monthly performance reporting',     'body' => 'A clean monthly report covering what content performed, what drove engagement, and what changes in the month ahead. No vanity metrics — just what is working.' ),
        ),
        'who_heading'       => 'Who this is right for',
        'who_items'         => array(
            'You are a seed to Series B SaaS company with between 2 and 30 people and no dedicated content resource.',
            'You are shipping product in a competitive category where positioning and content visibility genuinely influence purchase decisions.',
            'You want content that is informed by real market intelligence — not just blog posts written in a vacuum.',
            'You have tried to manage content yourself or with a freelancer and it has been inconsistent. You want a system, not another supplier to chase.',
        ),
        'uc_heading'        => 'Use cases for Tech & SaaS startups',
        'use_cases'         => array(
            array( 'ind_uc_title' => 'Competitor intelligence',    'ind_uc_description' => 'Weekly monitoring of competitor content, messaging, and positioning so you are never caught off guard by a move in your market.',    'ind_uc_url' => '/industries/tech-saas/competitor-intelligence', 'ind_uc_cta' => 'See this use case' ),
            array( 'ind_uc_title' => 'Founder brand building',     'ind_uc_description' => 'Consistent LinkedIn and thought leadership content published in your voice — building trust and authority with your target market every week.',      'ind_uc_url' => '/industries/tech-saas/founder-brand',           'ind_uc_cta' => 'See this use case' ),
            array( 'ind_uc_title' => 'Content repurposing engine', 'ind_uc_description' => 'Every long-form piece turned into a full suite of channel-specific assets — so your best thinking reaches your audience on every platform they use.', 'ind_uc_url' => '/industries/tech-saas/content-repurposing',     'ind_uc_cta' => 'See this use case' ),
            array( 'ind_uc_title' => 'Product launch content',     'ind_uc_description' => 'A complete content package for every product launch or feature release — so every update reaches the people who need to hear about it, across every channel.', 'ind_uc_url' => '/industries/tech-saas/product-launch-content', 'ind_uc_cta' => 'See this use case' ),
        ),
        'pricing_heading'   => 'One flat monthly retainer. No surprises.',
        'pricing_body'      => 'Bluu retainers for SaaS startups start at $1,500 per month and scale to $3,500 depending on the volume of content, number of platforms, and depth of intelligence coverage you need. No project fees. No hourly billing. Everything in one predictable monthly number.',
        'cta_heading'       => 'Stop putting content off until next sprint.',
        'cta_sub'           => 'Book a 15-minute Discovery Call. We will tell you honestly whether Bluu makes sense for your stage, your team size, and your goals. No pitch, no pressure.',
        'cta_p_label'       => 'Book a Discovery Call',
        'cta_s_label'       => 'See pricing',
        'sub_industries'    => array(
            array( 'name' => 'Seed to Series A',         'url' => '/industries/tech-saas/seed-series-a' ),
            array( 'name' => 'B2B SaaS growth teams',    'url' => '/industries/tech-saas/b2b-saas-growth' ),
            array( 'name' => 'No-code & AI startups',    'url' => '/industries/tech-saas/no-code-ai-startups' ),
            array( 'name' => 'Developer tools',          'url' => '/industries/tech-saas/developer-tools' ),
        ),
    ),

    'agencies-consultants' => array(
        'hero_tag'          => 'Industry — Agencies & Consultants',
        'hero_headline'     => 'You run client work. Content should not be what falls through the cracks.',
        'hero_sub'          => 'Agencies and consultancies live on referrals and reputation — but the work that builds that reputation never gets done because client delivery always comes first. Bluu runs your content operation so your name and thinking are visible in the market every single month.',
        'pain_heading'      => 'The visibility problem every agency principal knows',
        'pain_points'       => array(
            array( 'title' => 'Feast-or-famine new business',  'body' => 'Pipeline dries up when your team is fully booked and you have no time to market. By the time you surface for air, it takes months to rebuild momentum you should never have lost.' ),
            array( 'title' => 'Expertise locked inside the firm', 'body' => 'Your team has deep, hard-won expertise. None of it is visible to the market. The thinking that wins you clients lives in decks and proposals, not in content that compounds over time.' ),
            array( 'title' => 'Undifferentiated positioning',  'body' => 'Most agencies look the same online. Without a consistent content presence that demonstrates your specific point of view, buyers default to whoever they have heard of most recently.' ),
        ),
        'sol_heading'       => 'What the retainer covers for agencies and consultancies',
        'sol_items'         => array(
            array( 'title' => 'Thought leadership content',       'body' => 'Original articles, LinkedIn posts, and newsletters written around your methodology and market perspective — positioning you as the definitive voice in your category.' ),
            array( 'title' => 'Case study and proof writing',     'body' => 'Your client outcomes turned into compelling stories that demonstrate the transformation you deliver. Structured for your website, proposals, and outreach sequences.' ),
            array( 'title' => 'Principal and team brand content', 'body' => 'Consistent personal brand content for your key people — building individual authority that translates directly into firm reputation and inbound enquiries.' ),
            array( 'title' => 'Content repurposing across channels', 'body' => 'Every insight, talk, or article repurposed into a full suite of channel-specific assets — LinkedIn, email, video scripts, and social — so nothing valuable gets wasted.' ),
            array( 'title' => 'Monthly performance reporting',    'body' => 'A clear monthly report on what content performed, what drove engagement, and what the plan is for the month ahead. No vanity metrics — just signal.' ),
        ),
        'who_heading'       => 'Who this is right for',
        'who_items'         => array(
            'You run a boutique agency or consultancy with 2 to 40 people and no dedicated marketing or content resource.',
            'You rely heavily on referrals and want to build an inbound channel that does not depend on your personal network alone.',
            'You have a clear point of view and methodology but it is not consistently visible in the market.',
            'You have tried to create content yourself or delegate it internally and it keeps falling down the priority list.',
        ),
        'uc_heading'        => 'Use cases for agencies and consultancies',
        'use_cases'         => array(
            array( 'ind_uc_title' => 'Thought leadership programme', 'ind_uc_description' => 'A consistent stream of opinion, insight, and methodology content that builds category authority and keeps your firm front of mind with ideal buyers.', 'ind_uc_url' => '/industries/agencies-consultants/thought-leadership', 'ind_uc_cta' => 'See this use case' ),
            array( 'ind_uc_title' => 'Case study development',       'ind_uc_description' => 'Client success stories structured and written to demonstrate the outcomes you deliver — ready for your website, proposals, and sales conversations.',         'ind_uc_url' => '/industries/agencies-consultants/case-studies',       'ind_uc_cta' => 'See this use case' ),
            array( 'ind_uc_title' => 'Principal brand building',     'ind_uc_description' => 'Ongoing LinkedIn and newsletter content for your principals — building personal authority that directly feeds firm reputation and new business pipeline.',     'ind_uc_url' => '/industries/agencies-consultants/principal-brand',    'ind_uc_cta' => 'See this use case' ),
            array( 'ind_uc_title' => 'New business content engine',  'ind_uc_description' => 'A structured content system that supports your entire business development process — from awareness to nurture — without relying on outbound alone.',        'ind_uc_url' => '/industries/agencies-consultants/new-business',       'ind_uc_cta' => 'See this use case' ),
        ),
        'pricing_heading'   => 'One flat monthly retainer. No surprises.',
        'pricing_body'      => 'Bluu retainers for agencies and consultancies start at $1,500 per month and scale based on the volume of content, number of principals, and channels covered. No project fees. No hourly billing. Everything in one predictable monthly number.',
        'cta_heading'       => 'Your expertise deserves to be visible.',
        'cta_sub'           => 'Book a 15-minute Discovery Call. We will tell you honestly whether Bluu is the right fit for your firm, your stage, and your goals. No pitch, no pressure.',
        'cta_p_label'       => 'Book a Discovery Call',
        'cta_s_label'       => 'See pricing',
        'sub_industries'    => array(
            array( 'name' => 'Marketing consultants',       'url' => '/industries/agencies-consultants/marketing-consultants' ),
            array( 'name' => 'Branding & design studios',  'url' => '/industries/agencies-consultants/branding-design-studios' ),
            array( 'name' => 'PR & communications',        'url' => '/industries/agencies-consultants/pr-communications' ),
            array( 'name' => 'Strategy consultants',       'url' => '/industries/agencies-consultants/strategy-consultants' ),
            array( 'name' => 'Recruitment consultants',    'url' => '/industries/agencies-consultants/recruitment-consultants' ),
            array( 'name' => 'Business coaches',           'url' => '/industries/agencies-consultants/business-coaches' ),
            array( 'name' => 'Paid media agencies',        'url' => '/industries/agencies-consultants/paid-media-agencies' ),
            array( 'name' => 'Full-service agencies',      'url' => '/industries/agencies-consultants/full-service-agencies' ),
        ),
    ),

    'ecommerce-dtc' => array(
        'hero_tag'          => 'Industry — E-commerce & DTC Brands',
        'hero_headline'     => 'Acquisition costs keep rising. Content is the one channel that compounds.',
        'hero_sub'          => 'DTC brands built entirely on paid media are one algorithm update away from a crisis. Bluu builds the content engine that reduces your dependence on paid, deepens customer loyalty, and gives your brand a consistent voice across every channel — every month.',
        'pain_heading'      => 'The growth problem every DTC founder recognises',
        'pain_points'       => array(
            array( 'title' => 'Over-reliance on paid acquisition', 'body' => 'ROAS is falling and CAC is rising. Every brand in your category is bidding on the same keywords and audiences. Content is the one channel that builds compounding value over time.' ),
            array( 'title' => 'No real brand story',               'body' => 'Your product is good but your content looks like everyone else\'s. Without a consistent brand voice and editorial point of view, you are competing on price and discount.' ),
            array( 'title' => 'Low retention and repeat purchase', 'body' => 'First purchase is expensive. Second purchase is profit. Content — email, social, and editorial — is the infrastructure that turns one-time buyers into loyal customers.' ),
        ),
        'sol_heading'       => 'What the retainer covers for e-commerce brands',
        'sol_items'         => array(
            array( 'title' => 'Brand editorial and blog content',  'body' => 'Consistent long-form content that tells your brand story, educates your audience, and builds organic traffic. Written to rank, written to convert.' ),
            array( 'title' => 'Email and retention content',       'body' => 'Ongoing email content — welcome flows, post-purchase sequences, newsletters, and promotional copy — that keeps your customers engaged between purchases.' ),
            array( 'title' => 'Social and short-form content',     'body' => 'A monthly suite of social captions, short-form ideas, and channel-specific assets built around your brand voice and content calendar.' ),
            array( 'title' => 'Product launch content packages',   'body' => 'Everything you need to launch a new product or collection — email, blog, social captions, and paid ad copy — delivered before your go-live date.' ),
            array( 'title' => 'Monthly performance reporting',     'body' => 'Clear monthly reporting on what content performed, what drove revenue, and what the content plan is for the month ahead.' ),
        ),
        'who_heading'       => 'Who this is right for',
        'who_items'         => array(
            'You are a DTC or e-commerce brand doing between $500k and $10M in annual revenue with no dedicated content resource.',
            'You are spending heavily on paid media and want to build a content channel that compounds without a rising cost per click.',
            'You have a strong product and a clear customer but your brand voice is inconsistent or underdeveloped across channels.',
            'You want email, social, and editorial content that genuinely drives repeat purchase — not just brand awareness for its own sake.',
        ),
        'uc_heading'        => 'Use cases for e-commerce and DTC brands',
        'use_cases'         => array(
            array( 'ind_uc_title' => 'Brand editorial programme',  'ind_uc_description' => 'A consistent blog and editorial presence that builds organic traffic, tells your brand story, and supports conversion across the purchase journey.', 'ind_uc_url' => '/industries/ecommerce/brand-editorial',       'ind_uc_cta' => 'See this use case' ),
            array( 'ind_uc_title' => 'Email retention content',    'ind_uc_description' => 'Ongoing email sequences and newsletter content that keeps your customers engaged, builds loyalty, and drives repeat purchase revenue.',             'ind_uc_url' => '/industries/ecommerce/email-retention',       'ind_uc_cta' => 'See this use case' ),
            array( 'ind_uc_title' => 'Product launch packages',    'ind_uc_description' => 'A complete suite of content for every product launch — email, blog, social, and ad copy — so every new release gets the attention it deserves.',      'ind_uc_url' => '/industries/ecommerce/product-launch',        'ind_uc_cta' => 'See this use case' ),
            array( 'ind_uc_title' => 'Social content engine',      'ind_uc_description' => 'A monthly bank of on-brand social captions and short-form content ideas planned around your calendar and built in your brand voice.',                 'ind_uc_url' => '/industries/ecommerce/social-content',        'ind_uc_cta' => 'See this use case' ),
        ),
        'pricing_heading'   => 'One flat monthly retainer. No surprises.',
        'pricing_body'      => 'Bluu retainers for e-commerce brands start at $1,500 per month and scale based on the volume of content, number of channels, and depth of coverage required. No project fees. No hourly billing. Everything in one predictable monthly number.',
        'cta_heading'       => 'Build the content channel that does not stop working.',
        'cta_sub'           => 'Book a 15-minute Discovery Call. We will tell you honestly whether Bluu is the right fit for your brand, your stage, and your goals. No pitch, no pressure.',
        'cta_p_label'       => 'Book a Discovery Call',
        'cta_s_label'       => 'See pricing',
        'sub_industries'    => array(
            array( 'name' => 'Emerging DTC brands',         'url' => '/industries/ecommerce-dtc/emerging-dtc-brands' ),
            array( 'name' => 'Subscription & lifestyle',    'url' => '/industries/ecommerce-dtc/subscription-lifestyle' ),
            array( 'name' => 'Marketplaces & platforms',   'url' => '/industries/ecommerce-dtc/marketplaces-platforms' ),
        ),
    ),

    'professional-services' => array(
        'hero_tag'          => 'Industry — Professional Services',
        'hero_headline'     => 'Your expertise wins clients. Content is how they find it.',
        'hero_sub'          => 'Professional services firms win on trust, credibility, and demonstrated expertise. But most firms do not have a consistent content presence that builds that trust before the first conversation. Bluu puts your knowledge into the market every month so qualified buyers find you before you find them.',
        'pain_heading'      => 'The growth problem every professional services firm knows',
        'pain_points'       => array(
            array( 'title' => 'Referral dependency',               'body' => 'Your best clients come from referrals — but referrals are unpredictable and you cannot scale what you cannot control. Content builds an inbound channel that works even when your network is quiet.' ),
            array( 'title' => 'Commoditised category positioning', 'body' => 'Buyers cannot differentiate between you and your competitors on your website alone. Consistent content that demonstrates your specific methodology and point of view changes that.' ),
            array( 'title' => 'Long sales cycles, cold starts',    'body' => 'Professional services decisions take months. Buyers who are not ready today need to be nurtured. Content keeps you visible and credible through the entire decision timeline.' ),
        ),
        'sol_heading'       => 'What the retainer covers for professional services firms',
        'sol_items'         => array(
            array( 'title' => 'Authority and thought leadership content', 'body' => 'Articles, reports, and commentary that demonstrate your expertise and build the case for why your firm is the right choice — published consistently every month.' ),
            array( 'title' => 'Principal and partner brand content',      'body' => 'Personal brand content for your senior team — building individual authority that builds firm reputation and generates inbound conversations with qualified buyers.' ),
            array( 'title' => 'Long-form guides and educational content', 'body' => 'In-depth content that addresses your buyers\' most important questions — positioning you as the trusted expert before the first sales conversation begins.' ),
            array( 'title' => 'Case studies and proof content',           'body' => 'Client outcomes structured as compelling stories that demonstrate the results you deliver — ready for your website, proposals, and outreach.' ),
            array( 'title' => 'Monthly performance reporting',            'body' => 'Clear monthly reporting on what content drove engagement, what built pipeline visibility, and what the plan is for the month ahead.' ),
        ),
        'who_heading'       => 'Who this is right for',
        'who_items'         => array(
            'You run a professional services firm — law, finance, HR, IT, or management consulting — with 2 to 50 people and no marketing team.',
            'You win most of your business through referrals and introductions but want to build an inbound channel that works in parallel.',
            'Your firm has a clear methodology and track record but it is not visible or consistently communicated in the market.',
            'You have tried to produce content internally but it does not happen consistently because client delivery always takes priority.',
        ),
        'uc_heading'        => 'Use cases for professional services firms',
        'use_cases'         => array(
            array( 'ind_uc_title' => 'Authority content programme',     'ind_uc_description' => 'A consistent publishing programme that builds your firm\'s reputation as the definitive voice in your category — creating inbound before you need it.',              'ind_uc_url' => '/industries/professional-services/authority-content',   'ind_uc_cta' => 'See this use case' ),
            array( 'ind_uc_title' => 'Partner brand building',          'ind_uc_description' => 'Consistent personal brand content for your partners and senior team — building individual visibility that translates directly into firm credibility and enquiries.', 'ind_uc_url' => '/industries/professional-services/partner-brand',        'ind_uc_cta' => 'See this use case' ),
            array( 'ind_uc_title' => 'Buyer education content',         'ind_uc_description' => 'Long-form guides, FAQs, and educational content that answers your buyers\' most important questions and positions your firm as the trusted expert.',                 'ind_uc_url' => '/industries/professional-services/buyer-education',      'ind_uc_cta' => 'See this use case' ),
            array( 'ind_uc_title' => 'Case study development',          'ind_uc_description' => 'Client outcomes turned into compelling proof content — structured for your website, proposals, and business development conversations.',                             'ind_uc_url' => '/industries/professional-services/case-studies',         'ind_uc_cta' => 'See this use case' ),
        ),
        'pricing_heading'   => 'One flat monthly retainer. No surprises.',
        'pricing_body'      => 'Bluu retainers for professional services firms start at $1,500 per month and scale based on the volume of content, seniority of principals involved, and depth of subject matter required. No project fees. No hourly billing. Everything in one predictable monthly number.',
        'cta_heading'       => 'Your expertise should be working for you around the clock.',
        'cta_sub'           => 'Book a 15-minute Discovery Call. We will tell you honestly whether Bluu is the right fit for your firm, your goals, and your growth stage. No pitch, no pressure.',
        'cta_p_label'       => 'Book a Discovery Call',
        'cta_s_label'       => 'See pricing',
        'sub_industries'    => array(
            array( 'name' => 'Financial advisors',          'url' => '/industries/professional-services/financial-advisors' ),
            array( 'name' => 'Boutique law firms',          'url' => '/industries/professional-services/boutique-law-firms' ),
            array( 'name' => 'Management consultancies',    'url' => '/industries/professional-services/management-consultancies' ),
        ),
    ),
);

// Resolve slug to content — fall back to tech-saas defaults if slug not found
$d = isset( $ind_content[ $current_slug ] ) ? $ind_content[ $current_slug ] : reset( $ind_content );

// SEO & meta
$seo_title  = ( $gf ? get_field( 'ind_seo_title' )        : '' ) ?: get_the_title();
$seo_desc   = ( $gf ? get_field( 'ind_meta_description' ) : '' ) ?: '';

// Hero
$hero_tag  = ( $gf ? get_field( 'ind_hero_tag' )         : '' ) ?: $d['hero_tag'];
$hero_hl   = ( $gf ? get_field( 'ind_hero_headline' )    : '' ) ?: $d['hero_headline'];
$hero_sub  = ( $gf ? get_field( 'ind_hero_subheadline' ) : '' ) ?: $d['hero_sub'];
$hero_cta  = ( $gf ? get_field( 'ind_hero_cta_label' )   : '' ) ?: 'Book a Discovery Call';
$hero_url  = ( $gf ? get_field( 'ind_hero_cta_url' )     : '' ) ?: home_url( '/contact' );
$hero_img  = $gf ? get_field( 'ind_hero_image' ) : null;
if ( ! empty( $hero_img ) ) {
    $hero_img_src = is_array( $hero_img ) ? esc_url( $hero_img['url'] ) : esc_url( $hero_img );
    $hero_img_alt = is_array( $hero_img ) ? esc_attr( $hero_img['alt'] ) : '';
} else {
    $hero_img_src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';
    $hero_img_alt = 'Team working together';
}

// Pain
$pain_heading = ( $gf ? get_field( 'ind_pain_heading' ) : '' ) ?: $d['pain_heading'];
$pain_body    = ( $gf ? get_field( 'ind_pain_body' )    : '' ) ?: '';
$pain_points  = array();
for ( $i = 1; $i <= 3; $i++ ) {
    $t = ( $gf ? get_field( "ind_pain_point_{$i}_title" ) : '' );
    $b = ( $gf ? get_field( "ind_pain_point_{$i}_body" )  : '' );
    if ( $t || $b ) {
        $pain_points[] = array( 'title' => $t, 'body' => $b );
    }
}
if ( empty( $pain_points ) ) {
    $pain_points = $d['pain_points'];
}

// Solution
$sol_heading = ( $gf ? get_field( 'ind_solution_heading' ) : '' ) ?: $d['sol_heading'];
$sol_body    = ( $gf ? get_field( 'ind_solution_body' )    : '' ) ?: '';
$sol_img     = $gf ? get_field( 'ind_solution_image' ) : null;
if ( ! empty( $sol_img ) ) {
    $sol_img_src = is_array( $sol_img ) ? esc_url( $sol_img['url'] ) : esc_url( $sol_img );
    $sol_img_alt = is_array( $sol_img ) ? esc_attr( $sol_img['alt'] ) : '';
} else {
    $sol_img_src = 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=80';
    $sol_img_alt = 'Team collaborating on content strategy';
}
$sol_items = array();
for ( $i = 1; $i <= 5; $i++ ) {
    $t = ( $gf ? get_field( "ind_solution_item_{$i}_title" ) : '' );
    $b = ( $gf ? get_field( "ind_solution_item_{$i}_body" )  : '' );
    if ( $t || $b ) {
        $sol_items[] = array( 'title' => $t, 'body' => $b );
    }
}
if ( empty( $sol_items ) ) {
    $sol_items = $d['sol_items'];
}

// Who it's for
$who_heading = ( $gf ? get_field( 'ind_who_heading' ) : '' ) ?: $d['who_heading'];
$who_body    = ( $gf ? get_field( 'ind_who_body' )    : '' ) ?: '';
$who_items   = array();
for ( $i = 1; $i <= 4; $i++ ) {
    $s = ( $gf ? get_field( "ind_who_item_{$i}" ) : '' );
    if ( $s ) $who_items[] = $s;
}
if ( empty( $who_items ) ) {
    $who_items = $d['who_items'];
}

// Sub-industries
$sub_industries = isset( $d['sub_industries'] ) ? $d['sub_industries'] : array();

// Use cases
$uc_heading = ( $gf ? get_field( 'ind_usecases_heading' ) : '' ) ?: $d['uc_heading'];
$uc_intro   = ( $gf ? get_field( 'ind_usecases_intro' )   : '' ) ?: '';
$use_cases  = ( $gf ? get_field( 'ind_use_cases' )        : array() ) ?: $d['use_cases'];

// Pricing
$pricing_heading   = ( $gf ? get_field( 'ind_pricing_heading' )   : '' ) ?: $d['pricing_heading'];
$pricing_body      = ( $gf ? get_field( 'ind_pricing_body' )      : '' ) ?: $d['pricing_body'];
$pricing_cta_label = ( $gf ? get_field( 'ind_pricing_cta_label' ) : '' ) ?: 'See full pricing';
$pricing_cta_url   = ( $gf ? get_field( 'ind_pricing_cta_url' )   : '' ) ?: home_url( '/pricing' );

// Closing CTA
$cta_heading = ( $gf ? get_field( 'ind_cta_heading' )         : '' ) ?: $d['cta_heading'];
$cta_sub     = ( $gf ? get_field( 'ind_cta_subtext' )         : '' ) ?: $d['cta_sub'];
$cta_p_label = ( $gf ? get_field( 'ind_cta_primary_label' )   : '' ) ?: $d['cta_p_label'];
$cta_p_url   = ( $gf ? get_field( 'ind_cta_primary_url' )     : '' ) ?: home_url( '/contact' );
$cta_s_label = ( $gf ? get_field( 'ind_cta_secondary_label' ) : '' ) ?: $d['cta_s_label'];
$cta_s_url   = ( $gf ? get_field( 'ind_cta_secondary_url' )   : '' ) ?: home_url( '/pricing' );

get_header();
?>

<!-- ── Hero ──────────────────────────────────────────────────────────────────── -->
<section class="industry-pg-hero" aria-label="<?php esc_attr_e( 'Industry hero', 'bluu-interactive' ); ?>">
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
                <img src="<?php echo $hero_img_src; ?>" alt="<?php echo $hero_img_alt; ?>" loading="eager" decoding="async">
            </div>

        </div>
    </div>
</section>

<!-- ── Pain ──────────────────────────────────────────────────────────────────── -->
<section class="industry-situation" aria-label="<?php esc_attr_e( 'The situation', 'bluu-interactive' ); ?>">
    <div class="container">

        <div class="industry-situation__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'The situation', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php echo esc_html( $pain_heading ); ?></h2>
            <?php if ( $pain_body ) : ?>
                <p class="industry-section-body"><?php echo esc_html( $pain_body ); ?></p>
            <?php endif; ?>
        </div>

        <div class="industry-pain-grid">
            <?php foreach ( $pain_points as $point ) : ?>
                <div class="industry-pain-card animate-on-scroll">
                    <h3 class="industry-pain-card__title"><?php echo esc_html( $point['title'] ); ?></h3>
                    <p class="industry-pain-card__body"><?php echo esc_html( $point['body'] ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>

    </div>
</section>

<!-- ── Solution ──────────────────────────────────────────────────────────────── -->
<section class="industry-approach" aria-label="<?php esc_attr_e( 'What the retainer covers', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="industry-approach__inner">

            <div class="industry-approach__image animate-on-scroll">
                <img src="<?php echo $sol_img_src; ?>" alt="<?php echo $sol_img_alt; ?>" loading="lazy" decoding="async">
            </div>

            <div class="industry-approach__content animate-on-scroll">
                <span class="industry-section-badge"><?php esc_html_e( 'What we do', 'bluu-interactive' ); ?></span>
                <h2 class="industry-section-heading"><?php echo esc_html( $sol_heading ); ?></h2>
                <?php if ( $sol_body ) : ?>
                    <p class="industry-section-body" style="margin-bottom:var(--space-5)"><?php echo esc_html( $sol_body ); ?></p>
                <?php endif; ?>

                <div class="industry-steps">
                    <?php foreach ( $sol_items as $idx => $item ) : ?>
                        <div class="industry-step">
                            <div class="industry-step__num"><?php echo esc_html( $idx + 1 ); ?></div>
                            <div>
                                <div class="industry-step__title"><?php echo esc_html( $item['title'] ); ?></div>
                                <p class="industry-step__body"><?php echo esc_html( $item['body'] ); ?></p>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

        </div>
    </div>
</section>

<!-- ── Who it's for ──────────────────────────────────────────────────────────── -->
<section class="industry-fit" aria-label="<?php esc_attr_e( 'Who this is for', 'bluu-interactive' ); ?>">
    <div class="container">

        <div class="industry-fit__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'Right fit', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php echo esc_html( $who_heading ); ?></h2>
            <?php if ( $who_body ) : ?>
                <p class="industry-section-body" style="color:rgba(255,255,255,0.65)"><?php echo esc_html( $who_body ); ?></p>
            <?php endif; ?>
        </div>

        <div class="industry-fit__grid">
            <?php foreach ( $who_items as $stmt ) : ?>
                <div class="industry-fit-item animate-on-scroll">
                    <svg class="industry-fit-item__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    <p class="industry-fit-item__text"><?php echo esc_html( $stmt ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>

    </div>
</section>

<!-- ── Sub-industries ────────────────────────────────────────────────────────── -->
<?php if ( ! empty( $sub_industries ) ) : ?>
<section class="ind-subindustries" aria-label="Sub-industries">
    <div class="container">
        <div class="ind-subindustries__header animate-on-scroll">
            <span class="industry-section-badge">Explore by sector</span>
            <h2 class="industry-section-heading">Find your specific sector</h2>
            <p class="industry-section-body" style="max-width:560px;margin:0 auto">Every sector within this industry has its own content challenges. Select yours for more specific detail on how we work and what that looks like in practice.</p>
        </div>
        <div class="ind-subindustries__grid">
            <?php foreach ( $sub_industries as $si ) : ?>
                <a href="<?php echo esc_url( home_url( $si['url'] ) ); ?>" class="ind-subindustry-card animate-on-scroll">
                    <span class="ind-subindustry-card__name"><?php echo esc_html( $si['name'] ); ?></span>
                    <svg class="ind-subindustry-card__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<?php endif; ?>

<!-- ── Use Cases Grid ────────────────────────────────────────────────────────── -->
<section class="industry-related" aria-label="<?php esc_attr_e( 'Use cases', 'bluu-interactive' ); ?>" style="background:#fff;">
    <div class="container">

        <div class="industry-related__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'Specific solutions', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php echo esc_html( $uc_heading ); ?></h2>
            <?php if ( $uc_intro ) : ?>
                <p class="industry-section-body" style="max-width:640px;margin:0 auto"><?php echo esc_html( $uc_intro ); ?></p>
            <?php endif; ?>
        </div>

        <div class="industry-related__grid">
            <?php foreach ( $use_cases as $uc ) :
                $uc_title = isset( $uc['ind_uc_title'] )       ? $uc['ind_uc_title']       : '';
                $uc_desc  = isset( $uc['ind_uc_description'] ) ? $uc['ind_uc_description'] : '';
                $uc_url   = isset( $uc['ind_uc_url'] )         ? $uc['ind_uc_url']         : '#';
                $uc_cta   = isset( $uc['ind_uc_cta'] )         ? $uc['ind_uc_cta']         : 'See this use case';
            ?>
                <a href="<?php echo esc_url( home_url( $uc_url ) ); ?>" class="industry-related-card animate-on-scroll">
                    <div class="industry-related-card__title"><?php echo esc_html( $uc_title ); ?></div>
                    <p class="industry-related-card__desc"><?php echo esc_html( $uc_desc ); ?></p>
                    <span class="industry-related-card__arrow"><?php echo esc_html( $uc_cta ); ?> →</span>
                </a>
            <?php endforeach; ?>
        </div>

    </div>
</section>

<!-- ── Pricing Callout ───────────────────────────────────────────────────────── -->
<section class="industry-deliverables" aria-label="<?php esc_attr_e( 'Pricing', 'bluu-interactive' ); ?>" style="background:var(--md-surface-variant);">
    <div class="container">
        <div style="max-width:680px;margin:0 auto;text-align:center;" class="animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'Investment', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php echo esc_html( $pricing_heading ); ?></h2>
            <p class="industry-section-body" style="margin-bottom:var(--space-6)"><?php echo esc_html( $pricing_body ); ?></p>
            <a href="<?php echo esc_url( $pricing_cta_url ); ?>" class="btn-primary">
                <?php echo esc_html( $pricing_cta_label ); ?>
            </a>
        </div>
    </div>
</section>

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
