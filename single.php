<?php
/**
 * Single post template
 *
 * @package bluu-interactive
 */

get_header();
?>

<main id="main-content" class="site-main">

    <?php while ( have_posts() ) : the_post(); ?>

        <!-- Article Hero -->
        <section class="page-hero page-hero--navy">
            <div class="container">
                <?php
                $categories = get_the_category();
                if ( $categories ) :
                    $cat = $categories[0];
                ?>
                    <span class="md-chip md-chip--light" style="margin-bottom: var(--space-4); display: inline-block;">
                        <?php echo esc_html( $cat->name ); ?>
                    </span>
                <?php endif; ?>
                <h1 class="page-hero__title"><?php the_title(); ?></h1>
                <div class="page-hero__meta">
                    <span><?php echo esc_html( get_the_date() ); ?></span>
                    <span class="separator" aria-hidden="true">&middot;</span>
                    <span><?php echo esc_html( get_the_author() ); ?></span>
                </div>
            </div>
        </section>

        <!-- Featured Image -->
        <?php if ( has_post_thumbnail() ) : ?>
            <div class="post-featured-image container">
                <?php the_post_thumbnail( 'large', [ 'class' => 'post-featured-image__img', 'alt' => get_the_title() ] ); ?>
            </div>
        <?php endif; ?>

        <!-- Article Content -->
        <section class="section">
            <div class="container container--narrow">
                <article class="entry-content post-body">
                    <?php the_content(); ?>
                </article>

                <!-- Post Navigation -->
                <nav class="post-navigation" aria-label="<?php esc_attr_e( 'Post navigation', 'bluu-interactive' ); ?>">
                    <div class="post-navigation__prev">
                        <?php previous_post_link( '%link', '&larr; %title' ); ?>
                    </div>
                    <div class="post-navigation__next">
                        <?php next_post_link( '%link', '%title &rarr;' ); ?>
                    </div>
                </nav>
            </div>
        </section>

    <?php endwhile; ?>

</main>

<?php get_footer(); ?>
