<?php
/**
 * Bluu Interactive — Page Seeder
 *
 * Creates the full industry / sub-industry / use-case page hierarchy.
 * Run once via WP-CLI: wp eval-file seeder.php
 *
 * Safe to re-run — skips pages that already exist with the correct slug + parent.
 */

if ( ! defined( 'ABSPATH' ) ) {
    // Allow running via WP-CLI (wp eval-file)
    define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

$created = 0;
$skipped = 0;

/**
 * Ensure a page exists. Returns the post ID.
 *
 * @param string $title
 * @param string $slug
 * @param string $template  Filename of page template (e.g. page-industry.php)
 * @param int    $parent_id Post ID of parent page, 0 for top-level
 */
function bluu_ensure_page( $title, $slug, $template, $parent_id = 0 ) {
    global $created, $skipped;

    // Check for existing page by slug + parent
    $existing = get_posts( array(
        'name'        => $slug,
        'post_type'   => 'page',
        'post_status' => array( 'publish', 'draft' ),
        'post_parent' => $parent_id,
        'numberposts' => 1,
    ) );

    if ( $existing ) {
        $post_id = $existing[0]->ID;
        // Make sure template is set correctly
        $current_template = get_post_meta( $post_id, '_wp_page_template', true );
        if ( $current_template !== $template ) {
            update_post_meta( $post_id, '_wp_page_template', $template );
            echo "  UPDATED template on: {$slug} (was: {$current_template})\n";
        } else {
            echo "  EXISTS: {$slug}\n";
        }
        $skipped++;
        return $post_id;
    }

    $post_id = wp_insert_post( array(
        'post_title'   => $title,
        'post_name'    => $slug,
        'post_status'  => 'publish',
        'post_type'    => 'page',
        'post_parent'  => $parent_id,
        'menu_order'   => 0,
    ), true );

    if ( is_wp_error( $post_id ) ) {
        echo "  ERROR creating {$slug}: " . $post_id->get_error_message() . "\n";
        return 0;
    }

    update_post_meta( $post_id, '_wp_page_template', $template );
    echo "  CREATED: {$slug} (ID: {$post_id})\n";
    $created++;
    return $post_id;
}

// ── 1. Top-level Industries hub ───────────────────────────────────────────────
echo "\n[Industries hub]\n";
$hub_id = bluu_ensure_page( 'Industries', 'industries', 'page-industries.php', 0 );

// ── 2. Industry pages ─────────────────────────────────────────────────────────
echo "\n[Industry pages]\n";

$industries = array(
    array( 'title' => 'Tech & SaaS',               'slug' => 'tech-saas' ),
    array( 'title' => 'Agencies & Consultants',     'slug' => 'agencies-consultants' ),
    array( 'title' => 'E-commerce & DTC',           'slug' => 'ecommerce-dtc' ),
    array( 'title' => 'Professional Services',      'slug' => 'professional-services' ),
);

$industry_ids = array();
foreach ( $industries as $ind ) {
    $id = bluu_ensure_page( $ind['title'], $ind['slug'], 'page-industry.php', $hub_id );
    $industry_ids[ $ind['slug'] ] = $id;
}

// ── 3. Sub-industry pages ─────────────────────────────────────────────────────
echo "\n[Sub-industry pages]\n";

$sub_industries = array(
    // Tech & SaaS
    'tech-saas' => array(
        array( 'title' => 'Seed to Series A',              'slug' => 'seed-series-a' ),
        array( 'title' => 'B2B SaaS Growth',               'slug' => 'b2b-saas-growth' ),
        array( 'title' => 'No-code & AI Startups',         'slug' => 'no-code-ai-startups' ),
        array( 'title' => 'Developer Tools',               'slug' => 'developer-tools' ),
    ),
    // Agencies & Consultants
    'agencies-consultants' => array(
        array( 'title' => 'Marketing Consultants',         'slug' => 'marketing-consultants' ),
        array( 'title' => 'Branding & Design Studios',     'slug' => 'branding-design-studios' ),
        array( 'title' => 'PR & Communications',           'slug' => 'pr-communications' ),
        array( 'title' => 'Strategy Consultants',          'slug' => 'strategy-consultants' ),
        array( 'title' => 'Recruitment Consultants',       'slug' => 'recruitment-consultants' ),
        array( 'title' => 'Business Coaches',              'slug' => 'business-coaches' ),
        array( 'title' => 'Paid Media Agencies',           'slug' => 'paid-media-agencies' ),
        array( 'title' => 'Full-service Agencies',         'slug' => 'full-service-agencies' ),
    ),
    // E-commerce & DTC
    'ecommerce-dtc' => array(
        array( 'title' => 'Emerging DTC Brands',           'slug' => 'emerging-dtc-brands' ),
        array( 'title' => 'Subscription & Lifestyle',      'slug' => 'subscription-lifestyle' ),
        array( 'title' => 'Marketplaces & Platforms',      'slug' => 'marketplaces-platforms' ),
    ),
    // Professional Services
    'professional-services' => array(
        array( 'title' => 'Financial Advisors',            'slug' => 'financial-advisors' ),
        array( 'title' => 'Boutique Law Firms',            'slug' => 'boutique-law-firms' ),
        array( 'title' => 'Management Consultancies',      'slug' => 'management-consultancies' ),
    ),
);

foreach ( $sub_industries as $industry_slug => $pages ) {
    $parent = $industry_ids[ $industry_slug ] ?? 0;
    foreach ( $pages as $page ) {
        bluu_ensure_page( $page['title'], $page['slug'], 'page-subindustry.php', $parent );
    }
}

// ── 4. Use-case pages ─────────────────────────────────────────────────────────
echo "\n[Use-case pages]\n";

$use_cases = array(
    // Tech & SaaS
    'tech-saas' => array(
        array( 'title' => 'Competitor Intelligence',       'slug' => 'competitor-intelligence' ),
        array( 'title' => 'Founder Brand Building',        'slug' => 'founder-brand' ),
        array( 'title' => 'Content Repurposing Engine',    'slug' => 'content-repurposing' ),
        array( 'title' => 'Product Launch Content',        'slug' => 'product-launch-content' ),
    ),
    // Agencies & Consultants
    'agencies-consultants' => array(
        array( 'title' => 'Own-brand Content',             'slug' => 'own-brand-content' ),
        array( 'title' => 'Thought Leadership',            'slug' => 'thought-leadership' ),
        array( 'title' => 'White-label Content Production','slug' => 'white-label-production' ),
        array( 'title' => 'New Service Launch',            'slug' => 'service-launch' ),
    ),
    // E-commerce & DTC
    'ecommerce-dtc' => array(
        array( 'title' => 'Brand Storytelling',            'slug' => 'brand-storytelling' ),
        array( 'title' => 'Product & Collection Content',  'slug' => 'product-content' ),
        array( 'title' => 'Email & Newsletter Programme',  'slug' => 'email-newsletter' ),
        array( 'title' => 'Market Trend Intelligence',     'slug' => 'market-intelligence' ),
    ),
    // Professional Services
    'professional-services' => array(
        array( 'title' => 'Expert Commentary',             'slug' => 'expert-commentary' ),
        array( 'title' => 'Client Education Content',      'slug' => 'client-education' ),
        array( 'title' => 'Referral & Trust Content',      'slug' => 'referral-trust-content' ),
        array( 'title' => 'LinkedIn Authority',            'slug' => 'linkedin-authority' ),
    ),
);

foreach ( $use_cases as $industry_slug => $pages ) {
    $parent = $industry_ids[ $industry_slug ] ?? 0;
    foreach ( $pages as $page ) {
        bluu_ensure_page( $page['title'], $page['slug'], 'page-usecase.php', $parent );
    }
}

// ── Summary ───────────────────────────────────────────────────────────────────
echo "\n────────────────────────────────────\n";
echo "Done. Created: {$created} | Already existed: {$skipped}\n";
echo "────────────────────────────────────\n\n";
echo "URL structure:\n";
echo "  /industries/\n";
echo "  /industries/tech-saas/\n";
echo "  /industries/tech-saas/seed-series-a/\n";
echo "  /industries/tech-saas/competitor-intelligence/\n";
echo "  (and so on for all 4 industries + 18 sub-industries + 16 use cases)\n\n";
