<?php
/**
 * Blog sidebar partial — Table of contents + More from Bluu widget
 *
 * @package bluu-interactive
 */

$current_id = get_the_ID();

// Recent posts excluding current
$recent_posts = new WP_Query( array(
    'post_type'           => 'post',
    'posts_per_page'      => 3,
    'post__not_in'        => array( $current_id ),
    'orderby'             => 'date',
    'order'               => 'DESC',
    'no_found_rows'       => true,
    'ignore_sticky_posts' => true,
) );
?>
<aside class="bluu-blog-sidebar" aria-label="<?php esc_attr_e( 'Article sidebar', 'bluu-interactive' ); ?>">

    <!-- Table of Contents (populated by blog.js) -->
    <nav id="bluu-toc-wrap" class="bluu-toc" aria-label="<?php esc_attr_e( 'Table of contents', 'bluu-interactive' ); ?>">
        <p class="bluu-toc__heading"><?php esc_html_e( 'In this article', 'bluu-interactive' ); ?></p>
        <ul id="bluu-toc-list" class="bluu-toc__list"></ul>
    </nav>

    <?php if ( $recent_posts->have_posts() ) : ?>
    <div class="bluu-sidebar-widget">
        <p class="bluu-sidebar-widget__heading"><?php esc_html_e( 'More from Bluu', 'bluu-interactive' ); ?></p>
        <?php while ( $recent_posts->have_posts() ) : $recent_posts->the_post(); ?>
            <a href="<?php the_permalink(); ?>" class="bluu-widget-post">
                <div class="bluu-widget-post__title"><?php the_title(); ?></div>
                <div class="bluu-widget-post__date"><?php echo esc_html( get_the_date( 'j M Y' ) ); ?></div>
            </a>
        <?php endwhile; wp_reset_postdata(); ?>
    </div>
    <?php endif; ?>

</aside>
