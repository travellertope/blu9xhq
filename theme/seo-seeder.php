<?php
/**
 * Bluu Interactive — SEO Seeder
 *
 * Populates ACF SEO title and meta description fields for all industry,
 * sub-industry, and use-case pages.
 *
 * Run via WP-CLI: wp eval-file seo-seeder.php
 *
 * Safe to re-run — updates existing values with the latest copy below.
 */

if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

if ( ! function_exists( 'update_field' ) ) {
    echo "ERROR: ACF not active. Run this via WP-CLI on a live WordPress install.\n";
    exit;
}

$updated = 0;
$skipped = 0;

/**
 * Set SEO fields on a page found by slug + optional parent slug.
 */
function bluu_set_seo( $slug, $parent_slug, $seo_title, $meta_desc, $seo_field, $meta_field ) {
    global $updated, $skipped;

    $parent_id = 0;
    if ( $parent_slug ) {
        $parent = get_posts( array(
            'name'        => $parent_slug,
            'post_type'   => 'page',
            'post_status' => array( 'publish', 'draft' ),
            'numberposts' => 1,
        ) );
        if ( ! $parent ) {
            echo "  WARN: parent '{$parent_slug}' not found — skipping '{$slug}'\n";
            $skipped++;
            return;
        }
        $parent_id = $parent[0]->ID;
    }

    $pages = get_posts( array(
        'name'        => $slug,
        'post_type'   => 'page',
        'post_status' => array( 'publish', 'draft' ),
        'post_parent' => $parent_id,
        'numberposts' => 1,
    ) );

    if ( ! $pages ) {
        echo "  WARN: page '{$slug}' not found\n";
        $skipped++;
        return;
    }

    $id = $pages[0]->ID;
    update_field( $seo_field,  $seo_title, $id );
    update_field( $meta_field, $meta_desc, $id );
    echo "  SET [{$id}] {$slug}\n";
    $updated++;
}

// ── Hub ───────────────────────────────────────────────────────────────────────
echo "\n[Industries hub]\n";
bluu_set_seo(
    'industries', '',
    'Content Operations by Industry | Bluu Interactive',
    'Bluu Interactive runs fully managed content retainers for SaaS startups, agencies, e-commerce brands, and professional services firms. See which industry fits.',
    'hub_seo_title', 'hub_meta_description'
);

// ── Industry pages ────────────────────────────────────────────────────────────
echo "\n[Industry pages]\n";

$industry_seo = array(
    'tech-saas' => array(
        'title' => 'Content Operations for Tech & SaaS Startups | Bluu Interactive',
        'desc'  => 'Bluu runs your entire content operation — competitor intelligence, founder brand, and long-form content — on a flat monthly retainer built for SaaS teams.',
    ),
    'agencies-consultants' => array(
        'title' => 'Content Operations for Agencies & Consultants | Bluu Interactive',
        'desc'  => 'Managed content retainers for agencies and consultancies. Own-brand content, thought leadership, and white-label production — all done for you every month.',
    ),
    'ecommerce-dtc' => array(
        'title' => 'Content Operations for E-commerce & DTC Brands | Bluu Interactive',
        'desc'  => 'Bluu runs brand storytelling, product content, email programmes, and market intelligence for growing DTC brands — one flat monthly retainer.',
    ),
    'professional-services' => array(
        'title' => 'Content Operations for Professional Services Firms | Bluu Interactive',
        'desc'  => 'Expert commentary, client education, referral content, and LinkedIn authority — Bluu delivers a complete content operation for professional services firms.',
    ),
);

foreach ( $industry_seo as $slug => $copy ) {
    bluu_set_seo( $slug, 'industries', $copy['title'], $copy['desc'], 'ind_seo_title', 'ind_meta_description' );
}

// ── Sub-industry pages ────────────────────────────────────────────────────────
echo "\n[Sub-industry pages]\n";

$sub_industry_seo = array(

    // Tech & SaaS sub-industries
    'seed-series-a' => array(
        'parent' => 'tech-saas',
        'title'  => 'Content Operations for Seed to Series A Startups | Bluu Interactive',
        'desc'   => 'Early-stage SaaS founders: get a fully managed content operation covering competitor intelligence, founder LinkedIn, and long-form content from day one.',
    ),
    'b2b-saas-growth' => array(
        'parent' => 'tech-saas',
        'title'  => 'B2B SaaS Content Marketing & Growth Content | Bluu Interactive',
        'desc'   => 'Managed B2B SaaS content for growth-stage teams — SEO articles, thought leadership, product launches, and weekly competitor digests on one retainer.',
    ),
    'no-code-ai-startups' => array(
        'parent' => 'tech-saas',
        'title'  => 'Content Operations for No-Code & AI Startups | Bluu Interactive',
        'desc'   => 'No-code and AI startup content — founder brand building, category education, and competitor monitoring handled entirely by Bluu on a flat monthly retainer.',
    ),
    'developer-tools' => array(
        'parent' => 'tech-saas',
        'title'  => 'Content Operations for Developer Tools Companies | Bluu Interactive',
        'desc'   => 'Technical content, developer-focused thought leadership, and competitor intelligence for developer tools companies — all on one managed monthly retainer.',
    ),

    // Agencies & Consultants sub-industries
    'marketing-consultants' => array(
        'parent' => 'agencies-consultants',
        'title'  => 'Content Operations for Marketing Consultants | Bluu Interactive',
        'desc'   => 'Marketing consultants: grow your own brand while you grow your clients\' — Bluu manages your thought leadership, case studies, and LinkedIn content every month.',
    ),
    'branding-design-studios' => array(
        'parent' => 'agencies-consultants',
        'title'  => 'Content Operations for Branding & Design Studios | Bluu Interactive',
        'desc'   => 'Branding and design studios: showcase your work and thinking with consistent content — Bluu manages portfolio content, thought leadership, and LinkedIn presence.',
    ),
    'pr-communications' => array(
        'parent' => 'agencies-consultants',
        'title'  => 'Content Operations for PR & Comms Agencies | Bluu Interactive',
        'desc'   => 'PR and communications agencies: let Bluu manage your own content — commentary, thought leadership, and industry intelligence — while you focus on client work.',
    ),
    'strategy-consultants' => array(
        'parent' => 'agencies-consultants',
        'title'  => 'Content Operations for Strategy Consultants | Bluu Interactive',
        'desc'   => 'Strategy consultants: build the authority your expertise deserves — Bluu runs your content operation with a monthly retainer covering thought leadership and LinkedIn.',
    ),
    'recruitment-consultants' => array(
        'parent' => 'agencies-consultants',
        'title'  => 'Content Operations for Recruitment Consultants | Bluu Interactive',
        'desc'   => 'Recruitment consultants: attract better clients and candidates with consistent content — Bluu manages your thought leadership, LinkedIn, and market commentary.',
    ),
    'business-coaches' => array(
        'parent' => 'agencies-consultants',
        'title'  => 'Content Operations for Business Coaches | Bluu Interactive',
        'desc'   => 'Business coaches: build an audience and fill your pipeline with consistent content — Bluu manages your LinkedIn, long-form articles, and newsletter every month.',
    ),
    'paid-media-agencies' => array(
        'parent' => 'agencies-consultants',
        'title'  => 'Content Operations for Paid Media Agencies | Bluu Interactive',
        'desc'   => 'Paid media agencies: Bluu handles your organic content operation so you can focus on client campaigns — thought leadership, LinkedIn, and industry commentary covered.',
    ),
    'full-service-agencies' => array(
        'parent' => 'agencies-consultants',
        'title'  => 'Content Operations for Full-Service Agencies | Bluu Interactive',
        'desc'   => 'Full-service agencies: run your own content operation as well as you run your clients\' — Bluu delivers owned content on a flat monthly retainer.',
    ),

    // E-commerce & DTC sub-industries
    'emerging-dtc-brands' => array(
        'parent' => 'ecommerce-dtc',
        'title'  => 'Content Operations for Emerging DTC Brands | Bluu Interactive',
        'desc'   => 'Emerging DTC brands: build brand awareness and drive repeat purchase with consistent content — Bluu manages storytelling, product content, and email on one retainer.',
    ),
    'subscription-lifestyle' => array(
        'parent' => 'ecommerce-dtc',
        'title'  => 'Content Operations for Subscription & Lifestyle Brands | Bluu Interactive',
        'desc'   => 'Subscription and lifestyle brands: Bluu manages your brand content — storytelling, email programmes, and market intelligence — on a flat monthly retainer.',
    ),
    'marketplaces-platforms' => array(
        'parent' => 'ecommerce-dtc',
        'title'  => 'Content Operations for Marketplaces & Platforms | Bluu Interactive',
        'desc'   => 'Marketplace and platform content — category education, seller storytelling, and trend intelligence — all managed by Bluu on a single monthly retainer.',
    ),

    // Professional Services sub-industries
    'financial-advisors' => array(
        'parent' => 'professional-services',
        'title'  => 'Content Operations for Financial Advisors | Bluu Interactive',
        'desc'   => 'Financial advisors: build trust and attract ideal clients with expert-led content — Bluu manages your thought leadership, LinkedIn, and client education every month.',
    ),
    'boutique-law-firms' => array(
        'parent' => 'professional-services',
        'title'  => 'Content Marketing for Boutique Law Firms | Bluu Interactive',
        'desc'   => 'Boutique law firms: grow visibility and referrals with consistent expert content — Bluu manages commentary, client education, and LinkedIn on a flat monthly retainer.',
    ),
    'management-consultancies' => array(
        'parent' => 'professional-services',
        'title'  => 'Content Operations for Management Consultancies | Bluu Interactive',
        'desc'   => 'Management consultancies: convert your expertise into a consistent content presence — Bluu manages thought leadership, LinkedIn, and client-facing content monthly.',
    ),
);

foreach ( $sub_industry_seo as $slug => $copy ) {
    bluu_set_seo( $slug, $copy['parent'], $copy['title'], $copy['desc'], 'si_seo_title', 'si_meta_description' );
}

// ── Use-case pages ────────────────────────────────────────────────────────────
echo "\n[Use-case pages]\n";

$use_case_seo = array(

    // Tech & SaaS use cases
    'competitor-intelligence' => array(
        'parent' => 'tech-saas',
        'title'  => 'Competitor Intelligence for SaaS Startups | Bluu Interactive',
        'desc'   => 'Weekly competitor monitoring delivered as a structured digest — content output, messaging shifts, and positioning changes tracked every week. Included in your retainer.',
    ),
    'founder-brand' => array(
        'parent' => 'tech-saas',
        'title'  => 'Founder Brand Building on LinkedIn | Bluu Interactive',
        'desc'   => 'Consistent LinkedIn content written in your voice — opinions, market commentary, and product perspective published every week without taking time from your schedule.',
    ),
    'content-repurposing' => array(
        'parent' => 'tech-saas',
        'title'  => 'Content Repurposing Engine for SaaS Teams | Bluu Interactive',
        'desc'   => 'Turn one piece of long-form content into LinkedIn posts, newsletter sections, X threads, and social captions — Bluu manages the entire repurposing engine monthly.',
    ),
    'product-launch-content' => array(
        'parent' => 'tech-saas',
        'title'  => 'Product Launch Content Packages for SaaS | Bluu Interactive',
        'desc'   => 'A complete content package for every product launch — blog post, email, LinkedIn posts, X thread, and social captions — ready before your launch date.',
    ),

    // Agencies & Consultants use cases
    'own-brand-content' => array(
        'parent' => 'agencies-consultants',
        'title'  => 'Own-Brand Content for Agencies & Consultants | Bluu Interactive',
        'desc'   => 'Stop putting your own content last — Bluu manages your agency\'s thought leadership, case studies, and LinkedIn presence on a flat monthly retainer.',
    ),
    'thought-leadership' => array(
        'parent' => 'agencies-consultants',
        'title'  => 'Thought Leadership Content for Agencies | Bluu Interactive',
        'desc'   => 'Expert-led thought leadership content written for your principals — LinkedIn articles, opinion pieces, and industry commentary published consistently every month.',
    ),
    'white-label-production' => array(
        'parent' => 'agencies-consultants',
        'title'  => 'White-Label Content Production for Agencies | Bluu Interactive',
        'desc'   => 'Bluu produces client-ready content under your brand — blog posts, reports, email campaigns, and social content delivered to your brief, your style, your timeline.',
    ),
    'service-launch' => array(
        'parent' => 'agencies-consultants',
        'title'  => 'New Service Launch Content for Agencies | Bluu Interactive',
        'desc'   => 'Launch a new service with a complete content package — positioning copy, LinkedIn posts, email announcement, case study template, and sales enablement content.',
    ),

    // E-commerce & DTC use cases
    'brand-storytelling' => array(
        'parent' => 'ecommerce-dtc',
        'title'  => 'Brand Storytelling Content for DTC Brands | Bluu Interactive',
        'desc'   => 'Build brand affinity and repeat purchase with consistent storytelling — Bluu manages your founder story, mission content, and community narrative every month.',
    ),
    'product-content' => array(
        'parent' => 'ecommerce-dtc',
        'title'  => 'Product & Collection Content for E-commerce Brands | Bluu Interactive',
        'desc'   => 'SEO-optimised product descriptions, collection page copy, and launch content for every new product — all built to drive search visibility and convert browsers.',
    ),
    'email-newsletter' => array(
        'parent' => 'ecommerce-dtc',
        'title'  => 'Email & Newsletter Programme for DTC Brands | Bluu Interactive',
        'desc'   => 'A fully managed monthly email programme — campaign strategy, copywriting, and send scheduling handled by Bluu to drive repeat purchase and customer retention.',
    ),
    'market-intelligence' => array(
        'parent' => 'ecommerce-dtc',
        'title'  => 'Market Trend Intelligence for E-commerce Brands | Bluu Interactive',
        'desc'   => 'Weekly market trend monitoring across your category — competitor activity, consumer behaviour shifts, and emerging opportunities delivered as a structured digest.',
    ),

    // Professional Services use cases
    'expert-commentary' => array(
        'parent' => 'professional-services',
        'title'  => 'Expert Commentary Content for Professional Services | Bluu Interactive',
        'desc'   => 'Regular expert commentary on industry news and regulatory changes — Bluu turns your knowledge into timely, search-ready content that builds authority and drives referrals.',
    ),
    'client-education' => array(
        'parent' => 'professional-services',
        'title'  => 'Client Education Content for Professional Services | Bluu Interactive',
        'desc'   => 'Build trust and reduce sales friction with educational content — guides, explainers, and FAQ content that positions you as the expert before a client ever speaks to you.',
    ),
    'referral-trust-content' => array(
        'parent' => 'professional-services',
        'title'  => 'Referral & Trust Content for Professional Services | Bluu Interactive',
        'desc'   => 'Case studies, testimonial frameworks, and trust-building content that make referrals easy and convert warm introductions into signed clients.',
    ),
    'linkedin-authority' => array(
        'parent' => 'professional-services',
        'title'  => 'LinkedIn Authority Building for Professional Services | Bluu Interactive',
        'desc'   => 'Consistent LinkedIn content written in your voice — expert opinions, client wins, and market commentary published every week to grow your professional authority.',
    ),
);

foreach ( $use_case_seo as $slug => $copy ) {
    bluu_set_seo( $slug, $copy['parent'], $copy['title'], $copy['desc'], 'uc_seo_title', 'uc_meta_description' );
}

// ── Summary ───────────────────────────────────────────────────────────────────
echo "\n────────────────────────────────────\n";
echo "Done. Updated: {$updated} | Skipped/not found: {$skipped}\n";
echo "────────────────────────────────────\n\n";
