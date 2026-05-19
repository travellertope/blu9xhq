<?php
/**
 * Front Page Template
 *
 * @package bluu-interactive
 */

get_header();
?>

<?php get_template_part( 'template-parts/home/hero' ); ?>
<?php get_template_part( 'template-parts/home/problem' ); ?>
<?php get_template_part( 'template-parts/home/pillars' ); ?>
<?php get_template_part( 'template-parts/home/icp' ); ?>
<?php get_template_part( 'template-parts/home/cta-section' ); ?>

<?php get_footer(); ?>
