<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// ─── POST /wp-json/bluuhq/v1/auth/validate ────────────────────────────────────
// Called by NextAuth credentials provider to verify username/password and
// return the user's WP roles + CRM meta in one response.

add_action( 'rest_api_init', function (): void {
    register_rest_route( 'bluuhq/v1', '/auth/validate', [
        'methods'             => 'POST',
        'callback'            => 'bluuhq_auth_validate',
        'permission_callback' => '__return_true',
    ] );
} );

function bluuhq_auth_validate( WP_REST_Request $request ): WP_REST_Response|WP_Error {
    $username = sanitize_text_field( $request->get_param( 'username' ) );
    $password = $request->get_param( 'password' );

    if ( empty( $username ) || empty( $password ) ) {
        return new WP_Error( 'missing_fields', 'Username and password are required.', [ 'status' => 400 ] );
    }

    $user = wp_authenticate( $username, $password );

    if ( is_wp_error( $user ) ) {
        return new WP_Error( 'invalid_credentials', 'Invalid credentials.', [ 'status' => 401 ] );
    }

    return new WP_REST_Response( [
        'id'    => $user->ID,
        'name'  => $user->display_name,
        'email' => $user->user_email,
        'roles' => array_values( $user->roles ),
        'meta'  => [
            // Client portal link
            'bluu_client_post_id'     => (int) ( get_user_meta( $user->ID, 'bluu_client_post_id', true ) ?: 0 ),
            // Client portal state
            'portal_setup_complete'   => get_user_meta( $user->ID, 'portal_setup_complete', true ) ?: '',
            'portal_last_login'       => get_user_meta( $user->ID, 'portal_last_login', true ) ?: '',
            // CRM team meta
            'bluuhq_role'             => get_user_meta( $user->ID, 'bluuhq_role', true ) ?: null,
            'bluuhq_status'           => get_user_meta( $user->ID, 'bluuhq_status', true ) ?: 'active',
            'bluuhq_last_active'      => get_user_meta( $user->ID, 'bluuhq_last_active', true ) ?: null,
            'bluuhq_assigned_clients' => bluuhq_decode_assigned_clients( $user->ID ),
        ],
    ], 200 );
}

// ─── Helper: decode assigned clients from user meta ──────────────────────────

function bluuhq_decode_assigned_clients( int $user_id ): array {
    $raw = get_user_meta( $user_id, 'bluuhq_assigned_clients', true );

    if ( is_array( $raw ) ) {
        return array_map( 'intval', $raw );
    }

    if ( is_string( $raw ) && $raw !== '' ) {
        $decoded = json_decode( $raw, true );
        return is_array( $decoded ) ? array_map( 'intval', $decoded ) : [];
    }

    return [];
}
