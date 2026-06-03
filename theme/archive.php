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

                <!-- Search — pinned to the right of the filter bar -->
                <div class="bluu-archive-search__wrap" role="search">
                    <svg class="bluu-archive-search__icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                        type="search"
                        id="bluu-archive-search-input"
                        class="bluu-archive-search__input"
                        placeholder="<?php esc_attr_e( 'Search posts…', 'bluu-interactive' ); ?>"
                        autocomplete="off"
                        spellcheck="false"
                        aria-label="<?php esc_attr_e( 'Search posts', 'bluu-interactive' ); ?>"
                    >
                    <button id="bluu-archive-search-clear" class="bluu-archive-search__clear" type="button" aria-label="<?php esc_attr_e( 'Clear search', 'bluu-interactive' ); ?>">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- ── Post Grid ─────────────────────────────────────────────────────────── -->
    <section class="bluu-archive-section">
        <div class="container">

            <!-- Search results (hidden until a query is active) -->
            <div id="bluu-search-results" class="bluu-search-results">
                <div id="bluu-search-spinner" class="bluu-search-results__spinner" style="display:none">
                    <div class="bluu-spinner"></div>
                </div>
                <p id="bluu-search-results-meta" class="bluu-search-results__meta"></p>
                <div id="bluu-search-results-grid" class="bluu-search-results__grid"></div>
                <p id="bluu-search-empty" class="bluu-search-results__empty" style="display:none">
                    <?php esc_html_e( 'No posts found for that search. Try different keywords.', 'bluu-interactive' ); ?>
                </p>
            </div>

            <?php if ( have_posts() ) : ?>
                <div class="bluu-post-grid" id="bluu-post-grid">
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
