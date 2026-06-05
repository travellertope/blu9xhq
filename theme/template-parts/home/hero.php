<?php
/**
 * Home Hero Section
 *
 * @package bluu-interactive
 */

$hero_badge              = ( function_exists( 'get_field' ) ? get_field( 'hero_badge' )             : '' ) ?: 'B2B Growth Agency';
$hero_headline           = ( function_exists( 'get_field' ) ? get_field( 'hero_headline' )          : '' ) ?: "Your content operation.\nRunning. Every month.";
$hero_subheadline        = ( function_exists( 'get_field' ) ? get_field( 'hero_subheadline' )       : '' ) ?: 'Bluu Interactive handles your research, content, publishing, and reporting — so your brand shows up consistently while you focus on running the business.';
$hero_cta_primary_text   = ( function_exists( 'get_field' ) ? get_field( 'hero_cta_primary_text' )  : '' ) ?: 'Let's talk';
$hero_cta_primary_url    = ( function_exists( 'get_field' ) ? get_field( 'hero_cta_primary_url' )   : '' ) ?: home_url( '/contact' );
$hero_cta_secondary_text = ( function_exists( 'get_field' ) ? get_field( 'hero_cta_secondary_text' ): '' ) ?: "See What's Included";
$hero_cta_secondary_url  = ( function_exists( 'get_field' ) ? get_field( 'hero_cta_secondary_url' ) : '' ) ?: '#solution';
$hero_stats              = ( function_exists( 'get_field' ) ? get_field( 'hero_stats' )             : [] );

// Hero image — ACF image field returns array; fallback to Unsplash
$hero_image = function_exists( 'get_field' ) ? get_field( 'hero_image' ) : null;
if ( ! empty( $hero_image ) ) {
    $hero_img_src = is_array( $hero_image ) ? esc_url( $hero_image['url'] ) : esc_url( $hero_image );
    $hero_img_alt = is_array( $hero_image ) ? esc_attr( $hero_image['alt'] ) : '';
} else {
    $hero_img_src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80';
    $hero_img_alt = 'A modern, focused workspace';
}

if ( empty( $hero_stats ) ) {
    $hero_stats = [
        [ 'stat_number' => 'Year 1',  'stat_label' => 'Average ROI' ],
        [ 'stat_number' => '21%',     'stat_label' => 'Sales Velocity', 'accent' => true ],
        [ 'stat_number' => '100%',    'stat_label' => 'Done for You' ],
    ];
}

// Split headline on newline for two-line display
$headline_parts = array_map( 'trim', explode( "\n", $hero_headline, 2 ) );
$headline_1 = $headline_parts[0];
$headline_2 = isset( $headline_parts[1] ) ? $headline_parts[1] : '';
?>

<section class="home-hero" id="hero" aria-label="<?php esc_attr_e( 'Hero section', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="home-hero__inner">

            <!-- Left Content -->
            <div class="home-hero__content animate-on-scroll">

                <h1 class="home-hero__headline">
                    <?php echo esc_html( $headline_1 ); ?>
                    <?php if ( $headline_2 ) : ?>
                        <br><span class="home-hero__headline--accent"><?php echo esc_html( $headline_2 ); ?></span>
                    <?php endif; ?>
                </h1>

                <p class="home-hero__subheadline"><?php echo bluu_text( $hero_subheadline ); ?></p>

                <div class="home-hero__cta-group">
                    <a href="<?php echo esc_url( $hero_cta_primary_url ); ?>" class="btn-primary btn-primary--large">
                        <?php echo esc_html( $hero_cta_primary_text ); ?>
                    </a>
                    <a href="<?php echo esc_url( $hero_cta_secondary_url ); ?>" class="btn-outline btn-outline--large">
                        <?php echo esc_html( $hero_cta_secondary_text ); ?>
                    </a>
                </div>

            </div><!-- /.home-hero__content -->

            <!-- Right: Hero Image -->
            <div class="home-hero__visual animate-on-scroll">
                <div class="hero-image">
                    <img
                        src="<?php echo $hero_img_src; ?>"
                        alt="<?php echo $hero_img_alt; ?>"
                        loading="eager"
                        decoding="async"
                    >
                </div>
            </div><!-- /.home-hero__visual -->

        </div><!-- /.home-hero__inner -->
    </div><!-- /.container -->
</section>
