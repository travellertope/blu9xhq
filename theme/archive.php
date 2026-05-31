<?php
/**
 * Archive template — blog listing, category, tag, date archives
 *
 * @package bluu-interactive
 */

get_header();
?>

<main id="main-content" class="site-main">

    <!-- ── Blog Hero ─────────────────────────────────────────────────────────── -->
    <section class="bluu-archive-hero">
        <div class="container">
            <span class="bluu-archive-hero__eyebrow"><?php esc_html_e( 'Bluu Insights', 'bluu-interactive' ); ?></span>
            <h1 class="bluu-archive-hero__title">
                <?php
                if ( is_category() ) {
                    single_cat_title();
                } elseif ( is_tag() ) {
                    echo esc_html__( 'Posts tagged: ', 'bluu-interactive' );
                    single_tag_title();
                } elseif ( is_author() ) {
                    echo esc_html__( 'Posts by ', 'bluu-interactive' ) . esc_html( get_the_author() );
                } elseif ( is_date() ) {
                    echo esc_html( get_the_date( 'F Y' ) );
                } else {
                    esc_html_e( 'Bluu Insights', 'bluu-interactive' );
                }
                ?>
            </h1>
            <?php if ( is_home() || is_archive() && ! is_category() ) : ?>
                <p class="bluu-archive-hero__subtitle">
                    <?php esc_html_e( 'Research, strategy, and honest perspective on content, market intelligence, and what actually works for growing businesses. Every post written and structured to SEO and AI crawl standard.', 'bluu-interactive' ); ?>
                </p>
            <?php elseif ( is_category() ) : ?>
                <?php
                $cat_desc = category_description();
                if ( $cat_desc ) {
                    echo '<p class="bluu-archive-hero__subtitle">' . wp_kses_post( $cat_desc ) . '</p>';
                }
                ?>
            <?php endif; ?>
        </div>
    </section>

    <!-- ── Category Filter Bar ───────────────────────────────────────────────── -->
    <nav class="bluu-category-filter" aria-label="<?php esc_attr_e( 'Filter posts by category', 'bluu-interactive' ); ?>">
        <div class="container">
            <div class="bluu-category-filter__inner">
                <?php
                $current_cat = is_category() ? get_queried_object() : null;
                $is_all      = ! is_category();

                $blog_url = get_option( 'page_for_posts' )
                    ? get_permalink( get_option( 'page_for_posts' ) )
                    : home_url( '/blog/' );
                ?>
                <a href="<?php echo esc_url( $blog_url ); ?>"
                   class="bluu-cat-pill<?php echo $is_all ? ' bluu-cat-pill--active' : ''; ?>"
                   <?php echo $is_all ? 'aria-current="page"' : ''; ?>>
                    <?php esc_html_e( 'All posts', 'bluu-interactive' ); ?>
                </a>

                <?php
                $cats = get_categories( array( 'hide_empty' => true ) );
                foreach ( $cats as $cat ) :
                    $is_current = $current_cat && $current_cat->term_id === $cat->term_id;
                ?>
                    <a href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>"
                       class="bluu-cat-pill<?php echo $is_current ? ' bluu-cat-pill--active' : ''; ?>"
                       <?php echo $is_current ? 'aria-current="page"' : ''; ?>>
                        <?php echo esc_html( $cat->name ); ?>
                    </a>
                <?php endforeach; ?>
            </div>
        </div>
    </nav>

    <!-- ── Post Grid ─────────────────────────────────────────────────────────── -->
    <section class="bluu-archive-section">
        <div class="container">

            <?php if ( have_posts() ) : ?>
                <div class="bluu-post-grid">
                    <?php while ( have_posts() ) : the_post(); ?>
                        <?php get_template_part( 'template-parts/blog/blog-card' ); ?>
                    <?php endwhile; ?>
                </div>

                <!-- Pagination -->
                <div class="bluu-archive-pagination">
                    <?php
                    the_posts_pagination( array(
                        'prev_text'          => '&larr; ' . esc_html__( 'Previous', 'bluu-interactive' ),
                        'next_text'          => esc_html__( 'Next', 'bluu-interactive' ) . ' &rarr;',
                        'before_page_number' => '<span class="screen-reader-text">' . esc_html__( 'Page ', 'bluu-interactive' ) . '</span>',
                    ) );
                    ?>
                </div>

            <?php else : ?>
                <div style="text-align:center; padding: var(--space-10) 0; color: var(--md-on-surface-variant);">
                    <p><?php esc_html_e( 'No posts found.', 'bluu-interactive' ); ?></p>
                    <a href="<?php echo esc_url( $blog_url ); ?>" class="btn-primary btn-primary--small" style="margin-top:var(--space-5);"><?php esc_html_e( 'View all posts', 'bluu-interactive' ); ?></a>
                </div>
            <?php endif; ?>

        </div>
    </section>

</main>

<?php get_footer(); ?>
