<?php
/**
 * Home Testimonial Section
 *
 * @package bluu-interactive
 */

$quote      = ( function_exists( 'get_field' ) ? get_field( 'testimonial_quote' )       : '' ) ?: 'Bluu took the content operation completely off our plate. Within three months we were publishing consistently and our inbound pipeline started moving again. It is not a vendor relationship — it feels like having a dedicated team inside the business.';
$name       = ( function_exists( 'get_field' ) ? get_field( 'testimonial_name' )        : '' ) ?: 'Sarah Mitchell';
$title      = ( function_exists( 'get_field' ) ? get_field( 'testimonial_title' )       : '' ) ?: 'VP of Marketing, Clairen Software';
$photo      = ( function_exists( 'get_field' ) ? get_field( 'testimonial_photo' )       : null );

$photo_url = '';
$photo_alt = '';
if ( ! empty( $photo ) ) {
    $photo_url = is_array( $photo ) ? esc_url( $photo['url'] ) : esc_url( $photo );
    $photo_alt = is_array( $photo ) ? esc_attr( $photo['alt'] ) : esc_attr( $name );
}
?>

<section class="home-testimonial" aria-label="<?php esc_attr_e( 'Client testimonial', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="home-testimonial__inner animate-on-scroll">

            <!-- Photo block -->
            <div class="home-testimonial__photo-wrap">
                <?php if ( $photo_url ) : ?>
                    <img src="<?php echo $photo_url; ?>" alt="<?php echo $photo_alt; ?>" class="home-testimonial__photo" loading="lazy">
                <?php else : ?>
                    <div class="home-testimonial__photo home-testimonial__photo--placeholder" aria-hidden="true">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                <?php endif; ?>
                <!-- Large decorative quote mark -->
                <div class="home-testimonial__quote-icon" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                </div>
            </div>

            <!-- Quote block -->
            <blockquote class="home-testimonial__quote">
                <p class="home-testimonial__text"><?php echo bluu_text( $quote ); ?></p>
                <footer class="home-testimonial__attribution">
                    <cite class="home-testimonial__name"><?php echo esc_html( $name ); ?></cite>
                    <span class="home-testimonial__title"><?php echo esc_html( $title ); ?></span>
                </footer>
            </blockquote>

        </div>
    </div>
</section>
