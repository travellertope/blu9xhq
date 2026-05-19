<?php
/**
 * Default page template
 *
 * @package bluu-interactive
 */

get_header();
?>

<main id="main-content" class="site-main">

    <?php while ( have_posts() ) : the_post(); ?>

        <!-- Page Hero -->
        <section class="page-hero page-hero--navy">
            <div class="container">
                <h1 class="page-hero__title"><?php the_title(); ?></h1>
                <?php if ( has_excerpt() ) : ?>
                    <p class="page-hero__subtitle"><?php the_excerpt(); ?></p>
                <?php endif; ?>
            </div>
        </section>

        <!-- Page Content -->
        <section class="section">
            <div class="container container--narrow">
                <div class="page-content entry-content">
                    <?php the_content(); ?>
                </div>
            </div>
        </section>

    <?php endwhile; ?>

</main>

<?php get_footer(); ?>
