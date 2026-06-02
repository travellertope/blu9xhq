<?php
/**
 * Bluu Interactive — Page Seeder
 *
 * Creates the full industry / sub-industry / use-case page hierarchy,
 * then sets SEO-optimised titles and meta descriptions on every page.
 *
 * Trigger from WordPress admin: visit /wp-admin/?run_bluu_seeder=1
 * (or run via WP-CLI: wp eval-file seeder.php)
 *
 * Safe to re-run — skips pages that already exist, always updates SEO fields.
 */

// ── Admin trigger (no CLI required) ──────────────────────────────────────────
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

if ( defined( 'ABSPATH' ) && ! defined( 'WPINC' ) ) {
    // Running as a standalone file — not inside WordPress. Bail gracefully.
    die( 'Run this via WP-CLI (wp eval-file seeder.php) or the admin trigger.' );
}

// Allow admin users to trigger via URL: /wp-admin/?run_bluu_seeder=1
if ( isset( $_GET['run_bluu_seeder'] ) && current_user_can( 'manage_options' ) ) {
    add_action( 'admin_init', 'bluu_run_seeder_via_admin' );
}

function bluu_run_seeder_via_admin() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'Insufficient permissions.' );
    }
    ob_start();
    bluu_run_seeder();
    $output = ob_get_clean();
    // Display result as a plain-text admin page
    echo '<pre style="background:#1e1e1e;color:#d4d4d4;padding:24px;font-size:13px;line-height:1.6;">';
    echo esc_html( $output );
    echo '</pre>';
    exit;
}

// ── Core seeder function ──────────────────────────────────────────────────────

function bluu_run_seeder() {

    $created     = 0;
    $skipped     = 0;
    $seo_updated = 0;

    // ── Helper: ensure a page exists, return its ID ──────────────────────────
    $ensure = function( $title, $slug, $template, $parent_id = 0 ) use ( &$created, &$skipped ) {
        $existing = get_posts( array(
            'name'        => $slug,
            'post_type'   => 'page',
            'post_status' => array( 'publish', 'draft' ),
            'post_parent' => $parent_id,
            'numberposts' => 1,
        ) );

        if ( $existing ) {
            $post_id          = $existing[0]->ID;
            $current_template = get_post_meta( $post_id, '_wp_page_template', true );
            if ( $current_template !== $template ) {
                update_post_meta( $post_id, '_wp_page_template', $template );
                echo "  UPDATED template: {$slug} (was: {$current_template})\n";
            } else {
                echo "  EXISTS: {$slug}\n";
            }
            $skipped++;
            return $post_id;
        }

        $post_id = wp_insert_post( array(
            'post_title'  => $title,
            'post_name'   => $slug,
            'post_status' => 'publish',
            'post_type'   => 'page',
            'post_parent' => $parent_id,
            'menu_order'  => 0,
        ), true );

        if ( is_wp_error( $post_id ) ) {
            echo "  ERROR creating {$slug}: " . $post_id->get_error_message() . "\n";
            return 0;
        }

        update_post_meta( $post_id, '_wp_page_template', $template );
        echo "  CREATED: {$slug} (ID: {$post_id})\n";
        $created++;
        return $post_id;
    };

    // ── Helper: set ACF SEO fields on a known post ID ────────────────────────
    $set_seo = function( $post_id, $seo_title, $meta_desc, $title_field, $desc_field ) use ( &$seo_updated ) {
        if ( ! $post_id || ! function_exists( 'update_field' ) ) {
            return;
        }
        update_field( $title_field, $seo_title, $post_id );
        update_field( $desc_field,  $meta_desc, $post_id );
        $seo_updated++;
    };

    // =========================================================================
    // 1. Industries hub
    // =========================================================================
    echo "\n[Industries hub]\n";
    $hub_id = $ensure( 'Industries', 'industries', 'page-industries.php', 0 );
    $set_seo( $hub_id,
        'Content Operations by Industry | Bluu Interactive',
        'Bluu Interactive runs fully managed content retainers for SaaS startups, agencies, e-commerce brands, and professional services firms. See which industry fits.',
        'hub_seo_title', 'hub_meta_description'
    );

    // =========================================================================
    // 2. Industry pages
    // =========================================================================
    echo "\n[Industry pages]\n";

    $industries = array(
        array(
            'title' => 'Tech & SaaS',
            'slug'  => 'tech-saas',
            'seo'   => 'Content Operations for Tech & SaaS Startups | Bluu Interactive',
            'desc'  => 'Bluu runs your entire content operation — competitor intelligence, founder brand, and long-form content — on a flat monthly retainer built for SaaS teams.',
        ),
        array(
            'title' => 'Agencies & Consultants',
            'slug'  => 'agencies-consultants',
            'seo'   => 'Content Operations for Agencies & Consultants | Bluu Interactive',
            'desc'  => 'Managed content retainers for agencies and consultancies. Own-brand content, thought leadership, and white-label production — all done for you every month.',
        ),
        array(
            'title' => 'E-commerce & DTC',
            'slug'  => 'ecommerce-dtc',
            'seo'   => 'Content Operations for E-commerce & DTC Brands | Bluu Interactive',
            'desc'  => 'Bluu runs brand storytelling, product content, email programmes, and market intelligence for growing DTC brands — one flat monthly retainer.',
        ),
        array(
            'title' => 'Professional Services',
            'slug'  => 'professional-services',
            'seo'   => 'Content Operations for Professional Services Firms | Bluu Interactive',
            'desc'  => 'Expert commentary, client education, referral content, and LinkedIn authority — Bluu delivers a complete content operation for professional services firms.',
        ),
    );

    $industry_ids = array();
    foreach ( $industries as $ind ) {
        $id = $ensure( $ind['title'], $ind['slug'], 'page-industry.php', $hub_id );
        $industry_ids[ $ind['slug'] ] = $id;
        $set_seo( $id, $ind['seo'], $ind['desc'], 'ind_seo_title', 'ind_meta_description' );
    }

    // =========================================================================
    // 3. Sub-industry pages
    // =========================================================================
    echo "\n[Sub-industry pages]\n";

    $sub_industries = array(
        // Tech & SaaS
        'tech-saas' => array(
            array(
                'title' => 'Seed to Series A',
                'slug'  => 'seed-series-a',
                'seo'   => 'Content Operations for Seed to Series A Startups | Bluu Interactive',
                'desc'  => 'Early-stage SaaS founders: get a fully managed content operation covering competitor intelligence, founder LinkedIn, and long-form content from day one.',
            ),
            array(
                'title' => 'B2B SaaS Growth',
                'slug'  => 'b2b-saas-growth',
                'seo'   => 'B2B SaaS Content Marketing & Growth Content | Bluu Interactive',
                'desc'  => 'Managed B2B SaaS content for growth-stage teams — SEO articles, thought leadership, product launches, and weekly competitor digests on one retainer.',
            ),
            array(
                'title' => 'No-code & AI Startups',
                'slug'  => 'no-code-ai-startups',
                'seo'   => 'Content Operations for No-Code & AI Startups | Bluu Interactive',
                'desc'  => 'No-code and AI startup content — founder brand building, category education, and competitor monitoring handled entirely by Bluu on a flat monthly retainer.',
            ),
            array(
                'title' => 'Developer Tools',
                'slug'  => 'developer-tools',
                'seo'   => 'Content Operations for Developer Tools Companies | Bluu Interactive',
                'desc'  => 'Technical content, developer-focused thought leadership, and competitor intelligence for developer tools companies — all on one managed monthly retainer.',
            ),
        ),
        // Agencies & Consultants
        'agencies-consultants' => array(
            array(
                'title' => 'Marketing Consultants',
                'slug'  => 'marketing-consultants',
                'seo'   => 'Content Operations for Marketing Consultants | Bluu Interactive',
                'desc'  => 'Marketing consultants: grow your own brand while you grow your clients\' — Bluu manages your thought leadership, case studies, and LinkedIn content every month.',
            ),
            array(
                'title' => 'Branding & Design Studios',
                'slug'  => 'branding-design-studios',
                'seo'   => 'Content Operations for Branding & Design Studios | Bluu Interactive',
                'desc'  => 'Branding and design studios: showcase your work and thinking with consistent content — Bluu manages portfolio content, thought leadership, and LinkedIn presence.',
            ),
            array(
                'title' => 'PR & Communications',
                'slug'  => 'pr-communications',
                'seo'   => 'Content Operations for PR & Comms Agencies | Bluu Interactive',
                'desc'  => 'PR and communications agencies: let Bluu manage your own content — commentary, thought leadership, and industry intelligence — while you focus on client work.',
            ),
            array(
                'title' => 'Strategy Consultants',
                'slug'  => 'strategy-consultants',
                'seo'   => 'Content Operations for Strategy Consultants | Bluu Interactive',
                'desc'  => 'Strategy consultants: build the authority your expertise deserves — Bluu runs your content operation with a monthly retainer covering thought leadership and LinkedIn.',
            ),
            array(
                'title' => 'Recruitment Consultants',
                'slug'  => 'recruitment-consultants',
                'seo'   => 'Content Operations for Recruitment Consultants | Bluu Interactive',
                'desc'  => 'Recruitment consultants: attract better clients and candidates with consistent content — Bluu manages your thought leadership, LinkedIn, and market commentary.',
            ),
            array(
                'title' => 'Business Coaches',
                'slug'  => 'business-coaches',
                'seo'   => 'Content Operations for Business Coaches | Bluu Interactive',
                'desc'  => 'Business coaches: build an audience and fill your pipeline with consistent content — Bluu manages your LinkedIn, long-form articles, and newsletter every month.',
            ),
            array(
                'title' => 'Paid Media Agencies',
                'slug'  => 'paid-media-agencies',
                'seo'   => 'Content Operations for Paid Media Agencies | Bluu Interactive',
                'desc'  => 'Paid media agencies: Bluu handles your organic content operation so you can focus on client campaigns — thought leadership, LinkedIn, and industry commentary covered.',
            ),
            array(
                'title' => 'Full-service Agencies',
                'slug'  => 'full-service-agencies',
                'seo'   => 'Content Operations for Full-Service Agencies | Bluu Interactive',
                'desc'  => 'Full-service agencies: run your own content operation as well as you run your clients\' — Bluu delivers owned content on a flat monthly retainer.',
            ),
        ),
        // E-commerce & DTC
        'ecommerce-dtc' => array(
            array(
                'title' => 'Emerging DTC Brands',
                'slug'  => 'emerging-dtc-brands',
                'seo'   => 'Content Operations for Emerging DTC Brands | Bluu Interactive',
                'desc'  => 'Emerging DTC brands: build brand awareness and drive repeat purchase with consistent content — Bluu manages storytelling, product content, and email on one retainer.',
            ),
            array(
                'title' => 'Subscription & Lifestyle',
                'slug'  => 'subscription-lifestyle',
                'seo'   => 'Content Operations for Subscription & Lifestyle Brands | Bluu Interactive',
                'desc'  => 'Subscription and lifestyle brands: Bluu manages your brand content — storytelling, email programmes, and market intelligence — on a flat monthly retainer.',
            ),
            array(
                'title' => 'Marketplaces & Platforms',
                'slug'  => 'marketplaces-platforms',
                'seo'   => 'Content Operations for Marketplaces & Platforms | Bluu Interactive',
                'desc'  => 'Marketplace and platform content — category education, seller storytelling, and trend intelligence — all managed by Bluu on a single monthly retainer.',
            ),
        ),
        // Professional Services
        'professional-services' => array(
            array(
                'title' => 'Financial Advisors',
                'slug'  => 'financial-advisors',
                'seo'   => 'Content Operations for Financial Advisors | Bluu Interactive',
                'desc'  => 'Financial advisors: build trust and attract ideal clients with expert-led content — Bluu manages your thought leadership, LinkedIn, and client education every month.',
            ),
            array(
                'title' => 'Boutique Law Firms',
                'slug'  => 'boutique-law-firms',
                'seo'   => 'Content Marketing for Boutique Law Firms | Bluu Interactive',
                'desc'  => 'Boutique law firms: grow visibility and referrals with consistent expert content — Bluu manages commentary, client education, and LinkedIn on a flat monthly retainer.',
            ),
            array(
                'title' => 'Management Consultancies',
                'slug'  => 'management-consultancies',
                'seo'   => 'Content Operations for Management Consultancies | Bluu Interactive',
                'desc'  => 'Management consultancies: convert your expertise into a consistent content presence — Bluu manages thought leadership, LinkedIn, and client-facing content monthly.',
            ),
        ),
    );

    foreach ( $sub_industries as $industry_slug => $pages ) {
        $parent = $industry_ids[ $industry_slug ] ?? 0;
        foreach ( $pages as $page ) {
            $id = $ensure( $page['title'], $page['slug'], 'page-subindustry.php', $parent );
            $set_seo( $id, $page['seo'], $page['desc'], 'si_seo_title', 'si_meta_description' );
        }
    }

    // =========================================================================
    // 4. Use-case pages
    // =========================================================================
    echo "\n[Use-case pages]\n";

    $use_cases = array(
        // Tech & SaaS
        'tech-saas' => array(
            array(
                'title' => 'Competitor Intelligence',
                'slug'  => 'competitor-intelligence',
                'seo'   => 'Competitor Intelligence for SaaS Startups | Bluu Interactive',
                'desc'  => 'Weekly competitor monitoring delivered as a structured digest — content output, messaging shifts, and positioning changes tracked every week. Included in your retainer.',
            ),
            array(
                'title' => 'Founder Brand Building',
                'slug'  => 'founder-brand',
                'seo'   => 'Founder Brand Building on LinkedIn | Bluu Interactive',
                'desc'  => 'Consistent LinkedIn content written in your voice — opinions, market commentary, and product perspective published every week without taking time from your schedule.',
            ),
            array(
                'title' => 'Content Repurposing Engine',
                'slug'  => 'content-repurposing',
                'seo'   => 'Content Repurposing Engine for SaaS Teams | Bluu Interactive',
                'desc'  => 'Turn one piece of long-form content into LinkedIn posts, newsletter sections, X threads, and social captions — Bluu manages the entire repurposing engine monthly.',
            ),
            array(
                'title' => 'Product Launch Content',
                'slug'  => 'product-launch-content',
                'seo'   => 'Product Launch Content Packages for SaaS | Bluu Interactive',
                'desc'  => 'A complete content package for every product launch — blog post, email, LinkedIn posts, X thread, and social captions — ready before your launch date.',
            ),
        ),
        // Agencies & Consultants
        'agencies-consultants' => array(
            array(
                'title' => 'Own-brand Content',
                'slug'  => 'own-brand-content',
                'seo'   => 'Own-Brand Content for Agencies & Consultants | Bluu Interactive',
                'desc'  => 'Stop putting your own content last — Bluu manages your agency\'s thought leadership, case studies, and LinkedIn presence on a flat monthly retainer.',
            ),
            array(
                'title' => 'Thought Leadership',
                'slug'  => 'thought-leadership',
                'seo'   => 'Thought Leadership Content for Agencies | Bluu Interactive',
                'desc'  => 'Expert-led thought leadership content written for your principals — LinkedIn articles, opinion pieces, and industry commentary published consistently every month.',
            ),
            array(
                'title' => 'White-label Content Production',
                'slug'  => 'white-label-production',
                'seo'   => 'White-Label Content Production for Agencies | Bluu Interactive',
                'desc'  => 'Bluu produces client-ready content under your brand — blog posts, reports, email campaigns, and social content delivered to your brief, style, and timeline.',
            ),
            array(
                'title' => 'New Service Launch',
                'slug'  => 'service-launch',
                'seo'   => 'New Service Launch Content for Agencies | Bluu Interactive',
                'desc'  => 'Launch a new service with a complete content package — positioning copy, LinkedIn posts, email announcement, case study template, and sales enablement content.',
            ),
        ),
        // E-commerce & DTC
        'ecommerce-dtc' => array(
            array(
                'title' => 'Brand Storytelling',
                'slug'  => 'brand-storytelling',
                'seo'   => 'Brand Storytelling Content for DTC Brands | Bluu Interactive',
                'desc'  => 'Build brand affinity and repeat purchase with consistent storytelling — Bluu manages your founder story, mission content, and community narrative every month.',
            ),
            array(
                'title' => 'Product & Collection Content',
                'slug'  => 'product-content',
                'seo'   => 'Product & Collection Content for E-commerce Brands | Bluu Interactive',
                'desc'  => 'SEO-optimised product descriptions, collection page copy, and launch content for every new product — built to drive search visibility and convert browsers.',
            ),
            array(
                'title' => 'Email & Newsletter Programme',
                'slug'  => 'email-newsletter',
                'seo'   => 'Email & Newsletter Programme for DTC Brands | Bluu Interactive',
                'desc'  => 'A fully managed monthly email programme — campaign strategy, copywriting, and send scheduling handled by Bluu to drive repeat purchase and customer retention.',
            ),
            array(
                'title' => 'Market Trend Intelligence',
                'slug'  => 'market-intelligence',
                'seo'   => 'Market Trend Intelligence for E-commerce Brands | Bluu Interactive',
                'desc'  => 'Weekly market trend monitoring across your category — competitor activity, consumer behaviour shifts, and emerging opportunities delivered as a structured digest.',
            ),
        ),
        // Professional Services
        'professional-services' => array(
            array(
                'title' => 'Expert Commentary',
                'slug'  => 'expert-commentary',
                'seo'   => 'Expert Commentary Content for Professional Services | Bluu Interactive',
                'desc'  => 'Regular expert commentary on industry news and regulatory changes — Bluu turns your knowledge into timely, search-ready content that builds authority and referrals.',
            ),
            array(
                'title' => 'Client Education Content',
                'slug'  => 'client-education',
                'seo'   => 'Client Education Content for Professional Services | Bluu Interactive',
                'desc'  => 'Build trust and reduce sales friction with educational content — guides, explainers, and FAQ content that positions you as the expert before a client meets you.',
            ),
            array(
                'title' => 'Referral & Trust Content',
                'slug'  => 'referral-trust-content',
                'seo'   => 'Referral & Trust Content for Professional Services | Bluu Interactive',
                'desc'  => 'Case studies, testimonial frameworks, and trust-building content that make referrals easy and convert warm introductions into signed clients.',
            ),
            array(
                'title' => 'LinkedIn Authority',
                'slug'  => 'linkedin-authority',
                'seo'   => 'LinkedIn Authority Building for Professional Services | Bluu Interactive',
                'desc'  => 'Consistent LinkedIn content written in your voice — expert opinions, client wins, and market commentary published every week to grow your professional authority.',
            ),
        ),
    );

    foreach ( $use_cases as $industry_slug => $pages ) {
        $parent = $industry_ids[ $industry_slug ] ?? 0;
        foreach ( $pages as $page ) {
            $id = $ensure( $page['title'], $page['slug'], 'page-usecase.php', $parent );
            $set_seo( $id, $page['seo'], $page['desc'], 'uc_seo_title', 'uc_meta_description' );
        }
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    echo "\n────────────────────────────────────\n";
    echo "Pages — Created: {$created} | Already existed: {$skipped}\n";
    echo "SEO fields updated: {$seo_updated}\n";
    echo "────────────────────────────────────\n\n";
    echo "URL structure:\n";
    echo "  /industries/\n";
    echo "  /industries/tech-saas/\n";
    echo "  /industries/tech-saas/seed-series-a/\n";
    echo "  /industries/tech-saas/competitor-intelligence/\n";
    echo "  (and so on for all 4 industries + 18 sub-industries + 16 use cases)\n\n";
}

// ── Auto-run when executed directly (WP-CLI: wp eval-file seeder.php) ─────────
if ( defined( 'WP_CLI' ) && WP_CLI ) {
    bluu_run_seeder();
}
