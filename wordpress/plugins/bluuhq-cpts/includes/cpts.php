<?php
if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', 'bluuhq_register_cpts' );
function bluuhq_register_cpts(): void {

    $shared = [
        'public'             => false,
        'publicly_queryable' => false,
        'show_ui'            => true,
        'show_in_menu'       => true,
        'show_in_rest'       => true,
        'show_in_graphql'    => true,
        'supports'           => [ 'title', 'custom-fields' ],
        'has_archive'        => false,
        'rewrite'            => false,
        'capability_type'    => 'post',
        'map_meta_cap'       => true,
    ];

    $types = [
        'bluu_client' => [
            'label'               => 'Clients',
            'menu_icon'           => 'dashicons-groups',
            'graphql_single_name' => 'BluuClient',
            'graphql_plural_name' => 'BluuClients',
            'labels'              => [
                'name'          => 'Clients',
                'singular_name' => 'Client',
                'add_new_item'  => 'Add New Client',
                'edit_item'     => 'Edit Client',
            ],
        ],
        'bluu_service' => [
            'label'               => 'Services',
            'menu_icon'           => 'dashicons-products',
            'graphql_single_name' => 'BluuService',
            'graphql_plural_name' => 'BluuServices',
            'labels'              => [
                'name'          => 'Services',
                'singular_name' => 'Service',
                'add_new_item'  => 'Add New Service',
                'edit_item'     => 'Edit Service',
            ],
        ],
        'bluu_subscription' => [
            'label'               => 'Subscriptions',
            'menu_icon'           => 'dashicons-calendar-alt',
            'graphql_single_name' => 'BluuSubscription',
            'graphql_plural_name' => 'BluuSubscriptions',
            'labels'              => [
                'name'          => 'Subscriptions',
                'singular_name' => 'Subscription',
                'add_new_item'  => 'Add New Subscription',
                'edit_item'     => 'Edit Subscription',
            ],
        ],
        'bluu_invoice' => [
            'label'               => 'Invoices',
            'menu_icon'           => 'dashicons-media-document',
            'graphql_single_name' => 'BluuInvoice',
            'graphql_plural_name' => 'BluuInvoices',
            'labels'              => [
                'name'          => 'Invoices',
                'singular_name' => 'Invoice',
                'add_new_item'  => 'Add New Invoice',
                'edit_item'     => 'Edit Invoice',
            ],
        ],
        'bluu_file' => [
            'label'               => 'Files',
            'menu_icon'           => 'dashicons-portfolio',
            'graphql_single_name' => 'BluuFile',
            'graphql_plural_name' => 'BluuFiles',
            'labels'              => [
                'name'          => 'Files',
                'singular_name' => 'File',
                'add_new_item'  => 'Add New File',
                'edit_item'     => 'Edit File',
            ],
        ],
        'bluu_communication' => [
            'label'               => 'Communications',
            'menu_icon'           => 'dashicons-email-alt',
            'graphql_single_name' => 'BluuCommunication',
            'graphql_plural_name' => 'BluuCommunications',
            'labels'              => [
                'name'          => 'Communications',
                'singular_name' => 'Communication',
                'add_new_item'  => 'Log Communication',
                'edit_item'     => 'Edit Communication',
            ],
        ],
        'bluu_sequence' => [
            'label'               => 'Email Sequences',
            'menu_icon'           => 'dashicons-list-view',
            'graphql_single_name' => 'BluuSequence',
            'graphql_plural_name' => 'BluuSequences',
            'labels'              => [
                'name'          => 'Email Sequences',
                'singular_name' => 'Sequence',
                'add_new_item'  => 'Add New Sequence',
                'edit_item'     => 'Edit Sequence',
            ],
        ],
        'bluu_email_template' => [
            'label'               => 'Email Templates',
            'menu_icon'           => 'dashicons-editor-table',
            'graphql_single_name' => 'BluuEmailTemplate',
            'graphql_plural_name' => 'BluuEmailTemplates',
            'labels'              => [
                'name'          => 'Email Templates',
                'singular_name' => 'Email Template',
                'add_new_item'  => 'Add New Template',
                'edit_item'     => 'Edit Template',
            ],
        ],
    ];

    foreach ( $types as $slug => $args ) {
        register_post_type( $slug, array_merge( $shared, $args ) );
    }
}

// ─── Register meta keys for REST API filtering ───────────────────────────────
// WP REST ?meta_key=X&meta_value=Y filtering only works for registered meta.

add_action( 'init', 'bluuhq_register_post_meta_keys', 20 );
function bluuhq_register_post_meta_keys(): void {

    // bluu_client
    foreach ( [
        'contact_name', 'contact_email', 'contact_phone', 'company_name',
        'company_website', 'industry', 'portal_email', 'status', 'health_status',
        'tags', 'notes',
    ] as $key ) {
        register_post_meta( 'bluu_client', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'string' ] );
    }
    foreach ( [ 'wp_user_id', 'active_subscription_count' ] as $key ) {
        register_post_meta( 'bluu_client', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'integer' ] );
    }

    // bluu_subscription
    foreach ( [ 'status', 'currency', 'billing_cycle', 'start_date', 'next_billing_date', 'end_date', 'notes' ] as $key ) {
        register_post_meta( 'bluu_subscription', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'string' ] );
    }
    foreach ( [ 'client_id', 'service_id', 'wp_user_id' ] as $key ) {
        register_post_meta( 'bluu_subscription', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'integer' ] );
    }
    register_post_meta( 'bluu_subscription', 'amount', [ 'show_in_rest' => true, 'single' => true, 'type' => 'number' ] );

    // bluu_invoice
    foreach ( [ 'inv_number', 'inv_status', 'inv_currency', 'inv_issued_date', 'inv_due_date', 'inv_notes' ] as $key ) {
        register_post_meta( 'bluu_invoice', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'string' ] );
    }
    foreach ( [ 'inv_client', 'inv_subscription' ] as $key ) {
        register_post_meta( 'bluu_invoice', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'integer' ] );
    }
    register_post_meta( 'bluu_invoice', 'inv_total', [ 'show_in_rest' => true, 'single' => true, 'type' => 'number' ] );

    // bluu_file
    foreach ( [ 'file_category', 'file_visibility', 'file_mime_type', 'file_r2_key', 'file_public_url', 'file_original_name', 'file_description' ] as $key ) {
        register_post_meta( 'bluu_file', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'string' ] );
    }
    foreach ( [ 'file_client', 'file_subscription_id', 'file_uploaded_by', 'file_size' ] as $key ) {
        register_post_meta( 'bluu_file', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'integer' ] );
    }

    // bluu_communication
    foreach ( [ 'comm_type', 'comm_direction', 'comm_channel', 'comm_subject', 'comm_content',
                'comm_occurred_at', 'comm_mood', 'comm_mood_source', 'comm_mood_reasoning',
                'comm_red_flags', 'comm_email_status', 'comm_follow_up_due' ] as $key ) {
        register_post_meta( 'bluu_communication', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'string' ] );
    }
    foreach ( [ 'comm_client', 'comm_logged_by' ] as $key ) {
        register_post_meta( 'bluu_communication', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'integer' ] );
    }
    foreach ( [ 'comm_follow_up_needed', 'comm_follow_up_completed' ] as $key ) {
        register_post_meta( 'bluu_communication', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'string' ] );
    }
}

// ─── Enable meta_key / meta_value filtering via REST API ─────────────────────
// By default WP REST API does not pass meta_key/meta_value to WP_Query.
// These filters wire them through so ?meta_key=X&meta_value=Y works.

foreach ( [
    'bluu_client',
    'bluu_subscription',
    'bluu_invoice',
    'bluu_file',
    'bluu_communication',
] as $_bluuhq_cpt ) {
    add_filter( "rest_{$_bluuhq_cpt}_query", function ( array $args, WP_REST_Request $request ): array {
        $meta_key   = $request->get_param( 'meta_key' );
        $meta_value = $request->get_param( 'meta_value' );
        if ( $meta_key !== null && $meta_value !== null ) {
            $args['meta_key']     = sanitize_key( $meta_key );
            $args['meta_value']   = $meta_value;
            $args['meta_compare'] = '=';
        }
        return $args;
    }, 10, 2 );
}
