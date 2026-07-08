<?php
/**
 * Plugin Name: Bluu Affiliate Network — Landing Page
 * Plugin URI:  #
 * Description: Full-page affiliate program landing page for bluuhq.com/affiliates. All content managed via ACF fields; defaults hardcoded so the page works out of the box.
 * Version:     1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author:      Tope Akintayo
 * License:     GPL-2.0-or-later
 * Text Domain: baff
 */

defined( 'ABSPATH' ) || exit;

define( 'BAFF_VERSION', '1.0.0' );
define( 'BAFF_DIR',     plugin_dir_path( __FILE__ ) );
define( 'BAFF_URL',     plugin_dir_url( __FILE__ ) );
define( 'BAFF_TPL',     'templates/template-affiliates.php' );

if ( file_exists( BAFF_DIR . 'includes/acf-fields.php' ) ) {
	require_once BAFF_DIR . 'includes/acf-fields.php';
}

add_action( 'admin_notices', function (): void {
	if ( class_exists( 'ACF' ) ) return;
	echo '<div class="notice notice-info is-dismissible"><p>'
		. '<strong>Bluu Affiliate Landing Page:</strong> Install '
		. '<a href="https://wordpress.org/plugins/advanced-custom-fields/" target="_blank">Advanced Custom Fields</a>'
		. ' to edit page content from the dashboard.</p></div>';
} );

function baff_active(): bool {
	static $result = null;
	if ( $result === null ) {
		$id     = get_queried_object_id();
		$result = $id > 0 && is_page() && BAFF_TPL === get_page_template_slug( $id );
	}
	return $result;
}

add_filter( 'theme_page_templates', function ( array $tpls ): array {
	$tpls[ BAFF_TPL ] = __( 'Bluu Affiliate Landing Page', 'baff' );
	return $tpls;
} );

add_filter( 'template_include', function ( string $tpl ): string {
	if ( ! is_page() ) return $tpl;
	$id   = get_queried_object_id();
	$slug = $id ? get_page_template_slug( $id ) : '';
	if ( BAFF_TPL === $slug ) {
		$file = BAFF_DIR . BAFF_TPL;
		return file_exists( $file ) ? $file : $tpl;
	}
	return $tpl;
} );

add_action( 'wp_body_open', function (): void {
	if ( baff_active() ) {
		remove_all_actions( 'wp_body_open' );
	}
}, PHP_INT_MIN );

add_action( 'wp_enqueue_scripts', function (): void {
	if ( ! baff_active() ) return;

	wp_enqueue_style(
		'baff-fonts',
		'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap',
		[],
		null
	);
	wp_enqueue_style(
		'baff-css',
		BAFF_URL . 'assets/css/affiliates-landing.css',
		[ 'baff-fonts' ],
		filemtime( BAFF_DIR . 'assets/css/affiliates-landing.css' )
	);
	wp_dequeue_style( 'wp-block-library' );
	wp_dequeue_style( 'wp-block-library-theme' );
	wp_dequeue_style( 'global-styles' );
}, 20 );

add_action( 'wp_head', function (): void {
	if ( ! baff_active() ) return;
	echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
	echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}, 1 );

add_filter( 'body_class', function ( array $cls ): array {
	if ( baff_active() ) $cls[] = 'baff-page';
	return $cls;
} );

/**
 * Cookie: capture ?ref= on any WordPress page so referral attribution
 * works for leads who first land on bluuhq.com before visiting scan/portal.
 */
add_action( 'init', function (): void {
	if ( headers_sent() ) return;
	if ( isset( $_GET['ref'] ) && ! isset( $_COOKIE['bluu_ref'] ) ) {
		$code = sanitize_text_field( wp_unslash( $_GET['ref'] ) );
		if ( preg_match( '/^[A-Z0-9]{4,20}$/i', $code ) ) {
			setcookie(
				'bluu_ref',
				$code,
				[
					'expires'  => time() + ( 60 * DAY_IN_SECONDS ),
					'path'     => '/',
					'domain'   => '',
					'secure'   => is_ssl(),
					'httponly' => false,
					'samesite' => 'Lax',
				]
			);
		}
	}
} );
