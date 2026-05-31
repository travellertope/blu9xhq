<?php
/**
 * Single post template
 *
 * @package bluu-interactive
 */

get_header();

while ( have_posts() ) :
    the_post();

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
    $subtitle  = function_exists( 'get_field' ) ? get_field( 'bluu_post_subtitle', $post_id )  : '';
    $read_time = function_exists( 'bluu_reading_time' ) ? bluu_reading_time( $post_id ) : '';
    $author_name = get_the_author();
    $post_date   = get_the_date( 'j M Y' );

    // Thumbnail
    $thumb_id  = get_post_thumbnail_id( $post_id );
    $thumb_url = $thumb_id ? wp_get_attachment_image_url( $thumb_id, 'bluu-hero' ) : '';
    $thumb_alt = $thumb_id ? get_post_meta( $thumb_id, '_wp_attachment_image_alt', true ) : '';
    if ( ! $thumb_alt ) { $thumb_alt = get_the_title(); }

    // ACF CTA fields
    $cta_heading = function_exists( 'get_field' ) ? get_field( 'bluu_post_cta_heading', $post_id ) : '';
    $cta_subtext = function_exists( 'get_field' ) ? get_field( 'bluu_post_cta_subtext', $post_id ) : '';
    $cta_btn_lbl = function_exists( 'get_field' ) ? get_field( 'bluu_post_cta_button_label', $post_id ) : '';
    $cta_btn_url = function_exists( 'get_field' ) ? get_field( 'bluu_post_cta_button_url', $post_id ) : '';
    if ( ! $cta_heading ) { $cta_heading = __( 'Ready to hand off your content operation?', 'bluu-interactive' ); }
    if ( ! $cta_subtext ) { $cta_subtext = __( 'Book a 15-minute Discovery Call. No pitch, no pressure — just an honest conversation.', 'bluu-interactive' ); }
    if ( ! $cta_btn_lbl ) { $cta_btn_lbl = __( 'Book a Discovery Call', 'bluu-interactive' ); }
    if ( ! $cta_btn_url ) { $cta_btn_url = home_url( '/contact' ); }

    // Related posts
    $related_posts = array();
    if ( function_exists( 'get_field' ) ) {
        $related_posts = get_field( 'bluu_post_related_posts', $post_id );
    }
    if ( empty( $related_posts ) && $categories ) {
        $fallback = new WP_Query( array(
            'post_type'           => 'post',
            'posts_per_page'      => 3,
            'post__not_in'        => array( $post_id ),
            'category__in'        => array( $categories[0]->term_id ),
            'orderby'             => 'date',
            'order'               => 'DESC',
            'no_found_rows'       => true,
            'ignore_sticky_posts' => true,
        ) );
        if ( $fallback->have_posts() ) {
            $related_posts = $fallback->posts;
        }
        wp_reset_postdata();
    }
    if ( empty( $related_posts ) ) {
        $fallback2 = new WP_Query( array(
            'post_type'           => 'post',
            'posts_per_page'      => 3,
            'post__not_in'        => array( $post_id ),
            'orderby'             => 'date',
            'order'               => 'DESC',
            'no_found_rows'       => true,
            'ignore_sticky_posts' => true,
        ) );
        if ( $fallback2->have_posts() ) {
            $related_posts = $fallback2->posts;
        }
        wp_reset_postdata();
    }

    // Author bio
    $author_bio = '';
    if ( function_exists( 'get_field' ) ) {
        $author_bio = get_field( 'bluu_post_author_bio', $post_id );
    }
    if ( ! $author_bio ) {
        $author_bio = get_the_author_meta( 'description' );
    }

    // SEO: check for Yoast or Rank Math
    $has_seo_plugin = function_exists( 'yoast_head' ) || class_exists( 'RankMath' ) || function_exists( 'rank_math_head' );

    if ( ! $has_seo_plugin ) :
        $excerpt    = wp_strip_all_tags( get_the_excerpt() );
        $excerpt_55 = mb_strimwidth( $excerpt, 0, 155, '…' );
        $og_image   = $thumb_url ?: ( defined( 'BLUU_DEFAULT_OG_IMAGE' ) ? BLUU_DEFAULT_OG_IMAGE : '' );
        add_action( 'wp_head', function () use ( $excerpt_55, $og_image ) {
            echo '<meta name="description" content="' . esc_attr( $excerpt_55 ) . '">' . "\n";
            echo '<meta property="og:title" content="' . esc_attr( get_the_title() . ' — Bluu Interactive' ) . '">' . "\n";
            echo '<meta property="og:description" content="' . esc_attr( $excerpt_55 ) . '">' . "\n";
            if ( $og_image ) {
                echo '<meta property="og:image" content="' . esc_url( $og_image ) . '">' . "\n";
            }
            echo '<meta property="og:type" content="article">' . "\n";
            echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
        }, 5 );
    endif;
?>

<main id="main-content" class="site-main">

    <!-- ── Post Hero ─────────────────────────────────────────────────────────── -->
    <section class="bluu-post-hero <?php echo esc_attr( $cat_class ); ?>">
        <?php if ( $thumb_url ) : ?>
            <div class="bluu-post-hero__bg">
                <img src="<?php echo esc_url( $thumb_url ); ?>" alt="" role="presentation" loading="eager">
                <div class="bluu-post-hero__overlay"></div>
            </div>
        <?php endif; ?>
        <div class="container">
            <div class="bluu-post-hero__inner">
                <?php if ( $cat_label ) : ?>
                    <span class="bluu-post-hero__badge"><?php echo esc_html( $cat_label ); ?></span>
                <?php endif; ?>
                <h1 class="bluu-post-hero__title"><?php the_title(); ?></h1>
                <?php if ( $subtitle ) : ?>
                    <p class="bluu-post-hero__subtitle"><?php echo esc_html( $subtitle ); ?></p>
                <?php endif; ?>
                <div class="bluu-post-hero__meta">
                    <span><?php echo esc_html( $author_name ); ?></span>
                    <span class="bluu-post-hero__meta-sep" aria-hidden="true">&middot;</span>
                    <span><?php echo esc_html( $post_date ); ?></span>
                    <?php if ( $read_time ) : ?>
                        <span class="bluu-post-hero__meta-sep" aria-hidden="true">&middot;</span>
                        <span><?php echo esc_html( $read_time ); ?></span>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </section>

    <!-- ── Post content section ──────────────────────────────────────────────── -->
    <div class="bluu-post-section">
        <div class="container">

            <!-- Back link -->
            <div class="bluu-post-back">
                <?php
                $blog_url = get_option( 'page_for_posts' )
                    ? get_permalink( get_option( 'page_for_posts' ) )
                    : home_url( '/blog/' );
                ?>
                <a href="<?php echo esc_url( $blog_url ); ?>">
                    &larr; <?php esc_html_e( 'Back to all posts', 'bluu-interactive' ); ?>
                </a>
            </div>

            <div class="bluu-post-layout">

                <!-- ── Content column ─────────────────────────────────────────── -->
                <div class="bluu-post-main">

                    <article class="bluu-post-content">
                        <?php the_content(); ?>
                    </article>

                    <!-- Tags -->
                    <?php
                    $tags = get_the_tags( $post_id );
                    if ( $tags ) :
                    ?>
                        <div class="bluu-post-tags" aria-label="<?php esc_attr_e( 'Post tags', 'bluu-interactive' ); ?>">
                            <?php foreach ( $tags as $tag ) : ?>
                                <a href="<?php echo esc_url( get_tag_link( $tag->term_id ) ); ?>" class="bluu-post-tag">
                                    <?php echo esc_html( $tag->name ); ?>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>

                    <!-- Author block -->
                    <div class="bluu-author-block">
                        <div class="bluu-author-block__avatar">
                            <?php echo get_avatar( get_the_author_meta( 'ID' ), 64, '', esc_attr( $author_name ), array( 'class' => '' ) ); ?>
                        </div>
                        <div class="bluu-author-block__info">
                            <p class="bluu-author-block__name"><?php echo esc_html( $author_name ); ?></p>
                            <?php if ( $author_bio ) : ?>
                                <p class="bluu-author-block__bio"><?php echo esc_html( $author_bio ); ?></p>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- Post CTA -->
                    <div class="bluu-post-cta">
                        <h2 class="bluu-post-cta__heading"><?php echo esc_html( $cta_heading ); ?></h2>
                        <p class="bluu-post-cta__subtext"><?php echo esc_html( $cta_subtext ); ?></p>
                        <a href="<?php echo esc_url( $cta_btn_url ); ?>"
                           class="btn-primary"
                           aria-label="<?php echo esc_attr( $cta_btn_lbl . ' — Bluu Interactive' ); ?>">
                            <?php echo esc_html( $cta_btn_lbl ); ?>
                        </a>
                        <p class="bluu-post-cta__note"><?php esc_html_e( 'Free 15-minute call. No commitment required.', 'bluu-interactive' ); ?></p>
                    </div>

                    <!-- Related posts -->
                    <?php if ( ! empty( $related_posts ) ) : ?>
                        <div class="bluu-related-posts">
                            <h2 class="bluu-related-posts__heading"><?php esc_html_e( 'You might also find this useful', 'bluu-interactive' ); ?></h2>
                            <div class="bluu-related-posts__grid">
                                <?php foreach ( $related_posts as $related ) :
                                    $rid   = is_object( $related ) ? $related->ID : $related;
                                    $rtid  = get_post_thumbnail_id( $rid );
                                    $ralt  = $rtid ? get_post_meta( $rtid, '_wp_attachment_image_alt', true ) : get_the_title( $rid );
                                ?>
                                    <a href="<?php echo esc_url( get_permalink( $rid ) ); ?>" class="bluu-related-card">
                                        <div class="bluu-related-card__thumb">
                                            <?php if ( $rtid ) : ?>
                                                <?php echo wp_get_attachment_image( $rtid, array( 400, 225 ), false, array( 'alt' => esc_attr( $ralt ), 'loading' => 'lazy' ) ); ?>
                                            <?php else : ?>
                                                <div class="bluu-related-card__placeholder"></div>
                                            <?php endif; ?>
                                        </div>
                                        <div class="bluu-related-card__body">
                                            <div class="bluu-related-card__title"><?php echo esc_html( get_the_title( $rid ) ); ?></div>
                                            <div class="bluu-related-card__date"><?php echo esc_html( get_the_date( 'j M Y', $rid ) ); ?></div>
                                        </div>
                                    </a>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php endif; ?>

                    <!-- Prev / Next post navigation -->
                    <nav class="bluu-post-nav" aria-label="<?php esc_attr_e( 'Post navigation', 'bluu-interactive' ); ?>">
                        <div class="bluu-post-nav__item bluu-post-nav__item--prev">
                            <?php
                            $prev = get_previous_post();
                            if ( $prev ) :
                            ?>
                                <span class="bluu-post-nav__label"><?php esc_html_e( '← Previous', 'bluu-interactive' ); ?></span>
                                <a href="<?php echo esc_url( get_permalink( $prev->ID ) ); ?>" class="bluu-post-nav__link">
                                    <?php echo esc_html( get_the_title( $prev->ID ) ); ?>
                                </a>
                            <?php endif; ?>
                        </div>
                        <div class="bluu-post-nav__item bluu-post-nav__item--next">
                            <?php
                            $next = get_next_post();
                            if ( $next ) :
                            ?>
                                <span class="bluu-post-nav__label"><?php esc_html_e( 'Next →', 'bluu-interactive' ); ?></span>
                                <a href="<?php echo esc_url( get_permalink( $next->ID ) ); ?>" class="bluu-post-nav__link">
                                    <?php echo esc_html( get_the_title( $next->ID ) ); ?>
                                </a>
                            <?php endif; ?>
                        </div>
                    </nav>

                </div><!-- /.bluu-post-main -->

                <!-- ── Sidebar ─────────────────────────────────────────────────── -->
                <?php get_template_part( 'template-parts/blog/blog-sidebar' ); ?>

            </div><!-- /.bluu-post-layout -->
        </div><!-- /.container -->
    </div><!-- /.bluu-post-section -->

</main>

<?php
endwhile;
get_footer();
?>
