<?php
/**
 * Template Name: Sub-industry / Use Case Page
 * Template Post Type: page
 *
 * Reads from the uc_* ACF field groups registered in inc/acf-fields.php.
 *
 * @package bluu-interactive
 */

$gf = function_exists( 'get_field' );

// Hero
$hero_tag   = ( $gf ? get_field( 'uc_hero_tag' )         : '' ) ?: 'Use case';
$hero_hl    = ( $gf ? get_field( 'uc_hero_headline' )     : '' ) ?: get_the_title();
$hero_sub   = ( $gf ? get_field( 'uc_hero_subheadline' )  : '' ) ?: '';
$hero_cta   = ( $gf ? get_field( 'uc_hero_cta_label' )    : '' ) ?: 'Book a Discovery Call';
$hero_url   = ( $gf ? get_field( 'uc_hero_cta_url' )      : '' ) ?: home_url( '/contact' );
$hero_img   = $gf ? get_field( 'uc_hero_image' ) : null;
if ( ! empty( $hero_img ) ) {
    $hero_img_src = is_array( $hero_img ) ? esc_url( $hero_img['url'] ) : esc_url( $hero_img );
    $hero_img_alt = is_array( $hero_img ) ? esc_attr( $hero_img['alt'] ) : '';
} else {
    $hero_img_src = 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=1200&q=80';
    $hero_img_alt = 'Team at work';
}

// Situation
$sit_heading  = ( $gf ? get_field( 'uc_situation_heading' )    : '' ) ?: 'The situation';
$sit_body     = ( $gf ? get_field( 'uc_situation_body' )       : '' ) ?: '';
$sit_pains    = ( $gf ? get_field( 'uc_situation_pain_points' ): array() ) ?: array();

// Approach
$app_heading  = ( $gf ? get_field( 'uc_approach_heading' ) : '' ) ?: 'How Bluu approaches this';
$app_body     = ( $gf ? get_field( 'uc_approach_body' )    : '' ) ?: '';
$app_steps    = ( $gf ? get_field( 'uc_approach_steps' )   : array() ) ?: array();

// Deliverables
$del_heading  = ( $gf ? get_field( 'uc_deliverables_heading' ) : '' ) ?: 'What you receive';
$del_intro    = ( $gf ? get_field( 'uc_deliverables_intro' )   : '' ) ?: '';
$del_list     = ( $gf ? get_field( 'uc_deliverables_list' )    : array() ) ?: array();
$del_cadence  = ( $gf ? get_field( 'uc_cadence' )              : '' ) ?: 'Delivered as part of your monthly retainer.';

// Fit
$fit_heading  = ( $gf ? get_field( 'uc_fit_heading' )    : '' ) ?: 'Who this is right for';
$fit_list     = ( $gf ? get_field( 'uc_fit_list' )       : array() ) ?: array();
$not_fit_note = ( $gf ? get_field( 'uc_not_fit_note' )   : '' ) ?: '';

// Related
$related      = ( $gf ? get_field( 'uc_related_pages' ) : array() ) ?: array();

// CTA
$cta_heading  = ( $gf ? get_field( 'uc_cta_heading' )         : '' ) ?: 'Ready to get started?';
$cta_sub      = ( $gf ? get_field( 'uc_cta_subtext' )         : '' ) ?: 'Book a 15-minute Discovery Call. No pitch, no pressure.';
$cta_p_label  = ( $gf ? get_field( 'uc_cta_primary_label' )   : '' ) ?: 'Book a Discovery Call';
$cta_p_url    = ( $gf ? get_field( 'uc_cta_primary_url' )     : '' ) ?: home_url( '/contact' );
$cta_s_label  = ( $gf ? get_field( 'uc_cta_secondary_label' ) : '' ) ?: 'See pricing';
$cta_s_url    = ( $gf ? get_field( 'uc_cta_secondary_url' )   : '' ) ?: home_url( '/pricing' );

// Industry selector (used to style the tag colour — optional)
$industry = ( $gf ? get_field( 'uc_industry' ) : '' ) ?: '';

get_header();
?>

<!-- ── Hero ──────────────────────────────────────────────────────────────────── -->
<section class="industry-pg-hero" aria-label="<?php esc_attr_e( 'Use case hero', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="industry-pg-hero__inner">

            <div class="industry-pg-hero__content animate-on-scroll">
                <div class="industry-pg-hero__tag"><?php echo esc_html( $hero_tag ); ?></div>
                <h1 class="industry-pg-hero__headline"><?php echo esc_html( $hero_hl ); ?></h1>
                <?php if ( $hero_sub ) : ?>
                    <p class="industry-pg-hero__sub"><?php echo esc_html( $hero_sub ); ?></p>
                <?php endif; ?>
                <div class="industry-pg-hero__cta">
                    <a href="<?php echo esc_url( $hero_url ); ?>" class="btn-primary btn-primary--large">
                        <?php echo esc_html( $hero_cta ); ?>
                    </a>
                    <a href="<?php echo esc_url( home_url( '/pricing' ) ); ?>" class="btn-outline btn-outline--large" style="border-color:rgba(255,255,255,0.5);color:#fff;">
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

<!-- ── Situation ─────────────────────────────────────────────────────────────── -->
<?php if ( $sit_heading || $sit_body || $sit_pains ) : ?>
<section class="industry-situation" aria-label="<?php esc_attr_e( 'The situation', 'bluu-interactive' ); ?>">
    <div class="container">

        <div class="industry-situation__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'The situation', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php echo esc_html( $sit_heading ); ?></h2>
            <?php if ( $sit_body ) : ?>
                <p class="industry-section-body"><?php echo esc_html( $sit_body ); ?></p>
            <?php endif; ?>
        </div>

        <?php if ( $sit_pains ) : ?>
            <div class="industry-pain-grid">
                <?php foreach ( $sit_pains as $pain ) : ?>
                    <div class="industry-pain-card animate-on-scroll">
                        <h3 class="industry-pain-card__title"><?php echo esc_html( $pain['uc_pain_title'] ?? '' ); ?></h3>
                        <p class="industry-pain-card__body"><?php echo esc_html( $pain['uc_pain_body'] ?? '' ); ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

    </div>
</section>
<?php endif; ?>

<!-- ── Approach ──────────────────────────────────────────────────────────────── -->
<?php if ( $app_heading || $app_steps ) : ?>
<section class="industry-approach" aria-label="<?php esc_attr_e( 'Our approach', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="industry-approach__inner">

            <div class="industry-approach__image animate-on-scroll">
                <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=80" alt="<?php esc_attr_e( 'Strategic approach', 'bluu-interactive' ); ?>" loading="lazy" decoding="async">
            </div>

            <div class="industry-approach__content animate-on-scroll">
                <span class="industry-section-badge"><?php esc_html_e( 'How it works', 'bluu-interactive' ); ?></span>
                <h2 class="industry-section-heading"><?php echo esc_html( $app_heading ); ?></h2>
                <?php if ( $app_body ) : ?>
                    <p class="industry-section-body" style="margin-bottom:var(--space-5)"><?php echo esc_html( $app_body ); ?></p>
                <?php endif; ?>

                <?php if ( $app_steps ) : ?>
                    <div class="industry-steps">
                        <?php foreach ( $app_steps as $step ) : ?>
                            <div class="industry-step">
                                <div class="industry-step__num"><?php echo esc_html( $step['uc_step_number'] ?? '' ); ?></div>
                                <div>
                                    <div class="industry-step__title"><?php echo esc_html( $step['uc_step_title'] ?? '' ); ?></div>
                                    <p class="industry-step__body"><?php echo esc_html( $step['uc_step_body'] ?? '' ); ?></p>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>

        </div>
    </div>
</section>
<?php endif; ?>

<!-- ── Deliverables ───────────────────────────────────────────────────────────── -->
<?php if ( $del_list ) : ?>
<section class="industry-deliverables" aria-label="<?php esc_attr_e( 'What you receive', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="industry-deliverables__inner">

            <div class="industry-deliverables__intro animate-on-scroll">
                <span class="industry-section-badge"><?php esc_html_e( 'Deliverables', 'bluu-interactive' ); ?></span>
                <h2 class="industry-section-heading"><?php echo esc_html( $del_heading ); ?></h2>
                <?php if ( $del_intro ) : ?>
                    <p class="industry-section-body"><?php echo esc_html( $del_intro ); ?></p>
                <?php endif; ?>
                <?php if ( $del_cadence ) : ?>
                    <span class="industry-deliverables__cadence"><?php echo esc_html( $del_cadence ); ?></span>
                <?php endif; ?>
            </div>

            <div class="industry-deliverables__grid">
                <?php foreach ( $del_list as $d ) : ?>
                    <div class="industry-deliverable-card animate-on-scroll">
                        <div class="industry-deliverable-card__name"><?php echo esc_html( $d['uc_deliverable_name'] ?? '' ); ?></div>
                        <p class="industry-deliverable-card__detail"><?php echo esc_html( $d['uc_deliverable_detail'] ?? '' ); ?></p>
                    </div>
                <?php endforeach; ?>
            </div>

        </div>
    </div>
</section>
<?php endif; ?>

<!-- ── Who it's for ──────────────────────────────────────────────────────────── -->
<?php if ( $fit_list ) : ?>
<section class="industry-fit" aria-label="<?php esc_attr_e( 'Who this is for', 'bluu-interactive' ); ?>">
    <div class="container">

        <div class="industry-fit__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'Right fit', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php echo esc_html( $fit_heading ); ?></h2>
        </div>

        <div class="industry-fit__grid">
            <?php foreach ( $fit_list as $item ) : ?>
                <div class="industry-fit-item animate-on-scroll">
                    <svg class="industry-fit-item__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    <p class="industry-fit-item__text"><?php echo esc_html( $item['uc_fit_statement'] ?? '' ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>

        <?php if ( $not_fit_note ) : ?>
            <p class="industry-fit__not-fit"><?php echo esc_html( $not_fit_note ); ?></p>
        <?php endif; ?>

    </div>
</section>
<?php endif; ?>

<!-- ── Related Use Cases ─────────────────────────────────────────────────────── -->
<?php if ( $related ) : ?>
<section class="industry-related" aria-label="<?php esc_attr_e( 'Related use cases', 'bluu-interactive' ); ?>">
    <div class="container">

        <div class="industry-related__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'Related', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php esc_html_e( 'Explore related use cases', 'bluu-interactive' ); ?></h2>
        </div>

        <div class="industry-related__grid">
            <?php foreach ( $related as $rel ) : ?>
                <a href="<?php echo esc_url( $rel['uc_related_url'] ?? '#' ); ?>" class="industry-related-card animate-on-scroll">
                    <div class="industry-related-card__title"><?php echo esc_html( $rel['uc_related_title'] ?? '' ); ?></div>
                    <p class="industry-related-card__desc"><?php echo esc_html( $rel['uc_related_description'] ?? '' ); ?></p>
                    <span class="industry-related-card__arrow"><?php esc_html_e( 'See this use case', 'bluu-interactive' ); ?> →</span>
                </a>
            <?php endforeach; ?>
        </div>

    </div>
</section>
<?php endif; ?>

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
                <a href="<?php echo esc_url( $cta_s_url ); ?>" class="btn-outline btn-outline--large" style="border-color:rgba(255,255,255,0.6);color:#fff;">
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
