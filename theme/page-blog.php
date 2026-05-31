<?php
/**
 * Template Name: Blog Archive
 *
 * Assignable page template that renders the blog listing.
 * Use this when you need a specific WordPress page (e.g. /blog) to display
 * the post archive rather than relying on the automatic posts-page setting.
 *
 * @package bluu-interactive
 */

$paged         = max( 1, get_query_var( 'paged' ) );
$posts_per_page = 9;

$blog_query = new WP_Query( array(
    'post_type'      => 'post',
    'post_status'    => 'publish',
    'posts_per_page' => $posts_per_page,
    'paged'          => $paged,
    'orderby'        => 'date',
    'order'          => 'DESC',
) );

get_header();
?>

<!-- ── Blog Hero ────────────────────────────────────────────────────────────── -->
<section class="blog-hero" aria-label="<?php esc_attr_e( 'Blog overview', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="blog-hero__inner animate-on-scroll">
            <div class="blog-hero__badge"><?php esc_html_e( 'Bluu Insights', 'bluu-interactive' ); ?></div>
            <h1 class="blog-hero__headline"><?php esc_html_e( 'Strategy, content, and growth thinking for B2B teams.', 'bluu-interactive' ); ?></h1>
        </div>
    </div>
</section>

<!-- ── Category Filter Bar ──────────────────────────────────────────────────── -->
<?php
$categories = get_categories( array( 'hide_empty' => true, 'orderby' => 'count', 'order' => 'DESC' ) );
if ( $categories ) : ?>
<div class="blog-filter-bar" role="navigation" aria-label="<?php esc_attr_e( 'Filter by category', 'bluu-interactive' ); ?>">
    <div class="container">
        <div class="blog-filter-bar__inner">
            <a href="<?php echo esc_url( get_permalink() ); ?>" class="blog-filter-bar__pill blog-filter-bar__pill--active">
                <?php esc_html_e( 'All', 'bluu-interactive' ); ?>
            </a>
            <?php foreach ( $categories as $cat ) : ?>
                <a href="<?php echo esc_url( get_category_link( $cat->term_id ) ); ?>" class="blog-filter-bar__pill">
                    <?php echo esc_html( $cat->name ); ?>
                </a>
            <?php endforeach; ?>
        </div>
    </div>
</div>
<?php endif; ?>

<!-- ── Post Grid ────────────────────────────────────────────────────────────── -->
<section class="blog-archive" aria-label="<?php esc_attr_e( 'Blog posts', 'bluu-interactive' ); ?>">
    <div class="container">

        <?php if ( $blog_query->have_posts() ) : ?>
            <div class="blog-grid">
                <?php while ( $blog_query->have_posts() ) : $blog_query->the_post(); ?>
                    <?php get_template_part( 'template-parts/blog/blog-card' ); ?>
                <?php endwhile; ?>
            </div>

            <!-- Pagination -->
            <?php if ( $blog_query->max_num_pages > 1 ) : ?>
                <nav class="blog-pagination" aria-label="<?php esc_attr_e( 'Posts navigation', 'bluu-interactive' ); ?>">
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
                </nav>
            <?php endif; ?>

        <?php else : ?>
            <div class="blog-empty">
                <p><?php esc_html_e( 'No posts found. Check back soon.', 'bluu-interactive' ); ?></p>
            </div>
        <?php endif; ?>

        <?php wp_reset_postdata(); ?>
    </div>
</section>

<?php get_footer(); ?>
