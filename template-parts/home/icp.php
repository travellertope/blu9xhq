<?php
/**
 * Home ICP / Who We Serve Section
 *
 * @package bluu-interactive
 */

$icp_badge      = function_exists( 'get_field' ) ? get_field( 'icp_badge' )      : '';
$icp_headline   = function_exists( 'get_field' ) ? get_field( 'icp_headline' )   : '';
$icp_body       = function_exists( 'get_field' ) ? get_field( 'icp_body' )       : '';
$icp_verticals  = function_exists( 'get_field' ) ? get_field( 'icp_verticals' )  : array();

// Defaults
$icp_badge     = $icp_badge     ?: 'Who We Serve';
$icp_headline  = $icp_headline  ?: 'Built for $2M–$50M B2B Companies';
$icp_body      = $icp_body      ?: 'We focus exclusively on industries where expertise, trust, and precision are non-negotiable. If your buyers demand authority, we\'re built for you.';

if ( empty( $icp_verticals ) ) {
    $icp_verticals = array(
        array(
            'icon'        => 'zap',
            'title'       => 'B2B SaaS',
            'description' => 'Category leaders know that content compounds. We help SaaS companies dominate their niche with authority content that attracts decision-makers and converts on intent.',
        ),
        array(
            'icon'        => 'heart',
            'title'       => 'Healthcare & Healthtech',
            'description' => 'HIPAA awareness and clinical accuracy aren\'t optional. Our SME-verified content builds trust with healthcare buyers while navigating compliance guardrails.',
        ),
        array(
            'icon'        => 'scale',
            'title'       => 'Legal & Finance',
            'description' => 'Your buyers do extensive due diligence. We position your firm as the definitive expert through deep-research content that answers their hardest questions before they ask.',
        ),
        array(
            'icon'        => 'truck',
            'title'       => 'Logistics & Supply Chain',
            'description' => 'Buyers in logistics need proof, not promises. We produce case studies, data-driven content, and sales assets that demonstrate operational expertise at every deal stage.',
        ),
    );
}

/**
 * Returns inline SVG for an ICP icon.
 */
function bluu_get_icp_icon( $icon_name ) {
    switch ( $icon_name ) {
        case 'zap':
            return '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
        case 'heart':
            return '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
        case 'scale':
            return '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 6l9-3 9 3"/><path d="M3 10l0 2a4 4 0 0 0 8 0l0-2"/><path d="M13 10l0 2a4 4 0 0 0 8 0l0-2"/></svg>';
        case 'truck':
        default:
            return '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';
    }
}
?>

<section class="section icp-section" id="who-we-serve" aria-label="<?php esc_attr_e( 'Who We Serve', 'bluu-interactive' ); ?>">
    <div class="container">

        <!-- Section Header -->
        <div class="section__header section__header--center">
            <div class="md-chip animate-on-scroll">
                <?php echo esc_html( $icp_badge ); ?>
            </div>
            <h2 class="section__headline animate-on-scroll"><?php echo esc_html( $icp_headline ); ?></h2>
            <p class="section__body animate-on-scroll"><?php echo esc_html( $icp_body ); ?></p>
        </div>

        <!-- Vertical Cards: 2×2 grid -->
        <div class="icp-section__grid grid-2 grid-2--icp">
            <?php foreach ( $icp_verticals as $vertical ) : ?>
                <article class="icp-card md-card animate-on-scroll" aria-label="<?php echo esc_attr( $vertical['title'] ); ?>">
                    <div class="icp-card__icon" aria-hidden="true">
                        <?php echo bluu_get_icp_icon( $vertical['icon'] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
                    </div>
                    <div class="icp-card__content">
                        <h3 class="icp-card__title"><?php echo esc_html( $vertical['title'] ); ?></h3>
                        <p class="icp-card__description"><?php echo esc_html( $vertical['description'] ); ?></p>
                    </div>
                    <a
                        href="<?php echo esc_url( home_url( '/industries' ) ); ?>"
                        class="icp-card__link btn-text"
                        aria-label="<?php echo esc_attr( sprintf( __( 'Learn more about %s', 'bluu-interactive' ), $vertical['title'] ) ); ?>"
                    >
                        <?php esc_html_e( 'Learn more', 'bluu-interactive' ); ?>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                        </svg>
                    </a>
                </article>
            <?php endforeach; ?>
        </div><!-- /.icp-section__grid -->

    </div><!-- /.container -->
</section>
