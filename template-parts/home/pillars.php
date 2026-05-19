<?php
/**
 * Home Pillars Section
 *
 * @package bluu-interactive
 */

$solution_badge    = function_exists( 'get_field' ) ? get_field( 'solution_badge' )    : '';
$solution_headline = function_exists( 'get_field' ) ? get_field( 'solution_headline' ) : '';
$solution_body     = function_exists( 'get_field' ) ? get_field( 'solution_body' )     : '';
$pillars           = function_exists( 'get_field' ) ? get_field( 'pillars' )            : array();

// Defaults
$solution_badge    = $solution_badge    ?: 'The Solution';
$solution_headline = $solution_headline ?: 'One Team. Three Engines. Total Growth.';
$solution_body     = $solution_body     ?: 'Bluu Interactive unifies web infrastructure, authority content, and sales assets under one synchronized strategy — so every touchpoint works together.';

if ( empty( $pillars ) ) {
    $pillars = array(
        array(
            'pillar_icon'        => 'server',
            'pillar_label'       => 'Pillar 1 — The Hub',
            'pillar_title'       => 'Managed Digital Infrastructure',
            'pillar_description' => 'Your website is the hub of all growth activity. We own it end-to-end: architecture, performance, CRO, and technical SEO — so it\'s always working for your pipeline, not against it.',
            'pillar_feature_1'   => 'Conversion-optimized web architecture',
            'pillar_feature_2'   => 'Technical SEO & Core Web Vitals ownership',
            'pillar_feature_3'   => 'Continuous performance & uptime monitoring',
        ),
        array(
            'pillar_icon'        => 'trending-up',
            'pillar_label'       => 'Pillar 2 — The Traffic',
            'pillar_title'       => 'SME-Driven Authority Content',
            'pillar_description' => 'Generic content doesn\'t win in regulated industries. We produce SME-verified, compliance-aware articles and assets that rank for real buying-intent keywords and build genuine authority.',
            'pillar_feature_1'   => 'Subject-matter expert interviews & verification',
            'pillar_feature_2'   => 'Long-form authority articles (2,000–5,000 words)',
            'pillar_feature_3'   => 'Topic clusters that dominate SERP real estate',
        ),
        array(
            'pillar_icon'        => 'briefcase',
            'pillar_label'       => 'Pillar 3 — The Conversion',
            'pillar_title'       => 'Strategic Sales Assets',
            'pillar_description' => 'Your sales team needs more than slide decks. We produce case studies, battle cards, and proof assets that address real objections at every deal stage — delivered fast.',
            'pillar_feature_1'   => 'Premium case studies in 48 hours',
            'pillar_feature_2'   => 'Objection-mapped battle cards & one-pagers',
            'pillar_feature_3'   => 'Deal-stage aligned sales content library',
        ),
    );
}

// Accent colors per pillar
$pillar_colors = array( '#1A73E8', '#137333', '#0D47A1' );

/**
 * Returns inline SVG for a pillar icon name.
 */
function bluu_get_pillar_icon( $icon_name ) {
    switch ( $icon_name ) {
        case 'server':
            return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>';
        case 'trending-up':
            return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>';
        case 'briefcase':
        default:
            return '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>';
    }
}
?>

<section class="section pillars-section" id="pillars" aria-label="<?php esc_attr_e( 'Our Three Pillars', 'bluu-interactive' ); ?>">
    <div class="container">

        <!-- Section Header -->
        <div class="section__header section__header--center">
            <div class="md-chip animate-on-scroll">
                <?php echo esc_html( $solution_badge ); ?>
            </div>
            <h2 class="section__headline animate-on-scroll"><?php echo esc_html( $solution_headline ); ?></h2>
            <p class="section__body animate-on-scroll"><?php echo esc_html( $solution_body ); ?></p>
        </div>

        <!-- Pillar Cards -->
        <div class="pillars-section__grid grid-3">
            <?php foreach ( $pillars as $index => $pillar ) :
                $accent_color = $pillar_colors[ $index % count( $pillar_colors ) ];
                $features = array(
                    $pillar['pillar_feature_1'] ?? '',
                    $pillar['pillar_feature_2'] ?? '',
                    $pillar['pillar_feature_3'] ?? '',
                );
                $features = array_filter( $features );
            ?>
                <article
                    class="pillar-card md-card animate-on-scroll"
                    style="--pillar-accent: <?php echo esc_attr( $accent_color ); ?>;"
                    aria-label="<?php echo esc_attr( $pillar['pillar_title'] ); ?>"
                >
                    <div class="pillar-card__accent-bar" aria-hidden="true" style="background-color: <?php echo esc_attr( $accent_color ); ?>;"></div>

                    <div class="pillar-card__body">
                        <div class="pillar-card__icon" style="color: <?php echo esc_attr( $accent_color ); ?>;" aria-hidden="true">
                            <?php echo bluu_get_pillar_icon( $pillar['pillar_icon'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                        </div>

                        <div class="md-chip md-chip--colored pillar-card__label" style="background-color: <?php echo esc_attr( $accent_color ); ?>20; color: <?php echo esc_attr( $accent_color ); ?>;">
                            <?php echo esc_html( $pillar['pillar_label'] ); ?>
                        </div>

                        <h3 class="pillar-card__title"><?php echo esc_html( $pillar['pillar_title'] ); ?></h3>
                        <p class="pillar-card__description"><?php echo esc_html( $pillar['pillar_description'] ); ?></p>

                        <?php if ( ! empty( $features ) ) : ?>
                            <ul class="pillar-card__features" aria-label="<?php esc_attr_e( 'Features', 'bluu-interactive' ); ?>">
                                <?php foreach ( $features as $feature ) : ?>
                                    <li class="pillar-card__feature">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="<?php echo esc_attr( $accent_color ); ?>" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                        <?php echo esc_html( $feature ); ?>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        <?php endif; ?>
                    </div><!-- /.pillar-card__body -->
                </article>
            <?php endforeach; ?>
        </div><!-- /.pillars-section__grid -->

    </div><!-- /.container -->
</section>
