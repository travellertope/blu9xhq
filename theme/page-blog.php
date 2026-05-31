<?php
/**
 * Template Name: Blog Archive
 *
 * Assignable page template for the blog listing.
 * Mirrors archive.php structure so blog.css applies without changes.
 *
 * @package bluu-interactive
 */

$paged      = max( 1, get_query_var( 'paged' ) );
$blog_query = new WP_Query( array(
    'post_type'      => 'post',
    'post_status'    => 'publish',
    'posts_per_page' => get_option( 'posts_per_page', 9 ),
    'paged'          => $paged,
    'orderby'        => 'date',
    'order'          => 'DESC',
) );

get_header();
?>

<!-- ── Blog Hero ─────────────────────────────────────────────────────────────── -->
<section class="bluu-archive-hero">
    <div class="container">
        <span class="bluu-archive-hero__eyebrow"><?php esc_html_e( 'Bluu Insights', 'bluu-interactive' ); ?></span>
        <h1 class="bluu-archive-hero__title"><?php esc_html_e( 'Bluu Insights', 'bluu-interactive' ); ?></h1>
        <p class="bluu-archive-hero__subtitle">
            <?php esc_html_e( 'Research, strategy, and honest perspective on content, market intelligence, and what actually works for growing businesses. Every post written and structured to SEO and AI crawl standard.', 'bluu-interactive' ); ?>
        </p>
    </div>
</section>

<!-- ── Category Filter Bar ──────────────────────────────────────────────────── -->
<nav class="bluu-category-filter" aria-label="<?php esc_attr_e( 'Filter posts by category', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="bluu-category-filter__inner">
            <a href="<?php echo esc_url( get_permalink() ); ?>" class="bluu-cat-pill bluu-cat-pill--active" aria-current="page">
                <?php esc_html_e( 'All posts', 'bluu-interactive' ); ?>
            </a>
            <?php
            $cats = get_categories( array( 'hide_empty' => true ) );
            foreach ( $cats as $cat ) :
            ?>
                <a href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>" class="bluu-cat-pill">
                    <?php echo esc_html( $cat->name ); ?>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</nav>

<!-- ── Post Grid ────────────────────────────────────────────────────────────── -->
<section class="bluu-archive-section">
    <div class="container">

        <?php if ( $blog_query->have_posts() ) : ?>
            <div class="bluu-post-grid">
                <?php while ( $blog_query->have_posts() ) : $blog_query->the_post(); ?>
                    <?php get_template_part( 'template-parts/blog/blog-card' ); ?>
                <?php endwhile; ?>
            </div>

            <div class="bluu-archive-pagination">
                <?php
                echo paginate_links( array(
                    'base'      => trailingslashit( get_permalink() ) . '%_%',
                    'format'    => 'page/%#%/',
                    'current'   => $paged,
                    'total'     => $blog_query->max_num_pages,
                    'prev_text' => '&larr; ' . esc_html__( 'Previous', 'bluu-interactive' ),
                    'next_text' => esc_html__( 'Next', 'bluu-interactive' ) . ' &rarr;',
                ) );
                ?>
            </div>

        <?php else : ?>
            <div style="text-align:center; padding: var(--space-10) 0; color: var(--md-on-surface-variant);">
                <p><?php esc_html_e( 'No posts found. Check back soon.', 'bluu-interactive' ); ?></p>
            </div>
        <?php endif; ?>

        <?php wp_reset_postdata(); ?>
    </div>
</section>

<?php get_footer(); ?>
