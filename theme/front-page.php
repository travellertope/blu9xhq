<?php
/**
 * Template Name: Home Page — Scan Tool
 * Template Post Type: page
 *
 * New front page featuring the AI visibility scan tool as the hero,
 * with the scan form pointing to audit.bluuhq.com.
 *
 * Marketing content lives in template-parts/audit/marketing.php, shared
 * with page-audit.php (the stable /audit link for ads/affiliates/backlinks)
 * so the two surfaces can't drift apart.
 *
 * @package bluu-interactive
 */

get_header();

get_template_part( 'template-parts/audit/marketing' );

get_footer();
