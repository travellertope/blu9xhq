<?php
/**
 * Plugin Name:       AI Productivity Accelerator — Landing Page
 * Plugin URI:        #
 * Description:       Sales page template for the AI Productivity Accelerator class.
 *                    All content is managed through ACF fields — no block editor needed.
 *                    Requires Advanced Custom Fields (free or Pro).
 * Version:           2.2.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Your Name
 * License:           GPL-2.0-or-later
 * Text Domain:       ai-landing
 */

defined( 'ABSPATH' ) || exit;

define( 'AI_LANDING_VERSION',      '2.2.0' );
define( 'AI_LANDING_DIR',          plugin_dir_path( __FILE__ ) );
define( 'AI_LANDING_URL',          plugin_dir_url( __FILE__ ) );
define( 'AI_LANDING_TEMPLATE_KEY', 'templates/template-ai-landing.php' );

// ─── ACF field registration ───────────────────────────────────────────────
if ( file_exists( AI_LANDING_DIR . 'includes/acf-fields.php' ) ) {
	require_once AI_LANDING_DIR . 'includes/acf-fields.php';
}

// ─── Admin notice if ACF is missing ──────────────────────────────────────
add_action( 'admin_notices', function (): void {
	if ( class_exists( 'ACF' ) ) {
		return;
	}
	echo '<div class="notice notice-error"><p>'
		. '<strong>AI Productivity Landing Page:</strong> '
		. 'This plugin requires <a href="https://www.advancedcustomfields.com/" target="_blank">Advanced Custom Fields</a> to be installed and active.'
		. '</p></div>';
} );

// ─── Helper: is the landing template active? ─────────────────────────────
function ai_landing_is_active(): bool {
	static $result = null;
	if ( null === $result ) {
		$result = is_page()
			&& AI_LANDING_TEMPLATE_KEY === get_post_meta( get_the_ID(), '_wp_page_template', true );
	}
	return $result;
}

// ─── Register template in Page Attributes dropdown ───────────────────────
add_filter( 'theme_page_templates', function ( array $templates ): array {
	$templates[ AI_LANDING_TEMPLATE_KEY ] = __( 'AI Landing Page', 'ai-landing' );
	return $templates;
} );

// ─── Serve the plugin template file ──────────────────────────────────────
add_filter( 'template_include', function ( string $template ): string {
	if ( ! is_page() ) {
		return $template;
	}
	$selected = get_post_meta( get_the_ID(), '_wp_page_template', true );
	if ( $selected !== AI_LANDING_TEMPLATE_KEY ) {
		return $template;
	}
	$plugin_template = AI_LANDING_DIR . AI_LANDING_TEMPLATE_KEY;
	return file_exists( $plugin_template ) ? $plugin_template : $template;
} );

// ─── Enqueue Google Fonts + stylesheet ───────────────────────────────────
add_action( 'wp_enqueue_scripts', function (): void {
	if ( ! ai_landing_is_active() ) {
		return;
	}

	wp_enqueue_style(
		'ai-landing-google-fonts',
		'https://fonts.googleapis.com/css2?'
			. 'family=Fraunces:ital,opsz,wght@'
			.   '0,9..144,400;0,9..144,600;0,9..144,700;'
			.   '1,9..144,400;1,9..144,600'
			. '&family=DM+Sans:wght@400;500;600'
			. '&display=swap',
		[],
		null
	);

	wp_enqueue_style(
		'ai-landing-page',
		AI_LANDING_URL . 'assets/css/landing-page.css',
		[ 'ai-landing-google-fonts' ],
		AI_LANDING_VERSION
	);

	// Strip block styles — not needed without Gutenberg content
	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'wp-block-library-theme' );
	wp_dequeue_style( 'global-styles' );
}, 20 );

// ─── Preconnect hints ────────────────────────────────────────────────────
add_action( 'wp_head', function (): void {
	if ( ! ai_landing_is_active() ) {
		return;
	}
	echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
	echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}, 1 );

// ─── Body classes ────────────────────────────────────────────────────────
add_filter( 'body_class', function ( array $classes ): array {
	if ( ai_landing_is_active() ) {
		$classes[] = 'landing-page';
	}
	return $classes;
} );
