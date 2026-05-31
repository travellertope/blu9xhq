<?php
/**
 * Blog post card partial
 *
 * @package bluu-interactive
 */

$post_id    = get_the_ID();
$cat_class  = function_exists( 'bluu_get_cat_class' ) ? bluu_get_cat_class( $post_id ) : 'bluu-cat-default';
$categories = get_the_category( $post_id );
$cat_label  = '';
if ( function_exists( 'get_field' ) ) {
    $cat_label = get_field( 'bluu_post_category_label', $post_id );
}
if ( ! $cat_label && $categories ) {
    $cat_label = $categories[0]->name;
}

$subtitle = function_exists( 'get_field' ) ? get_field( 'bluu_post_subtitle', $post_id ) : '';
$read_time = function_exists( 'bluu_reading_time' ) ? bluu_reading_time( $post_id ) : '';

$author_id   = (int) get_post_field( 'post_author', $post_id );
$author_name = get_the_author_meta( 'display_name', $author_id );
$show_author = user_can( $author_id, 'administrator' );
$post_date   = get_the_date( 'j M Y', $post_id );

$thumb_id  = get_post_thumbnail_id( $post_id );
$thumb_alt = $thumb_id ? get_post_meta( $thumb_id, '_wp_attachment_image_alt', true ) : '';
if ( ! $thumb_alt ) {
    $thumb_alt = get_the_title( $post_id );
}
?>
<article class="bluu-post-card <?php echo esc_attr( $cat_class ); ?>">

    <div class="bluu-post-card__image-wrap">
        <a href="<?php the_permalink(); ?>" tabindex="-1" aria-hidden="true">
        <?php if ( has_post_thumbnail( $post_id ) ) : ?>
            <?php echo wp_get_attachment_image(
                $thumb_id,
                'bluu-card',
                false,
                array(
                    'alt'     => esc_attr( $thumb_alt ),
                    'loading' => 'lazy',
                )
            ); ?>
        <?php else : ?>
            <div class="bluu-post-card__placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
        <?php endif; ?>
        </a>
    </div>

    <div class="bluu-post-card__body">
        <?php if ( $cat_label ) : ?>
            <span class="bluu-post-card__badge"><?php echo esc_html( $cat_label ); ?></span>
        <?php endif; ?>

        <h2 class="bluu-post-card__title">
            <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
        </h2>

        <?php if ( $subtitle ) : ?>
            <p class="bluu-post-card__subtitle"><?php echo esc_html( $subtitle ); ?></p>
        <?php endif; ?>

        <div class="bluu-post-card__meta">
            <?php if ( $show_author ) : ?>
                <span><?php echo esc_html( $author_name ); ?></span>
                <span class="bluu-post-card__meta-sep" aria-hidden="true">&middot;</span>
            <?php endif; ?>
            <span><?php echo esc_html( $post_date ); ?></span>
            <?php if ( $read_time ) : ?>
                <span class="bluu-post-card__meta-sep" aria-hidden="true">&middot;</span>
                <span><?php echo esc_html( $read_time ); ?></span>
            <?php endif; ?>
        </div>

        <a href="<?php the_permalink(); ?>" class="bluu-post-card__readmore" aria-label="<?php echo esc_attr( sprintf( __( 'Read more: %s', 'bluu-interactive' ), get_the_title() ) ); ?>">
            <?php esc_html_e( 'Read more', 'bluu-interactive' ); ?> &rarr;
        </a>
    </div>

</article>
