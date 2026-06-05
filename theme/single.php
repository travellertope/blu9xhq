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
    $author_id   = (int) get_post_field( 'post_author', $post_id );
    $show_author = ! user_can( $author_id, 'administrator' );

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
    if ( ! $cta_subtext ) { $cta_subtext = __( 'Let's talk — an honest 15-minute conversation, no pitch, no pressure.', 'bluu-interactive' ); }
    if ( ! $cta_btn_lbl ) { $cta_btn_lbl = __( 'Let's talk', 'bluu-interactive' ); }
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

    // ── Article schema ────────────────────────────────────────────────────────────
    $schema_img_url  = $thumb_url ?: '';
    $schema_img_w    = 1440;
    $schema_img_h    = 900;
    if ( $thumb_id ) {
        $meta_w = get_post_meta( $thumb_id, '_wp_attachment_metadata', true );
        if ( is_array( $meta_w ) && isset( $meta_w['width'] ) ) {
            $schema_img_w = (int) $meta_w['width'];
            $schema_img_h = (int) $meta_w['height'];
        }
    }
    $article_schema = array(
        '@context'         => 'https://schema.org',
        '@type'            => 'Article',
        'headline'         => get_the_title(),
        'description'      => mb_strimwidth( wp_strip_all_tags( get_the_excerpt() ), 0, 200, '…' ),
        'datePublished'    => get_the_date( 'c' ),
        'dateModified'     => get_the_modified_date( 'c' ),
        'author'           => array(
            '@type' => 'Person',
            'name'  => $author_name,
            'url'   => get_author_posts_url( $author_id ),
        ),
        'publisher'        => array(
            '@type' => 'Organization',
            'name'  => 'Bluu Interactive',
            'url'   => 'https://bluuhq.com',
            'logo'  => array(
                '@type'  => 'ImageObject',
                'url'    => get_template_directory_uri() . '/assets/images/bluu-logo.png',
                'width'  => 200,
                'height' => 60,
            ),
        ),
        'mainEntityOfPage' => array(
            '@type' => '@WebPage',
            '@id'   => get_permalink(),
        ),
    );
    if ( $schema_img_url ) {
        $article_schema['image'] = array(
            '@type'  => 'ImageObject',
            'url'    => $schema_img_url,
            'width'  => $schema_img_w,
            'height' => $schema_img_h,
        );
    }
    add_action( 'wp_head', function () use ( $article_schema ) {
        echo '<script type="application/ld+json">' . wp_json_encode( $article_schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
    }, 6 );

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

<div class="bluu-read-progress" id="bluu-read-progress" role="progressbar" aria-hidden="true"></div>

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
                    <?php if ( $show_author ) : ?>
                        <span><?php echo esc_html( $author_name ); ?></span>
                        <span class="bluu-post-hero__meta-sep" aria-hidden="true">&middot;</span>
                    <?php endif; ?>
                    <span><?php echo esc_html( $post_date ); ?></span>
                    <?php if ( $read_time ) : ?>
                        <span class="bluu-post-hero__meta-sep" aria-hidden="true">&middot;</span>
                        <span><?php echo esc_html( $read_time ); ?></span>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </section>

    <!-- ── Back nav strip ────────────────────────────────────────────────────── -->
    <?php
    $blog_url = get_option( 'page_for_posts' )
        ? get_permalink( get_option( 'page_for_posts' ) )
        : home_url( '/blog/' );
    ?>
    <nav class="bluu-post-back" aria-label="<?php esc_attr_e( 'Return to blog', 'bluu-interactive' ); ?>">
        <div class="container">
            <a href="<?php echo esc_url( $blog_url ); ?>">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                <?php esc_html_e( 'Back to all posts', 'bluu-interactive' ); ?>
            </a>
        </div>
    </nav>

    <!-- ── Post content section ──────────────────────────────────────────────── -->
    <div class="bluu-post-section">
        <div class="container">

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

                    <!-- Share buttons -->
                    <div class="bluu-share" aria-label="<?php esc_attr_e( 'Share this post', 'bluu-interactive' ); ?>">
                        <span class="bluu-share__label"><?php esc_html_e( 'Share', 'bluu-interactive' ); ?></span>

                        <!-- LinkedIn -->
                        <a href="#" id="bluu-share-linkedin" class="bluu-share__btn" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Share on LinkedIn', 'bluu-interactive' ); ?>">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zm2-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>
                            LinkedIn
                        </a>

                        <!-- X / Twitter -->
                        <a href="#" id="bluu-share-x" class="bluu-share__btn" target="_blank" rel="noopener noreferrer" aria-label="<?php esc_attr_e( 'Share on X', 'bluu-interactive' ); ?>">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            X
                        </a>

                        <!-- Native share / mailto fallback -->
                        <a href="#" id="bluu-share-native" class="bluu-share__btn" style="display:none" aria-label="<?php esc_attr_e( 'Share via…', 'bluu-interactive' ); ?>">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                            <?php esc_html_e( 'Share', 'bluu-interactive' ); ?>
                        </a>

                        <!-- Copy link -->
                        <button id="bluu-share-copy" class="bluu-share__btn" type="button" aria-label="<?php esc_attr_e( 'Copy link', 'bluu-interactive' ); ?>">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            <?php esc_html_e( 'Copy link', 'bluu-interactive' ); ?>
                        </button>
                    </div>

                    <!-- Author block — only for administrators -->
                    <?php if ( $show_author ) : ?>
                    <div class="bluu-author-block">
                        <div class="bluu-author-block__avatar">
                            <?php echo get_avatar( $author_id, 64, '', esc_attr( $author_name ), array( 'class' => '' ) ); ?>
                        </div>
                        <div class="bluu-author-block__info">
                            <p class="bluu-author-block__name"><?php echo esc_html( $author_name ); ?></p>
                            <?php if ( $author_bio ) : ?>
                                <p class="bluu-author-block__bio"><?php echo esc_html( $author_bio ); ?></p>
                            <?php endif; ?>
                        </div>
                    </div>
                    <?php endif; ?>

                    <!-- Post CTA -->
                    <div class="bluu-post-cta">
                        <h2 class="bluu-post-cta__heading"><?php echo bluu_text( $cta_heading ); ?></h2>
                        <p class="bluu-post-cta__subtext"><?php echo bluu_text( $cta_subtext ); ?></p>
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
