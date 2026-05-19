<?php
/**
 * Home Problem Section
 *
 * @package bluu-interactive
 */

$problem_badge    = function_exists( 'get_field' ) ? get_field( 'problem_badge' )    : '';
$problem_headline = function_exists( 'get_field' ) ? get_field( 'problem_headline' ) : '';
$problem_body     = function_exists( 'get_field' ) ? get_field( 'problem_body' )     : '';
$problem_items    = function_exists( 'get_field' ) ? get_field( 'problem_items' )    : array();

// Defaults
$problem_badge    = $problem_badge    ?: 'The Problem';
$problem_headline = $problem_headline ?: 'Fragmentation Is Costing You Revenue';
$problem_body     = $problem_body     ?: 'Most B2B companies are paying 3–5 vendors who never talk to each other. The result: misaligned messaging, stalled pipeline, and a digital presence that doesn\'t convert.';

if ( empty( $problem_items ) ) {
    $problem_items = array(
        array(
            'icon'        => 'x-circle',
            'title'       => 'Your Web Team Works in a Vacuum',
            'description' => 'Your developer optimizes for uptime, not conversion. They don\'t know your sales objections or your top-converting keywords.',
        ),
        array(
            'icon'        => 'x-circle',
            'title'       => 'Your Content Doesn\'t Drive Revenue',
            'description' => 'Your SEO agency publishes generic articles that rank for nothing and convert no one — especially dangerous in regulated industries.',
        ),
        array(
            'icon'        => 'x-circle',
            'title'       => 'Your Sales Team Lacks Ammunition',
            'description' => 'Your reps ask for case studies that take months to produce, arrive in the wrong format, and don\'t address the objections they actually hear.',
        ),
    );
}

/**
 * Returns inline SVG for an icon name.
 */
function bluu_get_problem_icon( $icon_name ) {
    switch ( $icon_name ) {
        case 'x-circle':
        default:
            return '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    }
}
?>

<section class="section section--dark problem-section" id="problem" aria-label="<?php esc_attr_e( 'The Problem', 'bluu-interactive' ); ?>">
    <div class="container">

        <!-- Section Header -->
        <div class="section__header section__header--center">
            <div class="md-chip md-chip--light animate-on-scroll">
                <?php echo esc_html( $problem_badge ); ?>
            </div>
            <h2 class="section__headline animate-on-scroll"><?php echo esc_html( $problem_headline ); ?></h2>
            <p class="section__body animate-on-scroll"><?php echo esc_html( $problem_body ); ?></p>
        </div>

        <!-- Problem Cards -->
        <div class="problem-section__grid grid-3">
            <?php foreach ( $problem_items as $index => $item ) : ?>
                <article class="problem-card animate-on-scroll" aria-label="<?php echo esc_attr( $item['title'] ); ?>">
                    <div class="problem-card__icon-wrap" aria-hidden="true">
                        <?php echo bluu_get_problem_icon( $item['icon'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    </div>
                    <h3 class="problem-card__title"><?php echo esc_html( $item['title'] ); ?></h3>
                    <p class="problem-card__description"><?php echo esc_html( $item['description'] ); ?></p>

                    <!-- Visual indicator of isolation -->
                    <div class="problem-card__isolation-badge" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                        </svg>
                        <?php esc_html_e( 'Siloed', 'bluu-interactive' ); ?>
                    </div>
                </article>
            <?php endforeach; ?>
        </div>

        <!-- Transition Arrow / Bridge to Solution -->
        <div class="problem-section__bridge animate-on-scroll" aria-hidden="true">
            <div class="problem-section__bridge-line"></div>
            <div class="problem-section__bridge-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <polyline points="19 12 12 19 5 12"/>
                </svg>
            </div>
            <p class="problem-section__bridge-text"><?php esc_html_e( 'There is a better way', 'bluu-interactive' ); ?></p>
        </div>

    </div><!-- /.container -->
</section>
