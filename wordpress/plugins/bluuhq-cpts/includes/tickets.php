<?php
/**
 * Support Ticket CPTs and ACF field groups.
 * Registers: bluu_ticket, bluu_ticket_reply, bluu_ticket_status_log, bluu_ticket_attachment
 * Does NOT modify any existing CPTs.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', 'bluuhq_register_ticket_cpts' );

function bluuhq_register_ticket_cpts(): void {
    $defaults = [
        'public'             => false,
        'publicly_queryable' => false,
        'show_ui'            => false,
        'show_in_rest'       => true,
        'show_in_graphql'    => true,
        'supports'           => [ 'title', 'custom-fields' ],
        'has_archive'        => false,
        'rewrite'            => false,
        'capability_type'    => 'post',
        'map_meta_cap'       => true,
    ];

    register_post_type( 'bluu_ticket', array_merge( $defaults, [
        'label'              => 'Support Ticket',
        'rest_base'          => 'bluu_ticket',
        'graphql_single_name' => 'ticket',
        'graphql_plural_name' => 'tickets',
    ]));

    register_post_type( 'bluu_ticket_reply', array_merge( $defaults, [
        'label'              => 'Ticket Reply',
        'rest_base'          => 'bluu_ticket_reply',
        'graphql_single_name' => 'ticketReply',
        'graphql_plural_name' => 'ticketReplies',
        'supports'           => [ 'title', 'editor', 'excerpt', 'custom-fields' ],
    ]));

    register_post_type( 'bluu_ticket_status_log', array_merge( $defaults, [
        'label'              => 'Ticket Status Log',
        'rest_base'          => 'bluu_ticket_status_log',
        'show_in_graphql'    => false,
    ]));

    register_post_type( 'bluu_ticket_attachment', array_merge( $defaults, [
        'label'              => 'Ticket Attachment',
        'rest_base'          => 'bluu_ticket_attachment',
        'show_in_graphql'    => false,
    ]));
}

// ── Register ACF field groups programmatically ────────────────────────────────

add_action( 'acf/init', 'bluuhq_register_ticket_field_groups' );

function bluuhq_register_ticket_field_groups(): void {
    if ( ! function_exists( 'acf_add_local_field_group' ) ) return;

    // ── bluu_ticket fields ──
    acf_add_local_field_group([
        'key'          => 'group_bluu_ticket',
        'title'        => 'Ticket Fields',
        'show_in_rest' => true,
        'location'     => [[ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_ticket' ] ]],
        'fields'   => [
            bluuhq_acf_text( 'tkt_number',            'Ticket Number' ),
            bluuhq_acf_num(  'tkt_client',            'Client Post ID' ),
            bluuhq_acf_num(  'tkt_submitted_by',      'Submitted By (WP User ID)' ),
            bluuhq_acf_num(  'tkt_assigned_to',       'Assigned To (WP User ID)' ),
            bluuhq_acf_text( 'tkt_category',          'Category' ),
            bluuhq_acf_text( 'tkt_priority',          'Priority',  'normal' ),
            bluuhq_acf_text( 'tkt_status',            'Status',    'open' ),
            bluuhq_acf_num(  'tkt_retainer_id',       'Retainer/Subscription ID' ),
            bluuhq_acf_text( 'tkt_sla_response_target', 'SLA Response Target' ),
            bluuhq_acf_text( 'tkt_sla_resolve_target',  'SLA Resolve Target' ),
            bluuhq_acf_text( 'tkt_sla_alerted_at',    'SLA Last Alerted At' ),
            bluuhq_acf_text( 'tkt_first_response_at', 'First Response At' ),
            bluuhq_acf_text( 'tkt_resolved_at',       'Resolved At' ),
            bluuhq_acf_text( 'tkt_closed_at',         'Closed At' ),
        ],
    ]);

    // ── bluu_ticket_reply fields ──
    acf_add_local_field_group([
        'key'          => 'group_bluu_ticket_reply',
        'title'        => 'Ticket Reply Fields',
        'show_in_rest' => true,
        'location'     => [[ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_ticket_reply' ] ]],
        'fields'   => [
            bluuhq_acf_num(      'reply_ticket_id',   'Ticket Post ID' ),
            bluuhq_acf_num(      'reply_author_id',   'Author WP User ID' ),
            bluuhq_acf_textarea( 'reply_body',        'Body' ),
            bluuhq_acf_text(     'reply_type',        'Reply Type', 'reply' ),
        ],
    ]);

    // ── bluu_ticket_status_log fields ──
    acf_add_local_field_group([
        'key'          => 'group_bluu_ticket_status_log',
        'title'        => 'Ticket Status Log Fields',
        'show_in_rest' => true,
        'location'     => [[ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_ticket_status_log' ] ]],
        'fields'   => [
            bluuhq_acf_num(  'log_ticket_id',   'Ticket Post ID' ),
            bluuhq_acf_num(  'log_changed_by',  'Changed By (WP User ID)' ),
            bluuhq_acf_text( 'log_from_status', 'From Status' ),
            bluuhq_acf_text( 'log_to_status',   'To Status' ),
            bluuhq_acf_text( 'log_note',        'Note' ),
            bluuhq_acf_text( 'log_changed_at',  'Changed At' ),
        ],
    ]);

    // ── bluu_ticket_attachment fields ──
    acf_add_local_field_group([
        'key'          => 'group_bluu_ticket_attachment',
        'title'        => 'Ticket Attachment Fields',
        'show_in_rest' => true,
        'location'     => [[ [ 'param' => 'post_type', 'operator' => '==', 'value' => 'bluu_ticket_attachment' ] ]],
        'fields'   => [
            bluuhq_acf_num(  'att_ticket_id',    'Ticket Post ID' ),
            bluuhq_acf_num(  'att_reply_id',     'Reply Post ID' ),
            bluuhq_acf_num(  'att_uploaded_by',  'Uploaded By (WP User ID)' ),
            bluuhq_acf_text( 'att_file_name',    'File Name' ),
            bluuhq_acf_text( 'att_file_url',     'File URL / R2 Key' ),
            bluuhq_acf_text( 'att_file_type',    'MIME Type' ),
            bluuhq_acf_num(  'att_file_size_kb', 'File Size (KB)' ),
        ],
    ]);
}

// ── ACF field builder helpers ─────────────────────────────────────────────────

function bluuhq_acf_text( string $name, string $label, string $default = '' ): array {
    return [
        'key'           => 'field_' . $name,
        'name'          => $name,
        'label'         => $label,
        'type'          => 'text',
        'default_value' => $default,
        'show_in_rest'  => true,
    ];
}

function bluuhq_acf_textarea( string $name, string $label ): array {
    return [
        'key'          => 'field_' . $name,
        'name'         => $name,
        'label'        => $label,
        'type'         => 'textarea',
        'rows'         => 5,
        'show_in_rest' => true,
    ];
}

function bluuhq_acf_num( string $name, string $label ): array {
    return [
        'key'          => 'field_' . $name,
        'name'         => $name,
        'label'        => $label,
        'type'         => 'number',
        'show_in_rest' => true,
    ];
}

// ── Register meta keys for REST API filtering ─────────────────────────────────

add_action( 'init', 'bluuhq_register_ticket_meta_keys', 20 );
function bluuhq_register_ticket_meta_keys(): void {
    // bluu_ticket
    foreach ( [ 'tkt_number', 'tkt_category', 'tkt_priority', 'tkt_status',
                'tkt_sla_response_target', 'tkt_sla_resolve_target', 'tkt_sla_alerted_at',
                'tkt_first_response_at', 'tkt_resolved_at', 'tkt_closed_at' ] as $key ) {
        register_post_meta( 'bluu_ticket', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'string' ] );
    }
    foreach ( [ 'tkt_client', 'tkt_submitted_by', 'tkt_assigned_to', 'tkt_retainer_id' ] as $key ) {
        register_post_meta( 'bluu_ticket', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'integer' ] );
    }

    // bluu_ticket_reply
    foreach ( [ 'reply_body', 'reply_type' ] as $key ) {
        register_post_meta( 'bluu_ticket_reply', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'string' ] );
    }
    foreach ( [ 'reply_ticket_id', 'reply_author_id' ] as $key ) {
        register_post_meta( 'bluu_ticket_reply', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'integer' ] );
    }

    // bluu_ticket_attachment
    foreach ( [ 'att_file_name', 'att_file_url', 'att_file_type' ] as $key ) {
        register_post_meta( 'bluu_ticket_attachment', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'string' ] );
    }
    foreach ( [ 'att_ticket_id', 'att_reply_id', 'att_uploaded_by', 'att_file_size_kb' ] as $key ) {
        register_post_meta( 'bluu_ticket_attachment', $key, [ 'show_in_rest' => true, 'single' => true, 'type' => 'integer' ] );
    }
}

// ── REST API meta query filters ───────────────────────────────────────────────
// Without these, ?meta_key=X&meta_value=Y query params are silently ignored by
// the WP REST API for custom post types. This maps them to a real WP_Query meta_query.

add_filter( 'rest_bluu_ticket_reply_query',      'bluuhq_ticket_meta_query_filter', 10, 2 );
add_filter( 'rest_bluu_ticket_attachment_query', 'bluuhq_ticket_meta_query_filter', 10, 2 );

function bluuhq_ticket_meta_query_filter( array $args, WP_REST_Request $request ): array {
    $meta_key   = $request->get_param( 'meta_key' );
    $meta_value = $request->get_param( 'meta_value' );
    if ( $meta_key && $meta_value !== null && $meta_value !== '' ) {
        $args['meta_query'] = [[
            'key'     => sanitize_key( $meta_key ),
            'value'   => $meta_value,
            'compare' => '=',
        ]];
    }
    return $args;
}

// ── Belt-and-suspenders: save bluu_ticket_reply meta via native update_post_meta ──
// Runs at priority 20 (after ACF at ~10) so our values win if ACF failed to save.
// This guarantees reply_ticket_id is always in wp_postmeta so the REST meta query works.
add_action( 'rest_after_insert_bluu_ticket_reply', function ( WP_Post $post, WP_REST_Request $request ): void {
    $acf = $request->get_param( 'acf' );
    if ( ! is_array( $acf ) ) return;

    if ( isset( $acf['reply_ticket_id'] ) && is_numeric( $acf['reply_ticket_id'] ) ) {
        update_post_meta( $post->ID, 'reply_ticket_id', (int) $acf['reply_ticket_id'] );
    }
    if ( isset( $acf['reply_author_id'] ) && is_numeric( $acf['reply_author_id'] ) ) {
        update_post_meta( $post->ID, 'reply_author_id', (int) $acf['reply_author_id'] );
    }
    if ( isset( $acf['reply_body'] ) ) {
        update_post_meta( $post->ID, 'reply_body', sanitize_textarea_field( $acf['reply_body'] ) );
    }
    if ( isset( $acf['reply_type'] ) ) {
        update_post_meta( $post->ID, 'reply_type', sanitize_text_field( $acf['reply_type'] ) );
    }
}, 20, 2 );

// ── Belt-and-suspenders: save bluu_ticket_attachment meta via update_post_meta ──
// Same pattern as replies — ensures ACF field values land in wp_postmeta even if
// ACF's own REST API processing doesn't fire (e.g. older ACF, local field groups).
add_action( 'rest_after_insert_bluu_ticket_attachment', function ( WP_Post $post, WP_REST_Request $request ): void {
    $acf = $request->get_param( 'acf' );
    if ( ! is_array( $acf ) ) return;

    foreach ( [ 'att_ticket_id', 'att_reply_id', 'att_uploaded_by', 'att_file_size_kb' ] as $key ) {
        if ( isset( $acf[ $key ] ) && is_numeric( $acf[ $key ] ) ) {
            update_post_meta( $post->ID, $key, (int) $acf[ $key ] );
        }
    }
    foreach ( [ 'att_file_name', 'att_file_url', 'att_file_type' ] as $key ) {
        if ( isset( $acf[ $key ] ) ) {
            update_post_meta( $post->ID, $key, sanitize_text_field( $acf[ $key ] ) );
        }
    }
}, 20, 2 );
