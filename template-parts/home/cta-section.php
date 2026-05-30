<?php
/**
 * Home CTA Section — Redesigned (light-blue accent background)
 *
 * @package bluu-interactive
 */

$cta_headline    = ( function_exists( 'get_field' ) ? get_field( 'home_cta_headline' )    : '' ) ?: 'Ready to Hand Off Your Entire Content Operation?';
$cta_body        = ( function_exists( 'get_field' ) ? get_field( 'home_cta_body' )        : '' ) ?: 'Book a 15-minute Discovery Call. No pitch — just an honest conversation to see if Bluu is the right fit for your business.';
$cta_button_text = ( function_exists( 'get_field' ) ? get_field( 'home_cta_button_text' ) : '' ) ?: 'Book a Discovery Call';
$cta_button_url  = ( function_exists( 'get_field' ) ? get_field( 'home_cta_button_url' )  : '' ) ?: home_url( '/contact' );
$cta_note        = ( function_exists( 'get_field' ) ? get_field( 'home_cta_note' )        : '' ) ?: 'Limited Monthly Capacity';
?>

<section class="home-cta" id="cta" aria-label="<?php esc_attr_e( 'Call to action', 'bluu-interactive' ); ?>">
    <div class="container container--narrow">
        <div class="animate-on-scroll">
            <h2 class="home-cta__headline"><?php echo esc_html( $cta_headline ); ?></h2>
            <p class="home-cta__body"><?php echo esc_html( $cta_body ); ?></p>
            <a
                href="<?php echo esc_url( $cta_button_url ); ?>"
                class="btn-primary btn-primary--large"
                aria-label="<?php echo esc_attr( $cta_button_text ); ?>"
            >
                <?php echo esc_html( $cta_button_text ); ?>
            </a>
            <?php if ( $cta_note ) : ?>
                <p class="home-cta__note"><?php echo esc_html( $cta_note ); ?></p>
            <?php endif; ?>
        </div>
    </div>
</section>
