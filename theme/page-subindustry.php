<?php
/**
 * Template Name: Sub-industry / Use Case Page
 * Template Post Type: page
 *
 * Reads from the si_* ACF field groups registered in inc/acf-fields.php.
 *
 * @package bluu-interactive
 */

$gf = function_exists( 'get_field' );

// Hero
$hero_tag  = ( $gf ? get_field( 'si_hero_tag' )         : '' ) ?: 'Use case';
$hero_hl   = ( $gf ? get_field( 'si_hero_headline' )    : '' ) ?: get_the_title();
$hero_sub  = ( $gf ? get_field( 'si_hero_subheadline' ) : '' ) ?: '';
$hero_cta  = ( $gf ? get_field( 'si_hero_cta_label' )   : '' ) ?: 'Book a Discovery Call';
$hero_url  = ( $gf ? get_field( 'si_hero_cta_url' )     : '' ) ?: home_url( '/contact' );
$hero_img  = $gf ? get_field( 'si_hero_image' ) : null;
if ( ! empty( $hero_img ) ) {
    $hero_img_src = is_array( $hero_img ) ? esc_url( $hero_img['url'] ) : esc_url( $hero_img );
    $hero_img_alt = is_array( $hero_img ) ? esc_attr( $hero_img['alt'] ) : '';
} else {
    $hero_img_src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';
    $hero_img_alt = '';
}

// Who this is for
$who_heading = ( $gf ? get_field( 'si_who_heading' ) : '' ) ?: 'Exactly who this is built for';
$who_body    = ( $gf ? get_field( 'si_who_body' )    : '' ) ?: '';
$who_items   = array_values( array_filter( array(
    ( $gf ? get_field( 'si_who_item_1' ) : '' ) ?: '',
    ( $gf ? get_field( 'si_who_item_2' ) : '' ) ?: '',
    ( $gf ? get_field( 'si_who_item_3' ) : '' ) ?: '',
    ( $gf ? get_field( 'si_who_item_4' ) : '' ) ?: '',
) ) );

// Pain
$pain_heading = ( $gf ? get_field( 'si_pain_heading' ) : '' ) ?: 'The challenge';
$pain_body    = ( $gf ? get_field( 'si_pain_body' )    : '' ) ?: '';
$pains        = array_values( array_filter( array(
    array( 'title' => ( $gf ? get_field( 'si_pain_1_title' ) : '' ) ?: '', 'body' => ( $gf ? get_field( 'si_pain_1_body' ) : '' ) ?: '' ),
    array( 'title' => ( $gf ? get_field( 'si_pain_2_title' ) : '' ) ?: '', 'body' => ( $gf ? get_field( 'si_pain_2_body' ) : '' ) ?: '' ),
    array( 'title' => ( $gf ? get_field( 'si_pain_3_title' ) : '' ) ?: '', 'body' => ( $gf ? get_field( 'si_pain_3_body' ) : '' ) ?: '' ),
), function( $p ) { return ! empty( $p['title'] ); } ) );

// Use cases
$uc_heading = ( $gf ? get_field( 'si_usecases_heading' ) : '' ) ?: 'Where to start';
$uc_intro   = ( $gf ? get_field( 'si_usecases_intro' )   : '' ) ?: '';
$uc_list    = ( $gf ? get_field( 'si_use_cases' )         : array() ) ?: array();

// Why Bluu fits
$fit_heading = ( $gf ? get_field( 'si_fit_heading' ) : '' ) ?: 'Why Bluu works here';
$fit_body    = ( $gf ? get_field( 'si_fit_body' )    : '' ) ?: '';
$fit_proof   = ( $gf ? get_field( 'si_fit_proof' )   : '' ) ?: '';

// CTA
$cta_heading = ( $gf ? get_field( 'si_cta_heading' )         : '' ) ?: 'Ready to get started?';
$cta_sub     = ( $gf ? get_field( 'si_cta_subtext' )         : '' ) ?: 'Book a 15-minute Discovery Call. No pitch, no pressure.';
$cta_p_label = ( $gf ? get_field( 'si_cta_primary_label' )   : '' ) ?: 'Book a Discovery Call';
$cta_p_url   = ( $gf ? get_field( 'si_cta_primary_url' )     : '' ) ?: home_url( '/contact' );
$cta_s_label = ( $gf ? get_field( 'si_cta_secondary_label' ) : '' ) ?: 'See pricing';
$cta_s_url   = ( $gf ? get_field( 'si_cta_secondary_url' )   : '' ) ?: home_url( '/pricing' );

get_header();
?>

<!-- ── Hero ──────────────────────────────────────────────────────────────────── -->
<section class="industry-pg-hero" aria-label="<?php esc_attr_e( 'Page hero', 'bluu-interactive' ); ?>">
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
                <img src="<?php echo esc_url( $hero_img_src ); ?>" alt="<?php echo esc_attr( $hero_img_alt ); ?>" loading="eager" decoding="async">
            </div>

        </div>
    </div>
</section>

<!-- ── Who this is for ───────────────────────────────────────────────────────── -->
<?php if ( $who_items ) : ?>
<section class="si-who" aria-label="<?php esc_attr_e( 'Who this is for', 'bluu-interactive' ); ?>">
    <div class="container">

        <div class="si-who__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'Right fit', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php echo esc_html( $who_heading ); ?></h2>
            <?php if ( $who_body ) : ?>
                <p class="industry-section-body"><?php echo esc_html( $who_body ); ?></p>
            <?php endif; ?>
        </div>

        <div class="si-who__grid">
            <?php foreach ( $who_items as $item ) : ?>
                <div class="si-who-item animate-on-scroll">
                    <div class="si-who-item__icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                    </div>
                    <p class="si-who-item__text"><?php echo esc_html( $item ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>

    </div>
</section>
<?php endif; ?>

<!-- ── Pain ──────────────────────────────────────────────────────────────────── -->
<?php if ( $pains ) : ?>
<section class="si-pain" aria-label="<?php esc_attr_e( 'The challenge', 'bluu-interactive' ); ?>">
    <div class="container">

        <div class="si-pain__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'The problem', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php echo esc_html( $pain_heading ); ?></h2>
            <?php if ( $pain_body ) : ?>
                <p class="industry-section-body"><?php echo esc_html( $pain_body ); ?></p>
            <?php endif; ?>
        </div>

        <div class="industry-pain-grid">
            <?php foreach ( $pains as $pain ) : ?>
                <div class="industry-pain-card animate-on-scroll">
                    <h3 class="industry-pain-card__title"><?php echo esc_html( $pain['title'] ); ?></h3>
                    <p class="industry-pain-card__body"><?php echo esc_html( $pain['body'] ); ?></p>
                </div>
            <?php endforeach; ?>
        </div>

    </div>
</section>
<?php endif; ?>

<!-- ── Use Cases ─────────────────────────────────────────────────────────────── -->
<?php if ( $uc_list ) : ?>
<section class="si-usecases" aria-label="<?php esc_attr_e( 'Use cases', 'bluu-interactive' ); ?>">
    <div class="container">

        <div class="si-usecases__header animate-on-scroll">
            <span class="industry-section-badge"><?php esc_html_e( 'Where to start', 'bluu-interactive' ); ?></span>
            <h2 class="industry-section-heading"><?php echo esc_html( $uc_heading ); ?></h2>
            <?php if ( $uc_intro ) : ?>
                <p class="industry-section-body"><?php echo esc_html( $uc_intro ); ?></p>
            <?php endif; ?>
        </div>

        <div class="si-usecases__grid">
            <?php foreach ( $uc_list as $uc ) : ?>
                <div class="si-uc-card animate-on-scroll">
                    <h3 class="si-uc-card__title"><?php echo esc_html( $uc['si_uc_title'] ?? '' ); ?></h3>
                    <p class="si-uc-card__why"><?php echo esc_html( $uc['si_uc_why'] ?? '' ); ?></p>
                    <?php if ( ! empty( $uc['si_uc_url'] ) ) : ?>
                        <a href="<?php echo esc_url( $uc['si_uc_url'] ); ?>" class="si-uc-card__link">
                            <?php echo esc_html( $uc['si_uc_cta'] ?? 'See this use case' ); ?> →
                        </a>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>

    </div>
</section>
<?php endif; ?>

<!-- ── Why Bluu fits ─────────────────────────────────────────────────────────── -->
<?php if ( $fit_body ) : ?>
<section class="si-fit" aria-label="<?php esc_attr_e( 'Why Bluu fits', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="si-fit__inner animate-on-scroll">

            <div class="si-fit__content">
                <span class="industry-section-badge" style="color:#7eb8ff;"><?php esc_html_e( 'The Bluu approach', 'bluu-interactive' ); ?></span>
                <h2 class="industry-section-heading" style="color:#fff;"><?php echo esc_html( $fit_heading ); ?></h2>
                <p class="si-fit__body"><?php echo esc_html( $fit_body ); ?></p>
            </div>

            <?php if ( $fit_proof ) : ?>
                <div class="si-fit__proof">
                    <div class="si-fit__proof-label"><?php esc_html_e( 'Investment', 'bluu-interactive' ); ?></div>
                    <p class="si-fit__proof-text"><?php echo esc_html( $fit_proof ); ?></p>
                    <a href="<?php echo esc_url( home_url( '/pricing' ) ); ?>" class="si-fit__proof-link">
                        <?php esc_html_e( 'See full pricing →', 'bluu-interactive' ); ?>
                    </a>
                </div>
            <?php endif; ?>

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
