<?php
/**
 * Plugin Name: AI Productivity Accelerator — Landing Page
 * Plugin URI:  #
 * Description: Standalone sales page for the AI Productivity Accelerator live class. All content managed via ACF fields. No block editor required.
 * Version:     4.2.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author:      Tope Akintayo
 * License:     GPL-2.0-or-later
 * Text Domain: ailp
 */

defined( 'ABSPATH' ) || exit;

define( 'AILP_VERSION', '4.2.0' );
define( 'AILP_DIR',     plugin_dir_path( __FILE__ ) );
define( 'AILP_URL',     plugin_dir_url( __FILE__ ) );
define( 'AILP_TPL',     'templates/template-ai-landing.php' );
define( 'AILP_TPL_TY',  'templates/template-ai-thankyou.php' );

// Load ACF field registration
if ( file_exists( AILP_DIR . 'includes/acf-fields.php' ) ) {
	require_once AILP_DIR . 'includes/acf-fields.php';
}

// Admin notice when ACF is not active
add_action( 'admin_notices', function (): void {
	if ( class_exists( 'ACF' ) ) {
		return;
	}
	echo '<div class="notice notice-info is-dismissible"><p>'
		. '<strong>AI Productivity Landing Page:</strong> Install '
		. '<a href="https://wordpress.org/plugins/advanced-custom-fields/" target="_blank">Advanced Custom Fields (free)</a>'
		. ' to edit page content from the dashboard. The page displays default content without it.</p></div>';
} );

/**
 * Is the landing page template currently active?
 */
function ailp_active(): bool {
	static $result = null;
	if ( $result === null ) {
		$id     = get_queried_object_id();
		$result = $id > 0
			&& is_page()
			&& AILP_TPL === get_page_template_slug( $id );
	}
	return $result;
}

/**
 * Is the thank you page template currently active?
 */
function ailp_ty_active(): bool {
	static $result = null;
	if ( $result === null ) {
		$id     = get_queried_object_id();
		$result = $id > 0
			&& is_page()
			&& AILP_TPL_TY === get_page_template_slug( $id );
	}
	return $result;
}

// Register both templates in Page Attributes > Template dropdown
add_filter( 'theme_page_templates', function ( array $tpls ): array {
	$tpls[ AILP_TPL ]    = __( 'AI Landing Page', 'ailp' );
	$tpls[ AILP_TPL_TY ] = __( 'AI Thank You Page', 'ailp' );
	return $tpls;
} );

// Tell WordPress to use our plugin template files
add_filter( 'template_include', function ( string $tpl ): string {
	if ( ! is_page() ) {
		return $tpl;
	}
	$id   = get_queried_object_id();
	$slug = $id ? get_page_template_slug( $id ) : '';

	if ( AILP_TPL === $slug ) {
		$file = AILP_DIR . AILP_TPL;
		return file_exists( $file ) ? $file : $tpl;
	}
	if ( AILP_TPL_TY === $slug ) {
		$file = AILP_DIR . AILP_TPL_TY;
		return file_exists( $file ) ? $file : $tpl;
	}
	return $tpl;
} );

// Prevent themes injecting their header via wp_body_open
add_action( 'wp_body_open', function (): void {
	if ( ailp_active() || ailp_ty_active() ) {
		remove_all_actions( 'wp_body_open' );
	}
}, PHP_INT_MIN );

// Enqueue fonts + stylesheet (both plugin templates)
add_action( 'wp_enqueue_scripts', function (): void {
	if ( ! ailp_active() && ! ailp_ty_active() ) {
		return;
	}
	wp_enqueue_style(
		'ailp-fonts',
		'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap',
		[],
		null
	);
	wp_enqueue_style(
		'ailp-css',
		AILP_URL . 'assets/css/landing-page.css',
		[ 'ailp-fonts' ],
		filemtime( AILP_DIR . 'assets/css/landing-page.css' )
	);
	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'wp-block-library-theme' );
	wp_dequeue_style( 'global-styles' );
}, 20 );

// Google Fonts preconnect hints
add_action( 'wp_head', function (): void {
	if ( ! ailp_active() && ! ailp_ty_active() ) {
		return;
	}
	echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
	echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}, 1 );

// Body class for CSS scoping
add_filter( 'body_class', function ( array $cls ): array {
	if ( ailp_active() || ailp_ty_active() ) {
		$cls[] = 'ailp-page';
	}
	return $cls;
} );
