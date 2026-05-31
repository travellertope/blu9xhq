<?php
/**
 * Template Name: Home Page
 * Template Post Type: page
 *
 * Front Page Template — assign this template to your homepage, then set it as
 * the Static Front Page under Settings > Reading.
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
