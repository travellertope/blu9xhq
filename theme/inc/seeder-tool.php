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

    return $results;
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
