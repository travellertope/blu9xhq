<?php
if ( ! defined( 'ABSPATH' ) ) exit;

// ─── Role registration (also called on plugin activation) ─────────────────────

function bluuhq_register_roles(): void {

    // bluu_admin — full CRM + WP admin access
    if ( ! get_role( 'bluu_admin' ) ) {
        add_role( 'bluu_admin', 'BluuHQ Admin', [
            'read'           => true,
            'manage_options' => true,
            'upload_files'   => true,
            'edit_posts'     => true,
            // bluu_client caps
            'edit_bluu_client'                  => true,
            'edit_bluu_clients'                 => true,
            'edit_others_bluu_clients'          => true,
            'publish_bluu_clients'              => true,
            'read_private_bluu_clients'         => true,
            'delete_bluu_client'                => true,
            'delete_bluu_clients'               => true,
            // bluu_service caps
            'edit_bluu_service'                 => true,
            'edit_bluu_services'                => true,
            'edit_others_bluu_services'         => true,
            'publish_bluu_services'             => true,
            'read_private_bluu_services'        => true,
            'delete_bluu_service'               => true,
            'delete_bluu_services'              => true,
            // bluu_subscription caps
            'edit_bluu_subscription'            => true,
            'edit_bluu_subscriptions'           => true,
            'edit_others_bluu_subscriptions'    => true,
            'publish_bluu_subscriptions'        => true,
            'read_private_bluu_subscriptions'   => true,
            'delete_bluu_subscription'          => true,
            'delete_bluu_subscriptions'         => true,
            // bluu_invoice caps
            'edit_bluu_invoice'                 => true,
            'edit_bluu_invoices'                => true,
            'edit_others_bluu_invoices'         => true,
            'publish_bluu_invoices'             => true,
            'read_private_bluu_invoices'        => true,
            'delete_bluu_invoice'               => true,
            'delete_bluu_invoices'              => true,
            // bluu_file caps
            'edit_bluu_file'                    => true,
            'edit_bluu_files'                   => true,
            'edit_others_bluu_files'            => true,
            'publish_bluu_files'                => true,
            'read_private_bluu_files'           => true,
            'delete_bluu_file'                  => true,
            'delete_bluu_files'                 => true,
            // bluu_communication caps
            'edit_bluu_communication'           => true,
            'edit_bluu_communications'          => true,
            'edit_others_bluu_communications'   => true,
            'publish_bluu_communications'       => true,
            'read_private_bluu_communications'  => true,
            'delete_bluu_communication'         => true,
            'delete_bluu_communications'        => true,
            // bluu_sequence caps
            'edit_bluu_sequence'                => true,
            'edit_bluu_sequences'               => true,
            'edit_others_bluu_sequences'        => true,
            'publish_bluu_sequences'            => true,
            'read_private_bluu_sequences'       => true,
            'delete_bluu_sequence'              => true,
            'delete_bluu_sequences'             => true,
            // bluu_email_template caps
            'edit_bluu_email_template'          => true,
            'edit_bluu_email_templates'         => true,
            'edit_others_bluu_email_templates'  => true,
            'publish_bluu_email_templates'      => true,
            'read_private_bluu_email_templates' => true,
            'delete_bluu_email_template'        => true,
            'delete_bluu_email_templates'       => true,
        ] );
    }

    // bluu_team — portal team member; CRM access scoped in Next.js, read-only WP admin
    if ( ! get_role( 'bluu_team' ) ) {
        add_role( 'bluu_team', 'BluuHQ Team', [
            'read'                      => true,
            'upload_files'              => false,
            'edit_posts'                => false,
            'edit_bluu_clients'         => true,
            'edit_bluu_communications'  => true,
            'edit_bluu_invoices'        => true,
            'edit_bluu_files'           => true,
            'edit_bluu_subscriptions'   => true,
            'edit_bluu_services'        => true,
            'edit_bluu_sequences'       => true,
        ] );
    }

    // bluu_client — portal client; data-scoping enforced in Next.js
    if ( ! get_role( 'bluu_client' ) ) {
        add_role( 'bluu_client', 'BluuHQ Client', [
            'read' => true,
        ] );
    }
}

// Also run on init so roles exist even if activation hook was missed
add_action( 'init', 'bluuhq_register_roles' );


// ─── User meta keys ───────────────────────────────────────────────────────────

add_action( 'init', 'bluuhq_register_user_meta' );
function bluuhq_register_user_meta(): void {
    $admin_only = fn() => current_user_can( 'manage_options' );

    $base = [
        'show_in_rest'  => true,
        'single'        => true,
        'auth_callback' => $admin_only,
    ];

    register_meta( 'user', 'bluuhq_role', array_merge( $base, [
        'type'        => 'string',
        'description' => 'CRM role: super_admin|account_manager|billing_manager|support_staff|viewer',
        'default'     => 'viewer',
    ] ) );

    register_meta( 'user', 'bluuhq_status', array_merge( $base, [
        'type'        => 'string',
        'description' => 'Account status: active|deactivated',
        'default'     => 'active',
    ] ) );

    register_meta( 'user', 'bluuhq_last_active', array_merge( $base, [
        'type'        => 'string',
        'description' => 'ISO 8601 timestamp of last portal login',
        'default'     => '',
    ] ) );

    // Stored as JSON-encoded string: "[1,2,3]"
    register_meta( 'user', 'bluuhq_assigned_clients', array_merge( $base, [
        'type'        => 'string',
        'description' => 'JSON array of bluu_client post IDs assigned to this account_manager',
        'default'     => '[]',
    ] ) );

    // Linked bluu_client CPT post ID (for bluu_client WP users)
    register_meta( 'user', 'bluu_client_post_id', array_merge( $base, [
        'type'        => 'integer',
        'description' => 'The bluu_client CPT post ID linked to this WP user',
        'default'     => 0,
    ] ) );

    // ── Client portal meta ────────────────────────────────────────────────────

    register_meta( 'user', 'portal_magic_token', array_merge( $base, [
        'type'        => 'string',
        'description' => 'One-time magic-link token (hex). Cleared after use.',
        'default'     => '',
    ] ) );

    register_meta( 'user', 'portal_magic_token_expires', array_merge( $base, [
        'type'        => 'string',
        'description' => 'ISO 8601 expiry for portal_magic_token (1 hour TTL).',
        'default'     => '',
    ] ) );

    register_meta( 'user', 'portal_setup_complete', array_merge( $base, [
        'type'        => 'string',
        'description' => '"1" once the client has completed the first-login setup wizard.',
        'default'     => '',
    ] ) );

    register_meta( 'user', 'portal_last_login', array_merge( $base, [
        'type'        => 'string',
        'description' => 'ISO 8601 timestamp of the client\'s last portal login.',
        'default'     => '',
    ] ) );
}


// ─── Stamp last active on WP login (fallback — portal uses /ping endpoint) ───

add_action( 'wp_login', 'bluuhq_stamp_last_active', 10, 2 );
function bluuhq_stamp_last_active( string $user_login, WP_User $user ): void {
    if ( array_intersect( [ 'bluu_admin', 'bluu_team' ], (array) $user->roles ) ) {
        update_user_meta( $user->ID, 'bluuhq_last_active', gmdate( 'c' ) );
    }
}
