<?php
/**
 * Home Hero Section — Redesigned
 *
 * @package bluu-interactive
 */

$hero_badge              = ( function_exists( 'get_field' ) ? get_field( 'hero_badge' )             : '' ) ?: 'B2B Growth Agency';
$hero_headline           = ( function_exists( 'get_field' ) ? get_field( 'hero_headline' )          : '' ) ?: "Your content operation.\nRunning. Every month.";
$hero_subheadline        = ( function_exists( 'get_field' ) ? get_field( 'hero_subheadline' )       : '' ) ?: 'Bluu Interactive handles your research, content, publishing, and reporting — so your brand shows up consistently while you focus on running the business.';
$hero_cta_primary_text   = ( function_exists( 'get_field' ) ? get_field( 'hero_cta_primary_text' )  : '' ) ?: 'Book a Discovery Call';
$hero_cta_primary_url    = ( function_exists( 'get_field' ) ? get_field( 'hero_cta_primary_url' )   : '' ) ?: home_url( '/contact' );
$hero_cta_secondary_text = ( function_exists( 'get_field' ) ? get_field( 'hero_cta_secondary_text' ): '' ) ?: "See What's Included";
$hero_cta_secondary_url  = ( function_exists( 'get_field' ) ? get_field( 'hero_cta_secondary_url' ) : '' ) ?: '#solution';
$hero_stats              = ( function_exists( 'get_field' ) ? get_field( 'hero_stats' )             : [] );

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

                <p class="home-hero__subheadline"><?php echo esc_html( $hero_subheadline ); ?></p>

                <div class="home-hero__cta-group">
                    <a href="<?php echo esc_url( $hero_cta_primary_url ); ?>" class="btn-primary btn-primary--large">
                        <?php echo esc_html( $hero_cta_primary_text ); ?>
                    </a>
                    <a href="<?php echo esc_url( $hero_cta_secondary_url ); ?>" class="btn-outline btn-outline--large">
                        <?php echo esc_html( $hero_cta_secondary_text ); ?>
                    </a>
                </div>


            </div><!-- /.home-hero__content -->

            <!-- Right: Geometric Dashboard Illustration -->
            <div class="home-hero__visual animate-on-scroll" aria-hidden="true">
                <div class="hero-dash">
                    <!-- Tilted background plane -->
                    <div class="hero-dash__bg"></div>

                    <!-- Dashboard card -->
                    <div class="hero-dash__card">

                        <!-- Header bar -->
                        <div class="hero-dash__header">
                            <div class="hero-dash__title-bar"></div>
                            <div class="hero-dash__dots">
                                <div class="hero-dash__dot"></div>
                                <div class="hero-dash__dot"></div>
                            </div>
                        </div>

                        <!-- Two info blocks -->
                        <div class="hero-dash__blocks">
                            <div class="hero-dash__block hero-dash__block--blue">
                                <div class="hero-dash__block-num">1</div>
                                <div class="hero-dash__lines">
                                    <div class="hero-dash__line hero-dash__line--lg"></div>
                                    <div class="hero-dash__line hero-dash__line--sm"></div>
                                </div>
                            </div>
                            <div class="hero-dash__block hero-dash__block--green">
                                <div class="hero-dash__block-num hero-dash__block-num--green">2</div>
                                <div class="hero-dash__lines">
                                    <div class="hero-dash__line hero-dash__line--lg"></div>
                                    <div class="hero-dash__line hero-dash__line--sm"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Hub / Revenue Engine -->
                        <div class="hero-dash__hub">
                            <div>
                                <div class="hero-dash__hub-label"><?php esc_html_e( 'Unified Output', 'bluu-interactive' ); ?></div>
                                <div class="hero-dash__hub-title"><?php esc_html_e( 'Content Engine', 'bluu-interactive' ); ?></div>
                            </div>
                            <svg class="hero-dash__hub-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">
                                <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                            </svg>
                        </div>

                    </div><!-- /.hero-dash__card -->
                </div><!-- /.hero-dash -->
            </div><!-- /.home-hero__visual -->

        </div><!-- /.home-hero__inner -->
    </div><!-- /.container -->
</section>
