<?php
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'rest_api_init', 'bluuhq_register_team_endpoints' );
function bluuhq_register_team_endpoints(): void {

    // GET /wp-json/bluuhq/v1/team — list all bluu_admin + bluu_team users
    register_rest_route( 'bluuhq/v1', '/team', [
        'methods'             => 'GET',
        'callback'            => 'bluuhq_get_team',
        'permission_callback' => 'bluuhq_is_admin_request',
    ] );

    // POST /wp-json/bluuhq/v1/ping — stamp last_active for the authenticated user
    register_rest_route( 'bluuhq/v1', '/ping', [
        'methods'             => 'POST',
        'callback'            => 'bluuhq_ping',
        'permission_callback' => 'bluuhq_is_team_request',
    ] );
}


// ─── GET /bluuhq/v1/team ─────────────────────────────────────────────────────

function bluuhq_get_team( WP_REST_Request $request ): WP_REST_Response {
    $users = get_users( [
        'role__in' => [ 'bluu_admin', 'bluu_team' ],
        'number'   => -1,
        'orderby'  => 'display_name',
        'order'    => 'ASC',
    ] );

    $result = array_map( function ( WP_User $user ): array {
        return [
            'id'                      => $user->ID,
            'name'                    => $user->display_name,
            'email'                   => $user->user_email,
            'wp_roles'                => array_values( $user->roles ),
            'bluuhq_role'             => get_user_meta( $user->ID, 'bluuhq_role', true ) ?: 'viewer',
            'bluuhq_status'           => get_user_meta( $user->ID, 'bluuhq_status', true ) ?: 'active',
            'bluuhq_assigned_clients' => bluuhq_decode_assigned_clients( $user->ID ),
            'bluuhq_last_active'      => get_user_meta( $user->ID, 'bluuhq_last_active', true ) ?: null,
        ];
    }, $users );

    return new WP_REST_Response( $result, 200 );
}


// ─── POST /bluuhq/v1/ping ────────────────────────────────────────────────────

function bluuhq_ping( WP_REST_Request $request ): WP_REST_Response {
    $user = wp_get_current_user();
    update_user_meta( $user->ID, 'bluuhq_last_active', gmdate( 'c' ) );
    return new WP_REST_Response( [ 'ok' => true ], 200 );
}


// ─── Permission callbacks ─────────────────────────────────────────────────────

function bluuhq_is_admin_request(): bool {
    $user = wp_get_current_user();
    return $user && array_intersect(
        [ 'bluu_admin', 'administrator' ],
        (array) $user->roles
    ) !== [];
}

function bluuhq_is_team_request(): bool {
    $user = wp_get_current_user();
    return $user && array_intersect( [ 'bluu_admin', 'bluu_team', 'administrator' ], (array) $user->roles ) !== [];
}
