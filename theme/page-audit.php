<?php
/**
 * Template Name: BluuAudit Marketing Page
 * Template Post Type: page
 *
 * Stable, homepage-independent landing page for BluuAudit — assigned to
 * /audit so ads, affiliate links, and backlinks have a URL that won't
 * shift if the homepage content changes later.
 *
 * Shares its content with front-page.php via template-parts/audit/marketing.php
 * so the two surfaces can't drift apart.
 *
 * @package bluu-interactive
 */

get_header();

get_template_part( 'template-parts/audit/marketing' );

get_footer();
