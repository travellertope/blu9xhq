<?php
/**
 * Home CTA Section
 *
 * @package bluu-interactive
 */

$cta_headline    = function_exists( 'get_field' ) ? get_field( 'home_cta_headline' )     : '';
$cta_body        = function_exists( 'get_field' ) ? get_field( 'home_cta_body' )         : '';
$cta_button_text = function_exists( 'get_field' ) ? get_field( 'home_cta_button_text' )  : '';
$cta_button_url  = function_exists( 'get_field' ) ? get_field( 'home_cta_button_url' )   : '';

// Defaults
$cta_headline    = $cta_headline    ?: 'Ready to Replace Fragmentation With Growth?';
$cta_body        = $cta_body        ?: 'Book a 30-minute Discovery Call. No pitch. Just an honest conversation about your current stack and where the gaps are.';
$cta_button_text = $cta_button_text ?: 'Book a Discovery Call';
$cta_button_url  = $cta_button_url  ?: home_url( '/contact' );
?>

<section class="section section--blue cta-section" id="cta" aria-label="<?php esc_attr_e( 'Call to action', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="cta-section__inner animate-on-scroll">

            <div class="cta-section__content">
                <h2 class="cta-section__headline"><?php echo esc_html( $cta_headline ); ?></h2>
                <p class="cta-section__body"><?php echo esc_html( $cta_body ); ?></p>
            </div>

            <div class="cta-section__action">
                <a
                    href="<?php echo esc_url( $cta_button_url ); ?>"
                    class="btn-white"
                    aria-label="<?php echo esc_attr( $cta_button_text ); ?>"
                >
                    <?php echo esc_html( $cta_button_text ); ?>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                    </svg>
                </a>
                <p class="cta-section__disclaimer">
                    <?php esc_html_e( 'Free 30-minute call. No commitment required.', 'bluu-interactive' ); ?>
                </p>
            </div>

        </div><!-- /.cta-section__inner -->
    </div><!-- /.container -->
</section>
