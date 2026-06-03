<?php
/**
 * Plugin Name:       AI Productivity Accelerator — Landing Page
 * Plugin URI:        #
 * Description:       Registers the "AI Landing Page" page template and enqueues
 *                    its stylesheet. Install, activate, create a new Page, then
 *                    set Page Attributes → Template → AI Landing Page.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Your Name
 * Author URI:        #
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       ai-landing
 */

defined( 'ABSPATH' ) || exit;

define( 'AI_LANDING_VERSION', '1.0.0' );
define( 'AI_LANDING_DIR',     plugin_dir_path( __FILE__ ) );
define( 'AI_LANDING_URL',     plugin_dir_url( __FILE__ ) );

/** Internal template key — must match what's stored in post meta. */
const AI_LANDING_TEMPLATE_KEY = 'templates/template-ai-landing.php';

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true when the current request is for a page using our template.
 * Caches the result so repeated calls on the same request are free.
 */
function ai_landing_is_active(): bool {
	static $result = null;

	if ( null === $result ) {
		$result = is_page()
			&& AI_LANDING_TEMPLATE_KEY === get_post_meta( get_the_ID(), '_wp_page_template', true );
	}

	return $result;
}

// ─── 1. Register template in the Page Attributes dropdown ─────────────────
add_filter( 'theme_page_templates', function ( array $templates ): array {
	$templates[ AI_LANDING_TEMPLATE_KEY ] = __( 'AI Landing Page', 'ai-landing' );
	return $templates;
} );

// ─── 2. Serve the plugin template file instead of the theme one ───────────
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

// ─── 3. Enqueue Google Fonts + stylesheet ─────────────────────────────────
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
		null  // Google Fonts manages its own versioning
	);

	wp_enqueue_style(
		'ai-landing-page',
		AI_LANDING_URL . 'assets/css/landing-page.css',
		[ 'ai-landing-google-fonts' ],
		AI_LANDING_VERSION
	);

	// Dequeue heavy default block styles — our CSS overrides them all.
	// Remove these lines if any blocks look unstyled on other pages.
	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'wp-block-library-theme' );
	wp_dequeue_style( 'global-styles' );
}, 20 );

// ─── 4. Preconnect hints for Google Fonts (performance) ───────────────────
add_action( 'wp_head', function (): void {
	if ( ! ai_landing_is_active() ) {
		return;
	}
	echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
	echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}, 1 );

// ─── 5. Body classes ──────────────────────────────────────────────────────
add_filter( 'body_class', function ( array $classes ): array {
	if ( ai_landing_is_active() ) {
		$classes[] = 'landing-page';
		$classes[] = 'no-header';
		$classes[] = 'no-footer';
	}
	return $classes;
} );
