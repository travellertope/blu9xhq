<?php
/**
 * Plugin Name:  BluuHQ CRM
 * Plugin URI:   https://bluuhq.com
 * Description:  Registers all CPTs, user roles, ACF field groups, REST endpoints,
 *               and WPGraphQL resolvers for the BluuHQ CRM & client portal.
 * Version:      1.0.0
 * Author:       BluuHQ
 * Requires PHP: 8.0
 * Requires at least: 6.0
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'BLUUHQ_DIR', plugin_dir_path( __FILE__ ) );
define( 'BLUUHQ_VERSION', '1.0.0' );

foreach ( [ 'cpts', 'roles', 'rest-auth', 'rest-team', 'acf-fields', 'graphql', 'settings', 'tickets' ] as $module ) {
    require_once BLUUHQ_DIR . "includes/{$module}.php";
}

register_activation_hook( __FILE__, function (): void {
    bluuhq_register_roles();
    flush_rewrite_rules();
} );

register_deactivation_hook( __FILE__, function (): void {
    flush_rewrite_rules();
} );
