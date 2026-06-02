<?php
/**
 * Bluu Interactive — Page Seeder Admin Tool
 *
 * Registers a page under Tools > Bluu Seeder in WordPress admin.
 *
 * @package bluu-interactive
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'admin_menu', 'bluu_seeder_register_page' );

function bluu_seeder_register_page() {
    add_management_page(
        'Bluu Page Seeder',
        'Bluu Seeder',
        'manage_options',
        'bluu-seeder',
        'bluu_seeder_render_page'
    );
}

/**
 * SEO data for all pages. Keyed by slug.
 * Each entry: [ 'title' => rank_math_title, 'desc' => rank_math_description ]
 */
function bluu_seeder_seo_data() {
    return array(
        // Hub
        'industries'               => array( 'title' => 'Content Operations by Industry | Bluu Interactive',                              'desc' => 'Bluu Interactive runs fully managed content retainers for SaaS startups, agencies, e-commerce brands, and professional services firms. See which industry fits.' ),
        // Industries
        'tech-saas'                => array( 'title' => 'Content Operations for Tech & SaaS Startups | Bluu Interactive',                 'desc' => 'Bluu runs your entire content operation — competitor intelligence, founder brand, and long-form content — on a flat monthly retainer built for SaaS teams.' ),
        'agencies-consultants'     => array( 'title' => 'Content Operations for Agencies & Consultants | Bluu Interactive',               'desc' => 'Managed content retainers for agencies and consultancies. Own-brand content, thought leadership, and white-label production — all done for you every month.' ),
        'ecommerce-dtc'            => array( 'title' => 'Content Operations for E-commerce & DTC Brands | Bluu Interactive',              'desc' => 'Bluu runs brand storytelling, product content, email programmes, and market intelligence for growing DTC brands — one flat monthly retainer.' ),
        'professional-services'    => array( 'title' => 'Content Operations for Professional Services Firms | Bluu Interactive',           'desc' => 'Expert commentary, client education, referral content, and LinkedIn authority — Bluu delivers a complete content operation for professional services firms.' ),
        // Sub-industries — Tech & SaaS
        'seed-series-a'            => array( 'title' => 'Content Operations for Seed to Series A Startups | Bluu Interactive',            'desc' => 'Early-stage SaaS founders: get a fully managed content operation covering competitor intelligence, founder LinkedIn, and long-form content from day one.' ),
        'b2b-saas-growth'          => array( 'title' => 'B2B SaaS Content Marketing & Growth Content | Bluu Interactive',                 'desc' => 'Managed B2B SaaS content for growth-stage teams — SEO articles, thought leadership, product launches, and weekly competitor digests on one retainer.' ),
        'no-code-ai-startups'      => array( 'title' => 'Content Operations for No-Code & AI Startups | Bluu Interactive',                'desc' => 'No-code and AI startup content — founder brand building, category education, and competitor monitoring handled entirely by Bluu on a flat monthly retainer.' ),
        'developer-tools'          => array( 'title' => 'Content Operations for Developer Tools Companies | Bluu Interactive',             'desc' => 'Technical content, developer-focused thought leadership, and competitor intelligence for developer tools companies — all on one managed monthly retainer.' ),
        // Sub-industries — Agencies & Consultants
        'marketing-consultants'    => array( 'title' => 'Content Operations for Marketing Consultants | Bluu Interactive',                 'desc' => 'Marketing consultants: grow your own brand while you grow your clients\' — Bluu manages your thought leadership, case studies, and LinkedIn content every month.' ),
        'branding-design-studios'  => array( 'title' => 'Content Operations for Branding & Design Studios | Bluu Interactive',            'desc' => 'Branding and design studios: showcase your work and thinking with consistent content — Bluu manages portfolio content, thought leadership, and LinkedIn presence.' ),
        'pr-communications'        => array( 'title' => 'Content Operations for PR & Comms Agencies | Bluu Interactive',                  'desc' => 'PR and communications agencies: let Bluu manage your own content — commentary, thought leadership, and industry intelligence — while you focus on client work.' ),
        'strategy-consultants'     => array( 'title' => 'Content Operations for Strategy Consultants | Bluu Interactive',                  'desc' => 'Strategy consultants: build the authority your expertise deserves — Bluu runs your content operation with a monthly retainer covering thought leadership and LinkedIn.' ),
        'recruitment-consultants'  => array( 'title' => 'Content Operations for Recruitment Consultants | Bluu Interactive',               'desc' => 'Recruitment consultants: attract better clients and candidates with consistent content — Bluu manages your thought leadership, LinkedIn, and market commentary.' ),
        'business-coaches'         => array( 'title' => 'Content Operations for Business Coaches | Bluu Interactive',                      'desc' => 'Business coaches: build an audience and fill your pipeline with consistent content — Bluu manages your LinkedIn, long-form articles, and newsletter every month.' ),
        'paid-media-agencies'      => array( 'title' => 'Content Operations for Paid Media Agencies | Bluu Interactive',                   'desc' => 'Paid media agencies: Bluu handles your organic content operation so you can focus on client campaigns — thought leadership, LinkedIn, and industry commentary covered.' ),
        'full-service-agencies'    => array( 'title' => 'Content Operations for Full-Service Agencies | Bluu Interactive',                 'desc' => 'Full-service agencies: run your own content operation as well as you run your clients\' — Bluu delivers owned content on a flat monthly retainer.' ),
        // Sub-industries — E-commerce & DTC
        'emerging-dtc-brands'      => array( 'title' => 'Content Operations for Emerging DTC Brands | Bluu Interactive',                  'desc' => 'Emerging DTC brands: build brand awareness and drive repeat purchase with consistent content — Bluu manages storytelling, product content, and email on one retainer.' ),
        'subscription-lifestyle'   => array( 'title' => 'Content Operations for Subscription & Lifestyle Brands | Bluu Interactive',      'desc' => 'Subscription and lifestyle brands: Bluu manages your brand content — storytelling, email programmes, and market intelligence — on a flat monthly retainer.' ),
        'marketplaces-platforms'   => array( 'title' => 'Content Operations for Marketplaces & Platforms | Bluu Interactive',             'desc' => 'Marketplace and platform content — category education, seller storytelling, and trend intelligence — all managed by Bluu on a single monthly retainer.' ),
        // Sub-industries — Professional Services
        'financial-advisors'       => array( 'title' => 'Content Operations for Financial Advisors | Bluu Interactive',                   'desc' => 'Financial advisors: build trust and attract ideal clients with expert-led content — Bluu manages your thought leadership, LinkedIn, and client education every month.' ),
        'boutique-law-firms'       => array( 'title' => 'Content Marketing for Boutique Law Firms | Bluu Interactive',                    'desc' => 'Boutique law firms: grow visibility and referrals with consistent expert content — Bluu manages commentary, client education, and LinkedIn on a flat monthly retainer.' ),
        'management-consultancies' => array( 'title' => 'Content Operations for Management Consultancies | Bluu Interactive',              'desc' => 'Management consultancies: convert your expertise into a consistent content presence — Bluu manages thought leadership, LinkedIn, and client-facing content monthly.' ),
        // Use cases — Tech & SaaS
        'competitor-intelligence'  => array( 'title' => 'Competitor Intelligence for SaaS Startups | Bluu Interactive',                   'desc' => 'Weekly competitor monitoring delivered as a structured digest — content output, messaging shifts, and positioning changes tracked every week. Included in your retainer.' ),
        'founder-brand'            => array( 'title' => 'Founder Brand Building on LinkedIn | Bluu Interactive',                          'desc' => 'Consistent LinkedIn content written in your voice — opinions, market commentary, and product perspective published every week without taking time from your schedule.' ),
        'content-repurposing'      => array( 'title' => 'Content Repurposing Engine for SaaS Teams | Bluu Interactive',                   'desc' => 'Turn one piece of long-form content into LinkedIn posts, newsletter sections, X threads, and social captions — Bluu manages the entire repurposing engine monthly.' ),
        'product-launch-content'   => array( 'title' => 'Product Launch Content Packages for SaaS | Bluu Interactive',                    'desc' => 'A complete content package for every product launch — blog post, email, LinkedIn posts, X thread, and social captions — ready before your launch date.' ),
        // Use cases — Agencies & Consultants
        'own-brand-content'        => array( 'title' => 'Own-Brand Content for Agencies & Consultants | Bluu Interactive',                'desc' => 'Stop putting your own content last — Bluu manages your agency\'s thought leadership, case studies, and LinkedIn presence on a flat monthly retainer.' ),
        'thought-leadership'       => array( 'title' => 'Thought Leadership Content for Agencies | Bluu Interactive',                     'desc' => 'Expert-led thought leadership content written for your principals — LinkedIn articles, opinion pieces, and industry commentary published consistently every month.' ),
        'white-label-production'   => array( 'title' => 'White-Label Content Production for Agencies | Bluu Interactive',                 'desc' => 'Bluu produces client-ready content under your brand — blog posts, reports, email campaigns, and social content delivered to your brief, style, and timeline.' ),
        'service-launch'           => array( 'title' => 'New Service Launch Content for Agencies | Bluu Interactive',                     'desc' => 'Launch a new service with a complete content package — positioning copy, LinkedIn posts, email announcement, case study template, and sales enablement content.' ),
        // Use cases — E-commerce & DTC
        'brand-storytelling'       => array( 'title' => 'Brand Storytelling Content for DTC Brands | Bluu Interactive',                   'desc' => 'Build brand affinity and repeat purchase with consistent storytelling — Bluu manages your founder story, mission content, and community narrative every month.' ),
        'product-content'          => array( 'title' => 'Product & Collection Content for E-commerce Brands | Bluu Interactive',          'desc' => 'SEO-optimised product descriptions, collection page copy, and launch content for every new product — built to drive search visibility and convert browsers.' ),
        'email-newsletter'         => array( 'title' => 'Email & Newsletter Programme for DTC Brands | Bluu Interactive',                 'desc' => 'A fully managed monthly email programme — campaign strategy, copywriting, and send scheduling handled by Bluu to drive repeat purchase and customer retention.' ),
        'market-intelligence'      => array( 'title' => 'Market Trend Intelligence for E-commerce Brands | Bluu Interactive',             'desc' => 'Weekly market trend monitoring across your category — competitor activity, consumer behaviour shifts, and emerging opportunities delivered as a structured digest.' ),
        // Use cases — Professional Services
        'expert-commentary'        => array( 'title' => 'Expert Commentary Content for Professional Services | Bluu Interactive',          'desc' => 'Regular expert commentary on industry news and regulatory changes — Bluu turns your knowledge into timely, search-ready content that builds authority and referrals.' ),
        'client-education'         => array( 'title' => 'Client Education Content for Professional Services | Bluu Interactive',           'desc' => 'Build trust and reduce sales friction with educational content — guides, explainers, and FAQ content that positions you as the expert before a client meets you.' ),
        'referral-trust-content'   => array( 'title' => 'Referral & Trust Content for Professional Services | Bluu Interactive',          'desc' => 'Case studies, testimonial frameworks, and trust-building content that make referrals easy and convert warm introductions into signed clients.' ),
        'linkedin-authority'       => array( 'title' => 'LinkedIn Authority Building for Professional Services | Bluu Interactive',        'desc' => 'Consistent LinkedIn content written in your voice — expert opinions, client wins, and market commentary published every week to grow your professional authority.' ),
    );
}

/**
 * Ensure a page exists with the given slug + parent.
 * Returns array( 'id' => int, 'action' => 'created'|'updated'|'exists' ).
 */
function bluu_seeder_ensure_page( $title, $slug, $template, $parent_id = 0 ) {
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
            return array( 'id' => $post_id, 'action' => 'updated', 'slug' => $slug, 'title' => $title );
        }
        return array( 'id' => $post_id, 'action' => 'exists', 'slug' => $slug, 'title' => $title );
    }

    $post_id = wp_insert_post( array(
        'post_title'  => $title,
        'post_name'   => $slug,
        'post_status' => 'publish',
        'post_type'   => 'page',
        'post_parent' => $parent_id,
    ), true );

    if ( is_wp_error( $post_id ) ) {
        return array( 'id' => 0, 'action' => 'error', 'slug' => $slug, 'title' => $title, 'error' => $post_id->get_error_message() );
    }

    update_post_meta( $post_id, '_wp_page_template', $template );
    return array( 'id' => $post_id, 'action' => 'created', 'slug' => $slug, 'title' => $title );
}

function bluu_seeder_run() {
    $results = array();

    // ── 1. Industries hub ─────────────────────────────────────────────────────
    $r        = bluu_seeder_ensure_page( 'Industries', 'industries', 'page-industries.php', 0 );
    $hub_id   = $r['id'];
    $results[] = array_merge( $r, array( 'group' => 'Hub' ) );

    // ── 2. Industry pages ─────────────────────────────────────────────────────
    $industries = array(
        array( 'title' => 'Tech & SaaS',            'slug' => 'tech-saas' ),
        array( 'title' => 'Agencies & Consultants',  'slug' => 'agencies-consultants' ),
        array( 'title' => 'E-commerce & DTC',        'slug' => 'ecommerce-dtc' ),
        array( 'title' => 'Professional Services',   'slug' => 'professional-services' ),
    );
    $industry_ids = array();
    foreach ( $industries as $ind ) {
        $r = bluu_seeder_ensure_page( $ind['title'], $ind['slug'], 'page-industry.php', $hub_id );
        $industry_ids[ $ind['slug'] ] = $r['id'];
        $results[] = array_merge( $r, array( 'group' => 'Industry' ) );
    }

    // ── 3. Sub-industry pages ─────────────────────────────────────────────────
    $sub_industries = array(
        'tech-saas' => array(
            array( 'title' => 'Seed to Series A',          'slug' => 'seed-series-a' ),
            array( 'title' => 'B2B SaaS Growth',           'slug' => 'b2b-saas-growth' ),
            array( 'title' => 'No-code & AI Startups',     'slug' => 'no-code-ai-startups' ),
            array( 'title' => 'Developer Tools',           'slug' => 'developer-tools' ),
        ),
        'agencies-consultants' => array(
            array( 'title' => 'Marketing Consultants',     'slug' => 'marketing-consultants' ),
            array( 'title' => 'Branding & Design Studios', 'slug' => 'branding-design-studios' ),
            array( 'title' => 'PR & Communications',       'slug' => 'pr-communications' ),
            array( 'title' => 'Strategy Consultants',      'slug' => 'strategy-consultants' ),
            array( 'title' => 'Recruitment Consultants',   'slug' => 'recruitment-consultants' ),
            array( 'title' => 'Business Coaches',          'slug' => 'business-coaches' ),
            array( 'title' => 'Paid Media Agencies',       'slug' => 'paid-media-agencies' ),
            array( 'title' => 'Full-service Agencies',     'slug' => 'full-service-agencies' ),
        ),
        'ecommerce-dtc' => array(
            array( 'title' => 'Emerging DTC Brands',       'slug' => 'emerging-dtc-brands' ),
            array( 'title' => 'Subscription & Lifestyle',  'slug' => 'subscription-lifestyle' ),
            array( 'title' => 'Marketplaces & Platforms',  'slug' => 'marketplaces-platforms' ),
        ),
        'professional-services' => array(
            array( 'title' => 'Financial Advisors',        'slug' => 'financial-advisors' ),
            array( 'title' => 'Boutique Law Firms',        'slug' => 'boutique-law-firms' ),
            array( 'title' => 'Management Consultancies',  'slug' => 'management-consultancies' ),
        ),
    );
    foreach ( $sub_industries as $industry_slug => $pages ) {
        $parent = $industry_ids[ $industry_slug ] ?? 0;
        foreach ( $pages as $page ) {
            $r = bluu_seeder_ensure_page( $page['title'], $page['slug'], 'page-subindustry.php', $parent );
            $results[] = array_merge( $r, array( 'group' => 'Sub-industry' ) );
        }
    }

    // ── 4. Use-case pages ─────────────────────────────────────────────────────
    $use_cases = array(
        'tech-saas' => array(
            array( 'title' => 'Competitor Intelligence',        'slug' => 'competitor-intelligence' ),
            array( 'title' => 'Founder Brand Building',         'slug' => 'founder-brand' ),
            array( 'title' => 'Content Repurposing Engine',     'slug' => 'content-repurposing' ),
            array( 'title' => 'Product Launch Content',         'slug' => 'product-launch-content' ),
        ),
        'agencies-consultants' => array(
            array( 'title' => 'Own-brand Content',              'slug' => 'own-brand-content' ),
            array( 'title' => 'Thought Leadership',             'slug' => 'thought-leadership' ),
            array( 'title' => 'White-label Content Production', 'slug' => 'white-label-production' ),
            array( 'title' => 'New Service Launch',             'slug' => 'service-launch' ),
        ),
        'ecommerce-dtc' => array(
            array( 'title' => 'Brand Storytelling',             'slug' => 'brand-storytelling' ),
            array( 'title' => 'Product & Collection Content',   'slug' => 'product-content' ),
            array( 'title' => 'Email & Newsletter Programme',   'slug' => 'email-newsletter' ),
            array( 'title' => 'Market Trend Intelligence',      'slug' => 'market-intelligence' ),
        ),
        'professional-services' => array(
            array( 'title' => 'Expert Commentary',              'slug' => 'expert-commentary' ),
            array( 'title' => 'Client Education Content',       'slug' => 'client-education' ),
            array( 'title' => 'Referral & Trust Content',       'slug' => 'referral-trust-content' ),
            array( 'title' => 'LinkedIn Authority',             'slug' => 'linkedin-authority' ),
        ),
    );
    foreach ( $use_cases as $industry_slug => $pages ) {
        $parent = $industry_ids[ $industry_slug ] ?? 0;
        foreach ( $pages as $page ) {
            $r = bluu_seeder_ensure_page( $page['title'], $page['slug'], 'page-usecase.php', $parent );
            $results[] = array_merge( $r, array( 'group' => 'Use Case' ) );
        }
    }

    // ── 5. Apply Rank Math SEO titles + meta descriptions ─────────────────────
    $seo_data    = bluu_seeder_seo_data();
    $seo_updated = 0;
    foreach ( $results as $r ) {
        if ( ! $r['id'] || ! isset( $seo_data[ $r['slug'] ] ) ) continue;
        update_post_meta( $r['id'], 'rank_math_title',       $seo_data[ $r['slug'] ]['title'] );
        update_post_meta( $r['id'], 'rank_math_description', $seo_data[ $r['slug'] ]['desc']  );
        $seo_updated++;
    }
    $results[] = array( 'group' => '_seo_count', 'seo_updated' => $seo_updated );

    return $results;
}

/**
 * Apply Rank Math SEO fields to all existing industry/sub-industry/use-case
 * pages without re-creating them. Safe to run repeatedly.
 */
function bluu_seeder_apply_seo() {
    $seo_data = bluu_seeder_seo_data();
    $updated  = 0;
    $missing  = 0;

    foreach ( $seo_data as $slug => $copy ) {
        $pages = get_posts( array(
            'name'        => $slug,
            'post_type'   => 'page',
            'post_status' => array( 'publish', 'draft' ),
            'numberposts' => 1,
        ) );
        if ( ! $pages ) { $missing++; continue; }
        update_post_meta( $pages[0]->ID, 'rank_math_title',       $copy['title'] );
        update_post_meta( $pages[0]->ID, 'rank_math_description', $copy['desc']  );
        $updated++;
    }

    return array( 'updated' => $updated, 'missing' => $missing );
}

function bluu_seeder_render_page() {
    $results      = null;
    $faq_result   = null;
    $nonce_action = 'bluu_run_seeder';

    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'Insufficient permissions.' );
    }

    if ( isset( $_POST['bluu_run_seeder'] ) && check_admin_referer( $nonce_action ) ) {
        $results = bluu_seeder_run();
    }

    $seo_result = null;
    if ( isset( $_POST['bluu_run_seo'] ) && check_admin_referer( $nonce_action ) ) {
        $seo_result = bluu_seeder_apply_seo();
    }

    if ( isset( $_POST['bluu_run_faq_seeder'] ) && check_admin_referer( $nonce_action ) ) {
        ob_start();
        require_once get_template_directory() . '/inc/faq-seeder.php';
        $faq_result = ob_get_clean();
    }

    $counts = array( 'created' => 0, 'updated' => 0, 'exists' => 0, 'error' => 0 );
    if ( $results ) {
        foreach ( $results as $r ) {
            $counts[ $r['action'] ] = ( $counts[ $r['action'] ] ?? 0 ) + 1;
        }
    }
    ?>
    <div class="wrap">
        <h1>Bluu Page Seeder</h1>
        <p>Creates the full industry → sub-industry → use case page hierarchy with the correct slugs, templates, and parent/child relationships. Safe to run multiple times — existing pages are skipped.</p>

        <h2 style="margin-top:1.5em">Page structure</h2>
        <table class="widefat striped" style="max-width:640px">
            <thead><tr><th>Type</th><th>Count</th><th>Slugs</th></tr></thead>
            <tbody>
                <tr><td>Industries hub</td><td>1</td><td><code>/industries/</code></td></tr>
                <tr><td>Industry pages</td><td>4</td><td><code>tech-saas</code>, <code>agencies-consultants</code>, <code>ecommerce-dtc</code>, <code>professional-services</code></td></tr>
                <tr><td>Sub-industry pages</td><td>18</td><td>seed-series-a, b2b-saas-growth, no-code-ai-startups, developer-tools, marketing-consultants, branding-design-studios, pr-communications, strategy-consultants, recruitment-consultants, business-coaches, paid-media-agencies, full-service-agencies, emerging-dtc-brands, subscription-lifestyle, marketplaces-platforms, financial-advisors, boutique-law-firms, management-consultancies</td></tr>
                <tr><td>Use case pages</td><td>16</td><td>competitor-intelligence, founder-brand, content-repurposing, product-launch-content, own-brand-content, thought-leadership, white-label-production, service-launch, brand-storytelling, product-content, email-newsletter, market-intelligence, expert-commentary, client-education, referral-trust-content, linkedin-authority</td></tr>
            </tbody>
        </table>

        <?php if ( $results ) : ?>
            <h2 style="margin-top:2em">Result</h2>
            <p>
                <?php if ( $counts['created'] ) : ?>
                    <span style="color:#00a32a;font-weight:600">✓ <?php echo $counts['created']; ?> created</span>&emsp;
                <?php endif; ?>
                <?php if ( $counts['updated'] ) : ?>
                    <span style="color:#2271b1;font-weight:600">↻ <?php echo $counts['updated']; ?> template updated</span>&emsp;
                <?php endif; ?>
                <?php if ( $counts['exists'] ) : ?>
                    <span style="color:#666">— <?php echo $counts['exists']; ?> already existed</span>&emsp;
                <?php endif; ?>
                <?php if ( $counts['error'] ) : ?>
                    <span style="color:#d63638;font-weight:600">✗ <?php echo $counts['error']; ?> errors</span>
                <?php endif; ?>
            </p>
            <table class="widefat striped" style="max-width:800px;margin-top:1em">
                <thead>
                    <tr>
                        <th>Group</th>
                        <th>Title</th>
                        <th>Slug</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ( $results as $r ) :
                        $colour = array(
                            'created' => '#00a32a',
                            'updated' => '#2271b1',
                            'exists'  => '#666',
                            'error'   => '#d63638',
                        )[ $r['action'] ] ?? '#333';
                        $label = array(
                            'created' => '✓ Created',
                            'updated' => '↻ Template updated',
                            'exists'  => '— Already exists',
                            'error'   => '✗ Error',
                        )[ $r['action'] ] ?? $r['action'];
                    ?>
                    <tr>
                        <td><?php echo esc_html( $r['group'] ); ?></td>
                        <td>
                            <?php if ( $r['id'] ) : ?>
                                <a href="<?php echo esc_url( get_edit_post_link( $r['id'] ) ); ?>" target="_blank"><?php echo esc_html( $r['title'] ); ?></a>
                            <?php else : ?>
                                <?php echo esc_html( $r['title'] ); ?>
                            <?php endif; ?>
                        </td>
                        <td><code><?php echo esc_html( $r['slug'] ); ?></code></td>
                        <td style="color:<?php echo $colour; ?>;font-weight:600"><?php echo $label; ?><?php if ( isset( $r['error'] ) ) echo ': ' . esc_html( $r['error'] ); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>

            <?php if ( ! $counts['error'] ) : ?>
                <p style="margin-top:1em">
                    <a href="<?php echo esc_url( home_url( '/industries/' ) ); ?>" target="_blank" class="button button-secondary">View /industries/ →</a>
                    &nbsp;
                    <a href="<?php echo esc_url( admin_url( 'edit.php?post_type=page' ) ); ?>" class="button button-secondary">View all pages</a>
                </p>
            <?php endif; ?>

        <?php endif; ?>

        <h2 style="margin-top:2em"><?php echo $results ? 'Run again' : 'Run seeder'; ?></h2>
        <p>All pages are created with status <strong>Published</strong>. Content is pre-populated from the page template based on slug — no ACF entry needed.</p>
        <form method="post">
            <?php wp_nonce_field( $nonce_action ); ?>
            <input type="hidden" name="bluu_run_seeder" value="1">
            <?php submit_button( $results ? 'Run seeder again' : 'Create all pages now', 'primary large' ); ?>
        </form>

        <hr style="margin:2.5em 0">

        <h2>SEO Titles & Meta Descriptions</h2>
        <p>Writes Rank Math SEO titles and meta descriptions directly to all 39 industry, sub-industry, and use-case pages. Safe to run multiple times — it overwrites with the latest copy each time. Run this if pages exist but titles still look short in search results.</p>

        <?php if ( $seo_result ) : ?>
            <div style="background:#f0f6e4;border-left:4px solid #00a32a;padding:1em 1.5em;max-width:640px;margin-bottom:1.5em">
                <strong style="color:#00a32a">✓ SEO fields updated on <?php echo intval( $seo_result['updated'] ); ?> pages.</strong>
                <?php if ( $seo_result['missing'] ) : ?>
                    <br><span style="color:#d63638"><?php echo intval( $seo_result['missing'] ); ?> slugs not found — run the page seeder first.</span>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <form method="post">
            <?php wp_nonce_field( $nonce_action ); ?>
            <input type="hidden" name="bluu_run_seo" value="1">
            <?php submit_button( 'Apply SEO titles & descriptions now', 'primary large' ); ?>
        </form>

        <hr style="margin:2.5em 0">

        <h2>FAQ Content Seeder</h2>
        <p>Clears all existing FAQ ACF data and writes the current Bluu-approved FAQ content (6 categories, 33 questions). <strong>This is destructive</strong> — any manually entered FAQ content will be replaced. Run this after clearing old FAQ entries.</p>

        <?php if ( $faq_result ) : ?>
            <div style="background:#f0f6e4;border-left:4px solid #00a32a;padding:1em 1.5em;max-width:640px;margin-bottom:1.5em">
                <strong>FAQ seeder output:</strong>
                <pre style="margin:0.5em 0 0;white-space:pre-wrap;font-size:13px"><?php echo esc_html( $faq_result ); ?></pre>
            </div>
        <?php endif; ?>

        <form method="post">
            <?php wp_nonce_field( $nonce_action ); ?>
            <input type="hidden" name="bluu_run_faq_seeder" value="1">
            <?php submit_button( 'Seed FAQ content now', 'secondary large' ); ?>
        </form>

    </div>
    <?php
}
