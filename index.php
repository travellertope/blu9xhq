<?php
/**
 * Main template fallback — used for blog index
 *
 * @package bluu-interactive
 */

get_header();
?>

<main id="main-content" class="site-main">

    <!-- Page Hero -->
    <section class="page-hero page-hero--navy">
        <div class="container">
            <h1 class="page-hero__title"><?php
                if ( is_home() && ! is_front_page() ) {
                    single_post_title();
                } else {
                    esc_html_e( 'Insights', 'bluu-interactive' );
                }
            ?></h1>
            <p class="page-hero__subtitle"><?php esc_html_e( 'Strategy, case studies, and expert perspectives from the Bluu Interactive team.', 'bluu-interactive' ); ?></p>
        </div>
    </section>

    <!-- Blog Loop -->
    <section class="section">
        <div class="container">
            <?php if ( have_posts() ) : ?>
                <div class="posts-grid grid-3">
                    <?php while ( have_posts() ) : the_post(); ?>
                        <article id="post-<?php the_ID(); ?>" <?php post_class( 'md-card post-card' ); ?>>
                            <?php if ( has_post_thumbnail() ) : ?>
                                <a href="<?php the_permalink(); ?>" class="post-card__thumbnail" aria-hidden="true" tabindex="-1">
                                    <?php the_post_thumbnail( 'medium_large', [ 'alt' => '' ] ); ?>
                                </a>
                            <?php endif; ?>
                            <div class="post-card__body">
                                <?php
                                $categories = get_the_category();
                                if ( $categories ) :
                                    $cat = $categories[0];
                                ?>
                                    <span class="md-chip md-chip--accent"><?php echo esc_html( $cat->name ); ?></span>
                                <?php endif; ?>
                                <h2 class="post-card__title">
                                    <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                                </h2>
                                <div class="post-card__excerpt">
                                    <?php the_excerpt(); ?>
                                </div>
                                <div class="post-card__meta">
                                    <span class="post-card__date"><?php echo esc_html( get_the_date() ); ?></span>
                                    <a href="<?php the_permalink(); ?>" class="btn-text btn-text--accent">
                                        <?php esc_html_e( 'Read More', 'bluu-interactive' ); ?>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                    </a>
                                </div>
                            </div>
                        </article>
                    <?php endwhile; ?>
                </div>

                <!-- Pagination -->
                <div class="pagination">
                    <?php
                    the_posts_pagination( [
                        'prev_text' => '&larr; ' . __( 'Newer Posts', 'bluu-interactive' ),
                        'next_text' => __( 'Older Posts', 'bluu-interactive' ) . ' &rarr;',
                        'class'     => 'pagination__nav',
                    ] );
                    ?>
                </div>

            <?php else : ?>
                <div class="no-posts">
                    <p><?php esc_html_e( 'No posts found. Check back soon.', 'bluu-interactive' ); ?></p>
                </div>
            <?php endif; ?>
        </div>
    </section>

</main>

<?php get_footer(); ?>
